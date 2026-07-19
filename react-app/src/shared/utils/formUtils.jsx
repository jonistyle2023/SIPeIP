import {api} from '../api/api.js';

export const handleFormChange = (e, setFormData) => {
    const {name, value, type, checked} = e.target;
    setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
};

// endpoint: ruta relativa a la API (ej. '/config/periodos/' o '/config/periodos/5/'),
// method: 'POST' | 'PUT' | 'PATCH'. Usa el cliente api compartido en vez de fetch
// directo, así siempre respeta la URL base y el token configurados en un solo lugar.
export const handleFormSubmit = async ({endpoint, method, formData, onSave, setError}) => {
    try {
        await api[method.toLowerCase()](endpoint, formData);
        onSave();
    } catch (err) {
        setError(err.message);
    }
};