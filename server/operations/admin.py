from django.contrib import admin

from operations.models import (
    Alert,
    Checkpoint,
    GuardLocationPing,
    Incident,
    PanicEvent,
    PatrolLog,
    ReportEntry,
    ScheduledShift,
    ShiftEvent,
    Site,
)


@admin.register(Site)
class SiteAdmin(admin.ModelAdmin):
    pass


@admin.register(Checkpoint)
class CheckpointAdmin(admin.ModelAdmin):
    list_display = ('slug', 'name', 'site', 'code')


@admin.register(ScheduledShift)
class ScheduledShiftAdmin(admin.ModelAdmin):
    list_display = ('guard', 'site', 'day', 'start_time', 'end_time')


@admin.register(ShiftEvent)
class ShiftEventAdmin(admin.ModelAdmin):
    list_display = ('guard', 'site', 'kind', 'at')


@admin.register(PatrolLog)
class PatrolLogAdmin(admin.ModelAdmin):
    list_display = ('guard', 'checkpoint', 'timestamp', 'status')


@admin.register(GuardLocationPing)
class GuardLocationPingAdmin(admin.ModelAdmin):
    list_display = ('guard', 'site', 'checkpoint', 'source', 'timestamp', 'latitude', 'longitude')
    list_filter = ('source', 'site')


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ('guard', 'site', 'title', 'timestamp')


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('type', 'guard', 'timestamp', 'status')


@admin.register(PanicEvent)
class PanicEventAdmin(admin.ModelAdmin):
    list_display = ('guard', 'created_at',)


@admin.register(ReportEntry)
class ReportEntryAdmin(admin.ModelAdmin):
    list_display = ('slug', 'label', 'period_start', 'period_end')
