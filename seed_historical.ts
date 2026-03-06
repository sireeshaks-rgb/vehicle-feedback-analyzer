import { db } from './server/db';
import { feedback, organizations } from './shared/schema';

async function seed() {
    const o = await db.select().from(organizations);
    if (o.length === 0) {
        console.error("No organizations found to seed data for.");
        return;
    }
    const orgId = o[0].id;

    const modes = ["Bus", "Train", "Airplane"];
    const issues = ["Overcrowding", "Service Delay", "Staff Behavior", "Cleaning", "Pricing", "Safety"];
    const texts = [
        "The trip was okay, but a bit slow.",
        "Very crowded today, no place to sit.",
        "Excellent service, on time and clean.",
        "Dirty seats, please clean them.",
        "Delay of 20 minutes without notice. Frustrating.",
        "Smooth ride, friendly staff.",
        "Too expensive for the quality of service."
    ];

    console.log("Seeding historical data...");
    const records = [];
    const now = new Date();

    for (let i = 0; i < 60; i++) {
        const daysAgo = Math.floor(Math.random() * 14);
        // Create random hour/minute to avoid exact same times
        const hours = Math.floor(Math.random() * 24);
        const mins = Math.floor(Math.random() * 60);
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        date.setHours(hours, mins);

        const mode = modes[Math.floor(Math.random() * modes.length)] as any;
        const rating = Math.floor(Math.random() * 5) + 1;
        const travelDate = new Date(date).toISOString().split('T')[0];

        records.push({
            organizationId: orgId,
            transportMode: mode,
            reviewText: texts[Math.floor(Math.random() * texts.length)],
            rating: rating,
            sentimentScore: rating / 5.0,
            issueCategory: issues[Math.floor(Math.random() * issues.length)],
            createdAt: date,
            travelDate: travelDate,
            passengerType: "REGULAR" as const,
            tripTimeCategory: "PEAK" as const,
            dayType: "WEEKDAY" as const,
            location: "station"
        });
    }

    await db.insert(feedback).values(records);
    console.log("Successfully inserted 60 historical feedback records.");
}

seed().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
