import axios from 'axios';

export function doLogin(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/login`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function doLoginOnTchatGroup(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/auth/group`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function requestResetPassword(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/request-reset-password`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function resetPassword(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/reset-password`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}