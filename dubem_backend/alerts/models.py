import secrets

from django.conf import settings
from django.db import models


def new_token():
    return secrets.token_urlsafe(24)


class SavedSearch(models.Model):
    """An email alert (PRD JS-7). Matching mirrors the board's own filters."""
    INSTANT, DAILY = "instant", "daily"
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="alerts")
    name = models.CharField(max_length=80)
    q = models.CharField(max_length=80, blank=True)
    type = models.CharField(max_length=30, blank=True)
    mode = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=80, blank=True)
    frequency = models.CharField(max_length=10, choices=[(INSTANT, "Instant"), (DAILY, "Daily")], default=DAILY)
    active = models.BooleanField(default=True)
    last_sent = models.DateTimeField(null=True, blank=True)
    unsubscribe_token = models.CharField(max_length=64, unique=True, default=new_token)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
