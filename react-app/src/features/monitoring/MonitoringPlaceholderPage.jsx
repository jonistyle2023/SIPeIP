import React from 'react';

export default function MonitoringPlaceholderPage({ icon: Icon, title, description }) {
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Icon className="mr-3 text-blue-600" />
                    {title}
                </h2>
                <p className="text-gray-600 mt-1">{description}</p>
            </div>

            <div className="bg-white p-10 rounded-lg shadow-sm text-center">
                <h3 className="font-semibold text-lg">Módulo en Construcción</h3>
                <p className="text-gray-500 mt-2">
                    La lógica y las vistas detalladas para este módulo de seguimiento se implementarán en una fase posterior.
                </p>
            </div>
        </div>
    );
}