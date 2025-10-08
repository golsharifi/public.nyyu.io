import React, { useState, createContext, useContext } from 'react';
import _ from 'lodash';

const PresaleTableContext = createContext(null);

const PresaleTableProvider = ({ children }) => {
    const [data, setData] = useState({});

    const fetchData = data => {
        setData(_.mapKeys(data, 'id'));
    };

    // const updateDatum = datum => {
    //     setData({ ...data, [datum.id]: datum });
    // };

    const providerValue = {
        data,
        fetchData,
        // updateDatum
    };

    return (
        <PresaleTableContext.Provider value={providerValue}>
            {children}
        </PresaleTableContext.Provider>
    );
};

export default PresaleTableProvider;

export const usePresaleTable = () => useContext(PresaleTableContext);