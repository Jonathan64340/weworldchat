import React from 'react';
import { render } from 'react-dom';
import App from './component/App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducer';

export const store = createStore(rootReducer);
window.io(`${process.env.REACT_APP_ENDPOINT}`, { "forceBase64": 1 })

render(<Provider store={store}>
    <App />
</Provider>, document.getElementById('root'));