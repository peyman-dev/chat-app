"use client"

import { useSession } from "@/lib/stores/session-store"
import { useEffect } from "react"

const ValidateSession = () => {
    const { status } = useSession()


    useEffect(() => {
        if (status !== "loading")
            if (status == "unauthenticated")
                window.location.href = "/auth/login"

    }, [status])

    return null


}

export default ValidateSession