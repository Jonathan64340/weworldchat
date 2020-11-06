import { combineReducers } from 'redux';
import { LOGIN, LOGOUT, UPDATE } from '../action/authentication/authentication_types'
import { ENTER_PRIVATE_TCHAT, LOAD_FIRST_TIME, OPEN_MENU } from '../action/tchat/tchat_types'

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

const tchat = (state = { data: { userConversation: undefined } }, action) => {
    switch (action.type) {
        case ENTER_PRIVATE_TCHAT:
            return {
                data: {
                    userOneId: action.payload.userOneId,
                    userTwoId: action.payload.userTwoId,
                    userConversation: action.payload.userConversation,
                    enableWebcamCall: action.payload.enableWebcamCall
                }
            }

        case OPEN_MENU:
            return {
                ...state,
                data: { ...state.data, menuOpened: action.payload.menuOpened }
            }

        case LOAD_FIRST_TIME:
            return {
                data: {
                    notification: false,
                    message: false
                }
            }

        default:
            return state
    }
}


export default combineReducers({ user, tchat });