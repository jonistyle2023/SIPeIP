# Generated by Django 5.2.3 on 2025-06-24 20:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication', '0002_usuario_esta_bloqueado_usuario_fecha_bloqueo_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='usuario',
            name='clave',
            field=models.CharField(blank=True, max_length=128, null=True),
        ),
    ]
