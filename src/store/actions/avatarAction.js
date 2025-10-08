import _ from "lodash";
import * as Query from "../../apollo/graphqls/querys/AvatarComponent";
import * as Mutation from "./../../apollo/graphqls/mutations/AvatarComponent";
import * as types from "../actionTypes";
import client from "./../../apollo/client";
import {
    showFailAlarm,
    showSuccessAlarm,
} from "../../components/admin/AlarmModal";

export const create_Avatar_Component = (createData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.CREATE_NEW_COMPONENT,
            variables: { ...createData },
        });

        showSuccessAlarm("Avatar Component created successfully");
        dispatch({
            type: types.CREATE_AVATAR_COMPONENT,
            payload: data.createNewComponent,
        });
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong!");
    }
};

export const update_Avatar_Component = (updateData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.UPDATE_COMPONENT,
            variables: { ...updateData },
        });

        showSuccessAlarm("Avatar Component updated successfully");
        dispatch({
            type: types.UPDATE_AVATAR_COMPONENT,
            payload: { ...data?.updateComponent, ...updateData },
        });
    } catch (err) {
        showFailAlarm("Action failed", "Ops! Something went wrong!");
    }
};

export const delete_Avatar_Component = (deleteData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.DELETE_AVATAR_COMPONENT,
            variables: { ...deleteData },
        });
        if (data.deleteAvatarComponent) {
            showSuccessAlarm("Avatar Component deleted successfully");
            dispatch({
                type: types.DELETE_AVATAR_COMPONENT,
                payload: { ...deleteData },
            });
        }
    } catch (err) {
        showFailAlarm("Action failed", "Ops! Something went wrong!");
    }
};

export const fetch_Avatar_Components = () => async (dispatch) => {
    try {
        const { data } = await client.query({
            query: Query.GET_AVATAR_COMPONENTS,
        });
        const compData = data.getAvatarComponents;
        if (compData) {
            const hairStyles = _.mapKeys(
                _.filter(compData, { groupId: "hairStyle" }),
                "compId",
            );
            const facialStyles = _.mapKeys(
                _.filter(compData, { groupId: "facialStyle" }),
                "compId",
            );
            const expressions = _.mapKeys(
                _.filter(compData, { groupId: "expression" }),
                "compId",
            );
            const hats = _.mapKeys(
                _.filter(compData, { groupId: "hat" }),
                "compId",
            );
            const others = _.mapKeys(
                _.filter(compData, { groupId: "other" }),
                "compId",
            );
            dispatch({
                type: types.FETCH_AVATAR_COMPONENTS,
                payload: {
                    hairStyles,
                    facialStyles,
                    expressions,
                    hats,
                    others,
                },
            });
        } else {
            return null;
        }
    } catch (err) {
        console.log(err.message);
    }
};

export const create_New_Avatar = (createData) => async (dispatch) => {
    try {
        await client.mutate({
            mutation: Mutation.CREATE_NEW_AVATAR,
            variables: { ...createData },
        });
        showSuccessAlarm("Avatar created successfully");
        // console.log(data);
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong. Try again!");
    }
};

export const update_Avatar_Profile = (updateData) => async (dispatch) => {
    try {
        await client.mutate({
            mutation: Mutation.UPDATE_AVATAR_PROFILE,
            variables: { ...updateData },
        });
        showSuccessAlarm("Avatar updated successfully");

        dispatch({
            type: types.UPDATE_DATUM,
            payload: updateData,
        });
    } catch (err) {
        // console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong. Try again!");
    }
};

export const fetch_Avatars = () => async (dispatch) => {
    try {
        const { data } = await client.query({
            query: Query.GET_AVATARS,
        });
        const dataList = _.mapKeys(data.getAvatars, "id");
        // console.log(data.getAvatars)
        dispatch({
            type: types.FETCH_DATA,
            payload: dataList,
        });
    } catch (err) {
        // console.log(err.message);
        showFailAlarm(
            "Data Loading Error",
            "Ops! Something went wrong. Try again!",
        );
    }
};
