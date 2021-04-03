import { LOGIN, LOGOUT, UPDATE } from '../action/authentication/authentication_types'

const user = (state = { isAdmin: false }, action) => {
    switch (action.type) {
        case LOGIN:
            return {
                data: {
                    ...state,
                    id: action.payload.id,
                    name: action.payload.pseudo,
                    statusOnline: action.payload.statusOnline,
                    defaultColor: action.payload.defaultColor,
                    isLogged: true
                }
            }

        case UPDATE: {
            return {
                ...state,
                data: {
                    ...state.data,
                    statusOnline: action.payload.statusOnline
                }
            }
        }

        case LOGOUT:
            return {
                data: {
                    id: undefined,
                    name: null,
                    statusOnline: null,
                    isLogged: false
                }
            }

        default:
            return state
    }
}

export { user }