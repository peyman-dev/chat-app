import Sidebar from '@/components/templates/chats/sidebar'
import ChatComposer from '@/components/templates/chats/chat-composer'
import { ReactNode } from 'react'

const layout = ({ children }: {
    children: ReactNode
}) => {
    return (
        <main id='chat' className='flex h-dvh w-dvw'>
            <Sidebar />
            <section id='chat-content' className='relative bg-[url("/images/chat-light-bg.png")] dark:bg-[url("/images/chat-dark-bg.png")] bg-cover h-dvh w-full bg-center'>
                <div className='h-full'>
                    {children}
                </div>

                <div className='pointer-events-none absolute inset-x-0 bottom-0 px-8 pb-7'>
                    <ChatComposer className='pointer-events-auto' />
                </div>
            </section>
        </main>
    )
}

export default layout
