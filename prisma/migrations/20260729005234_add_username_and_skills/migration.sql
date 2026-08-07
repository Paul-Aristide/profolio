/*
  Migration modifiée manuellement pour gérer les lignes existantes.
*/

-- Étape 1 : ajouter la colonne username comme NULLABLE d'abord
ALTER TABLE "User" ADD COLUMN     "username" TEXT;

-- Étape 2 : remplir une valeur temporaire unique pour les lignes existantes,
-- basée sur la partie locale de l'email (avant le @), suffixée par un fragment de l'id pour garantir l'unicité
UPDATE "User" SET "username" = LOWER(SPLIT_PART("email", '@', 1)) || '-' || SUBSTRING("id", 1, 6)
WHERE "username" IS NULL;

-- Étape 3 : rendre la colonne obligatoire maintenant qu'elle est remplie
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;