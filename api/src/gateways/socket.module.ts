import {Module} from '@nestjs/common';
import { UserGateway } from './user.gateway';
import { FolderGateway } from './folder.gateway';
@Module({
    providers: [UserGateway, FolderGateway]
})

export class SocketModule {};