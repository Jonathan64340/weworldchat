import { ENTER_PRIVATE_TCHAT, OPEN_MENU, ENTER_GROUP_DISCUSSION, QUIT_GROUP_DISCUSSION } from './tchat_types';

/** 
 * @param {string} userOneId
 * @param {string} userTwoId
 * @param {string} userConversation
 * @description Persister la sélection de la conversation dans le store
*/
export const setEnterPrivateTchat = payload => ({
    type: ENTER_PRIVATE_TCHAT,
    payload
})

export const setOpenMenu = payload => ({
    type: OPEN_MENU,
    payload
})

export const setEnterGroupDiscussion = payload => ({
    type: ENTER_GROUP_DISCUSSION,
    payload
})

export const setQuitGroupDiscussion = payload => ({
    type: QUIT_GROUP_DISCUSSION,
    payload
})