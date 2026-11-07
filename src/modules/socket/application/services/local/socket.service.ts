import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';

//Domain
import type { ISocketService } from '../../../domain/interfaces/services';

//Infrastructure
import { SOCKET_CHANNEL } from '../../../infrastructure/constants';

@Injectable()
export class SocketService implements ISocketService {
  private io: Server | null = null;

  attach(server: Server): void {
    this.io = server;
  }

  emitToEmployee(userId: string, event: string, data: unknown): void {
    this.emit(SOCKET_CHANNEL.EMPLOYEE(userId), event, data);
  }

  emitToManagers(event: string, data: unknown): void {
    this.emit(SOCKET_CHANNEL.MANAGERS, event, data);
  }

  emitToManager(cloudUserId: string, event: string, data: unknown): void {
    this.emit(SOCKET_CHANNEL.MANAGER(cloudUserId), event, data);
  }

  //Functions
  private emit(channel: string, event: string, data: unknown): void {
    this.io?.to(channel).emit(event, data);
  }
}
