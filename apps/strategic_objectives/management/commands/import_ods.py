import json

from django.core.management.base import BaseCommand
from django.conf import settings
from apps.strategic_objectives.models import ObjetivoDesarrolloSostenible, MetaODS, IndicadorODS

class Command(BaseCommand):
    help = 'Importa los Objetivos de Desarrollo Sostenible (ODS), metas e indicadores desde archivos CSV.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Iniciando la importación de ODS...'))

        # Limpiar datos existentes para evitar duplicados en cada ejecución
        IndicadorODS.objects.all().delete()
        MetaODS.objects.all().delete()
        ObjetivoDesarrolloSostenible.objects.all().delete()
        self.stdout.write(self.style.WARNING('Datos de ODS existentes eliminados.'))

        # Ruta base a los archivos de datos
        data_path = settings.BASE_DIR / 'apps' / 'strategic_objectives' / 'data'

        # 1. Importar Objetivos (Goals)
        goals_file = data_path / 'goals-final-es.json'
        try:
            with open(goals_file, mode='r', encoding='utf-8') as file:
                goals_data = json.load(file)
                for row in goals_data:
                    goal_num = int(row['goal'])
                    ObjetivoDesarrolloSostenible.objects.create(
                        numero=goal_num,
                        nombre=row['short'],
                        descripcion=row['title'],
                    )
            self.stdout.write(self.style.SUCCESS(f'Se importaron {ObjetivoDesarrolloSostenible.objects.count()} ODS.'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'No se encontró el archivo: {goals_file}'))
            return

        # 2. Importar Metas (Targets)
        targets_file = data_path / 'targets-final.json'
        try:
            with open(targets_file, mode='r', encoding='utf-8') as file:
                targets_data = json.load(file)
                for row in targets_data:
                    try:
                        goal_num = int(row['goal'])
                        ods_instance = ObjetivoDesarrolloSostenible.objects.get(numero=goal_num)
                        MetaODS.objects.create(
                            ods=ods_instance,
                            codigo=row['id'],
                            descripcion=row['title']
                        )
                    except ObjetivoDesarrolloSostenible.DoesNotExist:
                        self.stdout.write(self.style.WARNING(
                            f"ODS con número {goal_num} no encontrado para la meta {row['target']}."))
            self.stdout.write(self.style.SUCCESS(f'Se importaron {MetaODS.objects.count()} metas de ODS.'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'No se encontró el archivo: {targets_file}'))
            return

        # 3. Importar Indicadores (Indicators)
        indicators_file = data_path / 'indicators-final.json'
        try:
            with open(indicators_file, mode='r', encoding='utf-8') as file:
                indicators_data = json.load(file)
                for row in indicators_data:
                    try:
                        target_code = row['target_id']
                        meta_instance = MetaODS.objects.get(codigo=target_code)
                        IndicadorODS.objects.create(
                            meta_ods=meta_instance,
                            codigo=row['indicator_id'],
                            descripcion=row['indicator']
                        )
                    except MetaODS.DoesNotExist:
                        self.stdout.write(self.style.WARNING(
                            f"Meta con código {target_code} no encontrada para el indicador {row['indicator_id']}."))
            self.stdout.write(self.style.SUCCESS(f'Se importaron {IndicadorODS.objects.count()} indicadores de ODS.'))
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'No se encontró el archivo: {indicators_file}'))
            return

        self.stdout.write(self.style.SUCCESS('Importación de ODS completada.'))