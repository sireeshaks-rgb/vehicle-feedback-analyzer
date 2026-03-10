import { db } from "./server/db";
import { users, feedback, organizations } from "./shared/schema";

async function seed() {
  let orgs = await db.select().from(organizations);
  let orgId;
  if (orgs.length === 0) {
    const res = await db.insert(organizations).values({ name: "Default Org" }).returning();
    orgId = res[0].id;
  } else {
    orgId = orgs[0].id;
  }

  const existing = await db.select().from(feedback);
  if (existing.length === 0) {
    await db.insert(feedback).values([
      {
        organizationId: orgId,
        transportMode: "Bus",
        reviewText: "The bus was late by 20 minutes and very crowded.",
        rating: 2,
        location: "Downtown Station",
        travelDate: "2024-10-25"
      },
      {
        organizationId: orgId,
        transportMode: "Bus",
        reviewText: "Great service, driver was very polite.",
        rating: 5,
        location: "North Suburb",
        travelDate: "2024-10-26"
      },
      {
        organizationId: orgId,
        transportMode: "Train",
        reviewText: "Air conditioning was broken during the summer heat.",
        rating: 1,
        location: "East Line",
        travelDate: "2024-08-15"
      },
      {
        organizationId: orgId,
        transportMode: "Airplane",
        reviewText: "Smooth ride, arrived exactly on time.",
        rating: 5,
        location: "Airport Express",
        travelDate: "2024-10-28"
      }
    ]);
    console.log("Database seeded with sample feedback.");
  } else {
    console.log("Database already has feedback data.");
  }
}

seed().catch(console.error).finally(() => process.exit(0));
