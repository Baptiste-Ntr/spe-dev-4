import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Créer un dossier racine s'il n'existe pas déjà
    const rootFolderId = process.env.ROOT_FOLDER_UUID;
    if (!rootFolderId) {
        throw new Error('ROOT_FOLDER_UUID is not defined in the environment variables');
    }

    const existingRootFolder = await prisma.folder.findUnique({
        where: { id: rootFolderId }
    });

    if (!existingRootFolder) {
        const rootFolder = await prisma.folder.create({
            data: {
                id: rootFolderId,
                name: 'Home',
                createdAt: new Date(),
            }
        });
        console.log(`✅ Dossier racine créé avec ID: ${rootFolder.id}`);
    } else {
        console.log(`ℹ️ Dossier racine existe déjà avec ID: ${existingRootFolder.id}`);
    }

}

main()
    .catch((e) => {
        console.error('❌ Erreur pendant le seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });