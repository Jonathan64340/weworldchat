import axios from 'axios';

export function getCountUsersConnected() {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/countUsersConnected`)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getPrivateTchat(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getPrivateTchat`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getGlobalTchat() {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getGlobalTchat`)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getListeGroupe(data) {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getListeGroupe`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}