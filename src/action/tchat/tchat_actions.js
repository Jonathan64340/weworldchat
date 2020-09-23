import { ENTER_PRIVATE_TCHAT, OPEN_MENU } from './tchat_types';

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