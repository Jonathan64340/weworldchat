import axios from 'axios';

const requestInterceptor = axios.interceptors.request.use(config => {
    return config;
}, error => {
    return Promise.reject(error)
})

const responseInterceptor = axios.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(error)
})

export { requestInterceptor, responseInterceptor };