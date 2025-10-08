import _ from "lodash";
import * as Mutation from "../../apollo/graphqls/mutations/Token";
import * as Query from "../../apollo/graphqls/querys/Token";
import client from "../../apollo/client";
import {
    showFailAlarm,
    showSuccessAlarm,
} from "../../components/admin/AlarmModal";
import * as types from "../actionTypes";

export const create_Token = (createData) => async (dispatch) => {
    try {
        await client.mutate({
            mutation: Mutation.CREATE_TOKEN,
            variables: { ...createData },
        });
        showSuccessAlarm("Token created successfully");
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong. Try again!");
    }
};

export const get_Tokens = () => async (dispatch) => {
    try {
        const { data } = await client.query({
            query: Query.GET_TOKENS,
        });
        const dataList = _.mapKeys(data.getTokenAssets, "id");

        dispatch({
            type: types.FETCH_DATA,
            payload: dataList,
        });
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong. Try again!");
    }
};

export const delete_Token = (id) => async (dispatch) => {
    try {
        await client.mutate({
            mutation: Mutation.DELETE_TOKEN,
            variables: { id },
        });
        showSuccessAlarm("Token deleted successfully");
        dispatch({
            type: types.DELETE_DATUM,
            payload: id,
        });
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong. Try again!");
    }
};

export const update_Symbol = (updateData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.UPDATE_SYMBOL,
            variables: {
                id: updateData.id,
                symbol: updateData.symbol,
            },
        });
        if (data.updateSymbol) {
            showSuccessAlarm("Token updated successfully");
            dispatch({
                type: types.UPDATE_DATUM,
                payload: { ...updateData },
            });
        } else {
            showFailAlarm(
                "Action failed",
                "Ops! Something went wrong. Try again!",
            );
        }
    } catch (err) {
        console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong. Try again!");
    }
};
