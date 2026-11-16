from django.contrib.auth import password_validation
from rest_framework import serializers

from .models import User


def user_payload(user):
    org = getattr(user, "organization", None)
    return {
        "id": user.pk, "name": user.name, "email": user.email, "role": user.role,
        "emailVerified": user.email_verified,
        "organization": {"name": org.name, "slug": org.slug, "verified": org.verified} if org else None,
    }


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    hiring = serializers.BooleanField(default=False)
    organization = serializers.CharField(max_length=160, required=False, allow_blank=True)
    website = serializers.URLField(required=False, allow_blank=True)
    terms = serializers.BooleanField()

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def validate_terms(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms.")
        return value

    def validate(self, data):
        if data.get("hiring") and not data.get("organization", "").strip():
            raise serializers.ValidationError({"organization": "Organization name is required when hiring."})
        password_validation.validate_password(data["password"], User(email=data["email"], name=data["name"]))
        return data


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(trim_whitespace=False)


class ResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(trim_whitespace=False)
