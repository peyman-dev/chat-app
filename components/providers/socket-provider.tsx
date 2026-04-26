"use client"
import { useChatWebSocket } from "@/lib/hooks/socket"
import { ReactNode } from "react"

const SocketProvider = ({ children }: {
    children: ReactNode
}) => {
    const initialSocket = useChatWebSocket()
    return (
        <>
            {children}
        </>
    )
}

export default SocketProvider