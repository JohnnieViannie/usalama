from rest_framework import serializers

from operations.models import (
    Alert,
    Checkpoint,
    GuardLocationPing,
    Incident,
    PatrolLog,
    ReportEntry,
    Site,
)


class CheckpointSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='slug', read_only=True)
    siteId = serializers.CharField(source='site_id')

    class Meta:
        model = Checkpoint
        fields = ('id', 'name', 'siteId', 'code')


class PatrolLogSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    def get_id(self, obj):
        return str(obj.pk)
    guardId = serializers.SerializerMethodField()
    checkpointId = serializers.CharField(source='checkpoint.slug')
    siteId = serializers.CharField(source='site.slug')
    timestamp = serializers.DateTimeField()
    guardName = serializers.SerializerMethodField()
    checkpointName = serializers.CharField(source='checkpoint.name', read_only=True)
    latitude = serializers.FloatField(required=False, allow_null=True)
    longitude = serializers.FloatField(required=False, allow_null=True)

    class Meta:
        model = PatrolLog
        fields = (
            'id',
            'guardId',
            'checkpointId',
            'siteId',
            'timestamp',
            'status',
            'guardName',
            'checkpointName',
            'latitude',
            'longitude',
        )

    def get_guardId(self, obj):
        ext = getattr(obj.guard, 'profile', None)
        if ext and ext.external_id:
            return ext.external_id
        return str(obj.guard_id)

    def get_guardName(self, obj):
        u = obj.guard
        return (u.get_full_name() or u.first_name or u.username).strip()


class IncidentSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    def get_id(self, obj):
        return str(obj.pk)
    guardId = serializers.SerializerMethodField()
    siteId = serializers.CharField(source='site.slug')
    timestamp = serializers.DateTimeField()
    imageUrl = serializers.SerializerMethodField()
    guardName = serializers.SerializerMethodField()

    class Meta:
        model = Incident
        fields = (
            'id',
            'guardId',
            'siteId',
            'title',
            'description',
            'timestamp',
            'status',
            'imageUrl',
            'guardName',
        )

    def get_guardId(self, obj):
        ext = getattr(obj.guard, 'profile', None)
        if ext and ext.external_id:
            return ext.external_id
        return str(obj.guard_id)

    def get_guardName(self, obj):
        u = obj.guard
        return (u.get_full_name() or u.first_name or u.username).strip()

    def get_imageUrl(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
        return obj.image_url or None


class AlertSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()

    def get_id(self, obj):
        return str(obj.pk)
    guardId = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField()
    guardName = serializers.SerializerMethodField()

    class Meta:
        model = Alert
        fields = ('id', 'type', 'guardId', 'timestamp', 'status', 'guardName')

    def get_guardId(self, obj):
        ext = getattr(obj.guard, 'profile', None)
        if ext and ext.external_id:
            return ext.external_id
        return str(obj.guard_id)

    def get_guardName(self, obj):
        u = obj.guard
        return (u.get_full_name() or u.first_name or u.username).strip()


class ReportEntrySerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='slug', read_only=True)
    periodStart = serializers.DateTimeField(source='period_start')
    periodEnd = serializers.DateTimeField(source='period_end')
    downloadUrl = serializers.URLField(source='download_url')

    class Meta:
        model = ReportEntry
        fields = ('id', 'label', 'periodStart', 'periodEnd', 'downloadUrl')


class CheckpointWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    siteId = serializers.CharField(max_length=16)
    code = serializers.CharField(max_length=64)


class ShiftWriteSerializer(serializers.Serializer):
    guardId = serializers.CharField()
    siteId = serializers.CharField(max_length=16)
    day = serializers.ChoiceField(choices=['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
    start = serializers.TimeField(format='%H:%M', input_formats=['%H:%M'])
    end = serializers.TimeField(format='%H:%M', input_formats=['%H:%M'])


class AlertStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[Alert.Status.RESOLVED, Alert.Status.UNRESOLVED])


class IncidentStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[Incident.Status.OPEN, Incident.Status.CLOSED])


class ReportGenerateSerializer(serializers.Serializer):
    label = serializers.CharField(max_length=255)
    periodStart = serializers.DateTimeField()
    periodEnd = serializers.DateTimeField()
    filters = serializers.JSONField(required=False)


class GuardLocationPingSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    guardId = serializers.SerializerMethodField()
    siteId = serializers.CharField(source='site.slug')
    checkpointId = serializers.CharField(source='checkpoint.slug', allow_null=True)
    checkpointName = serializers.CharField(source='checkpoint.name', allow_null=True)

    class Meta:
        model = GuardLocationPing
        fields = (
            'id',
            'guardId',
            'siteId',
            'checkpointId',
            'checkpointName',
            'timestamp',
            'latitude',
            'longitude',
            'source',
            'accuracy_m',
        )

    def get_id(self, obj):
        return str(obj.pk)

    def get_guardId(self, obj):
        ext = getattr(obj.guard, 'profile', None)
        if ext and ext.external_id:
            return ext.external_id
        return str(obj.guard_id)
