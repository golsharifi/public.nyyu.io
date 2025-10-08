import * as types from "../actionTypes";

const initialState = {
    bid_amount: 1,
    currency: { label: "USD", value: "USD", sign: "$" },
    round_id: 0,
    order_id: 0,
};

export const bidReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.BID_PLACE:
            return { ...state, bid_amount: action.payload };
        case types.SET_CURRENCY:
            return { ...state, currency: action.payload };
        case types.SET_CURRENT_ROUND_ID:
            return { ...state, round_id: action.payload };
        case types.SET_PRESALE_ORDER_ID:
            return { ...state, order_id: action.payload };
        default:
            return state;
    }
};

export const currencyRatesReducer = (state = {}, action) => {
    switch (action.type) {
        case types.FETCH_CURRENCY_RATES:
            return { ...state, ...action.payload };
        default:
            return state;
    }
};
