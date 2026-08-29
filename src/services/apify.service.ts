import { ApifyClient } from "apify-client";
import { ICampaign } from "@/models/Campaign";

// Official Google Maps Scraper Actor ID on Apify
const ACTOR_ID = "scraperlink/google-maps-scraper";

/**
 * Initializes and returns an instance of the Apify Client.
 */
export function getApifyClient(): ApifyClient {
  const token = process.env.APIFY_TOKEN;
  if (!token) {
    throw new Error("Missing APIFY_TOKEN in environment variables");
  }
  return new ApifyClient({ token });
}

/**
 * Prepares the JSON payload for the scraperlink Google Maps Actor.
 */
export function formatScraperInput(
  query: string,
  location: string,
  limit: number,
  country: string = "us"
) {
  const fullQuery = location ? `${query} in ${location}` : query;

  return {
    query: [fullQuery],
    location: location || undefined,
    num: Math.min(limit, 500),
    gl: country.toLowerCase(),
    hl: "en",
    popularTimes: false,
    reviews: false,
    maxImages: 1,
  };
}

/**
 * Starts an Apify Actor run asynchronously.
 */
export async function startScraperRun(
  query: string,
  location: string,
  limit: number,
  country: string = "us"
) {
  const client = getApifyClient();
  const input = formatScraperInput(query, location, limit, country);

  // Start the actor asynchronously
  const run = await client.actor(ACTOR_ID).start(input);
  return {
    runId: run.id,
    datasetId: run.defaultDatasetId,
    status: run.status,
  };
}

/**
 * Checks the current status of an Apify Actor run.
 */
export async function checkRunStatus(runId: string) {
  const client = getApifyClient();
  const run = await client.run(runId).get();
  return run;
}

/**
 * Fetches all scraped items from the specified Apify dataset.
 */
export async function getDatasetItems(datasetId: string) {
  const client = getApifyClient();
  const { items } = await client.dataset(datasetId).listItems({
    limit: 1000,
  });
  return items;
}

/**
 * Formats weekly opening hours object into a readable single string.
 */
export function formatOpeningHours(hours: Record<string, string> | null | undefined): string {
  if (!hours || typeof hours !== "object") return "Not Available";
  const firstDay = Object.keys(hours)[0];
  if (!firstDay) return "Not Available";
  return `${firstDay}: ${hours[firstDay]}`;
}

/**
 * Maps a raw Apify Google Maps item to our standardized Lead data structure.
 */
export function mapItemToLead(item: any, campaign: ICampaign) {
  const title = item.title || item.name || "Unknown Business";
  const category = item.categoryName || item.type || (item.categories && item.categories[0]) || "Business";
  const address = item.address || item.formattedAddress || `${item.city || ""}, ${item.state || ""}`;
  const website = item.website || item.url || "";
  const phone = item.phoneNumber || item.phone || item.phoneUnformatted || "";
  const rating = Number(item.totalScore || item.rating) || 0;
  const reviewsCount = Number(item.reviewsCount || item.ratingCount) || 0;
  const openingHours = formatOpeningHours(item.openingHours);
  const claimed = item.claimThisBusiness ? "Unclaimed" : "Claimed";
  const placeId = item.placeId || item.cid || "";
  const mapsUrl = item.googleMapsUrl || item.url || "";

  return {
    campaignId: campaign._id,
    campaignNumber: campaign.campaignNumber,
    campaignTitle: `#${campaign.campaignNumber} - ${campaign.title}`,
    platform: "Google Maps" as const,
    name: title,
    title: category,
    category: category,
    address: address,
    city: item.city || campaign.location || "Unknown",
    state: item.state || "",
    country: item.countryCode || campaign.country || "US",
    phone: phone || "Not Provided",
    website: website || "Not Provided",
    domain: item.domain || "",
    rating: rating,
    reviewsCount: reviewsCount,
    openingHours: openingHours,
    googleClaimed: claimed,
    googleMapsUrl: mapsUrl,
    placeId: placeId,
    googleAdsStatus: "Not Running Ads" as const,
    aiScore: 0,
    aiReasoning: "",
    outreachHook: "",
    aiProfile: campaign.aiProfile || "Default Profile",
    enriched: false,
    status: "new" as "new" | "qualified" | "contacted" | "disqualified",
  };
}
