"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const qClient = new QueryClient()

const QueryProvider = ({ children }: {
    children: ReactNode
}) => {

    return (
        <QueryClientProvider client={qClient}>
            {children}
        </QueryClientProvider>
    )
}

export default QueryProvider