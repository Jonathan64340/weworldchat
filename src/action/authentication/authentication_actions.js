import { LOGIN, LOGOUT, UPDATE } from './authentication_types'

export const setLogin = (payload) => ({
    type: LOGIN,
    payload
})

export const setLogout = () => ({
    type: LOGOUT
})

export const setUserUpdate = (payload) => ({
    type: UPDATE,
    payload
})