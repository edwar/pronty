import { PrismaClient } from "@prisma/client"
import { PrismaNeon } from "@prisma/adapter-neon"
import { hash } from "bcryptjs"

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaNeon({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding test database...")

  // Create admin user
  const adminPassword = await hash("Control2486", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "edwaramayadiaz@gmail.com" },
    update: {},
    create: {
      email: "edwaramayadiaz@gmail.com",
      name: "Edwar Admin",
      role: "ADMIN_MASTER",
      emailVerified: true,
    },
  })
  console.log("Admin user created:", adminUser.id)

  // Create admin account for better-auth
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "email",
        accountId: "edwaramayadiaz@gmail.com",
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      accountId: "edwaramayadiaz@gmail.com",
      providerId: "email",
      password: adminPassword,
    },
  })
  console.log("Admin account created")

  // Create commerce user
  const commercePassword = await hash("Control2486", 12)
  const commerceUser = await prisma.user.upsert({
    where: { email: "amayadiazedwarorlando@gmail.com" },
    update: {},
    create: {
      email: "amayadiazedwarorlando@gmail.com",
      name: "Edwar Comercio",
      role: "COMMERCER",
      emailVerified: true,
    },
  })
  console.log("Commerce user created:", commerceUser.id)

  // Create commerce account for better-auth
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "email",
        accountId: "amayadiazedwarorlando@gmail.com",
      },
    },
    update: {},
    create: {
      userId: commerceUser.id,
      accountId: "amayadiazedwarorlando@gmail.com",
      providerId: "email",
      password: commercePassword,
    },
  })
  console.log("Commerce account created")

  // Create commerce for the commerce user
  const commerce = await prisma.commerce.upsert({
    where: { userId: commerceUser.id },
    update: {},
    create: {
      userId: commerceUser.id,
      name: "Restaurante Test",
      slug: "restaurante-test",
      credits: 100,
    },
  })
  console.log("Commerce created:", commerce.id)

  // Create a test branch
  await prisma.branch.create({
    data: {
      commerceId: commerce.id,
      name: "Sede Principal",
      address: "Calle 1 #11-30",
      city: "Bogotá",
      lat: 4.711,
      lng: -74.072,
      orderPrefix: "TEST",
      isDefault: true,
    },
  })
  console.log("Test branch created")

  console.log("Seed completed!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
