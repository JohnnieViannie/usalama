from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


class Profile(models.Model):
    class Role(models.TextChoices):
        GUARD = 'guard', 'Guard'
        CLIENT = 'client', 'Client'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=Role.choices)
    external_id = models.CharField(max_length=32, unique=True, null=True, blank=True)
    phone = models.CharField(max_length=32, blank=True)
    pin_hash = models.CharField(max_length=128, blank=True)
    site = models.ForeignKey(
        'operations.Site',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='assigned_guards',
    )

    class GuardStatus(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        ON_DUTY = 'on_duty', 'On duty'

    class OnboardingStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    guard_status = models.CharField(
        max_length=16,
        choices=GuardStatus.choices,
        blank=True,
        default='',
    )
    onboarding_status = models.CharField(
        max_length=16,
        choices=OnboardingStatus.choices,
        default=OnboardingStatus.PENDING,
    )
    company_name = models.CharField(max_length=255, blank=True)
    company_address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=64, blank=True)
    registration_notes = models.TextField(blank=True)
    country = models.CharField(max_length=80, blank=True)
    phone_country_code = models.CharField(max_length=8, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    passport_image = models.ImageField(upload_to='passports/', null=True, blank=True)
    email_verification_code = models.CharField(max_length=6, blank=True)
    email_verification_expires_at = models.DateTimeField(null=True, blank=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    linked_client = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='linked_guards',
    )

    def __str__(self):
        return f'{self.user.username} ({self.role})'


class DashboardInvite(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    company_name = models.CharField(max_length=255, blank=True)
    token_hash = models.CharField(max_length=128, unique=True)
    expires_at = models.DateTimeField()
    accepted_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_dashboard_invites'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def is_active(self):
        return self.accepted_at is None and self.expires_at > timezone.now()
