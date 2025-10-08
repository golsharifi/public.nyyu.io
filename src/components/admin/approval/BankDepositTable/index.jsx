import React from 'react';
import BankDepositProvider from './useBankDeposit';
import DataTable from './DataTable';

const BankDepositTable = () => (
    <BankDepositProvider>
        <DataTable />
    </BankDepositProvider>
);


export default BankDepositTable;