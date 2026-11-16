from django.conf import settings
from django.core.mail import send_mail

from .tokens import make_reset_token, make_verify_token


def send_verification_email(user, request=None):
    token = make_verify_token(user)
    base = (request.build_absolute_uri("/api/auth/verify/") if request else f"{settings.FRONTEND_URL}/api/auth/verify/")
    link = f"{base}?token={token}"
    send_mail(
        "Confirm your Dubem email",
        f"Hi {user.name},\n\nConfirm your email to finish setting up your Dubem account:\n{link}\n\n"
        "The link works for 48 hours. If you did not sign up, ignore this email.\n\nDubem\n"
        "Reminder: a real employer never asks you to pay to get a job.",
        settings.DEFAULT_FROM_EMAIL, [user.email],
    )


def send_reset_email(user):
    link = f"{settings.FRONTEND_URL}/reset-password?token={make_reset_token(user)}"
    send_mail(
        "Reset your Dubem password",
        f"Hi {user.name},\n\nChoose a new password here (valid for 2 hours):\n{link}\n\n"
        "If you did not ask for this, you can ignore this email.\n\nDubem",
        settings.DEFAULT_FROM_EMAIL, [user.email],
    )
