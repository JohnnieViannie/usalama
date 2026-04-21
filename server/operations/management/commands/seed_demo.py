"""Load demo data aligned with dashboard/src/lib/mockData.ts."""

from datetime import datetime, timedelta

from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import Profile
from operations.models import (
    Alert,
    Checkpoint,
    GuardLocationPing,
    Incident,
    PatrolLog,
    ReportEntry,
    ScheduledShift,
    Site,
)


class Command(BaseCommand):
    help = 'Seed sites, checkpoints, users, and sample operational data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding MovaraShiftHub demo data...')

        sites_data = [
            ('s1', 'Equity Bank HQ', 'Upper Hill, Nairobi', 'Tier-1 banking facility'),
            ('s2', 'Westgate Mall', 'Westlands, Nairobi', 'Mixed-use retail complex'),
            ('s3', 'Garden City Plaza', 'Thika Road, Nairobi', 'Office park'),
        ]
        for slug, name, loc, desc in sites_data:
            Site.objects.update_or_create(
                slug=slug,
                defaults={'name': name, 'location': loc, 'description': desc},
            )

        checkpoints_data = [
            ('c1', 's1', 'Main Gate', 'USH-c1-MAIN'),
            ('c2', 's1', 'Vault Door', 'USH-c2-VAULT'),
            ('c3', 's2', 'Parking B2', 'USH-c3-B2'),
            ('c4', 's2', 'Rooftop', 'USH-c4-ROOF'),
            ('c5', 's3', 'East Entrance', 'USH-c5-EAST'),
        ]
        for slug, site_slug, name, code in checkpoints_data:
            site = Site.objects.get(pk=site_slug)
            Checkpoint.objects.update_or_create(
                slug=slug,
                defaults={'site': site, 'name': name, 'code': code},
            )

        now = timezone.now()

        guards_spec = [
            (
                'g1_james',
                'guard@example.com',
                'James',
                'Kamau',
                'g1',
                '+254 712 345 678',
                's1',
                Profile.GuardStatus.ON_DUTY,
                Profile.OnboardingStatus.APPROVED,
            ),
            (
                'g2_mary',
                'mary@example.com',
                'Mary',
                'Wanjiru',
                'g2',
                '+254 722 111 222',
                's2',
                Profile.GuardStatus.ON_DUTY,
                Profile.OnboardingStatus.APPROVED,
            ),
            (
                'g3_peter',
                'peter@example.com',
                'Peter',
                'Otieno',
                'g3',
                '+254 733 444 555',
                's1',
                Profile.GuardStatus.ACTIVE,
                Profile.OnboardingStatus.APPROVED,
            ),
            (
                'g4_grace',
                'grace@example.com',
                'Grace',
                'Akinyi',
                'g4',
                '+254 701 999 888',
                's3',
                Profile.GuardStatus.ON_DUTY,
                Profile.OnboardingStatus.APPROVED,
            ),
            (
                'g5_samuel',
                'samuel@example.com',
                'Samuel',
                'Kiprop',
                'g5',
                '+254 720 333 444',
                None,
                Profile.GuardStatus.INACTIVE,
                Profile.OnboardingStatus.REJECTED,
            ),
            (
                'g6_pending',
                'pending.guard@example.com',
                'Pending',
                'Guard',
                'g6',
                '+254 700 222 999',
                None,
                Profile.GuardStatus.INACTIVE,
                Profile.OnboardingStatus.PENDING,
            ),
        ]

        pin = make_password('1234')
        demo_password = 'demo1234'

        client_u, client_created = User.objects.get_or_create(
            username='client_admin',
            defaults={
                'email': 'client@example.com',
                'first_name': 'Client',
                'last_name': 'Admin',
            },
        )
        if client_created:
            client_u.set_password(demo_password)
            client_u.save()
        cp = client_u.profile
        cp.role = Profile.Role.CLIENT
        cp.external_id = 'c-admin'
        cp.company_name = 'Sentinel Security Ltd'
        cp.onboarding_status = Profile.OnboardingStatus.APPROVED
        cp.save()

        for username, email, fn, ln, ext_id, phone, site_slug, gstatus, onboarding in guards_spec:
            u, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': fn,
                    'last_name': ln,
                },
            )
            if created:
                u.set_password(demo_password)
                u.save()
            p = u.profile
            p.role = Profile.Role.GUARD
            p.external_id = ext_id
            p.phone = phone or ''
            p.pin_hash = pin
            p.guard_status = gstatus
            p.onboarding_status = onboarding
            p.company_name = 'Sentinel Security Ltd'
            p.linked_client = client_u if onboarding == Profile.OnboardingStatus.APPROVED else None
            p.site = Site.objects.get(pk=site_slug) if site_slug else None
            p.save()

        ReportEntry.objects.update_or_create(
            slug='r-daily',
            defaults={
                'label': 'Daily summary',
                'period_start': now,
                'period_end': now,
                'download_url': 'https://example.com/report-daily.pdf',
            },
        )
        ReportEntry.objects.update_or_create(
            slug='r-weekly',
            defaults={
                'label': 'Weekly summary',
                'period_start': now,
                'period_end': now,
                'download_url': 'https://example.com/report-weekly.pdf',
            },
        )

        g1 = User.objects.get(username='g1_james')
        g2 = User.objects.get(username='g2_mary')
        g3 = User.objects.get(username='g3_peter')
        g4 = User.objects.get(username='g4_grace')

        PatrolLog.objects.all().delete()
        hours_ago = lambda h: now - timedelta(hours=h)
        pls = [
            (g1, 'c1', 's1', hours_ago(0.3), 'on_time'),
            (g1, 'c2', 's1', hours_ago(1.5), 'on_time'),
            (g2, 'c3', 's2', hours_ago(2), 'late'),
            (g2, 'c4', 's2', hours_ago(3), 'missed'),
            (g4, 'c5', 's3', hours_ago(0.8), 'on_time'),
            (g3, 'c1', 's1', hours_ago(5), 'on_time'),
        ]
        for guard, cp_slug, site_slug, ts, stat in pls:
            PatrolLog.objects.create(
                guard=guard,
                checkpoint=Checkpoint.objects.get(pk=cp_slug),
                site=Site.objects.get(pk=site_slug),
                timestamp=ts,
                status=stat,
                latitude=-1.2921 + (0.001 * len(cp_slug)),
                longitude=36.8219 + (0.001 * len(site_slug)),
            )

        GuardLocationPing.objects.all().delete()
        route_points = [
            (g1, 's1', 'c1', hours_ago(0.35), -1.2921, 36.8219, GuardLocationPing.Source.SCAN),
            (g1, 's1', None, hours_ago(0.33), -1.2918, 36.8223, GuardLocationPing.Source.BACKGROUND),
            (g1, 's1', 'c2', hours_ago(1.55), -1.2913, 36.8229, GuardLocationPing.Source.SCAN),
            (g2, 's2', 'c3', hours_ago(2.05), -1.2683, 36.8071, GuardLocationPing.Source.SCAN),
            (g2, 's2', None, hours_ago(2.0), -1.2681, 36.8065, GuardLocationPing.Source.BACKGROUND),
            (g4, 's3', 'c5', hours_ago(0.82), -1.2310, 36.8755, GuardLocationPing.Source.SCAN),
        ]
        for guard, site_slug, cp_slug, ts, lat, lng, source in route_points:
            GuardLocationPing.objects.create(
                guard=guard,
                site=Site.objects.get(pk=site_slug),
                checkpoint=Checkpoint.objects.filter(pk=cp_slug).first(),
                timestamp=ts,
                latitude=lat,
                longitude=lng,
                source=source,
            )

        Incident.objects.all().delete()
        Incident.objects.create(
            guard=g1,
            site=Site.objects.get(pk='s1'),
            title='Suspicious vehicle',
            description='Suspicious vehicle parked near main gate. Plates recorded.',
            timestamp=hours_ago(2),
            image_url='https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
        )
        Incident.objects.create(
            guard=g2,
            site=Site.objects.get(pk='s2'),
            title='Broken window',
            description='Broken window on B2 service door. Maintenance notified.',
            timestamp=hours_ago(6),
            image_url='https://images.unsplash.com/photo-1520637836862-4d197d17c55a?w=800',
        )

        Alert.objects.all().delete()
        g5 = User.objects.get(username='g5_samuel')
        Alert.objects.create(
            type=Alert.Type.PANIC,
            guard=g2,
            timestamp=hours_ago(0.5),
            status=Alert.Status.UNRESOLVED,
        )
        Alert.objects.create(
            type=Alert.Type.MISSED_CHECKPOINT,
            guard=g2,
            timestamp=hours_ago(3),
            status=Alert.Status.UNRESOLVED,
        )
        Alert.objects.create(
            type=Alert.Type.LATE_SHIFT,
            guard=g5,
            timestamp=hours_ago(8),
            status=Alert.Status.RESOLVED,
        )

        ScheduledShift.objects.all().delete()
        ScheduledShift.objects.create(
            guard=g1,
            site=Site.objects.get(pk='s1'),
            day='Mon',
            start_time=datetime.strptime('06:00', '%H:%M').time(),
            end_time=datetime.strptime('18:00', '%H:%M').time(),
        )

        self.stdout.write(self.style.SUCCESS('Done. Demo password for users: demo1234 / PIN: 1234'))
