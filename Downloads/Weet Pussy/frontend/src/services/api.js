import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		'Content-Type': 'application/json',
	},
	timeout: 15000, // 15 second timeout
});

// Helper to get token from localStorage
const getToken = () => {
	const token = localStorage.getItem('token');
	console.log('Getting token from localStorage:', token ? 'exists' : 'null');
	return token;
};

// Request interceptor to add auth token
api.interceptors.request.use(
	(config) => {
		const token = getToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
			console.log('API Request with auth:', config.method?.toUpperCase(), config.url);
		} else {
			console.log('API Request (no auth):', config.method?.toUpperCase(), config.url);
		}
		return config;
	},
	(error) => {
		console.error('Request interceptor error:', error);
		return Promise.reject(error);
	}
);

// Response interceptor for error handling
api.interceptors.response.use(
	(response) => {
		console.log('API Response:', response.status, response.config.url);
		return response;
	},
	(error) => {
		console.error('API Error:', {
			message: error.message,
			status: error.response?.status,
			data: error.response?.data,
			url: error.config?.url
		});

		// Only redirect on 401 if NOT on auth endpoints
		if (error.response?.status === 401) {
			const isAuthEndpoint = error.config?.url?.includes('/auth/');
			if (!isAuthEndpoint) {
				console.log('401 on protected endpoint, clearing token');
				localStorage.removeItem('token');
				// Don't auto-redirect, let the component handle it
			}
		}

		return Promise.reject(error);
	}
);

// Auth API
export const authApi = {
	register: async (email, password) => {
		const response = await api.post('/auth/register', { email, password });
		return response.data;
	},

	login: async (email, password) => {
		const response = await api.post('/auth/login', { email, password });
		return response.data;
	},
};

// Sweets API
export const sweetsApi = {
	getAll: async () => {
		const response = await api.get('/sweets');
		return response.data;
	},

	getById: async (id) => {
		const response = await api.get(`/sweets/${id}`);
		return response.data;
	},

	create: async (sweet) => {
		console.log('Creating sweet:', sweet);
		const response = await api.post('/sweets', sweet);
		return response.data;
	},

	update: async (id, sweet) => {
		const response = await api.put(`/sweets/${id}`, sweet);
		return response.data;
	},

	delete: async (id) => {
		await api.delete(`/sweets/${id}`);
	},

	purchase: async (id, quantity = 1) => {
		const response = await api.post(`/sweets/${id}/purchase`, { quantity });
		return response.data;
	},
};

export default api;
