import * as Types from "../actionTypes"

export const setBidInfo = (bid_amount) => (dispatch) => {
    dispatch({
        type: Types.BID_PLACE,
        payload: bid_amount,
    })
}

export const setCurrencyInfo = (currency) => (dispatch) => {
    dispatch({
        type: Types.SET_CURRENCY,
        payload: currency,
    })
}

export const setCurrentRound = (round_id) => (dispatch) => {
    dispatch({
        type: Types.SET_CURRENT_ROUND_ID,
        payload: round_id,
    })
}

export const setPresaleOrderId = orderId => dispatch => {
    dispatch({
        type: Types.SET_PRESALE_ORDER_ID,
        payload: orderId
    })
}

export const setCurrencyRates = data => dispatch => {
    dispatch({
        type: Types.FETCH_CURRENCY_RATES,
        payload: data
    })
};