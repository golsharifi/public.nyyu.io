// src/components/debug/DebugWrapper.jsx
import React, { useEffect, useRef } from "react";

const DebugWrapper = ({ children, componentName }) => {
    const renderCount = useRef(0);
    const lastProps = useRef();

    useEffect(() => {
        renderCount.current += 1;
        console.log(`🔍 ${componentName} render #${renderCount.current}`);

        if (renderCount.current > 50) {
            console.error(
                `🚨 ${componentName} has rendered ${renderCount.current} times - possible infinite loop!`,
            );
        }
    });

    // Log prop changes
    useEffect(() => {
        if (lastProps.current) {
            const propsChanged =
                JSON.stringify(children?.props) !==
                JSON.stringify(lastProps.current);
            if (propsChanged) {
                console.log(`🔄 ${componentName} props changed:`, {
                    old: lastProps.current,
                    new: children?.props,
                });
            }
        }
        lastProps.current = children?.props;
    });

    return <div data-debug-component={componentName}>{children}</div>;
};

export default DebugWrapper;
