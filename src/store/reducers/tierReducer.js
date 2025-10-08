import * as types from "../actionTypes";

export const tierReducer = (state = {}, action) => {
    switch (action.type) {
        case types.FILL_USER_TIERS:
            return action.payload;
        default:
            return state;
    }
};
