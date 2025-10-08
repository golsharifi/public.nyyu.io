import React from 'react';
import BankWithdrawProvider from './useBankWithdraw';
import DataTable from './DataTable';

const BankWithdrawTable = () => (
    <BankWithdrawProvider>
        <DataTable />
    </BankWithdrawProvider>
);


export default BankWithdrawTable;