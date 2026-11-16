from django.urls import path
from . import views as v

urlpatterns = [
    path("events/", v.RecordEvent.as_view()),
    path("admin/analytics/", v.AdminAnalytics.as_view()),
    path("my/stats/", v.OrgStats.as_view()),
]
