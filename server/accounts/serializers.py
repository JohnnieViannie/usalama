from django.contrib.auth.models import User
from rest_framework import serializers

from accounts.models import Profile


class GuardRegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150, required=False, allow_blank=True)
    dateOfBirth = serializers.DateField()
    country = serializers.CharField(max_length=80)
    phoneCountryCode = serializers.CharField(max_length=8)
    phone = serializers.CharField(max_length=32)
    companyName = serializers.CharField(max_length=255, required=False, allow_blank=True)
    emergencyContact = serializers.CharField(max_length=64, required=False, allow_blank=True)
    registrationNotes = serializers.CharField(required=False, allow_blank=True)
    passportImage = serializers.ImageField()

    def create(self, validated_data):
        email = validated_data['email'].strip().lower()
        username = email
        first = validated_data.get('firstName', '').strip()
        last = validated_data.get('lastName', '').strip()
        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=first,
            last_name=last,
        )
        profile = user.profile
        profile.role = Profile.Role.GUARD
        profile.phone = validated_data.get('phone', '').strip()
        profile.phone_country_code = validated_data.get('phoneCountryCode', '').strip()
        profile.country = validated_data.get('country', '').strip()
        profile.date_of_birth = validated_data.get('dateOfBirth')
        profile.passport_image = validated_data.get('passportImage')
        profile.company_name = validated_data.get('companyName', '').strip()
        profile.emergency_contact = validated_data.get('emergencyContact', '').strip()
        profile.registration_notes = validated_data.get('registrationNotes', '').strip()
        profile.onboarding_status = Profile.OnboardingStatus.APPROVED
        profile.guard_status = Profile.GuardStatus.ACTIVE
        profile.linked_client = None
        profile.save()
        return user
