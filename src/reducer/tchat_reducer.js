import { ENTER_GROUP_DISCUSSION, ENTER_PRIVATE_TCHAT, LOAD_FIRST_TIME, OPEN_MENU, QUIT_GROUP_DISCUSSION } from '../action/tchat/tchat_types'

const tchat = (state = { data: { userConversation: undefined, groupeSubscribed: [] } }, action) => {
    switch (action.type) {
        case ENTER_PRIVATE_TCHAT:
            return {
                data: {
                    userOneId: action.payload.userOneId,
                    userTwoId: action.payload.userTwoId,
                    userConversation: action.payload.userConversation,
                    enableWebcamCall: action.payload.enableWebcamCall,
                    groupeSubscribed: state.data.groupeSubscribed
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

        case ENTER_GROUP_DISCUSSION:
            return {
                ...state,
                data: {
                    ...state.data, userConversation: null,
                    currentGroupDiscussion: action.payload.currentGroupDiscussion,
                    groupeSubscribed: action.payload.groupeSubscribed
                }
            }

        case QUIT_GROUP_DISCUSSION:
            return {
                ...state,
                data: {
                    userConversation: null,
                    groupeSubscribed: action.payload.groupeSubscribed,
                    currentGroupDiscussion: null
                }
            }

        default:
            return state
    }
}

export { tchat }