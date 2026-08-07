-- DropIndex
DROP INDEX "Experience_userId_idx";

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "interests" JSONB,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "whatsappUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
