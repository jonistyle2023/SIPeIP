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
            name='EstrategiaODS',
            fields=[
                ('estrategia_ods_id', models.AutoField(primary_key=True, serialize=False)),
                ('codigo', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='MetaPND',
            fields=[
                ('meta_pnd_id', models.AutoField(primary_key=True, serialize=False)),
                ('codigo', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='ObjetivoDesarrolloSostenible',
            fields=[
                ('ods_id', models.AutoField(primary_key=True, serialize=False)),
                ('numero', models.IntegerField()),
                ('nombre', models.CharField(max_length=255)),
                ('descripcion', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='PlanNacionalDesarrollo',
            fields=[
                ('pnd_id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255)),
                ('periodo', models.CharField(max_length=50)),
                ('fecha_publicacion', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='MetaODS',
            fields=[
                ('meta_ods_id', models.AutoField(primary_key=True, serialize=False)),
                ('codigo', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
                ('estrategia_ods', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metas', to='strategic_objectives.estrategiaods')),
            ],
        ),
        migrations.CreateModel(
            name='IndicadorPND',
            fields=[
                ('indicador_pnd_id', models.AutoField(primary_key=True, serialize=False)),
                ('codigo', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
                ('meta_pnd', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='indicadores', to='strategic_objectives.metapnd')),
            ],
        ),
        migrations.AddField(
            model_name='estrategiaods',
            name='ods',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='estrategias', to='strategic_objectives.objetivodesarrollosostenible'),
        ),
        migrations.CreateModel(
            name='PlanInstitucional',
            fields=[
                ('plan_institucional_id', models.AutoField(primary_key=True, serialize=False)),
                ('estado', models.CharField(choices=[('BORRADOR', 'Borrador'), ('VALIDADO', 'Validado'), ('APROBADO', 'Aprobado')], default='BORRADOR', max_length=20)),
                ('version_actual', models.PositiveIntegerField(default=1, help_text='La versión actual del plan')),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_ultima_actualizacion', models.DateTimeField(auto_now=True)),
                ('creador', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='planes_creados', to=settings.AUTH_USER_MODEL)),
                ('entidad', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='institutional_config.entidad')),
                ('periodo', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='institutional_config.periodoplanificacion')),
            ],
        ),
        migrations.CreateModel(
            name='ObjetivoEstrategicoInstitucional',
            fields=[
                ('oei_id', models.AutoField(primary_key=True, serialize=False)),
                ('codigo', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
                ('activo', models.BooleanField(default=True)),
                ('plan_institucional', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='objetivos_estrategicos', to='strategic_objectives.planinstitucional')),
            ],
        ),
        migrations.CreateModel(
            name='PlanInstitucionalVersion',
            fields=[
                ('version_id', models.AutoField(primary_key=True, serialize=False)),
                ('numero_version', models.PositiveIntegerField()),
                ('fecha_version', models.DateTimeField(auto_now_add=True)),
                ('datos', models.JSONField(help_text='Snapshot de los datos del plan en esta versión')),
                ('plan_institucional', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='versiones', to='strategic_objectives.planinstitucional')),
                ('usuario_responsable', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-fecha_version'],
            },
        ),
        migrations.CreateModel(
            name='ObjetivoPND',
            fields=[
                ('objetivo_pnd_id', models.AutoField(primary_key=True, serialize=False)),
                ('codigo', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
                ('pnd', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='objetivos', to='strategic_objectives.plannacionaldesarrollo')),
            ],
        ),
        migrations.CreateModel(
            name='PlanSectorial',
            fields=[
                ('plan_sectorial_id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255)),
                ('periodo', models.CharField(max_length=50)),
                ('fecha_publicacion', models.DateField()),
                ('entidad_responsable', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='institutional_config.entidad')),
            ],
        ),
        migrations.CreateModel(
            name='PoliticaPND',
            fields=[
                ('politica_pnd_id', models.AutoField(primary_key=True, serialize=False)),
                ('codigo', models.CharField(max_length=50)),
                ('descripcion', models.TextField()),
                ('objetivo_pnd', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='politicas', to='strategic_objectives.objetivopnd')),
            ],
        ),
        migrations.AddField(
            model_name='metapnd',
            name='politica_pnd',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='metas', to='strategic_objectives.politicapnd'),
        ),
        migrations.CreateModel(
            name='ProgramaInstitucional',
            fields=[
                ('programa_id', models.AutoField(primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=255)),
                ('version_actual', models.PositiveIntegerField(default=1)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('fecha_ultima_actualizacion', models.DateTimeField(auto_now=True)),
                ('creador', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
                ('entidad', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='programas', to='institutional_config.entidad')),
                ('oei_alineados', models.ManyToManyField(blank=True, related_name='programas_alineados', to='strategic_objectives.objetivoestrategicoinstitucional')),
            ],
            options={
                'verbose_name': 'Programa Institucional',
                'verbose_name_plural': 'Programas Institucionales',
            },
        ),
        migrations.CreateModel(
            name='Alineacion',
            fields=[
                ('alineacion_id', models.AutoField(primary_key=True, serialize=False)),
                ('instrumento_origen_id', models.PositiveIntegerField()),
                ('instrumento_destino_id', models.PositiveIntegerField()),
                ('contribucion_porcentaje', models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ('fecha_creacion', models.DateTimeField(auto_now_add=True)),
                ('instrumento_destino_tipo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alineaciones_destino', to='contenttypes.contenttype')),
                ('instrumento_origen_tipo', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alineaciones_origen', to='contenttypes.contenttype')),
                ('usuario_creacion', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('instrumento_origen_tipo', 'instrumento_origen_id', 'instrumento_destino_tipo', 'instrumento_destino_id')},
            },
        ),
    ]
