from django.contrib import admin
from django.utils import timezone

from .distribution import distribute
from .models import DistributionLog, Listing, Organization, PostingType, Report, SavedJob


@admin.register(Organization)
class OrgAdmin(admin.ModelAdmin):
    list_display = ("name", "owner", "verified", "suspended", "created_at")
    list_filter = ("verified", "suspended")
    search_fields = ("name", "owner__email")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(PostingType)
class PostingTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")


@admin.action(description="Approve selected (goes live, posts to WhatsApp)")
def approve(modeladmin, request, qs):
    for l in qs.exclude(status="approved"):
        l.status, l.rejection_reason = "approved", ""
        l.posted_at = l.posted_at or timezone.now()
        l.save()
        distribute(l)


@admin.action(description="Reject selected")
def reject(modeladmin, request, qs):
    qs.update(status="rejected")


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "organization", "posting_type", "status", "flags", "created_at")
    list_filter = ("status", "posting_type", "work_mode")
    search_fields = ("title", "organization__name")
    actions = [approve, reject]


admin.site.register([Report, SavedJob, DistributionLog])
