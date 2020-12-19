import axios from 'axios';
import { store } from '..';
import { setLoader } from '../action/app/app_actions';
import excludes from './excludes_routes_interceptor.json';

const requestInterceptor = axios.interceptors.request.use(config => {
    for(let i of excludes.excludes_routes_array) {
        if(!config.url.match(i)) {
            store.dispatch(setLoader({ isLoading: true }))
        }
    }
    return config;
}, error => {
    store.dispatch(setLoader({ isLoading: false }))
    return Promise.reject(error)
})

const responseInterceptor = axios.interceptors.response.use(response => {
    store.dispatch(setLoader({ isLoading: false }))
    return response;
}, error => {
    store.dispatch(setLoader({ isLoading: false }))
    return Promise.reject(error)
})

export { requestInterceptor, responseInterceptor };