import Sidebar from '@/components/templates/chats/sidebar'
import ChatComposer from '@/components/templates/chats/chat-composer'
import { ReactNode } from 'react'

const layout = ({ children }: {
    children: ReactNode
}) => {
    return (
        <main id='chat' className='flex h-dvh w-dvw'>
            <Sidebar />
            <section id='chat-content' className='relative h-dvh w-full bg-[url("/images/chat-light-bg.png")] bg-cover bg-center dark:bg-[url("/images/chat-dark-bg.png")]'>
                <div className='h-full pt-[calc(env(safe-area-inset-top)+3.25rem)] lg:pt-0'>
                    {children}
                </div>

                <div className='pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:px-5 sm:pb-5 lg:px-8 lg:pb-7'>
                    <ChatComposer className='pointer-events-auto' />
                </div>
            </section>
        </main>
    )
}

export default layout
