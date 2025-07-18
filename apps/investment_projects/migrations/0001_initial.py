# Generated by Django 5.2.3 on 2025-07-08 03:18

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        ('institutional_config', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ArrastreInversion',
            fields=[
                ('arrastre_id', models.AutoField(primary_key=True, serialize=False)),
                ('contrato_info', models.CharField(help_text='Información del contrato', max_length=255)),
                ('monto_devengado', models.DecimalField(decimal_places=2, max_digits=15)),
                ('monto_por_devengar', models.DecimalField(decimal_places=2, max_digits=15)),
            ],
        ),
        migrations.CreateModel(
            name='Componente',
            fields=[
                ('componente_id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=500)),
                ('descripcion', models.TextField(blank=True, null=True)),
                ('ponderacion', models.DecimalField(decimal_places=2, default=0.0, max_digits=5)),
            ],
        ),
        migrations.CreateModel(
            name='MarcoLogico',
            fields=[
                ('marco_logico_id', models.AutoField(primary_key=True, serialize=False)),
                ('fin', models.TextField(help_text='El objetivo de desarrollo al cual el proyecto contribuye.')),
                ('proposito', models.TextField(help_text='El resultado directo o el efecto esperado al finalizar el proyecto.')),
            ],
        ),
        migrations.CreateModel(
            name='ProyectoInversionVersion',
            fields=[
                ('version_id', models.AutoField(primary_key=True, serialize=False)),
                ('numero_version', models.PositiveIntegerField()),
                ('fecha_version', models.DateTimeField(auto_now_add=True)),
                ('datos', models.JSONField(help_text='Snapshot de los datos del proyecto en esta versión')),
            ],
            options={
                'ordering': ['-fecha_version'],
            },
        ),
        migrations.CreateModel(
            name='Actividad',
            fields=[
                ('actividad_id', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.TextField()),
                ('fecha_inicio', models.DateField()),
                ('fecha_fin', models.DateField()),
                ('componente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='actividades', to='investment_projects.componente')),
            ],
        ),
        migrations.CreateModel(
            name='CronogramaValorado',
            fields=[
                ('cronograma_id', models.AutoField(primary_key=True, serialize=False)),
                ('periodo', models.CharField(help_text='Formato AAAA-MM', max_length=7)),
                ('valor_programado', models.DecimalField(decimal_places=2, max_digits=15)),
                ('actividad', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cronograma', to='investment_projects.actividad')),
            ],
        ),
        migrations.CreateModel(
            name='DictamenPrioridad',
            fields=[
                ('dictamen_id', models.AutoField(primary_key=True, serialize=False)),
                ('estado', models.CharField(choices=[('SOLICITUD', 'Solicitud'), ('APROBADO', 'Aprobado'), ('RECHAZADO', 'Rechazado')], default='SOLICITUD', max_length=20)),
                ('fecha_solicitud', models.DateTimeField(auto_now_add=True)),
                ('observaciones', models.TextField(blank=True, null=True)),
                ('usuario_responsable_snp', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Indicador',
            fields=[
                ('indicador_id', models.AutoField(primary_key=True, serialize=False)),
                ('descripcion', models.TextField()),
                ('formula', models.TextField(blank=True, null=True)),
                ('unidad_medida', models.CharField(max_length=100)),
                ('object_id', models.PositiveIntegerField()),
                ('content_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='contenttypes.contenttype')),
            ],
        ),
        migrations.AddField(
            model_name='componente',
            name='marco_logico',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='componentes', to='investment_projects.marcologico'),
        ),
        migrations.CreateModel(
            name='Meta',
            fields=[
                ('meta_id', models.AutoField(primary_key=True, serialize=False)),
                ('linea_base', models.DecimalField(decimal_places=2, max_digits=15)),
                ('valor_meta', models.DecimalField(decimal_places=2, max_digits=15)),
                ('periodo_anualizado', models.CharField(help_text='Ej: 2025', max_length=50)),
                ('indicador', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='meta', to='investment_projects.indicador')),
            ],
        ),
        migrations.CreateModel(
            name='ProyectoInversion',
            fields=[
                ('proyecto_id', models.AutoField(primary_key=True, serialize=False)),
                ('cup', models.CharField(blank=True, help_text='Código Único de Proyecto, generado al final del proceso', max_length=50, null=True, unique=True)),
                ('nombre', models.CharField(max_length=500)),
                ('estado', models.CharField(default='EN_FORMULACION', max_length=50)),
                ('version_actual', models.PositiveIntegerField(default=1)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_ultima_actualizacion', models.DateTimeField(auto_now=True)),
                ('creador', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('entidad_ejecutora', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='proyectos_ejecutados', to='institutional_config.entidad')),
            ],
        ),
    ]
