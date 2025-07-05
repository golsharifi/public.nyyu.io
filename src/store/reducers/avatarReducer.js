import * as types from "../actionTypes";

const InitialAvatarComponents = {
    loaded: false,
    hairStyles: {},
    facialStyles: {},
    expressions: {},
    hats: {},
    others: {},
};

export const avatarComponentsReducer = (
    state = InitialAvatarComponents,
    action,
) => {
    switch (action.type) {
        case types.CREATE_AVATAR_COMPONENT:
        case types.UPDATE_AVATAR_COMPONENT:
            state[`${action.payload.groupId}s`] = {
                ...state[`${action.payload.groupId}s`],
                [action.payload.compId]: action.payload,
            };
            return { ...state };
        case types.DELETE_AVATAR_COMPONENT:
            delete state[`${action.payload.groupId}s`][
                `${action.payload.compId}`
            ];
            return { ...state };
        case types.FETCH_AVATAR_COMPONENTS:
            return {
                ...state,
                hairStyles: {
                    ...state.hairStyles,
                    ...action.payload.hairStyles,
                },
                facialStyles: {
                    ...state.facialStyles,
                    ...action.payload.facialStyles,
                },
                expressions: {
                    ...state.expressions,
                    ...action.payload.expressions,
                },
                hats: {
                    ...state.hats,
                    ...action.payload.hats,
                },
                others: {
                    ...state.others,
                    ...action.payload.others,
                },
                loaded: true,
            };
        default:
            return state;
    }
};
