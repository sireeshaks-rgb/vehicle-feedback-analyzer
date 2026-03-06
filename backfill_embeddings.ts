import { db } from "./server/db";
import { feedback } from "./shared/schema";
import { generateEmbedding } from "./server/rag";
import { eq, isNull } from "drizzle-orm";

async function backfillEmbeddings() {
    console.log("Starting embedding backfill...");
    try {
        // Find all feedback where embedding is currently null
        const missingEmbeddings = await db.select().from(feedback).where(isNull(feedback.embedding));
        console.log(`Found ${missingEmbeddings.length} records needing embeddings.`);

        for (let i = 0; i < missingEmbeddings.length; i++) {
            const record = missingEmbeddings[i];
            console.log(`Processing ${i + 1}/${missingEmbeddings.length}: ${record.id}`);
            try {
                const embedding = await generateEmbedding(record.reviewText);
                await db.update(feedback)
                    .set({ embedding })
                    .where(eq(feedback.id, record.id));
            } catch (err) {
                console.error(`Failed to generate embedding for ${record.id}:`, err);
            }
        }
        console.log("Backfill complete!");
    } catch (error) {
        console.error("Backfill failed:", error);
    } finally {
        process.exit(0);
    }
}

backfillEmbeddings();
