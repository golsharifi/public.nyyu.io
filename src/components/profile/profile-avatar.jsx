import React, { useState } from "react"
import { useQuery } from "@apollo/client"
import { GET_AVATAR_COMPONENTS } from "../../apollo/graphqls/querys/AvatarComponent"
import CustomSpinner from "../common/custom-spinner"
import { EmptyAvatar } from "../../utilities/imgImport"
import { useSelector } from "react-redux"

export default function ProfileAvatar() {
    // Webservice
    const { data: avatarComponents } = useQuery(GET_AVATAR_COMPONENTS, {
        fetchPolicy: "network-only",
        onCompleted: () => setAvatarComponentsData(avatarComponents.getAvatarComponents),
    })
    // Containers
    const [avatarComponentsData, setAvatarComponentsData] = useState(null)
    
    const userData = useSelector(state => state.auth?.user);
    
    const loadingSection = !(userData && avatarComponentsData)

    if (loadingSection) return <CustomSpinner />
    else {
        const selectedOnes = JSON.parse(userData.avatar.selected)
        return (
            <div className="position-relative">
                <img src={EmptyAvatar} alt="Avatar" className="position-absolute top-0 start-0" />
                {selectedOnes.map((item, index) => {
                    const currentComponent = avatarComponentsData?.filter(
                        (component) =>
                            component.groupId === item.groupId && component.compId === item.compId
                    )[0]
                    return (
                        <div
                            key={index}
                            className="position-absolute"
                            style={{
                                width: `${currentComponent.width}px`,
                                left: `${currentComponent.left}px`,
                                top: `${currentComponent.top}px`,
                            }}
                            dangerouslySetInnerHTML={{ __html: currentComponent.svg }}
                        />
                    )
                })}
            </div>
        )
    }
}
