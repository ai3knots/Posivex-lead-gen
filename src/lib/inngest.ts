import { Inngest } from "inngest";

/**
 * Inngest client initialization for Posivex Lead Generation background jobs.
 */
export const inngest = new Inngest({
  id: "posivex-lead-gen",
  name: "Posivex Lead Generation Platform",
  eventKey: process.env.INNGEST_EVENT_KEY,
  isDev: process.env.NODE_ENV !== "production",
});
