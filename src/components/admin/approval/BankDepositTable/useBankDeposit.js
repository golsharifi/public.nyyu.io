import React, { useState, createContext, useContext } from 'react';
import _ from 'lodash';

const BankDepositContext = createContext(null);

const BankDepositProvider = ({ children }) => {
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
        <BankDepositContext.Provider value={providerValue}>
            {children}
        </BankDepositContext.Provider>
    );
};

export default BankDepositProvider;

export const useBankDeposit = () => useContext(BankDepositContext);