import React from 'react';
import {X} from 'lucide-react';
import ProjectDetail from './ProjectDetail.jsx';

export default function ProjectDetailModal({project, onClose}) {
    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
                <div className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Detalle del Proyecto Postulado</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full">
                        <X size={24}/>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6">
                    {/* El prop 'onReturnToList' ahora simplemente cierra el modal */}
                    <ProjectDetail project={project} onReturnToList={onClose}/>
                </div>
            </div>
        </div>
    );
}