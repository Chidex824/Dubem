from django.db import migrations

TYPES = [
    ("Job", "job", {}),
    ("Internship", "internship", {"stipend": "text", "duration": "text"}),
    ("Fellowship", "fellowship", {"stipend": "text", "cohort_start": "date", "duration": "text"}),
    ("Volunteer", "volunteer", {"time_commitment": "text"}),
]

def seed(apps, schema_editor):
    PT = apps.get_model("listings", "PostingType")
    for name, slug, schema in TYPES:
        PT.objects.get_or_create(slug=slug, defaults={"name": name, "schema": schema})

class Migration(migrations.Migration):
    dependencies = [("listings", "0001_initial")]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
