import type { Server } from 'socket.io';

export interface ISocketService {
  attach(server: Server): void;

  emitToEmployee(userId: string, event: string, data: unknown): void;

  emitToManagers(event: string, data: unknown): void;

  emitToManager(cloudUserId: string, event: string, data: unknown): void;
}
