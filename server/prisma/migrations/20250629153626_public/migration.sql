-- CreateEnum
CREATE TYPE "Hostility" AS ENUM ('FRIENDLY', 'NEUTRAL', 'HOSTILE');

-- CreateEnum
CREATE TYPE "Class" AS ENUM ('VANGUARD', 'SHADOWBLADE', 'AETHER_WEAVER', 'DAWNKEEPER', 'TECHNOMANCER', 'GLOOM_WARDEN');

-- CreateEnum
CREATE TYPE "EquipSlot" AS ENUM ('NONE', 'HEAD', 'CHEST', 'LEGS', 'FEET', 'HANDS', 'WEAPON_MAIN', 'WEAPON_OFF', 'RING', 'AMULET');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "AffixType" AS ENUM ('PREFIX', 'SUFFIX');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "class" "Class" NOT NULL,
    "accountId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "experience" INTEGER NOT NULL,
    "experienceToNextLevel" INTEGER NOT NULL,
    "unspentStatPoints" INTEGER NOT NULL,
    "gold" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "constitution" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "wisdom" INTEGER NOT NULL,
    "charisma" INTEGER NOT NULL,
    "resolve" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "mana" INTEGER NOT NULL,
    "maxMana" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "currentRoomId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "exits" JSONB NOT NULL,
    "x" INTEGER NOT NULL DEFAULT 0,
    "y" INTEGER NOT NULL DEFAULT 0,
    "z" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BaseItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slot" "EquipSlot" NOT NULL,
    "baseWeight" DOUBLE PRECISION NOT NULL,
    "baseDamage" INTEGER,
    "baseArmor" INTEGER,
    "baseMagicResist" INTEGER,

    CONSTRAINT "BaseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Affix" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AffixType" NOT NULL,
    "requiredLevel" INTEGER NOT NULL,
    "attributes" JSONB NOT NULL,

    CONSTRAINT "Affix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemAffix" (
    "id" SERIAL NOT NULL,
    "itemId" TEXT NOT NULL,
    "affixId" INTEGER NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "ItemAffix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL,
    "baseItemId" INTEGER NOT NULL,
    "equipped" BOOLEAN NOT NULL DEFAULT false,
    "rarity" "Rarity" NOT NULL DEFAULT 'COMMON',
    "roomId" TEXT,
    "characterId" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hostility" "Hostility" NOT NULL DEFAULT 'NEUTRAL',
    "canDropGold" BOOLEAN NOT NULL DEFAULT true,
    "lootTable" JSONB NOT NULL DEFAULT '[]',
    "keywords" TEXT[],
    "level" INTEGER NOT NULL,
    "hp" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "defense" INTEGER NOT NULL,
    "experienceAward" INTEGER NOT NULL,
    "roomId" TEXT NOT NULL,

    CONSTRAINT "Mob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BaseItem_name_key" ON "BaseItem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Affix_name_key" ON "Affix"("name");

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_currentRoomId_fkey" FOREIGN KEY ("currentRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemAffix" ADD CONSTRAINT "ItemAffix_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemAffix" ADD CONSTRAINT "ItemAffix_affixId_fkey" FOREIGN KEY ("affixId") REFERENCES "Affix"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_baseItemId_fkey" FOREIGN KEY ("baseItemId") REFERENCES "BaseItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mob" ADD CONSTRAINT "Mob_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
