import { combineReducers } from 'redux';
import { user } from './user_reducer';
import { tchat } from './tchat_reducer';
import { app } from './app_reducer';

export default combineReducers({ user, tchat, app });