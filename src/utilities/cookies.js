import Cookies from 'js-cookie';

export const setCookie = (name, value) => {
    Cookies.set(name, value);
};

export const getCookie = (name) => {
    return Cookies.get(name);
};

export const removeCookie = (name) => {
    return Cookies.remove(name);
};

// cookie variable name
export const NDB_Paypal_TrxType = 'NDB_Paypal_TrxType';

export const NDB_Privilege = 'NDB_Privilege'; // check if user is amin or not.
export const NDB_FavAssets = 'NDB_FavAssets';
// cookie values
export const NDB_Auction = 'f920fd230rk_auc';
export const NDB_Presale = 'dj039rjkjaq_pre';
export const NDB_Deposit = 'f30fakjf203_dep';

export const NDB_Admin = 'adke!#%^fj@#$ldkf_hku68';