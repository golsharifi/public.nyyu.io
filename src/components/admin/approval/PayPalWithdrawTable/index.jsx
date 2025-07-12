import React from 'react';
import PaypalWithdrawProvider from './usePaypalWithdraw';
import DataTable from './DataTable';

const BankWithdrawTable = () => (
    <PaypalWithdrawProvider>
        <DataTable />
    </PaypalWithdrawProvider>
);


export default BankWithdrawTable;