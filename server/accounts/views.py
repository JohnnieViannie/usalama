from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
import hashlib
import secrets
from datetime import timedelta
import random

from accounts.models import DashboardInvite, Profile
from accounts.serializers import GuardRegistrationSerializer
from accounts.utils import user_payload
from operations.permissions import IsClient


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    phone = request.data.get('phone')
    pin = request.data.get('pin')

    user = None

    if email and password:
        user = authenticate(request, username=email, password=password)
        if user is None:
            try:
                u = User.objects.get(email__iexact=email.strip())
                user = authenticate(request, username=u.username, password=password)
            except User.DoesNotExist:
                pass
    elif phone and pin:
        p = (
            Profile.objects.select_related('user')
            .filter(phone=phone.strip())
            .first()
        )
        if p:
            if p.pin_hash:
                if check_password(pin, p.pin_hash):
                    user = p.user
            elif pin == '1234':
                user = p.user

    if user is None:
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if not user.is_active:
        return Response(
            {'detail': 'Email not verified. Please verify your email first.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    prof: Profile = user.profile
    if prof.role == Profile.Role.GUARD and prof.onboarding_status == Profile.OnboardingStatus.REJECTED:
        return Response(
            {
                'detail': 'Guard registration rejected',
                'onboardingStatus': prof.onboarding_status,
            },
            status=status.HTTP_403_FORBIDDEN,
        )
    refresh = RefreshToken.for_user(user)
    access = str(refresh.access_token)

    return Response(
        {
            'user': user_payload(user),
            'role': prof.role,
            'token': access,
            'refresh': str(refresh),
        }
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def guard_register(request):
    email = (request.data.get('email') or '').strip().lower()
    if not email:
        return Response({'detail': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'detail': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
    ser = GuardRegistrationSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    user = ser.save()
    user.is_active = False
    user.save(update_fields=['is_active'])
    profile = user.profile
    code = f"{random.randint(0, 999999):06d}"
    profile.email_verification_code = code
    profile.email_verification_expires_at = timezone.now() + timedelta(minutes=10)
    profile.email_verified_at = None
    profile.save(update_fields=['email_verification_code', 'email_verification_expires_at', 'email_verified_at'])
    send_mail(
        subject='Your Uslama verification code',
        message=(
            f'Your verification code is: {code}\n\n'
            'It expires in 10 minutes.'
        ),
        from_email=None,
        recipient_list=[user.email],
        fail_silently=False,
    )
    return Response(
        {
            'ok': True,
            'email': user.email,
            'onboardingStatus': profile.onboarding_status,
            'linkedClientId': profile.linked_client_id,
            'requiresEmailVerification': True,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def guard_verify_email(request):
    email = (request.data.get('email') or '').strip().lower()
    code = (request.data.get('code') or '').strip()
    if not email or not code:
        return Response({'detail': 'email and code are required'}, status=status.HTTP_400_BAD_REQUEST)
    if len(code) != 6 or not code.isdigit():
        return Response({'detail': 'code must be a 6-digit number'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.select_related('profile').filter(email__iexact=email).first()
    if not user or user.profile.role != Profile.Role.GUARD:
        return Response({'detail': 'Guard account not found'}, status=status.HTTP_404_NOT_FOUND)

    profile = user.profile
    if profile.email_verified_at is not None:
        return Response({'ok': True, 'email': user.email, 'alreadyVerified': True})
    if profile.email_verification_code != code:
        return Response({'detail': 'Invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
    if profile.email_verification_expires_at is None or timezone.now() > profile.email_verification_expires_at:
        return Response({'detail': 'Verification code expired'}, status=status.HTTP_400_BAD_REQUEST)

    profile.email_verified_at = timezone.now()
    profile.email_verification_code = ''
    profile.email_verification_expires_at = None
    profile.save(update_fields=['email_verified_at', 'email_verification_code', 'email_verification_expires_at'])
    user.is_active = True
    user.save(update_fields=['is_active'])

    return Response({'ok': True, 'email': user.email, 'verified': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def company_signup(request):
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''
    company_name = (request.data.get('companyName') or '').strip()
    first_name = (request.data.get('firstName') or '').strip()
    last_name = (request.data.get('lastName') or '').strip()
    if not email or not password or not company_name:
        return Response(
            {'detail': 'email, password and companyName are required'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(password) < 8:
        return Response({'detail': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'detail': 'Email already registered'}, status=status.HTTP_400_BAD_REQUEST)
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    p = user.profile
    p.role = Profile.Role.CLIENT
    p.company_name = company_name
    p.onboarding_status = Profile.OnboardingStatus.APPROVED
    p.save()
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            'user': user_payload(user),
            'role': p.role,
            'token': str(refresh.access_token),
            'refresh': str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def guard_registration_status(request):
    email = (request.query_params.get('email') or '').strip().lower()
    phone = (request.query_params.get('phone') or '').strip()
    if not email and not phone:
        return Response({'detail': 'email or phone is required'}, status=status.HTTP_400_BAD_REQUEST)
    q = User.objects.select_related('profile')
    if email:
        q = q.filter(email__iexact=email)
    else:
        q = q.filter(profile__phone=phone)
    user = q.first()
    if not user or user.profile.role != Profile.Role.GUARD:
        return Response(
            {'registered': False, 'email': email, 'onboardingStatus': None},
            status=status.HTTP_200_OK,
        )
    p = user.profile
    return Response(
        {
            'registered': True,
            'email': user.email,
            'name': (user.get_full_name() or user.username).strip(),
            'phone': p.phone,
            'phoneCountryCode': p.phone_country_code,
            'country': p.country,
            'dateOfBirth': p.date_of_birth.isoformat() if p.date_of_birth else None,
            'companyName': p.company_name,
            'onboardingStatus': p.onboarding_status,
            'siteId': p.site_id,
            'linkedClientId': p.linked_client_id,
        }
    )


@api_view(['POST'])
@permission_classes([IsClient])
def guard_link(request):
    email = (request.data.get('email') or '').strip().lower()
    phone = (request.data.get('phone') or '').strip()
    if not email and not phone:
        return Response({'detail': 'email or phone is required'}, status=status.HTTP_400_BAD_REQUEST)
    q = User.objects.select_related('profile')
    if email:
        q = q.filter(email__iexact=email)
    else:
        q = q.filter(profile__phone=phone)
    user = q.first()
    if not user or user.profile.role != Profile.Role.GUARD:
        return Response({'detail': 'Guard not found'}, status=status.HTTP_404_NOT_FOUND)
    p = user.profile
    p.linked_client = request.user
    p.onboarding_status = Profile.OnboardingStatus.APPROVED
    if not p.guard_status:
        p.guard_status = Profile.GuardStatus.ACTIVE
    p.save(update_fields=['linked_client', 'onboarding_status', 'guard_status'])
    return Response({'ok': True, 'guardId': p.external_id or str(user.pk), 'email': user.email, 'phone': p.phone})


def _set_guard_approval(email: str, approved: bool):
    user = User.objects.filter(email__iexact=email.strip().lower()).select_related('profile').first()
    if not user or user.profile.role != Profile.Role.GUARD:
        return None
    p = user.profile
    p.onboarding_status = (
        Profile.OnboardingStatus.APPROVED if approved else Profile.OnboardingStatus.REJECTED
    )
    if approved and not p.guard_status:
        p.guard_status = Profile.GuardStatus.ACTIVE
    p.save(update_fields=['onboarding_status', 'guard_status'])
    return p


@api_view(['POST'])
@permission_classes([IsClient])
def guard_approve(request):
    email = (request.data.get('email') or '').strip()
    if not email:
        return Response({'detail': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
    profile = _set_guard_approval(email, approved=True)
    if profile is None:
        return Response({'detail': 'Guard not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'ok': True, 'email': email, 'onboardingStatus': profile.onboarding_status})


@api_view(['POST'])
@permission_classes([IsClient])
def guard_reject(request):
    email = (request.data.get('email') or '').strip()
    if not email:
        return Response({'detail': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
    profile = _set_guard_approval(email, approved=False)
    if profile is None:
        return Response({'detail': 'Guard not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'ok': True, 'email': email, 'onboardingStatus': profile.onboarding_status})


def _invite_hash(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode('utf-8')).hexdigest()


@api_view(['POST'])
@permission_classes([IsClient])
def dashboard_invite_create(request):
    email = (request.data.get('email') or '').strip().lower()
    if not email:
        return Response({'detail': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
    first_name = (request.data.get('firstName') or '').strip()
    last_name = (request.data.get('lastName') or '').strip()
    company_name = (request.data.get('companyName') or '').strip()

    raw_token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timedelta(days=3)
    invite, _ = DashboardInvite.objects.update_or_create(
        email=email,
        defaults={
            'first_name': first_name,
            'last_name': last_name,
            'company_name': company_name,
            'token_hash': _invite_hash(raw_token),
            'expires_at': expires_at,
            'accepted_at': None,
            'created_by': request.user,
        },
    )
    return Response(
        {
            'ok': True,
            'email': invite.email,
            'expiresAt': invite.expires_at.isoformat(),
            'inviteToken': raw_token,
            'inviteUrl': f'/accept-invite?token={raw_token}',
        }
    )


@api_view(['GET'])
@permission_classes([AllowAny])
def dashboard_invite_status(request):
    raw_token = (request.query_params.get('token') or '').strip()
    if not raw_token:
        return Response({'detail': 'token is required'}, status=status.HTTP_400_BAD_REQUEST)
    invite = DashboardInvite.objects.filter(token_hash=_invite_hash(raw_token)).first()
    if not invite:
        return Response({'valid': False, 'detail': 'Invalid invite token'}, status=status.HTTP_404_NOT_FOUND)
    if not invite.is_active:
        return Response({'valid': False, 'detail': 'Invite expired or already used'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(
        {
            'valid': True,
            'email': invite.email,
            'firstName': invite.first_name,
            'lastName': invite.last_name,
            'companyName': invite.company_name,
            'expiresAt': invite.expires_at.isoformat(),
        }
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def dashboard_invite_accept(request):
    raw_token = (request.data.get('token') or '').strip()
    password = request.data.get('password') or ''
    if not raw_token or not password:
        return Response({'detail': 'token and password are required'}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 8:
        return Response({'detail': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
    invite = DashboardInvite.objects.filter(token_hash=_invite_hash(raw_token)).first()
    if not invite:
        return Response({'detail': 'Invalid invite token'}, status=status.HTTP_404_NOT_FOUND)
    if not invite.is_active:
        return Response({'detail': 'Invite expired or already used'}, status=status.HTTP_400_BAD_REQUEST)

    username = invite.email
    user, created = User.objects.get_or_create(
        username=username,
        defaults={
            'email': invite.email,
            'first_name': invite.first_name,
            'last_name': invite.last_name,
            'is_active': True,
        },
    )
    if not created and user.email.lower() != invite.email.lower():
        user.email = invite.email
    user.set_password(password)
    user.first_name = invite.first_name
    user.last_name = invite.last_name
    user.is_active = True
    user.save()

    p = user.profile
    p.role = Profile.Role.CLIENT
    if invite.company_name:
        p.company_name = invite.company_name
    p.onboarding_status = Profile.OnboardingStatus.APPROVED
    p.save()

    invite.accepted_at = timezone.now()
    invite.save(update_fields=['accepted_at'])
    return Response({'ok': True, 'email': user.email})


@api_view(['GET', 'POST'])
@permission_classes([IsClient])
def company_settings(request):
    p = request.user.profile
    if request.method == 'GET':
        return Response(
            {
                'companyName': p.company_name or '',
                'contactEmail': request.user.email or '',
                'contactPhone': p.phone or '',
                'address': p.company_address or '',
            }
        )
    company_name = (request.data.get('companyName') or '').strip()
    contact_email = (request.data.get('contactEmail') or '').strip().lower()
    contact_phone = (request.data.get('contactPhone') or '').strip()
    address = (request.data.get('address') or '').strip()
    if not company_name:
        return Response({'detail': 'companyName is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not contact_email:
        return Response({'detail': 'contactEmail is required'}, status=status.HTTP_400_BAD_REQUEST)
    request.user.email = contact_email
    p.company_name = company_name
    p.phone = contact_phone
    p.company_address = address
    request.user.save(update_fields=['email'])
    p.save(update_fields=['company_name', 'phone', 'company_address'])
    return Response(
        {
            'ok': True,
            'companyName': p.company_name,
            'contactEmail': request.user.email,
            'contactPhone': p.phone,
            'address': p.company_address,
        }
    )
