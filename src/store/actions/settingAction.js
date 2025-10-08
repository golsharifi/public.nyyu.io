import * as types from "../actionTypes";
import client from "../../apollo/client";
import * as Query from "../../apollo/graphqls/querys/Setting";
import * as Mutation from "../../apollo/graphqls/mutations/Setting";
import _ from "lodash";
import { Currencies } from "../../utilities/staticData2";

const currenciesObj = _.mapKeys(Currencies, "label");

export const set_All_Fees = (data) => (dispatch) => {
    dispatch({
        type: types.SET_ALL_FEES,
        payload: { ...data },
    });
};

const DEFAULT_ASSETS = "USD,NDB,BTC,ETH,SOL,DOGE,SHIB,LTC,ADA,CAKE";

export const fetch_Favor_Assets = () => async (dispatch) => {
    try {
        const { data } = await client.query({
            query: Query.GET_FAVOR_ASSETS,
        });
        if (data.getFavorAssets) {
            if (_.isEmpty(data.getFavorAssets)) {
                dispatch(
                    update_Favor_Assets({
                        assets: DEFAULT_ASSETS,
                    }),
                );
            } else {
                const currency = data?.getFavorAssets[0];
                const assets = data?.getFavorAssets.slice(1);
                dispatch({
                    type: types.FETCH_FAVOR_ASSETS,
                    payload: {
                        currency: currenciesObj[currency],
                        assets,
                    },
                });
            }
        }
    } catch (err) {
        console.log(err);
    }
};

export const update_Favor_Assets = (updateData) => async (dispatch) => {
    try {
        const { data } = await client.mutate({
            mutation: Mutation.UPDATE_FAVOR_ASSETS,
            variables: { ...updateData },
        });
        const favAssetsArray = String(updateData?.assets).split(",");
        const currency = favAssetsArray[0];
        const assets = favAssetsArray.slice(1);
        if (data.updateFavorAssets) {
            dispatch({
                type: types.UPDATE_FAVOR_ASSETS,
                payload: {
                    currency: currenciesObj[currency],
                    assets,
                },
            });
        }
    } catch (err) {
        console.log(err);
    }
};
