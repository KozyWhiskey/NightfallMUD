// server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { world } from '../src/game/world';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // --- DELETION IN CORRECT ORDER ---
  console.log('Clearing existing data...');
  await prisma.item.deleteMany();
  await prisma.mob.deleteMany();
  await prisma.character.deleteMany();
  await prisma.account.deleteMany();
  await prisma.room.deleteMany();
  console.log('Existing data cleared.');
  
  // --- CREATION ---
  console.log('Seeding rooms, items, and mobs...');
  for (const roomData of Object.values(world)) {
    // Create the room
    const room = await prisma.room.create({
      data: {
        id: roomData.id,
        name: roomData.name,
        description: roomData.description,
        exits: roomData.exits,
      },
    });
    console.log(`Created room: ${room.name}`);

    // Create items in the room
    if (roomData.items.length > 0) {
      await prisma.item.createMany({
        data: roomData.items.map(item => ({
          ...item,
          roomId: room.id,
        })),
      });
      console.log(`Created ${roomData.items.length} item(s) in ${room.name}`);
    }

    // Create mobs in the room
    if (roomData.mobTemplates.length > 0) {
      await prisma.mob.createMany({
        data: roomData.mobTemplates.map(mobTemplate => ({
          ...mobTemplate, // This will correctly include the new `hostility` field
          roomId: room.id,
        })),
      });
      console.log(`Spawned ${roomData.mobTemplates.length} mob(s) in ${room.name}`);
    }
  }
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
