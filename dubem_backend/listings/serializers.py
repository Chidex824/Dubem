from django.utils import timezone
from rest_framework import serializers

from .models import Listing, Organization, PostingType, Report

HTTPS_OR_MAILTO = ("https://", "http://", "mailto:")


class ListingSerializer(serializers.ModelSerializer):
    """Public shape. Field names match what the React app already uses (src/api/jobs.js)."""
    org = serializers.CharField(source="organization.name")
    orgSlug = serializers.CharField(source="organization.slug")
    verified = serializers.BooleanField(source="organization.verified")
    type = serializers.CharField(source="posting_type.slug")
    mode = serializers.CharField(source="work_mode")
    employmentType = serializers.CharField(source="employment_type")
    postedAt = serializers.DateTimeField(source="posted_at")
    closesAt = serializers.DateField(source="closes_at")
    applyUrl = serializers.CharField(source="apply_url")
    isOpen = serializers.BooleanField(source="is_open")

    class Meta:
        model = Listing
        fields = ["slug", "title", "org", "orgSlug", "verified", "type", "mode", "country", "city", "employmentType",
                  "pay", "postedAt", "closesAt", "applyUrl", "summary", "responsibilities", "requirements",
                  "details", "isOpen"]


class OwnerListingSerializer(ListingSerializer):
    """Adds moderation state for the owning organization and for admins."""
    status = serializers.CharField()
    rejectionReason = serializers.CharField(source="rejection_reason")
    flags = serializers.ListField(child=serializers.CharField())
    createdAt = serializers.DateTimeField(source="created_at")
    orgEmail = serializers.CharField(source="organization.owner.email")
    shareWhatsapp = serializers.BooleanField(source="share_whatsapp")

    class Meta(ListingSerializer.Meta):
        fields = ListingSerializer.Meta.fields + ["status", "rejectionReason", "flags", "createdAt", "orgEmail", "shareWhatsapp"]


class ListingWriteSerializer(serializers.ModelSerializer):
    type = serializers.SlugRelatedField(source="posting_type", slug_field="slug", queryset=PostingType.objects.all())
    mode = serializers.ChoiceField(source="work_mode", choices=Listing.MODES)
    employmentType = serializers.CharField(source="employment_type", required=False, allow_blank=True)
    closesAt = serializers.DateField(source="closes_at", required=False, allow_null=True)
    applyUrl = serializers.CharField(source="apply_url", max_length=300)
    shareWhatsapp = serializers.BooleanField(source="share_whatsapp", required=False)
    description = serializers.CharField(source="summary")

    class Meta:
        model = Listing
        fields = ["title", "type", "mode", "country", "city", "employmentType", "pay", "closesAt", "applyUrl",
                  "description", "responsibilities", "requirements", "details", "shareWhatsapp"]

    def validate_applyUrl(self, v):
        v = v.strip()
        if not v.lower().startswith(HTTPS_OR_MAILTO):
            raise serializers.ValidationError("Use a link starting with https:// or an email as mailto:you@org.com")
        return v

    def validate_closesAt(self, v):
        if v and v < timezone.localdate():
            raise serializers.ValidationError("The closing date is in the past.")
        return v

    def validate(self, d):
        if d.get("work_mode") != "remote" and not d.get("country") and not self.partial:
            raise serializers.ValidationError({"country": "Country is required unless the role is fully remote."})
        return d


class OrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["name", "slug", "website", "description", "logo_url", "verified", "suspended"]
        read_only_fields = ["slug", "verified", "suspended"]


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["reason", "note"]
