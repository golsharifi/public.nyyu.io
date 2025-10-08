import React, { useState, createContext, useContext } from 'react';
import _ from 'lodash';

const BankWithdrawContext = createContext(null);

const BankWithdrawProvider = ({ children }) => {
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
        <BankWithdrawContext.Provider value={providerValue}>
            {children}
        </BankWithdrawContext.Provider>
    );
};

export default BankWithdrawProvider;

export const useBankWithdraw = () => useContext(BankWithdrawContext);