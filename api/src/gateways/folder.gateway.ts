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

  @SubscribeMessage('renameFile')
  handleRenameFile(client: Socket, payload: any) {
    this.logger.log(`✏️ renameFile event received: ${JSON.stringify(payload)}`);
    this.server.emit('renameFile', payload);
  }

  @SubscribeMessage('renameFolder')
  handleRenameFolder(client: Socket, payload: any) {
    this.logger.log(`✏️ renameFolder event received: ${JSON.stringify(payload)}`);
    this.server.emit('renameFolder', payload);
  }

  @SubscribeMessage('deleteFolder')
  handleDeleteFolder(client: Socket, payload: any) {
    this.logger.log(`🗑️ deleteFolder event received: ${JSON.stringify(payload)}`);
    this.server.emit('deleteFolder', payload);
  }

  @SubscribeMessage('deleteFile')
  handleDeleteFile(client: Socket, payload: any) {
    this.logger.log(`🗑️ deleteFile event received: ${JSON.stringify(payload)}`);
    this.server.emit('deleteFile', payload);
  }

  @SubscribeMessage('uploadFile')
  handleUploadFile(client: Socket, payload: any) {
    this.logger.log(`📤 uploadFile event received: ${JSON.stringify(payload)}`);
    this.server.emit('uploadFile', payload);
  }

  logFolderCreated(folder: any) {
    this.logger.log(`📁 Folder created: ${folder.name}`);
  }
}
