import { connectToDatabase } from "../lib/db";
import { Campaign } from "../models/Campaign";
import { Lead } from "../models/Lead";
import { User } from "../models/User";
import { Setting, DEFAULT_PROMPT } from "../models/Setting";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  await connectToDatabase();
  console.log("Connected to MongoDB for seeding...");

  // 1. Seed Admin User
  const existingUser = await User.findOne({ email: "admin@posivex.com" });
  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("Posivex@2026", 10);
    await User.create({
      name: "Admin User",
      email: "admin@posivex.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("Admin user created: admin@posivex.com / Posivex@2026");
  }

  // 2. Seed Default Settings
  const existingSettings = await Setting.findOne({ key: "app_config" });
  if (!existingSettings) {
    await Setting.create({
      key: "app_config",
      systemPrompt: DEFAULT_PROMPT,
      scoringThreshold: 50,
      aiModel: "gemini-1.5-flash",
      adminEmail: "admin@posivex.com",
    });
    console.log("Default app settings created.");
  }

  // 3. Seed Sample Campaigns if none exist
  const count = await Campaign.countDocuments();
  if (count === 0) {
    console.log("Seeding sample campaigns and qualified leads...");

    const camp1 = await Campaign.create({
      campaignNumber: 20,
      title: "Luxury Car Showroom",
      query: "Luxury car showrooms",
      location: "New York",
      country: "us",
      limit: 50,
      scrapedCount: 49,
      aiEvaluatedCount: 49,
      qualifiedCount: 49,
      pendingCount: 0,
      estimatedCost: 0.04,
      status: "COMPLETED",
      aiProfile: "Default Profile",
      platform: "Google Maps",
    });

    const camp2 = await Campaign.create({
      campaignNumber: 19,
      title: "Specialty Coffee Shops in USA",
      query: "specialty coffee shops",
      location: "Austin, TX",
      country: "us",
      limit: 100,
      scrapedCount: 88,
      aiEvaluatedCount: 88,
      qualifiedCount: 75,
      pendingCount: 0,
      estimatedCost: 0.05,
      status: "COMPLETED",
      aiProfile: "Default Profile",
      platform: "Google Maps",
    });

    const camp3 = await Campaign.create({
      campaignNumber: 18,
      title: "HVAC Repair & Contractors",
      query: "hvac repair",
      location: "Miami, FL",
      country: "us",
      limit: 200,
      scrapedCount: 150,
      aiEvaluatedCount: 150,
      qualifiedCount: 97,
      pendingCount: 0,
      estimatedCost: 0.08,
      status: "COMPLETED",
      aiProfile: "Default Profile",
      platform: "Google Maps",
    });

    // Seed Leads for Campaign 1 & 2
    await Lead.create([
      {
        campaignId: camp1._id,
        campaignNumber: 20,
        campaignTitle: "#20 - Luxury Car Showroom",
        platform: "Google Maps",
        name: "Manhattan Motorcars",
        title: "Luxury Car Dealer",
        category: "Car Dealer",
        address: "711 11th Ave, New York, NY 10019, United States",
        city: "New York",
        state: "NY",
        country: "US",
        phone: "(212) 594-6200",
        website: "https://www.manhattanmotorcars.com",
        domain: "manhattanmotorcars.com",
        rating: 4.8,
        reviewsCount: 840,
        openingHours: "Monday-Saturday: 9:00 AM - 6:00 PM",
        googleClaimed: "Claimed",
        googleMapsUrl: "https://maps.google.com/?cid=12345",
        googleAdsStatus: "Not Running Ads",
        aiScore: 92,
        aiReasoning: "High-volume luxury dealership with top customer feedback but no active search ads or dedicated retargeting funnels in the Manhattan district.",
        outreachHook: "I noticed Manhattan Motorcars has incredible customer loyalty on 11th Ave, but your competitors are actively bidding on high-intent luxury automotive keywords. We can help you capture that VIP clientele.",
        aiProfile: "Default Profile",
        enriched: true,
        status: "qualified",
      },
      {
        campaignId: camp1._id,
        campaignNumber: 20,
        campaignTitle: "#20 - Luxury Car Showroom",
        platform: "Google Maps",
        name: "Gplymont Animal Hospital",
        title: "Veterinarian",
        category: "Veterinarian",
        address: "4618 Indian Head Hwy, Indian Head, MD 20640, United States",
        city: "Indian Head",
        state: "MD",
        country: "US",
        phone: "(301) 743-5411",
        website: "Not Provided",
        domain: "",
        rating: 4.9,
        reviewsCount: 120,
        openingHours: "Saturday: 8:00 AM - 2:00 PM",
        googleClaimed: "Unclaimed",
        googleMapsUrl: "https://maps.google.com/?cid=67890",
        googleAdsStatus: "Not Running Ads",
        aiScore: 90,
        aiReasoning: "Gplymont Animal Hospital shows clear signs of digital neglect, specifically lacking a website and active Google review management, which directly impacts their local visibility. They are an ideal candidate for Posivex digital growth.",
        outreachHook: "I noticed that Gplymont Animal Hospital is missing a dedicated website and active online presence, which makes it harder for local pet owners to find your care services. At Posivex, we specialize in high-converting web & local client funnels.",
        aiProfile: "Default Profile",
        enriched: true,
        status: "qualified",
      },
      {
        campaignId: camp2._id,
        campaignNumber: 19,
        campaignTitle: "#19 - Specialty Coffee Shops in USA",
        platform: "Google Maps",
        name: "Houndstooth Coffee",
        title: "Specialty Coffee Shop",
        category: "Coffee Shop",
        address: "401 Congress Ave, Austin, TX 78701, United States",
        city: "Austin",
        state: "TX",
        country: "US",
        phone: "(512) 394-6051",
        website: "https://houndstoothcoffee.com",
        domain: "houndstoothcoffee.com",
        rating: 4.7,
        reviewsCount: 650,
        openingHours: "Daily: 6:30 AM - 7:00 PM",
        googleClaimed: "Claimed",
        googleMapsUrl: "https://maps.google.com/?cid=112233",
        googleAdsStatus: "Not Running Ads",
        aiScore: 88,
        aiReasoning: "Prime downtown Austin location with huge daily foot traffic. Digital ordering integration and loyalty retargeting can significantly increase average customer lifetime value.",
        outreachHook: "I love the coffee experience at Houndstooth on Congress. We noticed an untapped avenue to scale your subscription sales and corporate catering orders with targeted B2B funnels.",
        aiProfile: "Default Profile",
        enriched: true,
        status: "qualified",
      },
      {
        campaignId: camp2._id,
        campaignNumber: 19,
        campaignTitle: "#19 - Specialty Coffee Shops in USA",
        platform: "Google Maps",
        name: "Fleet Coffee Co.",
        title: "Artisanal Espresso Bar",
        category: "Coffee Shop",
        address: "2427 Webberville Rd, Austin, TX 78702, United States",
        city: "Austin",
        state: "TX",
        country: "US",
        phone: "(512) 212-7174",
        website: "https://fleetcoffee.com",
        domain: "fleetcoffee.com",
        rating: 4.9,
        reviewsCount: 380,
        openingHours: "Daily: 7:00 AM - 4:00 PM",
        googleClaimed: "Claimed",
        googleMapsUrl: "https://maps.google.com/?cid=445566",
        googleAdsStatus: "Not Running Ads",
        aiScore: 95,
        aiReasoning: "Exceptional 4.9-star rating with cult local following, but under-leveraged digital footprint and zero paid advertising to capture visitors in East Austin.",
        outreachHook: "Fleet Coffee has one of the highest customer satisfaction scores in East Austin. At Posivex, we can amplify your reach to tourists and local remote workers through geofenced digital campaigns.",
        aiProfile: "Default Profile",
        enriched: true,
        status: "qualified",
      }
    ]);

    console.log("Seeding completed successfully!");
  }
}

// Auto run if executed directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
}
