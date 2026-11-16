from django.core.management.base import BaseCommand

from alerts.sending import send_alerts


class Command(BaseCommand):
    help = "Email saved-search alerts. Cron: every 10 min for --frequency instant, once a day for daily."

    def add_arguments(self, parser):
        parser.add_argument("--frequency", choices=["instant", "daily"], required=True)

    def handle(self, *args, **o):
        self.stdout.write(f"Sent {send_alerts(o['frequency'])} alert emails")
