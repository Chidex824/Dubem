from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from listings.distribution import listing_message
from listings.models import Listing


class Command(BaseCommand):
    help = "Print a copy-paste WhatsApp digest of listings approved in the last N days (manual fallback, PRD SD-2)."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, default=1)

    def handle(self, *args, **o):
        since = timezone.now() - timedelta(days=o["days"])
        items = [l for l in Listing.objects.filter(status="approved", posted_at__gte=since) if l.is_open]
        if not items:
            self.stdout.write("Nothing new.")
        for l in items:
            self.stdout.write(listing_message(l) + "\n---")
