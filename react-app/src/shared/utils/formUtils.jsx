export const handleFormChange = (e, setFormData) => {
    const {name, value, type, checked} = e.target;
    setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value}));
};

export const handleFormSubmit = async ({url, method, formData, token, onSave, setError}) => {
    try {
        const response = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json', 'Authorization': `Token ${token}`},
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(JSON.stringify(data));
        onSave();
    } catch (err) {
        setError(err.message);
    }
};