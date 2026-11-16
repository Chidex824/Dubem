"""Signed, expiring tokens. No database table needed, and a reset token stops working
as soon as the password changes because the password hash is part of the salt."""
from django.conf import settings
from django.core import signing

from .models import User

VERIFY_SALT = "dubem.verify"
RESET_SALT = "dubem.reset"
UNSUB_SALT = "dubem.unsub"


def make_verify_token(user):
    return signing.dumps({"u": user.pk, "e": user.email}, salt=VERIFY_SALT)


def read_verify_token(token):
    """Returns the user, or raises signing.BadSignature / SignatureExpired / User.DoesNotExist."""
    data = signing.loads(token, salt=VERIFY_SALT, max_age=settings.VERIFY_TOKEN_MAX_AGE)
    return User.objects.get(pk=data["u"], email=data["e"])


def make_reset_token(user):
    # "<user id>.<signed payload>": the id picks the user, the signature uses their password hash as salt
    return f"{user.pk}.{signing.dumps({'u': user.pk}, salt=RESET_SALT + user.password[-12:])}"


def read_reset_token(token):
    try:
        uid, signed = token.split(".", 1)
        user = User.objects.get(pk=int(uid))
    except (ValueError, User.DoesNotExist):
        raise signing.BadSignature("bad token")
    signing.loads(signed, salt=RESET_SALT + user.password[-12:], max_age=settings.RESET_TOKEN_MAX_AGE)
    return user
