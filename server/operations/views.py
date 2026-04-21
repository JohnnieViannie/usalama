from datetime import datetime
import json
import uuid

from django.contrib.auth.models import User
from django.http import HttpResponse
from django.db.models import Q
from django.utils import dateparse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import Profile
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
from operations.permissions import IsClient, IsGuard
from operations.serializers import (
    AlertStatusSerializer,
    AlertSerializer,
    CheckpointSerializer,
    CheckpointWriteSerializer,
    GuardLocationPingSerializer,
    IncidentStatusSerializer,
    IncidentSerializer,
    PatrolLogSerializer,
    ReportGenerateSerializer,
    ReportEntrySerializer,
    ShiftWriteSerializer,
)


def _client_guard_qs(client_user):
    return User.objects.filter(
        profile__role=Profile.Role.GUARD,
        profile__linked_client=client_user,
    )


def _client_site_qs(client_user):
    return Site.objects.filter(assigned_guards__linked_client=client_user).distinct()


def _client_guard_by_public_id(client_user, guard_id):
    guards = _client_guard_qs(client_user).select_related('profile')
    return guards.filter(Q(profile__external_id=guard_id) | Q(id=guard_id)).first()


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def guards_list(request):
    out = []
    for u in _client_guard_qs(request.user).select_related(
        'profile', 'profile__site'
    ):
        p = u.profile
        out.append(
            {
                'id': p.external_id or str(u.pk),
                'name': (u.get_full_name() or u.username).strip(),
                'phone': p.phone,
                'status': p.guard_status or 'inactive',
                'siteId': p.site.slug if p.site else None,
                'onboardingStatus': p.onboarding_status,
                'companyName': p.company_name,
                'email': u.email,
                'linkedClientId': str(p.linked_client_id) if p.linked_client_id else None,
            }
        )
    return Response(out)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def sites_list(request):
    guard_sites = Site.objects.filter(assigned_guards__linked_client=request.user).distinct()
    return Response(
        [
            {
                'id': s.slug,
                'name': s.name,
                'location': s.location,
                'description': s.description,
            }
            for s in guard_sites
        ]
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def checkpoints_list(request):
    guard_sites = _client_site_qs(request.user)
    return Response(
        [
            {
                'id': c.slug,
                'name': c.name,
                'siteId': c.site.slug,
                'code': c.code,
            }
            for c in Checkpoint.objects.select_related('site').filter(site__in=guard_sites)
        ]
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def checkpoints_create(request):
    ser = CheckpointWriteSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    site = _client_site_qs(request.user).filter(pk=ser.validated_data['siteId']).first()
    if not site:
        return Response({'detail': 'Invalid site'}, status=status.HTTP_400_BAD_REQUEST)
    if Checkpoint.objects.filter(site=site, code=ser.validated_data['code']).exists():
        return Response({'detail': 'Checkpoint code already exists for this site'}, status=status.HTTP_400_BAD_REQUEST)
    slug = uuid.uuid4().hex[:12]
    cp = Checkpoint.objects.create(
        slug=slug,
        site=site,
        name=ser.validated_data['name'],
        code=ser.validated_data['code'],
    )
    return Response(
        {'id': cp.slug, 'name': cp.name, 'siteId': cp.site_id, 'code': cp.code},
        status=status.HTTP_201_CREATED,
    )


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsClient])
def checkpoint_detail(request, checkpoint_id):
    cp = Checkpoint.objects.select_related('site').filter(pk=checkpoint_id).first()
    if not cp or not _client_site_qs(request.user).filter(pk=cp.site_id).exists():
        return Response({'detail': 'Checkpoint not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        cp.delete()
        return Response({'ok': True})
    ser = CheckpointWriteSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    site = _client_site_qs(request.user).filter(pk=ser.validated_data['siteId']).first()
    if not site:
        return Response({'detail': 'Invalid site'}, status=status.HTTP_400_BAD_REQUEST)
    duplicate = Checkpoint.objects.filter(site=site, code=ser.validated_data['code']).exclude(pk=cp.pk).exists()
    if duplicate:
        return Response({'detail': 'Checkpoint code already exists for this site'}, status=status.HTTP_400_BAD_REQUEST)
    cp.site = site
    cp.name = ser.validated_data['name']
    cp.code = ser.validated_data['code']
    cp.save(update_fields=['site', 'name', 'code'])
    return Response({'id': cp.slug, 'name': cp.name, 'siteId': cp.site_id, 'code': cp.code})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def alerts_list(request):
    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    qs = Alert.objects.select_related('guard').filter(guard_id__in=guard_ids)
    return Response(AlertSerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def alert_status_update(request, alert_id):
    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    alert = Alert.objects.filter(pk=alert_id, guard_id__in=guard_ids).first()
    if not alert:
        return Response({'detail': 'Alert not found'}, status=status.HTTP_404_NOT_FOUND)
    ser = AlertStatusSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    alert.status = ser.validated_data['status']
    alert.save(update_fields=['status'])
    return Response(AlertSerializer(alert).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def shifts_list(request):
    out = []
    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    for sh in ScheduledShift.objects.select_related('guard', 'site').filter(guard_id__in=guard_ids):
        g = sh.guard.profile
        out.append(
            {
                'id': str(sh.pk),
                'guardId': g.external_id or str(sh.guard_id),
                'siteId': sh.site.slug,
                'day': sh.day,
                'start': sh.start_time.strftime('%H:%M'),
                'end': sh.end_time.strftime('%H:%M'),
            }
        )
    return Response(out)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def shifts_create(request):
    ser = ShiftWriteSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    guard = _client_guard_by_public_id(request.user, ser.validated_data['guardId'])
    if not guard:
        return Response({'detail': 'Guard not found'}, status=status.HTTP_400_BAD_REQUEST)
    site = _client_site_qs(request.user).filter(pk=ser.validated_data['siteId']).first()
    if not site:
        return Response({'detail': 'Invalid site'}, status=status.HTTP_400_BAD_REQUEST)
    if ser.validated_data['start'] >= ser.validated_data['end']:
        return Response({'detail': 'Shift start must be before end'}, status=status.HTTP_400_BAD_REQUEST)
    shift = ScheduledShift.objects.create(
        guard=guard,
        site=site,
        day=ser.validated_data['day'],
        start_time=ser.validated_data['start'],
        end_time=ser.validated_data['end'],
    )
    gp = guard.profile
    return Response(
        {
            'id': str(shift.pk),
            'guardId': gp.external_id or str(guard.pk),
            'siteId': shift.site_id,
            'day': shift.day,
            'start': shift.start_time.strftime('%H:%M'),
            'end': shift.end_time.strftime('%H:%M'),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsClient])
def shift_detail(request, shift_id):
    shift = ScheduledShift.objects.select_related('guard__profile', 'site').filter(pk=shift_id).first()
    if not shift or not _client_guard_qs(request.user).filter(pk=shift.guard_id).exists():
        return Response({'detail': 'Shift not found'}, status=status.HTTP_404_NOT_FOUND)
    if request.method == 'DELETE':
        shift.delete()
        return Response({'ok': True})
    ser = ShiftWriteSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    guard = _client_guard_by_public_id(request.user, ser.validated_data['guardId'])
    if not guard:
        return Response({'detail': 'Guard not found'}, status=status.HTTP_400_BAD_REQUEST)
    site = _client_site_qs(request.user).filter(pk=ser.validated_data['siteId']).first()
    if not site:
        return Response({'detail': 'Invalid site'}, status=status.HTTP_400_BAD_REQUEST)
    if ser.validated_data['start'] >= ser.validated_data['end']:
        return Response({'detail': 'Shift start must be before end'}, status=status.HTTP_400_BAD_REQUEST)
    shift.guard = guard
    shift.site = site
    shift.day = ser.validated_data['day']
    shift.start_time = ser.validated_data['start']
    shift.end_time = ser.validated_data['end']
    shift.save(update_fields=['guard', 'site', 'day', 'start_time', 'end_time'])
    gp = guard.profile
    return Response(
        {
            'id': str(shift.pk),
            'guardId': gp.external_id or str(guard.pk),
            'siteId': shift.site_id,
            'day': shift.day,
            'start': shift.start_time.strftime('%H:%M'),
            'end': shift.end_time.strftime('%H:%M'),
        }
    )


def _guard_public_id(user):
    p = user.profile
    return p.external_id or str(user.pk)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsGuard])
def assigned_checkpoints(request):
    site = request.user.profile.site
    if site is None:
        return Response([])
    qs = Checkpoint.objects.filter(site=site)
    return Response(CheckpointSerializer(qs, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def patrol_logs_list(request):
    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    qs = PatrolLog.objects.select_related('guard', 'checkpoint', 'site').filter(guard_id__in=guard_ids)
    guard_id = request.query_params.get('guardId')
    from_ts = request.query_params.get('from')
    to_ts = request.query_params.get('to')
    if guard_id:
        qs = qs.filter(Q(guard__profile__external_id=guard_id) | Q(guard_id=guard_id))
    if from_ts:
        parsed = dateparse.parse_datetime(from_ts)
        if parsed:
            qs = qs.filter(timestamp__gte=parsed)
    if to_ts:
        parsed = dateparse.parse_datetime(to_ts)
        if parsed:
            qs = qs.filter(timestamp__lte=parsed)
    return Response(
        PatrolLogSerializer(qs, many=True, context={'request': request}).data
    )


def _create_location_ping(
    *,
    guard,
    site,
    timestamp,
    latitude,
    longitude,
    source,
    checkpoint=None,
    accuracy_m=None,
):
    if latitude is None or longitude is None:
        return None
    return GuardLocationPing.objects.create(
        guard=guard,
        site=site,
        checkpoint=checkpoint,
        timestamp=timestamp,
        latitude=latitude,
        longitude=longitude,
        source=source,
        accuracy_m=accuracy_m,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def incidents_list(request):
    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    qs = Incident.objects.select_related('guard', 'site').filter(guard_id__in=guard_ids)
    return Response(
        IncidentSerializer(qs, many=True, context={'request': request}).data
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def incident_status_update(request, incident_id):
    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    incident = Incident.objects.select_related('guard', 'site').filter(pk=incident_id, guard_id__in=guard_ids).first()
    if not incident:
        return Response({'detail': 'Incident not found'}, status=status.HTTP_404_NOT_FOUND)
    ser = IncidentStatusSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    incident.status = ser.validated_data['status']
    incident.save(update_fields=['status'])
    return Response(IncidentSerializer(incident, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def reports_list(request):
    qs = ReportEntry.objects.filter(company=request.user).order_by('-period_end')
    return Response(ReportEntrySerializer(qs, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsClient])
def reports_generate(request):
    ser = ReportGenerateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    period_start = ser.validated_data['periodStart']
    period_end = ser.validated_data['periodEnd']
    if period_start >= period_end:
        return Response({'detail': 'periodStart must be before periodEnd'}, status=status.HTTP_400_BAD_REQUEST)
    slug = uuid.uuid4().hex[:16]
    filters_json = json.dumps(ser.validated_data.get('filters') or {})
    download_url = f'/api/reports-download/{slug}/'
    row = ReportEntry.objects.create(
        slug=slug,
        company=request.user,
        label=ser.validated_data['label'],
        period_start=period_start,
        period_end=period_end,
        download_url=download_url,
        filters_json=filters_json,
    )
    return Response(ReportEntrySerializer(row).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def reports_download(request, report_id):
    row = ReportEntry.objects.filter(slug=report_id, company=request.user).first()
    if not row:
        return Response({'detail': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)
    payload = {
        'id': row.slug,
        'label': row.label,
        'periodStart': row.period_start.isoformat(),
        'periodEnd': row.period_end.isoformat(),
        'filters': json.loads(row.filters_json or '{}'),
    }
    content = json.dumps(payload, indent=2)
    response = HttpResponse(content, content_type='application/json')
    response['Content-Disposition'] = f'attachment; filename="{row.slug}.json"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def dashboard_summary(request):
    guards = _client_guard_qs(request.user)
    guard_ids = list(guards.values_list('id', flat=True))
    on_duty = Profile.objects.filter(
        user_id__in=guard_ids,
        role=Profile.Role.GUARD,
        guard_status=Profile.GuardStatus.ON_DUTY,
    ).count()
    sites = Site.objects.filter(assigned_guards__user_id__in=guard_ids).distinct().count()
    alerts = Alert.objects.select_related('guard').filter(guard_id__in=guard_ids)[:20]
    data = AlertSerializer(alerts, many=True).data

    return Response(
        {
            'guardsOnDuty': on_duty,
            'activeSites': sites,
            'alerts': json.dumps(data),
        }
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGuard])
def start_shift(request):
    return _shift(request, ShiftEvent.Kind.START)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGuard])
def end_shift(request):
    return _shift(request, ShiftEvent.Kind.END)


def _shift(request, kind):
    body = request.data
    gid = body.get('guardId')
    if gid != _guard_public_id(request.user):
        return Response({'detail': 'guardId mismatch'}, status=status.HTTP_400_BAD_REQUEST)
    site_id = body.get('siteId')
    try:
        site = Site.objects.get(pk=site_id)
    except Site.DoesNotExist:
        return Response({'detail': 'Invalid site'}, status=status.HTTP_400_BAD_REQUEST)
    ts = body.get('timestamp')
    at = dateparse.parse_datetime(ts) if ts else datetime.now()
    if at is None:
        at = datetime.now()
    ShiftEvent.objects.create(
        guard=request.user,
        site=site,
        kind=kind,
        at=at,
        latitude=body.get('latitude'),
        longitude=body.get('longitude'),
    )
    _create_location_ping(
        guard=request.user,
        site=site,
        timestamp=at,
        latitude=body.get('latitude'),
        longitude=body.get('longitude'),
        source=GuardLocationPing.Source.SHIFT,
    )
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGuard])
def scan_checkpoint(request):
    body = request.data
    if body.get('guardId') != _guard_public_id(request.user):
        return Response({'detail': 'guardId mismatch'}, status=status.HTTP_400_BAD_REQUEST)
    cp_id = body.get('checkpointId')
    try:
        cp = Checkpoint.objects.get(pk=cp_id)
    except Checkpoint.DoesNotExist:
        return Response({'detail': 'Unknown checkpoint'}, status=status.HTTP_400_BAD_REQUEST)
    ts = body.get('timestamp')
    at = dateparse.parse_datetime(ts) if ts else datetime.now()
    if at is None:
        at = datetime.now()
    patrol = PatrolLog.objects.create(
        guard=request.user,
        checkpoint=cp,
        site=cp.site,
        timestamp=at,
        status='on_time',
        latitude=body.get('latitude'),
        longitude=body.get('longitude'),
    )
    _create_location_ping(
        guard=request.user,
        site=cp.site,
        checkpoint=cp,
        timestamp=at,
        latitude=body.get('latitude'),
        longitude=body.get('longitude'),
        source=GuardLocationPing.Source.SCAN,
        accuracy_m=body.get('accuracyM'),
    )
    return Response({'ok': True, 'patrolLogId': str(patrol.pk)})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGuard])
def report_incident(request):
    body = request.data
    if body.get('guardId') != _guard_public_id(request.user):
        return Response({'detail': 'guardId mismatch'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        site = Site.objects.get(pk=body.get('siteId'))
    except Site.DoesNotExist:
        return Response({'detail': 'Invalid site'}, status=status.HTTP_400_BAD_REQUEST)
    ts = body.get('timestamp')
    at = dateparse.parse_datetime(ts) if ts else datetime.now()
    if at is None:
        at = datetime.now()
    Incident.objects.create(
        guard=request.user,
        site=site,
        title=body.get('title') or '',
        description=body.get('description') or '',
        timestamp=at,
        image_url=body.get('imageUrl') or '',
    )
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGuard])
def panic_alert(request):
    body = request.data
    if body.get('guardId') != _guard_public_id(request.user):
        return Response({'detail': 'guardId mismatch'}, status=status.HTTP_400_BAD_REQUEST)
    ts = body.get('timestamp')
    at = dateparse.parse_datetime(ts) if ts else datetime.now()
    if at is None:
        at = datetime.now()
    PanicEvent.objects.create(
        guard=request.user,
        created_at=at,
        latitude=body.get('latitude'),
        longitude=body.get('longitude'),
    )
    Alert.objects.create(
        type=Alert.Type.PANIC,
        guard=request.user,
        timestamp=at,
        status=Alert.Status.UNRESOLVED,
    )
    return Response({'ok': True})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsGuard])
def submit_location_pings(request):
    body = request.data
    if body.get('guardId') != _guard_public_id(request.user):
        return Response({'detail': 'guardId mismatch'}, status=status.HTTP_400_BAD_REQUEST)
    site_id = body.get('siteId') or request.user.profile.site_id
    if not site_id:
        return Response({'detail': 'siteId is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        site = Site.objects.get(pk=site_id)
    except Site.DoesNotExist:
        return Response({'detail': 'Invalid site'}, status=status.HTTP_400_BAD_REQUEST)
    raw_points = body.get('points')
    if not isinstance(raw_points, list) or not raw_points:
        return Response({'detail': 'points must be a non-empty list'}, status=status.HTTP_400_BAD_REQUEST)
    created = 0
    for p in raw_points:
        if not isinstance(p, dict):
            continue
        ts = dateparse.parse_datetime(p.get('timestamp') or '')
        if ts is None:
            ts = datetime.now()
        cp = None
        cp_id = p.get('checkpointId')
        if cp_id:
            cp = Checkpoint.objects.filter(pk=cp_id).first()
        row = _create_location_ping(
            guard=request.user,
            site=site,
            checkpoint=cp,
            timestamp=ts,
            latitude=p.get('latitude'),
            longitude=p.get('longitude'),
            source=p.get('source') or GuardLocationPing.Source.BACKGROUND,
            accuracy_m=p.get('accuracyM'),
        )
        if row:
            created += 1
    return Response({'ok': True, 'created': created})


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def location_pings_list(request):
    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    qs = GuardLocationPing.objects.select_related('guard', 'site', 'checkpoint').filter(guard_id__in=guard_ids)
    guard_id = request.query_params.get('guardId')
    from_ts = request.query_params.get('from')
    to_ts = request.query_params.get('to')
    if guard_id:
        qs = qs.filter(Q(guard__profile__external_id=guard_id) | Q(guard_id=guard_id))
    if from_ts:
        parsed = dateparse.parse_datetime(from_ts)
        if parsed:
            qs = qs.filter(timestamp__gte=parsed)
    if to_ts:
        parsed = dateparse.parse_datetime(to_ts)
        if parsed:
            qs = qs.filter(timestamp__lte=parsed)
    return Response(GuardLocationPingSerializer(qs[:2000], many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsClient])
def patrol_evidence(request):
    guard_id = request.query_params.get('guardId')
    from_ts = request.query_params.get('from')
    to_ts = request.query_params.get('to')

    guard_ids = list(_client_guard_qs(request.user).values_list('id', flat=True))
    logs = PatrolLog.objects.select_related('guard', 'checkpoint', 'site').filter(guard_id__in=guard_ids)
    pings = GuardLocationPing.objects.select_related('guard', 'site', 'checkpoint').filter(guard_id__in=guard_ids)
    if guard_id:
        logs = logs.filter(Q(guard__profile__external_id=guard_id) | Q(guard_id=guard_id))
        pings = pings.filter(Q(guard__profile__external_id=guard_id) | Q(guard_id=guard_id))
    if from_ts:
        parsed = dateparse.parse_datetime(from_ts)
        if parsed:
            logs = logs.filter(timestamp__gte=parsed)
            pings = pings.filter(timestamp__gte=parsed)
    if to_ts:
        parsed = dateparse.parse_datetime(to_ts)
        if parsed:
            logs = logs.filter(timestamp__lte=parsed)
            pings = pings.filter(timestamp__lte=parsed)

    return Response(
        {
            'patrolLogs': PatrolLogSerializer(
                logs, many=True, context={'request': request}
            ).data,
            'locationPings': GuardLocationPingSerializer(pings[:2000], many=True).data,
        }
    )
