import React from 'react';
import {FileText, BarChart3, Bell, History, Download, FileJson, FileSpreadsheet, FileType} from 'lucide-react';

// Pequeño componente para las tarjetas de capacidad de exportación
const ExportCard = ({icon: Icon, title, format, onExport}) => (
    <button
        onClick={() => onExport(format)}
        className="bg-gray-50 p-4 rounded-lg flex flex-col items-center justify-center text-center hover:bg-blue-100 hover:shadow-md transition-all duration-300"
    >
        <Icon className="w-10 h-10 text-blue-600 mb-2"/>
        <h4 className="font-semibold text-gray-800">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">Exportar datos en formato .{format}</p>
    </button>
);

export default function ReportsPage() {

    // Función especializada para manejar la descarga de archivos desde la API
    const handleExport = async (format) => {
        const token = localStorage.getItem('authToken'); // Obtener token como en api.js
        if (!token) {
            console.error('Token no encontrado en localStorage');
        }
        const url = `http://127.0.0.1:8000/api/v1/reports/export/?format=${format}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta de la red');
            }

            // Convertimos la respuesta en un blob (un objeto tipo archivo)
            const blob = await response.blob();

            // Creamos una URL temporal para el blob
            const downloadUrl = window.URL.createObjectURL(blob);

            // Creamos un enlace 'a' invisible para iniciar la descarga
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `reporte_alineaciones.${format}`); // Nombre del archivo
            document.body.appendChild(link);
            link.click();

            // Limpiamos el enlace y la URL del blob
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error('Hubo un error al exportar el reporte:', error);
            // Aquí podrías mostrar una notificación de error al usuario
        }
    };

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">PROC08 - Reportes y Visualización</h1>
                    <button onClick={() => handleExport('pdf')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow hover:bg-blue-700">
                        <Download className="w-4 h-4 mr-2"/>
                        Exportar
                    </button>
                </div>

                {/* Módulo de Reportes y Visualización */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Tarjetas de Módulo */}
                    <div className="bg-white p-5 rounded-lg shadow flex items-center"><FileText
                        className="w-8 h-8 text-green-500 mr-4"/>
                        <div><h3 className="font-bold">Exportación</h3><p className="text-sm text-gray-500">PDF, Excel,
                            JSON, CSV</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow flex items-center"><BarChart3
                        className="w-8 h-8 text-yellow-500 mr-4"/>
                        <div><h3 className="font-bold">Visualización</h3><p className="text-sm text-gray-500">Dashboards
                            dinámicos</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow flex items-center"><Bell
                        className="w-8 h-8 text-red-500 mr-4"/>
                        <div><h3 className="font-bold">Alertas</h3><p className="text-sm text-gray-500">Reportes
                            dinámicos</p></div>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow flex items-center"><History
                        className="w-8 h-8 text-purple-500 mr-4"/>
                        <div><h3 className="font-bold">Histórico</h3><p className="text-sm text-gray-500">Desde 2011</p>
                        </div>
                    </div>
                </div>

                {/* Capacidades de Exportación */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Capacidades de Exportación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ExportCard icon={FileType} title="PDF" format="pdf" onExport={handleExport}/>
                        <ExportCard icon={FileSpreadsheet} title="Excel" format="excel" onExport={handleExport}/>
                        <ExportCard icon={FileJson} title="JSON" format="json" onExport={handleExport}/>
                        <ExportCard icon={FileType} title="CSV" format="csv" onExport={handleExport}/>
                    </div>
                </div>

                {/* Paneles de información estáticos (como en el diseño) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Funcionalidades Principales</h2>
                        {/* ... Aquí iría el contenido estático de funcionalidades ... */}
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">Alineación PND</h2>
                        {/* ... Contenido estático de alineación ... */}
                    </div>
                </div>
            </div>
        </div>
    );
}