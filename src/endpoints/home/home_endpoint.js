import axios from 'axios';

export function getCountUsersConnected(data) {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/countUsersConnected`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getPrivateTchat(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getPrivateTchat`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getGlobalTchat(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getGlobalTchat`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getListeGroupe(data) {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getListeGroupe`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getGroupeTchat(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/getGroupTchat`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getAvailableGroupName(data) {
    return axios
        .post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/verifyAvailableGroupName`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}

export function getParticipantsFromGroup(data) {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/group?participants=${data}`)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}