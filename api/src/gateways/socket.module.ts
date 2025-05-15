import {Module} from '@nestjs/common';
import { UserGateway } from './user.gateway';
import { FolderGateway } from './folder.gateway';
@Module({
    providers: [UserGateway, FolderGateway],
    exports: [FolderGateway],
})

export class SocketModule {};