// server/prisma/seed.ts
import { PrismaClient, EquipSlot, AffixType } from '@prisma/client';
// --- Import from our new central data index ---
import { 
  allRoomTemplates, 
  allMobTemplates,
  baseItemTypes,
  allAffixes
} from '../src/data';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- DELETION ORDER ---
  console.log('Clearing existing data...');
  await prisma.item.deleteMany();
  await prisma.mob.deleteMany();
  await prisma.character.deleteMany();
  await prisma.account.deleteMany();
  await prisma.affix.deleteMany();
  await prisma.baseItem.deleteMany();
  await prisma.room.deleteMany();
  console.log('Existing data cleared.');
  
  // --- CREATION LOGIC ---

  // 1. Create all master data for random generation
  console.log('Seeding master data...');
  await prisma.baseItem.createMany({ data: baseItemTypes });
  await prisma.affix.createMany({ data: allAffixes });
  console.log(`Seeded ${baseItemTypes.length} base item types and ${allAffixes.length} affixes.`);

  // 2. Create all Rooms
  console.log('Seeding Rooms...');
  await prisma.room.createMany({
    data: Object.values(allRoomTemplates).map(r => ({
      id: r.id, name: r.name, description: r.description,
      exits: r.exits, x: r.x, y: r.y, z: r.z,
    }))
  });
  console.log(`${Object.keys(allRoomTemplates).length} rooms seeded.`);

  // 3. Create all Mobs
  console.log('Seeding Mobs...');
  if (allMobTemplates.length > 0) {
    // The lootTable is now correctly formatted as JSON
    await prisma.mob.createMany({ data: allMobTemplates });
    console.log(`${allMobTemplates.length} mobs seeded.`);
  }

  // 4. Create static Item instances in rooms (if any)
  // Note: We are moving away from this model, but the code is here if needed.
  console.log('Seeding initial items in rooms...');
  for (const roomData of Object.values(allRoomTemplates)) {
    if (roomData.items && roomData.items.length > 0) {
      // This part would need a master list of static items to work correctly.
      // For now, we assume loot comes from mobs.
    }
  }

  // 5. Create a test account
  console.log('Creating test account...');
  const hashedPassword = await bcrypt.hash('test', 10);
  await prisma.account.create({
    data: { username: 'test', password: hashedPassword },
  });
  console.log('Test account created with username "test" and password "test".');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
