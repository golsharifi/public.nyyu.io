import React from "react";
import { useSelector } from "react-redux";
import AvatarImage from "../admin/shared/AvatarImage";

export default function Avatar({ className, onClick }) {
    // Get user data from Redux store
    const user = useSelector((state) => state.auth?.user);

    // Debug log to check user data structure
    console.log("Avatar Debug - User Data:", user);

    // Handle different possible data structures
    let avatar, selected, hairColor, skinColor;

    if (user?.avatar) {
        // If avatar is nested under user.avatar
        avatar = user.avatar;
        selected = avatar.selected;
        hairColor = avatar.hairColor;
        skinColor = avatar.skinColor;
    } else if (user?.selected) {
        // If avatar data is directly on the user object
        selected = user.selected;
        hairColor = user.hairColor;
        skinColor = user.skinColor;
    } else {
        // Fallback - try to find avatar data anywhere in user object
        selected = user?.avatarSet || user?.avatar?.avatarSet || "[]";
        hairColor = user?.hairColor || user?.avatar?.hairColor;
        skinColor = user?.skinColor || user?.avatar?.skinColor;
    }

    console.log("Avatar Debug - Parsed Data:", {
        selected,
        hairColor,
        skinColor,
        hasUser: !!user,
    });

    // Parse avatar set safely
    let avatarSet;
    try {
        avatarSet = JSON.parse(selected || "[]");
    } catch (e) {
        console.error("Error parsing avatar set:", e);
        avatarSet = [];
    }

    // If no valid avatar data, show fallback
    if (!avatarSet || avatarSet.length === 0) {
        return (
            <div
                className={`avatar-fallback ${className || ""}`}
                onClick={onClick}
                style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                }}
            >
                {user?.email?.[0]?.toUpperCase() ||
                    user?.username?.[0]?.toUpperCase() ||
                    "U"}
            </div>
        );
    }

    return (
        <div className={className} onClick={onClick}>
            <AvatarImage avatar={{ avatarSet, hairColor, skinColor }} />
        </div>
    );
}
