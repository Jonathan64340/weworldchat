import axios from 'axios';

export function doLogin(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/login`, data)
        .then(({ data }) => data)
}

export function checkConnectionRematch(id) {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getUser/${id}`)
        .then(({ data }) => data)
}

export function doLoginOnTchatGroup(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/auth/group`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}