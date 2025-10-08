import React, { useState, createContext, useContext } from 'react';
import _ from 'lodash';

const CryptoWithdrawContext = createContext(null);

const CryptoWithdrawProvider = ({ children }) => {
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
        <CryptoWithdrawContext.Provider value={providerValue}>
            {children}
        </CryptoWithdrawContext.Provider>
    );
};

export default CryptoWithdrawProvider;

export const useCryptoWithdraw = () => useContext(CryptoWithdrawContext);