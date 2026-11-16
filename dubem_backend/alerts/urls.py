from django.urls import path
from . import views as v

urlpatterns = [
    path("alerts/", v.AlertList.as_view()),
    path("alerts/unsubscribe/<str:token>/", v.Unsubscribe.as_view()),
    path("alerts/<int:pk>/", v.AlertDetail.as_view()),
]
