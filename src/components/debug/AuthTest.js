import React from "react";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { getInMemoryAuthToken } from "../../utilities/auth";

const GET_USER_TEST = gql`
    query getUserTest {
        getUser {
            id
            email
            name
        }
    }
`;

const GET_AVATARS_TEST = gql`
    query getAvatarsTest {
        getAvatars {
            id
            fname
            surname
        }
    }
`;

const AuthTest = () => {
    const token = getInMemoryAuthToken();

    const {
        data: userData,
        loading: userLoading,
        error: userError,
    } = useQuery(GET_USER_TEST, {
        skip: !token,
        errorPolicy: "all",
    });

    const {
        data: avatarData,
        loading: avatarLoading,
        error: avatarError,
    } = useQuery(GET_AVATARS_TEST, {
        skip: !token,
        errorPolicy: "all",
    });

    return (
        <div style={{ padding: "20px", fontFamily: "monospace" }}>
            <h2>🔍 Authentication Test</h2>

            <div style={{ marginBottom: "20px" }}>
                <h3>Token Status</h3>
                <p>Token Present: {token ? "✅ Yes" : "❌ No"}</p>
                {token && <p>Token Preview: {token.substring(0, 30)}...</p>}
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3>User Query Test</h3>
                {userLoading && <p>🔄 Loading user...</p>}
                {userError && (
                    <div style={{ color: "red" }}>
                        <p>❌ User Error: {userError.message}</p>
                        <pre>{JSON.stringify(userError, null, 2)}</pre>
                    </div>
                )}
                {userData && (
                    <div style={{ color: "green" }}>
                        <p>✅ User loaded successfully!</p>
                        <pre>{JSON.stringify(userData, null, 2)}</pre>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: "20px" }}>
                <h3>Avatar Query Test</h3>
                {avatarLoading && <p>🔄 Loading avatars...</p>}
                {avatarError && (
                    <div style={{ color: "red" }}>
                        <p>❌ Avatar Error: {avatarError.message}</p>
                        <pre>{JSON.stringify(avatarError, null, 2)}</pre>
                    </div>
                )}
                {avatarData && (
                    <div style={{ color: "green" }}>
                        <p>✅ Avatars loaded successfully!</p>
                        <pre>{JSON.stringify(avatarData, null, 2)}</pre>
                    </div>
                )}
            </div>

            <div>
                <button onClick={() => window.debugAuthState?.()}>
                    🔍 Debug Auth State
                </button>
            </div>
        </div>
    );
};

export default AuthTest;
