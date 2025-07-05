import React from "react";
import { navigate } from "gatsby";
import { useDispatch } from "react-redux";
import { logout } from "../../utilities/auth";
import { ROUTES } from "../../utilities/routes";
import {
    removeCookie,
    NDB_FavAssets,
    NDB_Privilege,
} from "../../utilities/cookies";
import { logOutUser } from "../../store/actions/authAction";

export default function SignOutTab() {
    const dispatch = useDispatch();

    const signOut = () => {
        dispatch(logOutUser());
        logout(() => {
            removeCookie(NDB_FavAssets);
            removeCookie(NDB_Privilege);
            navigate(ROUTES.home);
        });
    };

    return (
        <div className="sign-out">
            <h4 className="pt-3">confirm sign out</h4>
            <div className="h-75 d-flex flex-column align-items-center justify-content-center">
                <p>Are you sure you want to sign out?</p>
                <button className="btn-primary" onClick={signOut}>
                    sign out
                </button>
            </div>
        </div>
    );
}
