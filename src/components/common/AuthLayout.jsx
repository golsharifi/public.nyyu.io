import React from "react";
import Header from "../header";
import Footer from "../footer";
import { Trees } from "../../utilities/imgImport";

const AuthLayout = ({ children }) => {
    return (
        <main className="signup-page">
            <Header />
            <section className="position-relative">
                <div className="d-flex container position-relative h-100 align-items-center">
                    <div className="signup">{children}</div>
                </div>
                <img
                    src={Trees}
                    alt="trees"
                    className="trees-img w-100 z-n999"
                />
            </section>
            <Footer />
        </main>
    );
};

export default AuthLayout;
