import { combineReducers } from "redux";
import { authReducer } from "./authReducer";
import { errorsReducer } from "./errorReducer";
import { avatarComponentsReducer } from "./avatarReducer";
import { bidReducer, currencyRatesReducer } from "./bidReducer";
import { tasksReducer, userTierReducer } from "./settingReducer";
import { dataReducer } from './dataReducer';
import { kycSettingsReducer } from "./settingReducer";
import { allFeesReducer } from "./allFeesReducer";
import { tempReducer, profileTabReducer, balanceReducer } from './tempReducer';
import { favorAssetsReducer } from "./settingReducer";
import { tierReducer } from "./tierReducer";

const rootReducer = combineReducers({
    auth: authReducer,
    avatarComponents: avatarComponentsReducer,
    errors: errorsReducer,
    userTiers: userTierReducer,
    placeBid: bidReducer,
    kycSettings: kycSettingsReducer,
    tasks: tasksReducer,
    data: dataReducer,
    temp: tempReducer,
    allFees: allFeesReducer,
    profileTab: profileTabReducer,
    currencyRates: currencyRatesReducer,
    favAssets: favorAssetsReducer,
    tiers: tierReducer,
    balance: balanceReducer,
});

export default rootReducer;
