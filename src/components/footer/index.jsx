import React from "react"
import { footerLinks } from "../../utilities/staticData"
import CookieConsent, { Cookies, getCookieConsentValue } from "react-cookie-consent";
const FooterStatement = '© 2022 NYYU UAB. Authorised by the FCIU, Reg. 305951620.';

export default function Footer() {

    return (
        
        <div className="footer-bar">
            <CookieConsent
                location="bottom"
                buttonText="Yes, I agree"
                cookieName="gatsby-gdpr-google-analytics"
                style={{ background: "#333333" }}
                buttonStyle={{ color: "#23C865", background: "#333333", fontSize: "14px" }}
                declineButtonStyle={{ color: "#FFFFFF", background: "#333333", fontSize: "14px" }}
                expires={365}
            >
                <p style={{ color: "white", fontSize: "14px", textAlign: "left" }}>
                We use cookies to give you the best online experience. Please let us know if you agree to
                all of these cookies.
                <br />
                </p>
            </CookieConsent>
            <div className="row">
                <div className="col-xl-4 d-none d-xl-block text-center">
                    <div className="text-lightgrey py-1">
                        {FooterStatement}
                    </div>
                </div>
                <div className="col-xl-8">
                    <div className="d-none d-md-block">
                        <div className="d-flex flex-column flex-md-row align-items-center justify-content-center text-lightgrey py-1">
                            {footerLinks.map((item, index) => (
                                <a
                                    key={index}
                                    href={item.url}
                                    className="text-lightgrey text-hover-green mx-3 mb-1"
                                    target='_blank'
                                >
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                    <div className="d-block d-md-none">
                        <div className="row mx-2">
                            {footerLinks.map((item, index) => (
                                <div className="col-4" key={index}>
                                    <a
                                        href={item.url}
                                        className="text-lightgrey text-hover-green mx-1 mb-2"
                                        target='_blank'
                                    >
                                        {item.label}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 d-block d-xl-none text-center mt-3 mb-5 px-4 px-sm-5 pb-5 pb-sm-2">
                    <div className="text-lightgrey py-1">
                        {FooterStatement}
                    </div>
                </div>
            </div>
        </div>
    )
}