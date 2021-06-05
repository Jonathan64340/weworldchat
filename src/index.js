import React from 'react';
import { render } from 'react-dom';
import App from './component/App';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducer';

export const store = createStore(rootReducer);

render(<Provider store={store}>
    <App />
</Provider>, document.getElementById('root'));