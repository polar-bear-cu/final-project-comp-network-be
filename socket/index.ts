import { Server, Socket } from "socket.io";
import type { Server as HttpServer } from "node:http";

interface ActiveUser {
  userid: string;
  username: string;
}

interface UserSockets {
  username: string;
  socketIds: Set<string>;
}

const userSockets = new Map<string, UserSockets>();

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.handshake.auth.userid as string;
    const username = socket.handshake.auth.username as string;

    console.log(`User ${username} (${userId}) connected`);

    if (!userId || !username) {
      console.log("No user data provided. Disconnecting socket:", socket.id);
      socket.disconnect();
      return;
    }

    if (!userSockets.has(userId)) {
      userSockets.set(userId, { username, socketIds: new Set() });
    }
    userSockets.get(userId)!.socketIds.add(socket.id);

    const activeUsers: ActiveUser[] = Array.from(userSockets.entries()).map(
      ([id, info]) => ({ userid: id, username: info.username })
    );
    io.emit("active-users", activeUsers);

    socket.on("get-active-users", () => {
      socket.emit("active-users", activeUsers);
    });

    socket.on("disconnect", () => {
      const userInfo = userSockets.get(userId);
      if (!userInfo) return;

      userInfo.socketIds.delete(socket.id);
      if (userInfo.socketIds.size === 0) {
        userSockets.delete(userId);
      }

      const updatedActiveUsers: ActiveUser[] = Array.from(userSockets.entries()).map(
        ([id, info]) => ({ userid: id, username: info.username })
      );
      io.emit("active-users", updatedActiveUsers);

      console.log(`User ${username} (${userId}) disconnected`);
    });
  });

  return io;
}