from django.conf import settings
from django.contrib.auth import authenticate, password_validation
from django.core import signing
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.http import HttpResponseRedirect
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from listings.models import Organization

from .emails import send_reset_email, send_verification_email
from .models import User
from .serializers import (LoginSerializer, ResetConfirmSerializer, SignupSerializer, user_payload)
from .tokens import read_reset_token, read_verify_token


def _unique_org_slug(name):
    base = slugify(name)[:60] or "org"
    slug, n = base, 2
    while Organization.objects.filter(slug=slug).exists():
        slug, n = f"{base}-{n}", n + 1
    return slug


class SignupView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "signup"

    @transaction.atomic
    def post(self, request):
        s = SignupSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        d = s.validated_data
        user = User.objects.create_user(
            d["email"], d["password"], name=d["name"],
            account_type=User.ORG if d["hiring"] else User.SEEKER,
        )
        if d["hiring"]:
            Organization.objects.create(
                owner=user, name=d["organization"].strip(), slug=_unique_org_slug(d["organization"]),
                website=d.get("website", ""),
            )
        send_verification_email(user, request)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": user_payload(user)}, status=status.HTTP_201_CREATED)


class VerifyView(APIView):
    """GET is the link in the email: verify, then send the browser to the React signup page."""
    permission_classes = [AllowAny]

    def _verify(self, token):
        try:
            user = read_verify_token(token or "")
        except (signing.BadSignature, User.DoesNotExist):
            return None
        if not user.email_verified:
            user.email_verified, user.email_verified_at = True, timezone.now()
            user.save(update_fields=["email_verified", "email_verified_at"])
        return user

    def get(self, request):
        ok = self._verify(request.query_params.get("token"))
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/signup?status={'verified' if ok else 'expired'}")

    def post(self, request):
        user = self._verify(request.data.get("token"))
        if not user:
            return Response({"detail": "This link is invalid or has expired."}, status=400)
        return Response({"user": user_payload(user)})


class ResendView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "resend"

    def post(self, request):
        # Same answer whether or not the address exists, so this cannot be used to probe accounts.
        email = (request.data.get("email") or (request.user.email if request.user.is_authenticated else "")).lower()
        user = User.objects.filter(email=email, email_verified=False, is_active=True).first()
        if user:
            send_verification_email(user, request)
        return Response({"detail": "If that account needs verifying, a new email is on its way."})


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        s = LoginSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        user = authenticate(request, username=s.validated_data["email"].lower(), password=s.validated_data["password"])
        if not user:
            return Response({"detail": "Email or password is incorrect."}, status=400)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": user_payload(user)})


class LogoutView(APIView):
    def post(self, request):
        Token.objects.filter(user=request.user).delete()
        return Response(status=204)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(user_payload(request.user))

    def patch(self, request):
        name = (request.data.get("name") or "").strip()
        if name:
            request.user.name = name[:120]
            request.user.save(update_fields=["name"])
        return Response(user_payload(request.user))

    def delete(self, request):
        """Delete personal data on request (PRD section 9)."""
        request.user.delete()
        return Response(status=204)


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "reset"

    def post(self, request):
        user = User.objects.filter(email=(request.data.get("email") or "").lower(), is_active=True).first()
        if user:
            send_reset_email(user)
        return Response({"detail": "If that email has an account, a reset link is on its way."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "reset"

    def post(self, request):
        s = ResetConfirmSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        try:
            user = read_reset_token(s.validated_data["token"])
        except signing.BadSignature:
            return Response({"detail": "This reset link is invalid or has expired."}, status=400)
        try:
            password_validation.validate_password(s.validated_data["password"], user)
        except DjangoValidationError as e:
            return Response({"password": list(e.messages)}, status=400)
        user.set_password(s.validated_data["password"])
        user.save(update_fields=["password"])
        Token.objects.filter(user=user).delete()
        return Response({"detail": "Password updated. Please sign in."})
