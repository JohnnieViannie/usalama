from django.conf import settings
from django.db import models


class Site(models.Model):
    slug = models.CharField(max_length=16, primary_key=True)
    name = models.CharField(max_length=255)
    location = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Checkpoint(models.Model):
    slug = models.CharField(max_length=16, primary_key=True)
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='checkpoints')
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=64)

    def __str__(self):
        return self.name


class ScheduledShift(models.Model):
    """Planned shift template (optional UI)."""
    guard = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scheduled_shifts')
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    day = models.CharField(max_length=3)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        ordering = ['day', 'start_time']


class ShiftEvent(models.Model):
    class Kind(models.TextChoices):
        START = 'start', 'Start'
        END = 'end', 'End'

    guard = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='shift_events')
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    kind = models.CharField(max_length=8, choices=Kind.choices)
    at = models.DateTimeField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True)


class PatrolLog(models.Model):
    guard = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patrol_logs')
    checkpoint = models.ForeignKey(Checkpoint, on_delete=models.CASCADE)
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    timestamp = models.DateTimeField()
    status = models.CharField(max_length=16)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']


class GuardLocationPing(models.Model):
    class Source(models.TextChoices):
        SCAN = 'scan', 'Scan'
        BACKGROUND = 'background', 'Background'
        SHIFT = 'shift', 'Shift'

    guard = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='location_pings'
    )
    site = models.ForeignKey(Site, on_delete=models.CASCADE, related_name='location_pings')
    checkpoint = models.ForeignKey(
        Checkpoint, on_delete=models.SET_NULL, null=True, blank=True, related_name='location_pings'
    )
    timestamp = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    source = models.CharField(max_length=16, choices=Source.choices, default=Source.BACKGROUND)
    accuracy_m = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-timestamp']


class Incident(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        CLOSED = 'closed', 'Closed'

    guard = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='incidents')
    site = models.ForeignKey(Site, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    timestamp = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.OPEN)
    image = models.ImageField(upload_to='incidents/', null=True, blank=True)
    image_url = models.URLField(blank=True)

    class Meta:
        ordering = ['-timestamp']


class Alert(models.Model):
    class Type(models.TextChoices):
        PANIC = 'panic', 'Panic'
        MISSED_CHECKPOINT = 'missed_checkpoint', 'Missed checkpoint'
        LATE_SHIFT = 'late_shift', 'Late shift'

    class Status(models.TextChoices):
        RESOLVED = 'resolved', 'Resolved'
        UNRESOLVED = 'unresolved', 'Unresolved'

    type = models.CharField(max_length=32, choices=Type.choices)
    guard = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alerts')
    timestamp = models.DateTimeField()
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.UNRESOLVED)

    class Meta:
        ordering = ['-timestamp']


class PanicEvent(models.Model):
    guard = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='panic_events')
    created_at = models.DateTimeField()
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)


class ReportEntry(models.Model):
    """Metadata for downloadable reports (PDF URLs)."""
    slug = models.CharField(max_length=32, primary_key=True)
    company = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='report_entries',
        null=True,
        blank=True,
    )
    label = models.CharField(max_length=255)
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    download_url = models.URLField()
    filters_json = models.TextField(blank=True)
