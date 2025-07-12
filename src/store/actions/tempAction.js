import axios from 'axios';
import * as types from './../actionTypes';

export const set_Temp_Data = data => dispatch => {
    dispatch({
        type: types.SET_TEMP_DATA,
        payload: { ...data }
    })
};

export const updateHiddenStatus = status => dispatch => {
    dispatch({
        type: types.UPDATE_HIDDEN_STATUS,
        payload: status
    })
}

export const changeEquity = equity => dispatch => {
    dispatch({
        type: types.CHANGE_EQUITY,
        payload: equity
    })
}

export const fetchNDBPrice = () => async dispatch => {
    try {
        const { data } = await axios.get(`${process.env.GATSBY_API_BASE_URL}/ndbcoin/info`);
        const { price } = data;
        dispatch({
            type: types.FETCH_NDB_PRICE,
            payload: price
        });
    } catch(err) {
        console.log('fetching NDB price', err.message);
        dispatch({
            type: types.FETCH_NDB_PRICE,
            payload: 0
        });
    }
}