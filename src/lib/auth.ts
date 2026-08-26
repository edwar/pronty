import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: true,
        defaultValue: 'COMMERCER',
        input: false,
      },
      phone: {
        type: 'string',
        required: false,
      },
      commerceId: {
        type: 'string',
        required: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user, _ctx) => {
          const userCount = await prisma.user.count()
          if (userCount === 1) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: 'ADMIN_MASTER' },
            })
          }
        },
      },
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
})

