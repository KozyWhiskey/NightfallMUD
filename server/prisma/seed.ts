// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
// --- NEW: Import from our new central data index ---
import { allItemTemplates, allRoomTemplates } from '../src/data';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- DELETION ORDER IS UNCHANGED ---
  console.log('Clearing existing data...');
  await prisma.item.deleteMany();
  await prisma.itemTemplate.deleteMany();
  await prisma.mob.deleteMany();
  await prisma.character.deleteMany();
  await prisma.account.deleteMany();
  await prisma.room.deleteMany();
  console.log('Existing data cleared.');
  
  // --- CREATION LOGIC IS NOW CLEANER ---

  // 1. Create all Item Templates
  console.log('Seeding Item Templates...');
  await prisma.itemTemplate.createMany({ data: allItemTemplates });
  console.log(`${allItemTemplates.length} item templates seeded.`);

  // 2. Create all Rooms and their associated Mobs and Items
  console.log('Seeding Rooms, Items, and Mobs...');
  for (const roomData of Object.values(allRoomTemplates)) {
    await prisma.room.create({
      data: {
        id: roomData.id,
        name: roomData.name,
        description: roomData.description,
        exits: roomData.exits,
        x: roomData.x,
        y: roomData.y,
        z: roomData.z,
      },
    });
    console.log(`Created room: ${roomData.name}`);

    if (roomData.mobTemplates.length > 0) {
      await prisma.mob.createMany({
        data: roomData.mobTemplates.map(mobTemplate => ({
          ...mobTemplate,
          roomId: roomData.id,
        })),
      });
      console.log(`Spawned ${roomData.mobTemplates.length} mob(s) in ${roomData.name}`);
    }

    if (roomData.items.length > 0) {
      const itemsToCreate = roomData.items.map(itemTemplateId => ({
        itemTemplateId: itemTemplateId,
        roomId: roomData.id,
      }));
      await prisma.item.createMany({ data: itemsToCreate });
      console.log(`Placed ${itemsToCreate.length} item(s) in ${roomData.name}`);
    }
  }

  // 3. Create a test account
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
