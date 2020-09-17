import axios from 'axios';

export function getCountUsersConnected() {
    return axios
        .get(`https://nameless-lowlands-47620.herokuapp.com/countUsersConnected`)
        .then(({ data }) => data)
}

export function getPrivateTchat(data) {
    return axios
        .post(`https://nameless-lowlands-47620.herokuapp.com/getPrivateTchat`, data)
        .then(({ data }) => data)
}