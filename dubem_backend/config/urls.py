from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", lambda r: JsonResponse({"ok": True})),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("listings.urls")),
    path("api/", include("alerts.urls")),
    path("api/", include("analytics.urls")),
]
