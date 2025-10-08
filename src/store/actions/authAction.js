import { LOGIN_SUCCESS, LOGOUT_USER } from "../actionTypes";
import { GET_USER } from "../../apollo/graphqls/querys/Auth";
import client from "./../../apollo/client";

export const logOutUser = () => (dispatch) => {
    dispatch({
        type: LOGOUT_USER,
    });
};

export const setCurrentAuthInfo = (authInfo) => (dispatch) => {
    // Debug log to see what data we're receiving
    console.log("setCurrentAuthInfo - Received data:", authInfo);

    dispatch({
        type: LOGIN_SUCCESS,
        payload: {
            isAuthenticated: true,
            user: authInfo,
        },
    });
};

export const getAuthInfo = () => async (dispatch) => {
    try {
        console.log("getAuthInfo - Fetching user data");
        const { data } = await client.query({
            query: GET_USER,
        });

        console.log("getAuthInfo - Received data:", data.getUser);

        dispatch({
            type: LOGIN_SUCCESS,
            payload: {
                isAuthenticated: true,
                user: data.getUser,
            },
        });
    } catch (err) {
        console.log("getAuthInfo - Error:", err.message);
    }
};
