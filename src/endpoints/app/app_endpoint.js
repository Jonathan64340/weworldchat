import axios from 'axios';

export function getVersion() {
    return axios
        .get(`${process.env.REACT_APP_HOSTNAME || process.env.REACT_APP_ENDPOINT}/version-front`)
        .then(({ data }) => data)
        .catch(err => new Error(err))
}