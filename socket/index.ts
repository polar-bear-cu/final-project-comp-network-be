import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";

const userSockets = new Map<string, string>();

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.auth.userid as string;

    if (!userId) {
      console.log("No userid provided. Disconnecting socket:", socket.id);
      socket.disconnect();
      return;
    }

    if (userSockets.has(userId)) {
      const oldSocketId = userSockets.get(userId)!;
      const oldSocket = io.sockets.sockets.get(oldSocketId);
      if (oldSocket) oldSocket.disconnect(true);
    }

    socket.on("open-addfriend-popup", () => {
      io.emit("active-users-id", Array.from(userSockets.keys()));
    });

    userSockets.set(userId, socket.id);
    console.log(`Socket connected for user ${userId}: ${socket.id}`);

    socket.on("disconnect", () => {
      userSockets.delete(userId);
      io.emit("active-users-id", Array.from(userSockets.keys()));
    });
  });

  return io;
}
