from django.db import models


class AnalyticsEvent(models.Model):
    VIEW, APPLY = "view", "apply_click"
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="events")
    type = models.CharField(max_length=12, choices=[(VIEW, "View"), (APPLY, "Apply click")])
    source = models.CharField(max_length=12, default="direct")
    visitor = models.CharField(max_length=32)  # salted daily hash, never the raw IP
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        indexes = [models.Index(fields=["listing", "type", "created_at"])]
