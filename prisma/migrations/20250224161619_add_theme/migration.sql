-- CreateEnum
CREATE TYPE "Theme" AS ENUM ('dark', 'light');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "theme" "Theme" NOT NULL DEFAULT 'dark';
