import React from 'react';
import PresaleTableProvider from './usePresaleTable';
import DataTable from './DataTable';

const PresaleTable = () => (
    <PresaleTableProvider>
        <DataTable />
    </PresaleTableProvider>
);


export default PresaleTable;