/**
 * Idempotent development seed. Safe to run repeatedly — it upserts by email
 * rather than truncating, so it will not destroy data you added by hand.
 */
import { db } from './db'

// Must satisfy the signup rules in backend/routes/schemas.ts (min 8 chars),
// so a seeded account is reproducible through the public API.
const SEED_PASSWORD = process.env.SEED_PASSWORD || 'password123'

const seedUsers = [
  { name: 'Test User', email: 'test@example.com', role: 'admin' },
  { name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
]

// Matches backend/services/authService.ts, which uses Bun's built-in hashing.
const passwordHash = await Bun.password.hash(SEED_PASSWORD)

for (const user of seedUsers) {
  await db
    .insertInto('users')
    .values({ ...user, passwordHash })
    .onConflict((oc) =>
      oc.column('email').doUpdateSet((eb) => ({
        name: eb.ref('excluded.name'),
        role: eb.ref('excluded.role'),
      })),
    )
    .execute()
}

console.log(`Seeded ${seedUsers.length} users (password: ${SEED_PASSWORD})`)
for (const user of seedUsers) console.log(`  - ${user.email} [${user.role}]`)

// Bucket-list items for the CRUD demo. Only inserted for users who have none,
// so re-running the seed never duplicates them or resurrects deleted items.
const seedTodos: Record<string, { title: string; done?: boolean }[]> = {
  'test@example.com': [
    { title: 'Ride a camel', done: true },
    { title: 'See the northern lights' },
    { title: 'Learn to bake sourdough' },
    { title: 'Swim with a whale shark' },
  ],
  'jane@example.com': [{ title: 'Visit every national park' }, { title: 'Run a marathon' }],
}

let todoCount = 0
for (const [email, todos] of Object.entries(seedTodos)) {
  const user = await db
    .selectFrom('users')
    .select('id')
    .where('email', '=', email)
    .executeTakeFirst()
  if (!user) continue

  const existing = await db
    .selectFrom('todos')
    .select('id')
    .where('userId', '=', user.id)
    .executeTakeFirst()
  if (existing) continue

  await db
    .insertInto('todos')
    .values(todos.map((t) => ({ userId: user.id, title: t.title, done: t.done ? 1 : 0 })))
    .execute()
  todoCount += todos.length
}

console.log(`Seeded ${todoCount} todos`)
