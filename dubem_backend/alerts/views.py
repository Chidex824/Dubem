from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from listings.views import VerifiedUser

from .models import SavedSearch
from .serializers import AlertSerializer


class AlertList(generics.ListCreateAPIView):
    permission_classes = [VerifiedUser]
    serializer_class = AlertSerializer
    pagination_class = None

    def get_queryset(self):
        return self.request.user.alerts.all()

    def perform_create(self, s):
        if self.request.user.alerts.count() >= 20:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You can keep up to 20 alerts.")
        s.save(user=self.request.user)


class AlertDetail(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [VerifiedUser]
    serializer_class = AlertSerializer

    def get_queryset(self):
        return self.request.user.alerts.all()


class Unsubscribe(APIView):
    """One click from the email, no login (GET for the link, POST for mail clients' one-click header)."""
    permission_classes = [AllowAny]

    def _do(self, token):
        a = get_object_or_404(SavedSearch, unsubscribe_token=token)
        a.active = False
        a.save(update_fields=["active"])
        return Response({"detail": f'Alert "{a.name}" turned off.'})

    def get(self, request, token):
        return self._do(token)

    def post(self, request, token):
        return self._do(token)
