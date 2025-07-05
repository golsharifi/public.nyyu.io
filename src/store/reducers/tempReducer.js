import * as types from "../actionTypes";

export const tempReducer = (state = {}, action) => {
    switch (action.type) {
        case types.SET_TEMP_DATA:
            return { ...action.payload };
        default:
            return state;
    }
};

export const profileTabReducer = (state = 0, action) => {
    switch (action.type) {
        case types.CREATE_NOTIFICATION_ROUTE:
            return 1;
        case types.DISABLE_NOTIFICATION_ROUTE:
            return 0;
        case types.TIER_TAB:
            return 2;
        default:
            return state;
    }
};

const initialState = {
    hidden: false,
    equity: "BTC",
    ndbPrice: 0.1,
};

export const balanceReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.UPDATE_HIDDEN_STATUS:
            return { ...state, hidden: action.payload };
        case types.CHANGE_EQUITY:
            return { ...state, equity: action.payload };
        case types.FETCH_NDB_PRICE:
            return { ...state, ndbPrice: action.payload };
        default:
            return state;
    }
};
