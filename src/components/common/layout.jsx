import * as React from "react";
import Header from "../header";
import BackendHealthCheck from "./common/BackendHealthCheck";

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <section>{children}</section>
            <BackendHealthCheck />
        </>
    );
};

export default Layout;
