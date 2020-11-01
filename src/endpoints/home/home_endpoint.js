import axios from 'axios';

export function getCountUsersConnected() {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/countUsersConnected`)
        .then(({ data }) => data)
}

export function getPrivateTchat(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getPrivateTchat`, data)
        .then(({ data }) => data)
}

export function getGlobalTchat() {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getGlobalTchat`)
        .then(({ data }) => data)
}