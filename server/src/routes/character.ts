// server/src/routes/character.ts
import { Router, Response } from 'express';
import { PrismaClient, Class } from '@prisma/client';
import { webService, AuthenticatedRequest } from '../services/web.service';
import { startingClassData } from '../game/class.data';

const prisma = new PrismaClient();
const router = Router();

// This middleware protects all routes defined in this file.
router.use(webService.authMiddleware);

// GET /api/characters - Fetch all characters for the logged-in account
const handleGetCharacters = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized.' });
  }
  try {
    const characters = await prisma.character.findMany({
      where: { accountId: req.user.accountId },
    });
    res.json(characters);
  } catch (error) {
    console.error("Error fetching characters:", error);
    res.status(500).json({ message: 'Failed to fetch characters.' });
  }
};

// POST /api/characters - Create a new character for the logged-in account
const handleCreateCharacter = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized.' });
  }

  const { name, characterClass } = req.body;
  if (!name || !characterClass) {
    return res.status(400).json({ message: 'Character name and class are required.' });
  }

  if (!Object.values(Class).includes(characterClass)) {
    return res.status(400).json({ message: 'Invalid character class selected.' });
  }

  const classData = startingClassData[characterClass as Class];
  if (!classData) {
    return res.status(500).json({ message: 'Internal error: Class data not found.' });
  }

  try {
    const newCharacter = await prisma.character.create({
      data: {
        name: name,
        class: characterClass,
        accountId: req.user.accountId,
        currentRoomId: 'town-square',
        ...classData.stats,
      },
    });
    res.status(201).json(newCharacter);
  } catch (error: any) {
    console.error("Error creating character:", error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A character with that name already exists.' });
    }
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

// --- Attaching Handlers to the Router ---
router.get('/', handleGetCharacters);
router.post('/', handleCreateCharacter);

export default router;
