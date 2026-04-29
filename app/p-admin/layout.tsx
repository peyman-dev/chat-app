import React, { ReactNode } from 'react'

const layout = ({ children }: {
    children: ReactNode
}) => {
    return (
        <main id='admin-panel' className='min-w-dvw py-[86px] min-h-dvh bg-[#F3F5F7]'>
            {children}
        </main>
    )
}

export default layout