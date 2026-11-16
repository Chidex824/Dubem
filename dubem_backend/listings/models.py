import re
import secrets

from django.conf import settings
from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Organization(models.Model):
    owner = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="organization")
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=80, unique=True)
    website = models.URLField(blank=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(blank=True)
    verified = models.BooleanField(default=False)    # shows the "Verified" badge
    suspended = models.BooleanField(default=False)   # cannot post while suspended
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class PostingType(models.Model):
    """Admin-managed (PRD AD-3). `schema` documents the optional type-specific fields kept in Listing.details."""
    name = models.CharField(max_length=60)
    slug = models.SlugField(unique=True)
    schema = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return self.name


# Phrases that send a listing to the top of the admin's attention (shown as checks in the queue).
FEE_RE = re.compile(r"(registration|application|processing|training)\s+fee|pay\s+(a|to|us)|send\s+money|deposit|western union|bitcoin|gift card", re.I)
PERSONAL_MAIL = ("gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "proton.me")


class Listing(models.Model):
    PENDING, APPROVED, REJECTED, CLOSED = "pending", "approved", "rejected", "closed"
    STATUSES = [(PENDING, "Pending"), (APPROVED, "Approved"), (REJECTED, "Rejected"), (CLOSED, "Closed")]
    MODES = [("remote", "Remote"), ("hybrid", "Hybrid"), ("onsite", "Onsite")]

    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="listings")
    posting_type = models.ForeignKey(PostingType, on_delete=models.PROTECT, related_name="listings")
    slug = models.SlugField(max_length=120, unique=True)
    title = models.CharField(max_length=160)
    work_mode = models.CharField(max_length=10, choices=MODES, default="onsite")
    country = models.CharField(max_length=80, blank=True, help_text='Use "Remote" for global remote roles')
    city = models.CharField(max_length=80, blank=True)
    employment_type = models.CharField(max_length=40, blank=True)
    pay = models.CharField(max_length=80, blank=True)
    summary = models.TextField()
    responsibilities = models.JSONField(default=list, blank=True)
    requirements = models.JSONField(default=list, blank=True)
    details = models.JSONField(default=dict, blank=True)
    apply_url = models.CharField(max_length=300)  # https link or mailto:
    closes_at = models.DateField(null=True, blank=True)
    share_whatsapp = models.BooleanField(default=True)

    status = models.CharField(max_length=10, choices=STATUSES, default=PENDING, db_index=True)
    rejection_reason = models.CharField(max_length=300, blank=True)
    flags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    posted_at = models.DateTimeField(null=True, blank=True)  # set on approval

    class Meta:
        ordering = ["-posted_at", "-created_at"]

    def __str__(self):
        return self.title

    @property
    def is_open(self):
        return self.status == self.APPROVED and (not self.closes_at or self.closes_at >= timezone.localdate())

    def compute_flags(self):
        text = " ".join([self.title, self.summary, " ".join(map(str, self.responsibilities)), " ".join(map(str, self.requirements))])
        flags = []
        if FEE_RE.search(text):
            flags.append("Asks for a fee")
        if self.apply_url.lower().startswith("mailto:") and self.apply_url.lower().split("@")[-1] in PERSONAL_MAIL:
            flags.append("Personal email only")
        if not self.organization.verified:
            flags.append("Unverified organization")
        return flags

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(f"{self.title}-{self.organization.name}")[:100]
            self.slug = f"{base}-{secrets.token_hex(2)}"
        super().save(*args, **kwargs)


class SavedJob(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_jobs")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="saves")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "listing")
        ordering = ["-created_at"]


class Report(models.Model):
    OPEN, REVIEWED, DISMISSED = "open", "reviewed", "dismissed"
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="reports")
    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    reason = models.CharField(max_length=40)
    note = models.TextField(blank=True)
    status = models.CharField(max_length=10, default=OPEN)
    created_at = models.DateTimeField(auto_now_add=True)


class DistributionLog(models.Model):
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="distribution")
    platform = models.CharField(max_length=30)
    status = models.CharField(max_length=10)  # ok | failed | skipped
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
