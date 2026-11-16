from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User


class Command(BaseCommand):
    help = "Delete accounts that never verified their email (PRD AC-2). Run daily."

    def handle(self, *args, **opts):
        cutoff = timezone.now() - timedelta(days=settings.UNVERIFIED_ACCOUNT_DAYS)
        n, _ = User.objects.filter(email_verified=False, is_staff=False, date_joined__lt=cutoff).delete()
        self.stdout.write(f"Removed {n} unverified records")
