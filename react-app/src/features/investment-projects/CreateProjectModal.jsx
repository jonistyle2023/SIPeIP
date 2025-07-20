import React, {useState} from 'react';
import {X} from 'lucide-react';
import {api} from '../../shared/api/api.js';

const initialProjectData = {
    nombre: '',
    codigo_snip: '',
    sector: null, // Deberá ser un ID de catálogo
    entidad_ejecutora: null, // Deberá ser un ID de catálogo
    // ... otros campos necesarios
};

export default function CreateProjectModal({onClose}) {
    const [projectData, setProjectData] = useState(initialProjectData);
    const [sectors, setSectors] = useState([]);
    const [executingEntities, setExecutingEntities] = useState([]);
    const [loadingCatalogs, setLoadingCatalogs] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        Promise.all([
            api.get('/config/catalogos/?nombre=Sector'),
            api.get('/config/catalogos/?nombre=Entidad Ejecutora')
        ])
            .then(([sectorsData, entitiesData]) => {
                setSectors(sectorsData.results || []);
                setExecutingEntities(entitiesData.results || []);
                setLoadingCatalogs(false);
            })
            .catch(error => {
                console.error("Error fetching catalogs:", error);
                setErrorMessage('Error al cargar los catálogos.');
                setLoadingCatalogs(false);
            });
    }, []);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setProjectData(prevData => ({
            ...prevData,
            [name]: value
        }));
    }
}