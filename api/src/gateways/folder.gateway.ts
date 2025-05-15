import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class FolderGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(FolderGateway.name);

  static server: Server;

  afterInit(server: Server) {
    FolderGateway.server = server;
    console.log('afterInit called');
    this.logger.log('✅ FolderGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`📁 Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`📁  Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('folderCreated')
  handleFolderCreated(client: Socket, payload: any) {
    this.logger.log(`📁 FolderCreated event received from ${client.id}`);
    this.server.emit('folderCreated', payload);
  }

  @SubscribeMessage('fileCreated')
  handleFileCreated(client: Socket, payload: any) {
    this.logger.log(`📄 fileCreated event received from ${client.id}`);
    this.server.emit('fileCreated', payload);
  }

  logFolderCreated(folder: any) {
    this.logger.log(`📁 Folder created: ${folder.name}`);
  }
}
