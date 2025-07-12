import React from 'react';
import LockedNDBBalance from "./LockedNDBBalance";

export default function LockUpTab() {
    return (
        <div className="px-4 py-3">
            <div className="row">
                <LockedNDBBalance totalLocked={4930400}  />
            </div>
        </div>
    )
}