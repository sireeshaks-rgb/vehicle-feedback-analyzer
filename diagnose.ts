
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
    f.forEach(x => console.log(`ID: ${x.id} | Org: ${x.organizationId} | Text: ${x.reviewText?.slice(0, 30)}` | 'NONE'));
}

show().catch(console.error);
