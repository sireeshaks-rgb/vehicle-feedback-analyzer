
import { db } from './server/db';
import { users, feedback, organizations } from './shared/schema';

async function show() {
    const u = await db.select().from(users);
    const f = await db.select().from(feedback);
    const o = await db.select().from(organizations);

    console.log('=== ORGS ===');
    o.forEach(x => console.log(`${x.id} : ${x.name}`));

    console.log('=== USERS ===');
    u.forEach(x => console.log(`${x.email} | ${x.role} | Org: ${x.organizationId}`));

    console.log('=== FEEDBACK ===');
    if (f.length === 0) {
        console.log('NO FEEDBACK FOUND');
    } else {
        f.forEach(x => console.log(`ID: ${x.id} | Org: ${x.organizationId} | Mode: ${x.transportMode} | Rating: ${x.rating} | Text: ${x.reviewText?.slice(0, 50)}`));
    }
}

show().catch(console.error);
