from django.contrib import admin

from accounts.models import DashboardInvite, Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'role',
        'external_id',
        'phone',
        'site',
        'guard_status',
        'onboarding_status',
        'company_name',
        'linked_client',
    )
    list_filter = ('role', 'onboarding_status', 'guard_status')
    search_fields = ('user__username', 'user__email', 'external_id', 'phone', 'company_name')


@admin.register(DashboardInvite)
class DashboardInviteAdmin(admin.ModelAdmin):
    list_display = ('email', 'company_name', 'created_by', 'expires_at', 'accepted_at', 'created_at')
    search_fields = ('email', 'company_name')
    list_filter = ('accepted_at',)
