import * as types from "../actionTypes";

export const allFeesReducer = (state = {}, action) => {
    switch (action.type) {
        case types.SET_ALL_FEES:
            return { ...action.payload };
        default:
            return state;
    }
};
