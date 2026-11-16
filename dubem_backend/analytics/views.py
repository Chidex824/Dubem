import hashlib
from datetime import timedelta

from django.conf import settings
from django.db.models import Count
from django.db.models.functions import TruncDate
from django.http import Http404
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from alerts.models import SavedSearch
from listings.models import Listing
from listings.views import IsAdmin, IsOrgAccount

from .models import AnalyticsEvent

SOURCES = {"whatsapp", "telegram", "email", "search", "x", "direct"}


def visitor_hash(request):
    ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", "")).split(",")[0].strip()
    day = timezone.localdate().isoformat()
    return hashlib.sha256(f"{settings.SECRET_KEY}|{day}|{ip}|{request.META.get('HTTP_USER_AGENT', '')}".encode()).hexdigest()[:32]


class RecordEvent(APIView):
    """Called by the React app: {slug, type: "view"|"apply_click", source}. Always answers 204 so it never breaks a page."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_scope = "event"

    def post(self, request):
        etype = request.data.get("type")
        src = request.data.get("source") or "direct"
        if etype not in (AnalyticsEvent.VIEW, AnalyticsEvent.APPLY):
            return Response({"detail": "Unknown event type."}, status=400)
        try:
            listing = Listing.objects.get(slug=request.data.get("slug"), status=Listing.APPROVED)
        except Listing.DoesNotExist:
            raise Http404
        v = visitor_hash(request)
        today = timezone.localdate()
        if etype == AnalyticsEvent.VIEW and AnalyticsEvent.objects.filter(
                listing=listing, type=etype, visitor=v, created_at__date=today).exists():
            return Response(status=204)  # one view per visitor per listing per day
        AnalyticsEvent.objects.create(listing=listing, type=etype, visitor=v, source=src if src in SOURCES else "direct")
        return Response(status=204)


def _series(qs, days):
    start = timezone.localdate() - timedelta(days=days - 1)
    by_day = {(r["d"], r["type"]): r["n"] for r in
              qs.filter(created_at__date__gte=start).annotate(d=TruncDate("created_at")).values("d", "type").annotate(n=Count("id"))}
    out = []
    for i in range(days):
        d = start + timedelta(days=i)
        out.append({"date": d.isoformat(), "views": by_day.get((d, "view"), 0), "applyClicks": by_day.get((d, "apply_click"), 0)})
    return out


def _sources(qs, days):
    since = timezone.now() - timedelta(days=days)
    rows = qs.filter(type="view", created_at__gte=since).values("source").annotate(n=Count("id")).order_by("-n")
    total = sum(r["n"] for r in rows) or 1
    return [{"source": r["source"], "views": r["n"], "share": round(100 * r["n"] / total)} for r in rows]


def _days(request):
    d = request.query_params.get("days", "7")
    return min(max(int(d), 1), 90) if d.isdigit() else 7


class AdminAnalytics(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        days = _days(request)
        ev = AnalyticsEvent.objects.all()
        since = timezone.now() - timedelta(days=days)
        top = (ev.filter(created_at__gte=since).values("listing__slug", "listing__title", "type").annotate(n=Count("id")))
        per = {}
        for r in top:
            e = per.setdefault(r["listing__slug"], {"slug": r["listing__slug"], "title": r["listing__title"], "views": 0, "applyClicks": 0})
            e["views" if r["type"] == "view" else "applyClicks"] = r["n"]
        return Response({
            "days": days,
            "tiles": {
                "pageViews": ev.filter(type="view", created_at__gte=since).count(),
                "applyClicks": ev.filter(type="apply_click", created_at__gte=since).count(),
                "liveListings": Listing.objects.filter(status="approved").count(),
                "pendingListings": Listing.objects.filter(status="pending").count(),
                "activeAlerts": SavedSearch.objects.filter(active=True).count(),
                "newSignups": User.objects.filter(date_joined__gte=since).count(),
            },
            "perDay": _series(ev, days),
            "sources": _sources(ev, days),
            "listings": sorted(per.values(), key=lambda x: -x["views"])[:20],
        })


class OrgStats(APIView):
    """An organization sees stats for its own listings only."""
    permission_classes = [IsOrgAccount]

    def get(self, request):
        days = _days(request)
        ev = AnalyticsEvent.objects.filter(listing__organization=request.user.organization)
        since = timezone.now() - timedelta(days=days)
        rows = ev.filter(created_at__gte=since).values("listing__slug", "listing__title", "type").annotate(n=Count("id"))
        per = {}
        for r in rows:
            e = per.setdefault(r["listing__slug"], {"slug": r["listing__slug"], "title": r["listing__title"], "views": 0, "applyClicks": 0})
            e["views" if r["type"] == "view" else "applyClicks"] = r["n"]
        return Response({"days": days, "perDay": _series(ev, days), "sources": _sources(ev, days), "listings": list(per.values())})
