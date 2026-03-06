import { storage } from "./server/storage";

async function checkUsers() {
    const users = await storage.getAllFeedback(); // Just to test DB connection
    const u = await storage.getUserByEmail("admin_v1@test.com");
    console.log("Admin User:", JSON.stringify(u, null, 2));
    const p = await storage.getUserByEmail("user_v1@test.com");
    console.log("Passenger User:", JSON.stringify(p, null, 2));
}

checkUsers().catch(console.error);
