import { ReactNode } from 'react'

const layout = ({ children }: {
    children: ReactNode
}) => {
    return (
        <main id='chat' className='flex '>

            <section id='chat-content'>

            </section>
        </main>
    )
}

export default layout