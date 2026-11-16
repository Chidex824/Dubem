"""WhatsApp auto-post on approval. A failure is logged and never blocks the listing (PRD SD-1, SD-4)."""
import logging

import requests
from django.conf import settings

from .models import DistributionLog

log = logging.getLogger(__name__)


def listing_message(listing):
    loc = "Remote" if listing.country in ("", "Remote") else ", ".join(p for p in (listing.city, listing.country) if p)
    url = f"{settings.FRONTEND_URL}/jobs/{listing.slug}?src=whatsapp"
    return f"*{listing.title}*\n{listing.organization.name} · {loc}\n{listing.posting_type.name}\n\n{url}"


def distribute(listing):
    if not listing.share_whatsapp:
        DistributionLog.objects.create(listing=listing, platform="whatsapp", status="skipped", error="Not requested")
        return
    if not settings.WHATSAPP_WEBHOOK_URL:
        DistributionLog.objects.create(listing=listing, platform="whatsapp", status="skipped", error="Not configured")
        return
    try:
        r = requests.post(
            settings.WHATSAPP_WEBHOOK_URL, json={"text": listing_message(listing)}, timeout=8,
            headers={"Authorization": f"Bearer {settings.WHATSAPP_TOKEN}"} if settings.WHATSAPP_TOKEN else {},
        )
        r.raise_for_status()
        DistributionLog.objects.create(listing=listing, platform="whatsapp", status="ok")
    except Exception as exc:  # noqa: BLE001 - must never raise into the approval flow
        log.warning("WhatsApp post failed for %s: %s", listing.slug, exc)
        DistributionLog.objects.create(listing=listing, platform="whatsapp", status="failed", error=str(exc)[:500])
