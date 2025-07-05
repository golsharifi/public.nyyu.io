import _ from "lodash";
import client from "../../apollo/client";
import * as Mutation from "./../../apollo/graphqls/mutations/Auction";
import * as Query from "./../../apollo/graphqls/querys/Auction";
import {
    showFailAlarm,
    showSuccessAlarm,
} from "../../components/admin/AlarmModal";
import * as types from "../actionTypes";

export const create_Auction = (createData) => async (dispatch) => {
    try {
        await client.mutate({
            mutation: Mutation.CREATE_AUCTION,
            variables: { ...createData },
        });
        showSuccessAlarm("Auction created successfully");
    } catch (err) {
        // console.log(err.message);
        if (err.message === "started_auction") {
            showFailAlarm("Action failed", "Auction already started");
        } else {
            showFailAlarm("Action failed", err.message);
        }
    }
};

export const create_New_Presale = (createData) => async (dispatch) => {
    try {
        await client.mutate({
            mutation: Mutation.CREATE_NEW_PRESALE,
            variables: { ...createData },
        });
        showSuccessAlarm("Direct Purchase Round created successfully");
    } catch (err) {
        // console.log(err.message);
        if (err.message === "started_auction") {
            showFailAlarm("Action failed", "Auction already started");
        } else {
            showFailAlarm("Action failed", err.message);
        }
    }
};

export const get_Auctions = () => async (dispatch) => {
    try {
        const { data } = await client.query({
            query: Query.GET_AUCTIONS,
        });
        const dataList = _.mapKeys(data.getAuctions, "round");
        dispatch({
            type: types.FETCH_DATA,
            payload: dataList,
        });
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", err.message);
    }
};

export const get_Presales = () => async (dispatch) => {
    try {
        const { data } = await client.query({
            query: Query.GET_PRESALES,
        });
        const dataList = _.mapKeys(data.getPreSales, "round");
        dispatch({
            type: types.FETCH_DATA,
            payload: dataList,
        });
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", err.message);
    }
};
