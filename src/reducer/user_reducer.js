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
                    isLogged: true,
                    email: action.payload.email,
                    registerDate: action.payload.registerDate,
                    ...(action.payload.avatar && { avatar: action.payload.avatar })
                }
            }

        case UPDATE: {
            return {
                ...state,
                data: {
                    ...state.data,
                    avatar: action.payload.avatar,
                    ...(action.payload.statusOnline && { statusOnline: action.payload.statusOnline, ...(state.data.avatar && { avatar: state.data.avatar }) })
                }
            }
        }

        case LOGOUT:
            return {
                data: {
                    id: undefined,
                    name: null,
                    statusOnline: null,
                    isLogged: false,
                    email: null,
                    registerDate: null
                }
            }

        default:
            return state
    }
}

export { user }