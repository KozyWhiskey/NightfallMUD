// NightfallMUD/server/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { world } from '../src/game/world'; // Import our hardcoded world data

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  for (const roomData of Object.values(world)) {
    // Create or update the room
    const room = await prisma.room.upsert({
      where: { id: roomData.id },
      update: {}, // We don't need to update anything if it exists
      create: {
        id: roomData.id,
        name: roomData.name,
        description: roomData.description,
        exits: roomData.exits, // Prisma handles the JSON conversion
      },
    });
    console.log(`Created/updated room with id: ${room.id}`);

    // Create the items associated with this room
    for (const itemData of roomData.items) {
      await prisma.item.create({
        data: {
          id: itemData.id,
          name: itemData.name,
          description: itemData.description,
          // Connect the item to the room it's in
          room: {
            connect: { id: room.id },
          },
        },
      });
      console.log(`Created item '${itemData.name}' in room ${room.id}`);
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