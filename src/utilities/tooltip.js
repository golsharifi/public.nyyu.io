import React from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

// Export with old name for backward compatibility
export { Tooltip as ReactTooltip };
export default Tooltip;

// Wrapper component for easier migration from v4 to v5
export const ReactTooltipLegacy = ({
    id,
    place = "top",
    effect = "solid",
    type = "dark",
    ...props
}) => {
    return (
        <Tooltip
            {...props}
            id={id}
            place={place}
            variant={
                effect === "solid"
                    ? type === "light"
                        ? "light"
                        : "dark"
                    : "light"
            }
        />
    );
};

// Helper function to generate tooltip props for the new version
export const getTooltipProps = (content, options = {}) => {
    const {
        place = "top",
        variant = "dark",
        delay = 0,
        ...otherOptions
    } = options;

    return {
        "data-tooltip-content": content,
        "data-tooltip-place": place,
        "data-tooltip-variant": variant,
        "data-tooltip-delay-show": delay,
        ...otherOptions,
    };
};

// Modern tooltip component with better API
export const ModernTooltip = ({
    children,
    content,
    place = "top",
    variant = "dark",
    className = "",
    ...props
}) => {
    const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <>
            <span data-tooltip-id={tooltipId} className={className}>
                {children}
            </span>
            <Tooltip
                id={tooltipId}
                place={place}
                variant={variant}
                content={content}
                {...props}
            />
        </>
    );
};
