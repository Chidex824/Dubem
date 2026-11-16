from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from listings.views import filter_listings, public_listings

from .models import SavedSearch


def matches_for(alert):
    since = alert.last_sent or alert.created_at
    params = {k: getattr(alert, k) for k in ("q", "type", "mode", "country")}
    return list(filter_listings(public_listings(), params).filter(posted_at__gt=since)[:20])


def send_alerts(frequency):
    """Send each active alert of this frequency if it has new matches. Returns the number of emails sent."""
    now, sent = timezone.now(), 0
    qs = SavedSearch.objects.filter(active=True, frequency=frequency, user__email_verified=True, user__is_active=True)
    if frequency == SavedSearch.DAILY:
        qs = qs.exclude(last_sent__gt=now - timedelta(hours=20))
    for alert in qs.select_related("user"):
        items = matches_for(alert)
        if not items:
            continue
        lines = [f"- {l.title} at {l.organization.name}\n  {settings.FRONTEND_URL}/jobs/{l.slug}?src=email" for l in items]
        unsub = f"{settings.FRONTEND_URL}/api/alerts/unsubscribe/{alert.unsubscribe_token}/"
        _send(alert, items, lines, unsub)
        alert.last_sent = now
        alert.save(update_fields=["last_sent"])
        sent += 1
    return sent


def _send(alert, items, lines, unsub):
    from django.core.mail import EmailMessage
    msg = EmailMessage(
        f'{len(items)} new for "{alert.name}" on Dubem',
        f'Hi {alert.user.name},\n\nNew listings matching "{alert.name}":\n\n' + "\n".join(lines)
        + f"\n\nTurn this alert off in one click: {unsub}\n",
        settings.DEFAULT_FROM_EMAIL, [alert.user.email],
        headers={"List-Unsubscribe": f"<{unsub}>", "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"},
    )
    msg.send()
