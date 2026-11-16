from django.contrib import admin
from .models import SavedSearch

admin.site.register(SavedSearch, type("SavedSearchAdmin", (admin.ModelAdmin,), {"list_display": ("name", "user", "frequency", "active", "last_sent")}))
