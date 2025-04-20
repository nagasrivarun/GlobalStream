import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Create subscription plans
  const plans = [
    {
      name: "Basic",
      description: "Watch on one device in SD quality",
      price: 7.99,
      features: ["Access to all content", "SD quality", "Watch on 1 device", "Cancel anytime"],
      isPopular: false,
    },
    {
      name: "Standard",
      description: "Watch on two devices in HD quality",
      price: 12.99,
      features: ["Access to all content", "HD quality", "Watch on 2 devices", "Downloads available", "Cancel anytime"],
      isPopular: true,
    },
    {
      name: "Premium",
      description: "Watch on four devices in Ultra HD",
      price: 17.99,
      features: [
        "Access to all content",
        "4K Ultra HD quality",
        "Watch on 4 devices",
        "Downloads available",
        "Offline viewing",
        "Cancel anytime",
      ],
      isPopular: false,
    },
  ]

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    })
  }

  // Create genres
  const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "History",
    "Horror",
    "Music",
    "Mystery",
    "Romance",
    "Science Fiction",
    "Thriller",
    "War",
    "Western",
  ]

  for (const name of genres) {
    await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    })
  }

  // Create languages
  const languages = [
    { name: "English", code: "en" },
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
    { name: "German", code: "de" },
    { name: "Italian", code: "it" },
    { name: "Japanese", code: "ja" },
    { name: "Korean", code: "ko" },
    { name: "Chinese", code: "zh" },
    { name: "Hindi", code: "hi" },
    { name: "Arabic", code: "ar" },
  ]

  for (const language of languages) {
    await prisma.language.upsert({
      where: { code: language.code },
      update: language,
      create: language,
    })
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("Admin123!", 12)
  await prisma.user.upsert({
    where: { email: "admin@globalstream.com" },
    update: {},
    create: {
      email: "admin@globalstream.com",
      name: "Admin User",
      hashedPassword,
      role: "ADMIN",
    },
  })

  // Add sample content (just a few examples)
  const sampleMovies = [
    {
      title: "Interstellar",
      description:
        "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      type: "MOVIE",
      releaseYear: 2014,
      duration: 169,
      maturityRating: "PG-13",
      featured: true,
      trending: true,
      popular: true,
    },
    {
      title: "The Shawshank Redemption",
      description:
        "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      type: "MOVIE",
      releaseYear: 1994,
      duration: 142,
      maturityRating: "R",
      featured: false,
      trending: false,
      popular: true,
    },
    {
      title: "Inception",
      description:
        "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      type: "MOVIE",
      releaseYear: 2010,
      duration: 148,
      maturityRating: "PG-13",
      featured: false,
      trending: true,
      popular: true,
    },
  ]

  for (const movie of sampleMovies) {
    await prisma.content.create({
      data: movie,
    })
  }

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
