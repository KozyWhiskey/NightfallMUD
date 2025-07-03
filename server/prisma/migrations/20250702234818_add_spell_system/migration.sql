-- CreateEnum
CREATE TYPE "SpellType" AS ENUM ('CLASS', 'UNIVERSAL');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('SELF', 'TARGET_ENEMY', 'TARGET_ALLY', 'AREA_OF_EFFECT');

-- CreateEnum
CREATE TYPE "DamageType" AS ENUM ('PHYSICAL', 'FIRE', 'FROST', 'GLOOM', 'HOLY', 'SHOCK');

-- CreateEnum
CREATE TYPE "EffectType" AS ENUM ('DIRECT_DAMAGE', 'HEAL', 'APPLY_STATUS_EFFECT', 'BUFF', 'DEBUFF');

-- CreateTable
CREATE TABLE "Spell" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "spellType" "SpellType" NOT NULL,
    "requiredClass" "Class",
    "requiredLevel" INTEGER NOT NULL,
    "manaCost" INTEGER NOT NULL,
    "targetType" "TargetType" NOT NULL,
    "castingTime" INTEGER NOT NULL,
    "cooldown" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Spell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpellEffect" (
    "id" SERIAL NOT NULL,
    "spellId" INTEGER NOT NULL,
    "effectType" "EffectType" NOT NULL,
    "damageType" "DamageType",
    "baseValue" INTEGER NOT NULL,
    "scalingFactor" DOUBLE PRECISION NOT NULL,
    "statusEffectId" INTEGER,
    "duration" INTEGER,
    "order" INTEGER NOT NULL,

    CONSTRAINT "SpellEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusEffect" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "effectType" "EffectType" NOT NULL,
    "damageType" "DamageType",
    "baseValue" INTEGER NOT NULL,
    "scalingFactor" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "maxStacks" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "StatusEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterSpell" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "spellId" INTEGER NOT NULL,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cooldownUntil" TIMESTAMP(3),

    CONSTRAINT "CharacterSpell_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Spell_name_key" ON "Spell"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StatusEffect_name_key" ON "StatusEffect"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterSpell_characterId_spellId_key" ON "CharacterSpell"("characterId", "spellId");

-- AddForeignKey
ALTER TABLE "SpellEffect" ADD CONSTRAINT "SpellEffect_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpellEffect" ADD CONSTRAINT "SpellEffect_statusEffectId_fkey" FOREIGN KEY ("statusEffectId") REFERENCES "StatusEffect"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSpell" ADD CONSTRAINT "CharacterSpell_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterSpell" ADD CONSTRAINT "CharacterSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE CASCADE ON UPDATE CASCADE;
