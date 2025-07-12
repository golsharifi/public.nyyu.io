import React, { useState, createContext, useContext } from 'react';
import _ from 'lodash';

const PaypalWithdrawContext = createContext(null);

const PaypalWithdrawProvider = ({ children }) => {
    const [data, setData] = useState({});

    const fetchData = data => {
        setData(_.mapKeys(data, 'id'));
    };

    const updateDatum = datum => {
        setData({ ...data, [datum.id]: datum });
    };

    const providerValue = {
        data,
        fetchData,
        updateDatum
    };

    return (
        <PaypalWithdrawContext.Provider value={providerValue}>
            {children}
        </PaypalWithdrawContext.Provider>
    );
};

export default PaypalWithdrawProvider;

export const usePaypalWithdraw = () => useContext(PaypalWithdrawContext);