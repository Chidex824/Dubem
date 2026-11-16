from django.urls import path
from . import views as v

urlpatterns = [
    path("jobs/", v.JobList.as_view()),
    path("jobs/<slug:slug>/", v.JobDetail.as_view()),
    path("jobs/<slug:slug>/close/", v.CloseListing.as_view()),
    path("jobs/<slug:slug>/report/", v.ReportView.as_view()),
    path("my/jobs/", v.MyListings.as_view()),
    path("orgs/me/", v.OrgMe.as_view()),
    path("posting-types/", v.PostingTypes.as_view()),
    path("saved/", v.SavedList.as_view()),
    path("saved/<slug:slug>/", v.SavedToggle.as_view()),
    path("admin/queue/", v.AdminQueue.as_view()),
    path("admin/jobs/<slug:slug>/approve/", v.AdminApprove.as_view()),
    path("admin/jobs/<slug:slug>/reject/", v.AdminReject.as_view()),
    path("admin/orgs/", v.AdminOrgs.as_view()),
    path("admin/orgs/<slug:slug>/<str:action>/", v.AdminOrgAction.as_view()),
]
