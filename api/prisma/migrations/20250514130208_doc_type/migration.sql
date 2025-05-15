-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('TEXT', 'PDF', 'IMAGE');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "type" "DocumentType" NOT NULL DEFAULT 'TEXT';
