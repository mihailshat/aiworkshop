"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

if os.environ.get("RUN_MIGRATIONS_ON_START") == "1":
    try:
        from django.core.management import call_command
        call_command("migrate")
        print("[WSGI] Migrations applied successfully.")
    except Exception as e:
        print(f"[WSGI] Error applying migrations: {e}")

application = get_wsgi_application()
