from django.contrib.auth.models import User

from accounts.models import Profile


def user_payload(user: User) -> dict:
    p: Profile = user.profile
    site = p.site
    return {
        'id': p.external_id or str(user.pk),
        'name': (user.get_full_name() or user.first_name or user.username).strip(),
        'email': user.email or '',
        'phone': p.phone,
        'phoneCountryCode': p.phone_country_code,
        'country': p.country,
        'dateOfBirth': p.date_of_birth.isoformat() if p.date_of_birth else None,
        'passportImage': p.passport_image.url if p.passport_image else None,
        'siteId': site.slug if site else None,
        'siteName': site.name if site else None,
        'companyName': p.company_name,
        'onboardingStatus': p.onboarding_status,
        'linkedClientId': str(p.linked_client_id) if p.linked_client_id else None,
    }
