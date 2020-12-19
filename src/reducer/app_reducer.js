import { LOADER } from '../action/app/app_types';

const app = (state = { isLoading: false }, action) => {
    switch (action.type) {
        case LOADER:
            return {
                ...state,
                isLoading: action.payload.isLoading
            }

        default:
            return { state }
    }
}

export { app }