-- DropForeignKey
ALTER TABLE "Permission" DROP CONSTRAINT "Permission_documentId_fkey";

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
