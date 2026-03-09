import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'E-mail', type: 'email' },
                password: { label: 'Senha', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                // Estratégia MVP Auth (.env baseada)
                const ADMIN_EMAIL = process.env.NEXTAUTH_ADMIN_EMAIL
                const ADMIN_PASSWORD = process.env.NEXTAUTH_ADMIN_PASSWORD

                if (credentials.email === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
                    return { id: '1', name: 'Administrador', email: ADMIN_EMAIL }
                }

                return null
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.AUTH_SECRET,
})
