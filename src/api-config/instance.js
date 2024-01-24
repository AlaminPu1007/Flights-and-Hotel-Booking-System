import axios from 'axios';
import JwtService from './jwtService';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        apikey: process.env.NEXT_PUBLIC_API_KEY,
    },
});

instance.interceptors.request.use(
    (config) => {
        const token = JwtService.getAccessToken();
        const guestId = JwtService.getGuestId();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (guestId) {
            const checkGuestId = guestId?.includes('guest_id');

            if (checkGuestId) {
                config.headers['guest-id'] = `${guestId?.slice(9)}`;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default instance;
