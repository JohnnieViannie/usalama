"""
Django settings for movara_api project.

Environment (common):
  DJANGO_DEBUG          — "true"/"false" (default: true for local dev)
  DJANGO_SECRET_KEY     — required when DJANGO_DEBUG=false
  DJANGO_ALLOWED_HOSTS  — comma-separated hostnames (default: localhost,127.0.0.1)
  DATABASE_URL          — optional; when set, replaces SQLite (e.g. postgres://user:pass@host:5432/dbname)
  DATABASE_SSL          — "true" when Postgres requires SSL (e.g. managed cloud DB)
  DJANGO_CORS_ORIGINS   — comma-separated origins (default includes local Vite URLs)

Database:
  Without DATABASE_URL, SQLite is used: db.sqlite3 next to manage.py.
  With DATABASE_URL, typically PostgreSQL (see requirements.txt).
"""

from datetime import timedelta
import os
from pathlib import Path

import dj_database_url
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv(path: Path) -> None:
    if not path.exists():
        return
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv(BASE_DIR / ".env")


def _env_bool(key: str, default: bool = False) -> bool:
    v = os.environ.get(key)
    if v is None:
        return default
    return v.strip().lower() in ("1", "true", "yes", "on")


def _env_str(key: str, default: str) -> str:
    v = os.environ.get(key)
    if v is None:
        return default
    v = v.strip()
    return v if v else default


DEBUG = _env_bool("DJANGO_DEBUG", True)

SECRET_KEY = _env_str(
    "DJANGO_SECRET_KEY",
    "django-insecure-pqwf$-4kgnyo8@8v@q)c547n5%ldvz!y&8o_5pl9=7m$sx^*uf",
)

if not DEBUG:
    if SECRET_KEY.startswith("django-insecure") or len(SECRET_KEY) < 40:
        raise ImproperlyConfigured(
            "Set a strong DJANGO_SECRET_KEY (40+ chars) when DJANGO_DEBUG is false."
        )

ALLOWED_HOSTS = [
    h.strip()
    for h in os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")
    if h.strip()
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt",
    "accounts",
    "operations",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "movara_api.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "movara_api.wsgi.application"


if os.environ.get("DATABASE_URL"):
    DATABASES = {
        "default": dj_database_url.config(
            conn_max_age=600,
            ssl_require=_env_bool("DATABASE_SSL", False),
        )
    }
else:
    required_mysql_env = ("DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT")
    missing_mysql_env = [k for k in required_mysql_env if not (os.environ.get(k) or "").strip()]
    if missing_mysql_env:
        raise ImproperlyConfigured(
            "Missing MySQL database environment variables: "
            + ", ".join(missing_mysql_env)
        )
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.mysql",
            "OPTIONS": {
                "charset": "utf8mb4",
            },
            "NAME": os.environ.get("DB_NAME"),
            "USER": os.environ.get("DB_USER"),
            "PASSWORD": os.environ.get("DB_PASSWORD"),
            "HOST": os.environ.get("DB_HOST"),
            "PORT": os.environ.get("DB_PORT"),
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=12),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "AUTH_HEADER_TYPES": ("Bearer",),
}

_cors_default = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:3000,http://127.0.0.1:3000"
)
CORS_ALLOWED_ORIGINS = [
    o.strip()
    for o in os.environ.get("DJANGO_CORS_ORIGINS", _cors_default).split(",")
    if o.strip()
]
CORS_ALLOW_CREDENTIALS = True

_default_email_backend = (
    "django.core.mail.backends.console.EmailBackend"
    if DEBUG
    else "django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_BACKEND = _env_str("DJANGO_EMAIL_BACKEND", _default_email_backend)
DEFAULT_FROM_EMAIL = _env_str("DJANGO_DEFAULT_FROM_EMAIL", "noreply@uslama.local")
EMAIL_HOST = _env_str("DJANGO_EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(_env_str("DJANGO_EMAIL_PORT", "587"))
EMAIL_HOST_USER = _env_str("DJANGO_EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = _env_str("DJANGO_EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = _env_bool("DJANGO_EMAIL_USE_TLS", True)

if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = "DENY"
    # Behind HTTPS reverse proxy, set DJANGO_SECURE_PROXY_SSL=true and configure proxy headers.
    if _env_bool("DJANGO_SECURE_PROXY_SSL", False):
        SECURE_SSL_REDIRECT = True
        SESSION_COOKIE_SECURE = True
        CSRF_COOKIE_SECURE = True
        SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
