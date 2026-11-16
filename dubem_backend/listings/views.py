from datetime import timedelta

from django.db.models import Q
from django.http import Http404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny, BasePermission, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .distribution import distribute
from .models import Listing, Organization, PostingType, Report, SavedJob
from .serializers import (ListingSerializer, ListingWriteSerializer, OrgSerializer, OwnerListingSerializer,
                          ReportSerializer)


class BigPage(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


class VerifiedUser(BasePermission):
    message = "Verify your email first. Check your inbox for the link."

    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.email_verified)


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.is_staff)


class IsOrgAccount(BasePermission):
    message = "Only organization accounts can post."

    def has_permission(self, request, view):
        u = request.user
        return bool(u.is_authenticated and hasattr(u, "organization"))


def public_listings():
    today = timezone.localdate()
    return (Listing.objects.filter(status=Listing.APPROVED)
            .filter(Q(closes_at__isnull=True) | Q(closes_at__gte=today))
            .select_related("organization", "posting_type"))


def filter_listings(qs, p):
    if p.get("q"):
        q = p["q"]
        qs = qs.filter(Q(title__icontains=q) | Q(organization__name__icontains=q) | Q(summary__icontains=q)
                       | Q(city__icontains=q) | Q(country__icontains=q))
    if p.get("type"):
        qs = qs.filter(posting_type__slug=p["type"])
    if p.get("mode"):
        qs = qs.filter(work_mode=p["mode"])
    if p.get("country"):
        qs = qs.filter(country__iexact=p["country"])
    if p.get("days", "").isdigit():
        qs = qs.filter(posted_at__gte=timezone.now() - timedelta(days=int(p["days"])))
    return qs


class JobList(generics.ListCreateAPIView):
    pagination_class = BigPage

    def get_permissions(self):
        if self.request.method == "POST":
            return [VerifiedUser(), IsOrgAccount()]
        return [AllowAny()]

    def get_throttles(self):
        if self.request.method == "POST":
            self.throttle_scope = "post"
            return super().get_throttles()
        return []

    def get_queryset(self):
        return filter_listings(public_listings(), self.request.query_params)

    def get_serializer_class(self):
        return ListingWriteSerializer if self.request.method == "POST" else ListingSerializer

    def create(self, request, *args, **kwargs):
        org = request.user.organization
        if org.suspended:
            return Response({"detail": "This organization is suspended and cannot post."}, status=403)
        s = ListingWriteSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        listing = Listing(organization=org, **s.validated_data)
        listing.flags = listing.compute_flags()
        listing.save()
        return Response(OwnerListingSerializer(listing).data, status=201)


class JobDetail(APIView):
    """Public for approved/closed listings (old shared links keep working). Owner and admin can also see their own pending ones."""
    permission_classes = [AllowAny]

    def get_object(self, request, slug):
        try:
            listing = Listing.objects.select_related("organization__owner", "posting_type").get(slug=slug)
        except Listing.DoesNotExist:
            raise Http404
        u = request.user
        privileged = u.is_authenticated and (u.is_staff or listing.organization.owner_id == u.pk)
        if listing.status in (Listing.PENDING, Listing.REJECTED) and not privileged:
            raise Http404
        return listing, privileged

    def get(self, request, slug):
        listing, privileged = self.get_object(request, slug)
        return Response((OwnerListingSerializer if privileged else ListingSerializer)(listing).data)

    def patch(self, request, slug):
        listing, privileged = self.get_object(request, slug)
        if not privileged:
            return Response({"detail": "Not allowed."}, status=403)
        s = ListingWriteSerializer(listing, data=request.data, partial=True)
        s.is_valid(raise_exception=True)
        s.save()
        if not request.user.is_staff:  # an edit by the organization goes back through moderation
            listing.status, listing.rejection_reason = Listing.PENDING, ""
        listing.flags = listing.compute_flags()
        listing.save()
        return Response(OwnerListingSerializer(listing).data)


class MyListings(generics.ListAPIView):
    permission_classes = [IsOrgAccount]
    serializer_class = OwnerListingSerializer

    def get_queryset(self):
        return self.request.user.organization.listings.select_related("organization__owner", "posting_type")


class CloseListing(APIView):
    permission_classes = [IsOrgAccount]

    def post(self, request, slug):
        try:
            listing = request.user.organization.listings.get(slug=slug)
        except Listing.DoesNotExist:
            raise Http404
        listing.status = Listing.CLOSED
        listing.save(update_fields=["status"])
        return Response(OwnerListingSerializer(listing).data)


class OrgMe(generics.RetrieveUpdateAPIView):
    permission_classes = [IsOrgAccount]
    serializer_class = OrgSerializer

    def get_object(self):
        return self.request.user.organization


class PostingTypes(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response([{"slug": t.slug, "name": t.name, "schema": t.schema} for t in PostingType.objects.all()])


# ---- saved jobs (verified seekers) -------------------------------------------------------------

class SavedList(generics.ListAPIView):
    permission_classes = [VerifiedUser]
    serializer_class = ListingSerializer

    def get_queryset(self):
        return Listing.objects.filter(saves__user=self.request.user, status__in=[Listing.APPROVED, Listing.CLOSED]) \
            .select_related("organization", "posting_type").order_by("-saves__created_at")

    pagination_class = None


class SavedToggle(APIView):
    permission_classes = [VerifiedUser]

    def _listing(self, slug):
        try:
            return Listing.objects.get(slug=slug, status=Listing.APPROVED)
        except Listing.DoesNotExist:
            raise Http404

    def put(self, request, slug):
        SavedJob.objects.get_or_create(user=request.user, listing=self._listing(slug))
        return Response({"saved": True})

    def delete(self, request, slug):
        SavedJob.objects.filter(user=request.user, listing__slug=slug).delete()
        return Response({"saved": False})


# ---- reports ---------------------------------------------------------------------------------

class ReportView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "report"

    def post(self, request, slug):
        try:
            listing = Listing.objects.get(slug=slug)
        except Listing.DoesNotExist:
            raise Http404
        s = ReportSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        Report.objects.create(listing=listing, reporter=request.user if request.user.is_authenticated else None, **s.validated_data)
        return Response({"detail": "Thanks. We will review this listing."}, status=201)


# ---- admin moderation ------------------------------------------------------------------------

class AdminQueue(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = OwnerListingSerializer
    pagination_class = None

    def get_queryset(self):
        st = self.request.query_params.get("status", Listing.PENDING)
        return Listing.objects.filter(status=st).select_related("organization__owner", "posting_type").order_by("created_at")


class AdminApprove(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, slug):
        try:
            listing = Listing.objects.select_related("organization__owner", "posting_type").get(slug=slug)
        except Listing.DoesNotExist:
            raise Http404
        was_live = listing.status == Listing.APPROVED
        listing.status, listing.rejection_reason = Listing.APPROVED, ""
        if not listing.posted_at:
            listing.posted_at = timezone.now()
        listing.save()
        if not was_live:
            distribute(listing)  # swallows its own errors: the listing is already live
        return Response(OwnerListingSerializer(listing).data)


class AdminReject(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, slug):
        reason = (request.data.get("reason") or "").strip()
        if not reason:
            return Response({"reason": "Give the organization a reason."}, status=400)
        try:
            listing = Listing.objects.select_related("organization__owner", "posting_type").get(slug=slug)
        except Listing.DoesNotExist:
            raise Http404
        listing.status, listing.rejection_reason = Listing.REJECTED, reason[:300]
        listing.save(update_fields=["status", "rejection_reason"])
        return Response(OwnerListingSerializer(listing).data)


class AdminOrgs(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response([{**OrgSerializer(o).data, "email": o.owner.email, "listings": o.listings.count()}
                         for o in Organization.objects.select_related("owner")])


class AdminOrgAction(APIView):
    """POST /admin/orgs/<slug>/<verify|unverify|suspend|unsuspend>/ (PRD AD-2)."""
    permission_classes = [IsAdmin]
    ACTIONS = {"verify": ("verified", True), "unverify": ("verified", False),
               "suspend": ("suspended", True), "unsuspend": ("suspended", False)}

    def post(self, request, slug, action):
        if action not in self.ACTIONS:
            raise Http404
        try:
            org = Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            raise Http404
        field, value = self.ACTIONS[action]
        setattr(org, field, value)
        org.save(update_fields=[field])
        return Response(OrgSerializer(org).data)
