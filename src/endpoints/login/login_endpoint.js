import axios from 'axios';

export function doLogin(data) {
    return axios
        .post(`https://nameless-lowlands-47620.herokuapp.com/login`, data)
        .then(({ data }) => data)
}

export function checkConnectionRematch(id) {
    return axios
        .get(`https://nameless-lowlands-47620.herokuapp.com/getUser/${id}`)
        .then(({ data }) => data)
}