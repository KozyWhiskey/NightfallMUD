// NightfallMUD/server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { world } from '../src/game/world'; // We still use our world definition

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Clear existing Rooms and Items to prevent duplicates on re-seeding
  await prisma.item.deleteMany();
  await prisma.room.deleteMany();
  console.log('Deleted existing rooms and items.');

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

    // Create the items associated with this room
    if (roomData.items.length > 0) {
      await prisma.item.createMany({
        data: roomData.items.map(item => ({
          ...item,
          roomId: room.id, // Link each item to the created room
        })),
      });
      console.log(`Created ${roomData.items.length} items in ${room.name}`);
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