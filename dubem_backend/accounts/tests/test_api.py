import re
from datetime import timedelta

from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from rest_framework.test import APITestCase

from accounts.models import User
from alerts.models import SavedSearch
from alerts.sending import send_alerts
from analytics.models import AnalyticsEvent
from listings.models import DistributionLog, Listing, Organization


def link_in_mail(n=-1):
    return re.search(r"https?://\S+", mail.outbox[n].body).group(0)


class Base(APITestCase):
    def setUp(self):
        cache.clear()

    def signup(self, email="ada@example.com", hiring=False, **extra):
        data = {"name": "Ada", "email": email, "password": "correct-horse-battery", "terms": True, "hiring": hiring, **extra}
        r = self.client.post("/api/auth/signup/", data, format="json")
        return r

    def auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token}")

    def verified_user(self, email="ada@example.com", hiring=False, **extra):
        r = self.signup(email, hiring, **extra)
        self.assertEqual(r.status_code, 201, r.data)
        u = User.objects.get(email=email)
        u.email_verified = True
        u.save()
        self.auth(r.data["token"])
        return u

    def org_with_listing(self, status="approved", **kw):
        org = Organization.objects.filter(slug="acme").first()
        if not org:
            owner = User.objects.create_user("hr@acme.org", "x" * 12, name="HR", account_type="org", email_verified=True)
            org = Organization.objects.create(owner=owner, name="Acme", slug="acme", verified=True)
        from listings.models import PostingType
        d = dict(organization=org, posting_type=PostingType.objects.get(slug="job"), title="Backend Developer",
                 summary="Build APIs", apply_url="https://acme.org/apply", country="Nigeria", city="Lagos",
                 work_mode="hybrid", status=status, posted_at=timezone.now())
        d.update(kw)
        return Listing.objects.create(**d)


class AuthTests(Base):
    def test_signup_sends_verification_and_link_verifies(self):
        r = self.signup()
        self.assertEqual(r.status_code, 201)
        self.assertFalse(r.data["user"]["emailVerified"])
        self.assertEqual(len(mail.outbox), 1)
        resp = self.client.get(link_in_mail())
        self.assertEqual(resp.status_code, 302)
        self.assertIn("status=verified", resp["Location"])
        self.assertTrue(User.objects.get(email="ada@example.com").email_verified)

    def test_bad_verification_token_goes_to_expired(self):
        resp = self.client.get("/api/auth/verify/?token=garbage")
        self.assertIn("status=expired", resp["Location"])

    def test_verification_token_expires(self):
        self.signup()
        url = link_in_mail()
        with override_settings(VERIFY_TOKEN_MAX_AGE=-1):
            self.assertIn("status=expired", self.client.get(url)["Location"])

    def test_duplicate_email_and_weak_password_rejected(self):
        self.signup()
        self.assertEqual(self.signup().status_code, 400)
        r = self.client.post("/api/auth/signup/", {"name": "B", "email": "b@x.com", "password": "short", "terms": True}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_terms_required(self):
        r = self.client.post("/api/auth/signup/", {"name": "B", "email": "b@x.com", "password": "correct-horse-battery", "terms": False}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_hiring_signup_creates_organization(self):
        r = self.signup("hr@co.com", hiring=True, organization="Co Ltd", website="https://co.com")
        self.assertEqual(r.data["user"]["role"], "org")
        self.assertEqual(r.data["user"]["organization"]["name"], "Co Ltd")
        self.assertFalse(r.data["user"]["organization"]["verified"])

    def test_hiring_requires_organization_name(self):
        self.assertEqual(self.signup("hr@co.com", hiring=True).status_code, 400)

    def test_login_logout_me(self):
        self.signup()
        r = self.client.post("/api/auth/login/", {"email": "ADA@example.com", "password": "correct-horse-battery"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.auth(r.data["token"])
        self.assertEqual(self.client.get("/api/auth/me/").data["email"], "ada@example.com")
        self.assertEqual(self.client.post("/api/auth/logout/").status_code, 204)
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_wrong_password(self):
        self.signup()
        r = self.client.post("/api/auth/login/", {"email": "ada@example.com", "password": "nope-nope-nope"}, format="json")
        self.assertEqual(r.status_code, 400)

    def test_resend_does_not_reveal_accounts(self):
        a = self.client.post("/api/auth/resend/", {"email": "ghost@x.com"}, format="json")
        self.assertEqual(a.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)
        self.signup()
        self.client.post("/api/auth/resend/", {"email": "ada@example.com"}, format="json")
        self.assertEqual(len(mail.outbox), 2)

    def test_resend_is_rate_limited(self):
        codes = [self.client.post("/api/auth/resend/", {"email": "a@x.com"}, format="json").status_code for _ in range(7)]
        self.assertIn(429, codes)

    def test_password_reset_flow_and_single_use(self):
        self.signup()
        self.client.post("/api/auth/password-reset/", {"email": "ada@example.com"}, format="json")
        token = re.search(r"token=(\S+)", mail.outbox[-1].body).group(1)
        r = self.client.post("/api/auth/password-reset/confirm/", {"token": token, "password": "a-brand-new-passphrase"}, format="json")
        self.assertEqual(r.status_code, 200, r.data)
        self.assertTrue(self.client.post("/api/auth/login/", {"email": "ada@example.com", "password": "a-brand-new-passphrase"}, format="json").status_code == 200)
        again = self.client.post("/api/auth/password-reset/confirm/", {"token": token, "password": "another-passphrase-1"}, format="json")
        self.assertEqual(again.status_code, 400)

    def test_delete_account(self):
        self.verified_user()
        self.assertEqual(self.client.delete("/api/auth/me/").status_code, 204)
        self.assertFalse(User.objects.filter(email="ada@example.com").exists())

    def test_purge_unverified(self):
        self.signup()
        User.objects.update(date_joined=timezone.now() - timedelta(days=30))
        from django.core.management import call_command
        call_command("purge_unverified")
        self.assertEqual(User.objects.count(), 0)


class PublicBoardTests(Base):
    def test_only_approved_open_listings_are_public(self):
        self.org_with_listing()
        self.org_with_listing(status="pending", title="Hidden pending")
        self.org_with_listing(title="Expired", closes_at=timezone.localdate() - timedelta(days=1))
        r = self.client.get("/api/jobs/")
        self.assertEqual([j["title"] for j in r.data["results"]], ["Backend Developer"])

    def test_response_shape_matches_frontend(self):
        self.org_with_listing(closes_at=timezone.localdate() + timedelta(days=5))
        j = self.client.get("/api/jobs/").data["results"][0]
        for k in ("slug", "title", "org", "verified", "type", "mode", "country", "city", "employmentType", "pay",
                  "postedAt", "closesAt", "applyUrl", "summary", "responsibilities", "requirements"):
            self.assertIn(k, j)
        self.assertEqual((j["type"], j["mode"], j["org"], j["verified"]), ("job", "hybrid", "Acme", True))

    def test_filters(self):
        self.org_with_listing()
        self.org_with_listing(title="Design Intern", work_mode="remote", country="Remote",
                              posting_type=__import__("listings.models", fromlist=["PostingType"]).PostingType.objects.get(slug="internship"))
        n = lambda qs: len(self.client.get("/api/jobs/" + qs).data["results"])
        self.assertEqual(n("?type=internship"), 1)
        self.assertEqual(n("?mode=hybrid"), 1)
        self.assertEqual(n("?country=nigeria"), 1)
        self.assertEqual(n("?q=design"), 1)
        self.assertEqual(n("?q=zzz"), 0)

    def test_detail_hides_pending_but_keeps_closed_reachable(self):
        p = self.org_with_listing(status="pending", title="P")
        c = self.org_with_listing(status="closed", title="C")
        self.assertEqual(self.client.get(f"/api/jobs/{p.slug}/").status_code, 404)
        r = self.client.get(f"/api/jobs/{c.slug}/")
        self.assertEqual(r.status_code, 200)
        self.assertFalse(r.data["isOpen"])
        self.assertNotIn("status", r.data)

    def test_posting_types_seeded(self):
        self.assertEqual({t["slug"] for t in self.client.get("/api/posting-types/").data}, {"job", "internship", "fellowship", "volunteer"})

    def test_report(self):
        l = self.org_with_listing()
        self.assertEqual(self.client.post(f"/api/jobs/{l.slug}/report/", {"reason": "scam"}, format="json").status_code, 201)
        self.assertEqual(l.reports.count(), 1)


POST = {"title": "Data Analyst", "type": "job", "mode": "onsite", "country": "Ghana", "city": "Accra",
        "applyUrl": "https://co.com/apply", "description": "Analyse things", "shareWhatsapp": True}


class PostingAndModerationTests(Base):
    def org(self, verified_email=True):
        r = self.signup("hr@co.com", hiring=True, organization="Co Ltd")
        if verified_email:
            User.objects.filter(email="hr@co.com").update(email_verified=True)
        self.auth(r.data["token"])

    def test_visitor_and_seeker_cannot_post(self):
        self.assertEqual(self.client.post("/api/jobs/", POST, format="json").status_code, 401)
        self.verified_user("seeker@x.com")
        self.assertEqual(self.client.post("/api/jobs/", POST, format="json").status_code, 403)

    def test_unverified_email_cannot_post(self):
        self.org(verified_email=False)
        self.assertEqual(self.client.post("/api/jobs/", POST, format="json").status_code, 403)

    def test_post_goes_to_queue_not_public(self):
        self.org()
        r = self.client.post("/api/jobs/", POST, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        self.assertEqual(r.data["status"], "pending")
        self.assertIn("Unverified organization", r.data["flags"])
        self.assertEqual(Listing.objects.get().posted_at, None)
        self.assertEqual(self.client.get("/api/jobs/").data["count"], 0)
        self.assertEqual(self.client.get("/api/my/jobs/").data["count"] if "count" in self.client.get("/api/my/jobs/").data else len(self.client.get("/api/my/jobs/").data), 1)

    def test_scam_flags(self):
        self.org()
        r = self.client.post("/api/jobs/", {**POST, "description": "Pay a registration fee to apply", "applyUrl": "mailto:boss@gmail.com"}, format="json")
        self.assertIn("Asks for a fee", r.data["flags"])
        self.assertIn("Personal email only", r.data["flags"])

    def test_validation(self):
        self.org()
        self.assertEqual(self.client.post("/api/jobs/", {**POST, "applyUrl": "javascript:alert(1)"}, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/jobs/", {**POST, "type": "nope"}, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/jobs/", {**POST, "country": ""}, format="json").status_code, 400)
        self.assertEqual(self.client.post("/api/jobs/", {**POST, "closesAt": "2001-01-01"}, format="json").status_code, 400)

    def test_suspended_org_blocked(self):
        self.org()
        Organization.objects.update(suspended=True)
        self.assertEqual(self.client.post("/api/jobs/", POST, format="json").status_code, 403)

    def admin(self):
        a = User.objects.create_superuser("root@dubem.com", "x" * 12, name="Root")
        self.client.force_authenticate(a)

    def test_only_admin_can_moderate(self):
        self.org()
        slug = self.client.post("/api/jobs/", POST, format="json").data["slug"]
        self.assertEqual(self.client.post(f"/api/admin/jobs/{slug}/approve/").status_code, 403)
        self.assertEqual(self.client.get("/api/admin/queue/").status_code, 403)

    def test_approve_publishes_and_logs_distribution(self):
        self.org()
        slug = self.client.post("/api/jobs/", POST, format="json").data["slug"]
        self.client.credentials()
        self.admin()
        self.assertEqual(len(self.client.get("/api/admin/queue/").data), 1)
        r = self.client.post(f"/api/admin/jobs/{slug}/approve/")
        self.assertEqual(r.data["status"], "approved")
        self.assertIsNotNone(r.data["postedAt"])
        self.assertEqual(DistributionLog.objects.get().status, "skipped")  # no webhook configured
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/jobs/").data["count"], 1)

    def test_whatsapp_failure_never_blocks_listing(self):
        self.org()
        slug = self.client.post("/api/jobs/", POST, format="json").data["slug"]
        self.client.credentials()
        self.admin()
        with override_settings(WHATSAPP_WEBHOOK_URL="http://127.0.0.1:9/hook"):
            r = self.client.post(f"/api/admin/jobs/{slug}/approve/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(Listing.objects.get().status, "approved")
        self.assertEqual(DistributionLog.objects.get().status, "failed")

    def test_reject_needs_reason_and_hides(self):
        self.org()
        slug = self.client.post("/api/jobs/", POST, format="json").data["slug"]
        self.client.credentials()
        self.admin()
        self.assertEqual(self.client.post(f"/api/admin/jobs/{slug}/reject/", {}, format="json").status_code, 400)
        r = self.client.post(f"/api/admin/jobs/{slug}/reject/", {"reason": "Asks for a fee"}, format="json")
        self.assertEqual(r.data["status"], "rejected")
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get("/api/jobs/").data["count"], 0)

    def test_org_edit_returns_to_queue_and_close(self):
        l = self.org_with_listing()
        self.client.force_authenticate(l.organization.owner)
        r = self.client.patch(f"/api/jobs/{l.slug}/", {"title": "Senior Backend Developer"}, format="json")
        self.assertEqual((r.status_code, r.data["status"]), (200, "pending"))
        self.assertEqual(self.client.post(f"/api/jobs/{l.slug}/close/").data["status"], "closed")

    def test_other_org_cannot_edit(self):
        l = self.org_with_listing()
        self.org()
        self.assertEqual(self.client.patch(f"/api/jobs/{l.slug}/", {"title": "x"}, format="json").status_code, 403)

    def test_admin_verifies_and_suspends_org(self):
        l = self.org_with_listing()
        self.admin()
        self.assertFalse(self.client.post("/api/admin/orgs/acme/unverify/").data["verified"])
        self.assertTrue(self.client.post("/api/admin/orgs/acme/suspend/").data["suspended"])
        self.assertEqual(self.client.post("/api/admin/orgs/acme/explode/").status_code, 404)


class SavedAlertsAnalyticsTests(Base):
    def test_saved_jobs_need_verified_email(self):
        l = self.org_with_listing()
        r = self.signup()
        self.auth(r.data["token"])
        self.assertEqual(self.client.put(f"/api/saved/{l.slug}/").status_code, 403)
        User.objects.update(email_verified=True)
        self.assertEqual(self.client.put(f"/api/saved/{l.slug}/").status_code, 200)
        self.client.put(f"/api/saved/{l.slug}/")  # idempotent
        self.assertEqual([j["slug"] for j in self.client.get("/api/saved/").data], [l.slug])
        self.client.delete(f"/api/saved/{l.slug}/")
        self.assertEqual(self.client.get("/api/saved/").data, [])

    def test_alert_crud_and_validation(self):
        self.verified_user()
        self.assertEqual(self.client.post("/api/alerts/", {"name": "Empty", "frequency": "daily"}, format="json").status_code, 400)
        r = self.client.post("/api/alerts/", {"name": "Lagos devs", "q": "developer", "country": "Nigeria", "frequency": "instant"}, format="json")
        self.assertEqual(r.status_code, 201, r.data)
        self.assertTrue(r.data["on"])
        pk = r.data["id"]
        self.assertFalse(self.client.patch(f"/api/alerts/{pk}/", {"on": False}, format="json").data["on"])
        self.assertEqual(self.client.delete(f"/api/alerts/{pk}/").status_code, 204)

    def test_alerts_are_private_per_user(self):
        u = self.verified_user("a@x.com")
        a = SavedSearch.objects.create(user=u, name="mine", q="dev")
        self.verified_user("b@x.com")
        self.assertEqual(self.client.get(f"/api/alerts/{a.pk}/").status_code, 404)

    def test_send_alerts_only_new_matches_and_unsubscribe(self):
        u = self.verified_user()
        alert = SavedSearch.objects.create(user=u, name="Devs", q="developer", frequency="instant")
        SavedSearch.objects.filter(pk=alert.pk).update(created_at=timezone.now() - timedelta(days=1))
        self.org_with_listing()
        mail.outbox.clear()
        self.assertEqual(send_alerts("instant"), 1)
        self.assertIn("Backend Developer", mail.outbox[0].body)
        self.assertIn("List-Unsubscribe", mail.outbox[0].extra_headers)
        self.assertEqual(send_alerts("instant"), 0)  # nothing new the second time
        self.client.credentials()
        self.assertEqual(self.client.get(f"/api/alerts/unsubscribe/{alert.unsubscribe_token}/").status_code, 200)
        alert.refresh_from_db()
        self.assertFalse(alert.active)

    def test_events_dedupe_views_and_validate(self):
        l = self.org_with_listing()
        ev = lambda t, **k: self.client.post("/api/events/", {"slug": l.slug, "type": t, **k}, format="json")
        self.assertEqual(ev("view", source="whatsapp").status_code, 204)
        ev("view")
        ev("apply_click", source="whatsapp")
        ev("apply_click", source="whatsapp")
        self.assertEqual(AnalyticsEvent.objects.filter(type="view").count(), 1)
        self.assertEqual(AnalyticsEvent.objects.filter(type="apply_click").count(), 2)
        self.assertEqual(ev("hack").status_code, 400)
        self.assertEqual(ev("view", source="<script>").status_code, 204)
        self.assertEqual(self.client.post("/api/events/", {"slug": "nope", "type": "view"}, format="json").status_code, 404)

    def test_admin_analytics_and_org_scoping(self):
        l = self.org_with_listing()
        self.client.post("/api/events/", {"slug": l.slug, "type": "view", "source": "whatsapp"}, format="json")
        self.client.post("/api/events/", {"slug": l.slug, "type": "apply_click"}, format="json")
        self.verified_user("seeker@x.com")
        self.assertEqual(self.client.get("/api/admin/analytics/").status_code, 403)
        self.client.force_authenticate(User.objects.create_superuser("r@d.com", "x" * 12, name="R"))
        d = self.client.get("/api/admin/analytics/?days=7").data
        self.assertEqual((d["tiles"]["pageViews"], d["tiles"]["applyClicks"], d["tiles"]["liveListings"]), (1, 1, 1))
        self.assertEqual(len(d["perDay"]), 7)
        self.assertEqual(d["sources"][0]["source"], "whatsapp")
        self.client.force_authenticate(l.organization.owner)
        s = self.client.get("/api/my/stats/").data
        self.assertEqual(s["listings"][0]["views"], 1)
