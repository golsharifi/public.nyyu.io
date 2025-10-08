import React, { useEffect, useState } from "react";
import Loading from "../common/Loading";
import { useQuery } from "@apollo/client";
import SimpleHeader from "../header/simple-header";
import { GET_USER } from "../../apollo/graphqls/querys/Auth";
import VerificationSwitch from "../verify-identity/verification-switch";
import { GET_SHUFT_REFERENCE } from "../verify-identity/kyc-webservice";
import VerificationProvider from "../verify-identity/verification-context";
import { getShuftiStatusByReference } from "../../utilities/utility-methods";
import { navigate } from "gatsby";
import { ROUTES } from "../../utilities/routes";
import Seo from '../seo';

const VerificationPage = () => {
    // Containers
    const [userEmail, setUserEmail] = useState("");
    const [shuftReference, setShuftReference] = useState(null);
    const [shuftiStatus, setShuftiStatus] = useState(null);
    const [shuftiReferenceLoading, setShuftiReferenceLoading] = useState(true);
    const loadingData = !(userEmail && !shuftiReferenceLoading && shuftiStatus);

    // WebService
    useQuery(GET_USER, {
        onCompleted: (res) => {
            setUserEmail(res.getUser?.email);
        },
        fetchPolicy: "network-only",
        errorpolicy: "ignore",
    });
    useQuery(GET_SHUFT_REFERENCE, {
        onCompleted: (data) => {
            setShuftReference(data.getShuftiReference);
            return setShuftiReferenceLoading(false);
        },
        fetchPolicy: "network-only",
        errorpolicy: "ignore",
    });

    // Methods
    useEffect(() => {
        (async function () {
            if (!shuftiReferenceLoading) {
                const response = await getShuftiStatusByReference(
                    shuftReference?.reference
                );
                setShuftiStatus(response);
                if(response.event === 'verification.accepted') 
                    await navigate(ROUTES.profile);
                return;
            }
        })();
    }, [shuftiReferenceLoading, shuftReference?.reference]);

    if (loadingData) return <Loading />;
    else
        return (
            <>
                <Seo title='Verify ID' />
                <main className="verify-page">
                    <SimpleHeader />
                    <section className="d-flex justify-content-center align-items-start align-items-xl-center">
                        <VerificationProvider>
                            <VerificationSwitch
                                shuftReferencePayload={shuftiStatus}
                                userEmail={userEmail}
                            />
                        </VerificationProvider>
                    </section>
                </main>
            </>
        );
};

export default VerificationPage;
