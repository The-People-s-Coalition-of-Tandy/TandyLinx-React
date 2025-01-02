import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

export const pageService = {
    getPage: (pageURL) => api.get(`/get-page/${pageURL}`),
    updatePage: (pageURL, data) => api.post(`/update-page/${pageURL}`, data),
    checkPageURL: (name) => api.get(`/check-pageURL?name=${name}`),
    createPage: (data) => api.post('/create', data)
};

export const authService = {
    login: (credentials) => api.post('/login', credentials),
    logout: () => api.post('/logout'),
    checkAuth: () => api.get('/check-auth')
}; 