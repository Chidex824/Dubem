from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create(self, email, password, **extra):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("is_staff", False)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True, email_verified=True)
        return self._create(email, password, **extra)


class User(AbstractBaseUser, PermissionsMixin):
    SEEKER, ORG = "seeker", "org"
    ACCOUNT_TYPES = [(SEEKER, "Seeker"), (ORG, "Organization")]

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=120)
    account_type = models.CharField(max_length=10, choices=ACCOUNT_TYPES, default=SEEKER)
    email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email

    @property
    def role(self):
        """The four roles the React app understands (guest is "no user")."""
        if self.is_staff:
            return "admin"
        return self.account_type
