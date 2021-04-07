import axios from 'axios';

export function doRegister(data) {
    return axios.post(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/register`, data)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}