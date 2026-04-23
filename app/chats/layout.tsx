import Sidebar from '@/components/templates/chats/sidebar'
import { ReactNode } from 'react'

const layout = ({ children }: {
    children: ReactNode
}) => {
    return (
        <main id='chat' className='flex h-dvh w-dvw'>
            <Sidebar />
            <section id='chat-content' className='bg-[url("/images/chat-light-bg.png")] dark:bg-[url("/images/chat-dark-bg.png")] bg-cover h-dvh w-full bg-center'>
                {children}
            </section>
        </main>
    )
}

export default layout