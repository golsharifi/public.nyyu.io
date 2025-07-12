import client from "../../apollo/client";
import _ from "lodash";
import {
    showFailAlarm,
    showSuccessAlarm,
} from "../../components/admin/AlarmModal";
import * as Mutation from "./../../apollo/graphqls/mutations/User";
import * as Query from "../../apollo/graphqls/querys/User";
import * as types from "../actionTypes";

export const create_New_User = (createData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.CREATE_NEW_USER,
            variables: { ...createData },
        });
        if (data.createNewUser) {
            showSuccessAlarm("User created successfully");
        }
    } catch (err) {
        if (err.message === "already_exists") {
            showFailAlarm(
                "Action failed",
                "User with this email already exists",
            );
        } else {
            showFailAlarm("Action failed", "Ops! Something went wrong!");
        }
    }
};

export const get_Users = () => async (dispatch) => {
    try {
        const { data } = await client.query({
            query: Query.GET_USERS,
        });
        if (data.getPaginatedUsers) {
            const users = _.mapKeys(data.getPaginatedUsers, "id");
            dispatch({
                type: types.FETCH_DATA,
                payload: users,
            });
        }
    } catch (err) {
        console.log(err.message);
    }
};

export const change_User_Role = (updateData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.CHANGE_ROLE,
            variables: { ...updateData },
        });
        if (data.changeRole === "Success") {
            showSuccessAlarm(`User's role updated successfully`);
            dispatch({
                type: types.UPDATE_USER_ROLE,
                payload: {
                    id: updateData.id,
                    role: [updateData.role],
                },
            });
        } else {
            showFailAlarm("Action failed", "Ops! Something went wrong!");
        }
    } catch (err) {
        console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong!");
    }
};

export const suspend_User_By_Admin = (updateData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.SUSPEND_USER_BY_ADMIN,
            variables: { ...updateData },
        });
        if (data.suspendUserByAdmin) {
            showSuccessAlarm(`User suspended successfully`);
            dispatch({
                type: types.UPDATE_DATUM,
                payload: { ...updateData, isSuspended: true },
            });
        } else {
            showFailAlarm("Action failed", "Ops! Something went wrong!");
        }
    } catch (err) {
        console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong!");
    }
};

export const release_User_By_Admin = (updateData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.RELEASE_USER_BY_ADMIN,
            variables: { ...updateData },
        });
        if (data.releaseUserByAdmin) {
            showSuccessAlarm(`User released successfully`);
            dispatch({
                type: types.UPDATE_DATUM,
                payload: { ...updateData, isSuspended: false },
            });
        } else {
            showFailAlarm("Action failed", "Ops! Something went wrong!");
        }
    } catch (err) {
        console.log(err.message);
        showFailAlarm("Action failed", "Ops! Something went wrong!");
    }
};
