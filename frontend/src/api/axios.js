import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Aapka actual IP Address backend ke liye
const API_URL = 'http://192.168.29.171:5000'; 

const api = axios.create({
    baseURL: API_URL,
});

// Request Interceptor: Har API call se pehle token add karega
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;