import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONT_URL || "http://localhost:3000",
    credentials: true,
  },
})

export class UserGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: Socket) {
    console.log(`A user connected ${client.id}`);
    this.server.emit('user connected', 'A new user has connected');
  }

  handleDisconnect(client: Socket) { 
    console.log('User disconnected');
    this.server.emit('user disconnected', 'A user has disconnected');
  }
}
