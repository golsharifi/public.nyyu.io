import * as types from "../actionTypes";
import _ from "lodash";

export const userTierReducer = (state = {}, action) => {
    switch (action.type) {
        case types.GET_USER_TIERS:
            return { ...state, ...action.payload };
        case types.CREATE_USER_TIER:
        case types.UPDATE_USER_TIER:
            return { ...state, [action.payload.level]: action.payload };
        case types.DELETE_USER_TIER:
            delete state[action.payload];
            return { ...state };
        default:
            return state;
    }
};

const InitialKYCSetting = {
    KYC: {},
    AML: {},
};

export const kycSettingsReducer = (state = InitialKYCSetting, action) => {
    switch (action.type) {
        case types.FETCH_KYC_SETTINGS:
            return { ...state, ...action.payload };
        case types.UPDATE_KYC_SETTING:
            return { ...state, [action.payload.kind]: action.payload };
        default:
            return state;
    }
};

const InitialTask = {
    verification: 0,
    wallet: [],
    auction: 0,
    direct: 0,
    staking: [],
};

export const tasksReducer = (state = InitialTask, action) => {
    switch (action.type) {
        case types.FETCH_TASK_SETTING:
            const wallet = _.orderBy(
                action.payload.wallet,
                ["amount"],
                ["asc"],
            );
            const staking = _.orderBy(
                action.payload.staking,
                ["expiredTime"],
                ["asc"],
            );
            return { ...state, ...action.payload, wallet, staking };
        default:
            return state;
    }
};

const InitialFavAssets = {
    currency: { label: "USD", value: "USD", sign: "$" },
    assets: [],
};

export const favorAssetsReducer = (state = InitialFavAssets, action) => {
    switch (action.type) {
        case types.FETCH_FAVOR_ASSETS:
        case types.UPDATE_FAVOR_ASSETS:
            return { ...action.payload };
        default:
            return state;
    }
};
