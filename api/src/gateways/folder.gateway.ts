import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class FolderGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('folderCreated')
  handleFolderCreated(client: Socket, payload: any) {
    this.server.emit('folderCreated', payload);
  }

  @SubscribeMessage('fileCreated')
  handleFileCreated(client: Socket, payload: any) {
    this.server.emit('fileCreated', payload);
  }
}

