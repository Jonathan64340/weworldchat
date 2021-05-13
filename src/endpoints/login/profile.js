import axios from 'axios';

export function deleteAccount(data) {
    return axios.post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/rgpd-delete-account`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
};