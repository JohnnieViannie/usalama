from rest_framework.permissions import BasePermission

from accounts.models import Profile


def _safe_profile(user):
    try:
        return user.profile
    except Profile.DoesNotExist:
        return None


class IsGuard(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        p = _safe_profile(request.user)
        return p is not None and p.role == Profile.Role.GUARD


class IsClient(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        p = _safe_profile(request.user)
        return p is not None and p.role == Profile.Role.CLIENT


class IsClientOrGuardRead(BasePermission):
    """Client monitoring or guard (own) — use per-view get_queryset for guard scope."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        p = _safe_profile(request.user)
        return p is not None and p.role in (Profile.Role.CLIENT, Profile.Role.GUARD)
