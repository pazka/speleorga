import Image from 'next/image'
import {Inter} from '@next/font/google'
import styles from './page.module.css'

const inter = Inter({subsets: ['latin']})

export default function Home() {
    return (
        <main className={styles.main}>
            <div>
                <p>Hello I'm a Next.js app!</p>
            </div>
            <form method={"POST"} action="/api/createAdmin">
                <input type="text" name="name" />
                <input type="text" name="email" />
                <input type="text" name="password" />
                <input type="submit" value="Submit" />
            </form>
        </main>
    )
}
