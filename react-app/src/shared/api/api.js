const BASE_URL = 'http://127.0.0.1:8000/api/v1';

const getAuthToken = () => localStorage.getItem('authToken');

const request = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {'Content-Type': 'application/json', ...options.headers};
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {...options, headers});
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({detail: 'Error desconocido'}));
        throw new Error(errorData.detail || JSON.stringify(errorData));
    }
    return response.status === 204 ? null : response.json();
};

export const api = {
    get: (endpoint) => request(endpoint),
    post: (endpoint, body) => request(endpoint, {method: 'POST', body: JSON.stringify(body)}),
    put: (endpoint, body) => request(endpoint, {method: 'PUT', body: JSON.stringify(body)}),
    patch: (endpoint, body) => request(endpoint, {method: 'PATCH', body: JSON.stringify(body)}),
    delete: (endpoint) => request(endpoint, {method: 'DELETE'}),
};