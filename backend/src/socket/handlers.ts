import { Server, Socket } from 'socket.io';
import { db } from '../database/connection';
import { users, messages, chatRoomMembers, notifications } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  username?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production') as any;
      socket.userId = decoded.id;
      socket.username = decoded.username;
      
      // Update user online status
      await db.update(users)
        .set({ isOnline: true, lastSeen: new Date() })
        .where(eq(users.id, decoded.id));

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.username} connected`);

    // Join user's chat rooms
    socket.on('join-rooms', async () => {
      try {
        if (!socket.userId) return;

        const userRooms = await db.select({ roomId: chatRoomMembers.roomId })
          .from(chatRoomMembers)
          .where(eq(chatRoomMembers.userId, socket.userId));

        userRooms.forEach(room => {
          socket.join(`room-${room.roomId}`);
        });

        socket.emit('rooms-joined', { rooms: userRooms.map(r => r.roomId) });
      } catch (error) {
        console.error('Join rooms error:', error);
      }
    });

    // Handle new message
    socket.on('send-message', async (data: { roomId: number; content: string; messageType?: string }) => {
      try {
        if (!socket.userId) return;

        const { roomId, content, messageType = 'text' } = data;

        // Check if user is member of the room
        const membership = await db.select().from(chatRoomMembers)
          .where(and(eq(chatRoomMembers.roomId, roomId), eq(chatRoomMembers.userId, socket.userId)))
          .limit(1);

        if (membership.length === 0) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Save message to database
        const [newMessage] = await db.insert(messages).values({
          roomId,
          senderId: socket.userId,
          content,
          messageType
        }).returning();

        // Get sender info
                            const sender = await db.select({
                      id: users.id,
                      username: users.username,
                      avatar: users.avatar
                    })
                    .from(users)
                    .where(eq(users.id, socket.userId!))
                    .limit(1);

        const messageWithSender = {
          ...newMessage,
          sender: sender[0]
        };

        // Broadcast to room
        io.to(`room-${roomId}`).emit('new-message', messageWithSender);

        // Send notifications to offline members
        const roomMembers = await db.select({ userId: chatRoomMembers.userId })
          .from(chatRoomMembers)
          .where(eq(chatRoomMembers.roomId, roomId));

        for (const member of roomMembers) {
          if (member.userId !== socket.userId) {
            const memberUser = await db.select({ isOnline: users.isOnline })
              .from(users)
              .where(eq(users.id, member.userId))
              .limit(1);

            if (!memberUser[0]?.isOnline) {
              await db.insert(notifications).values({
                userId: member.userId,
                type: 'message',
                title: `New message from ${socket.username}`,
                message: content.substring(0, 100),
                data: { roomId, messageId: newMessage.id }
              });
            }
          }
        }
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', (data: { roomId: number; isTyping: boolean }) => {
      const { roomId, isTyping } = data;
      socket.to(`room-${roomId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        isTyping
      });
    });

    // Handle join room
    socket.on('join-room', (roomId: number) => {
      socket.join(`room-${roomId}`);
      socket.emit('room-joined', { roomId });
    });

    // Handle leave room
    socket.on('leave-room', (roomId: number) => {
      socket.leave(`room-${roomId}`);
      socket.emit('room-left', { roomId });
    });

    // Handle friend request
    socket.on('friend-request', async (data: { targetUserId: number }) => {
      try {
        const { targetUserId } = data;

        // Check if target user is online
        const targetUser = await db.select({ isOnline: users.isOnline })
          .from(users)
          .where(eq(users.id, targetUserId))
          .limit(1);

        if (targetUser[0]?.isOnline) {
          // Send real-time notification
          io.to(`user-${targetUserId}`).emit('friend-request', {
            from: {
              id: socket.userId,
              username: socket.username
            }
          });
        } else {
          // Save notification to database
          await db.insert(notifications).values({
            userId: targetUserId,
            type: 'friend_request',
            title: `Friend request from ${socket.username}`,
            message: `${socket.username} wants to be your friend`,
            data: { requesterId: socket.userId }
          });
        }
      } catch (error) {
        console.error('Friend request error:', error);
      }
    });

    // Handle user status updates
    socket.on('status-update', async (data: { status: string }) => {
      try {
        if (!socket.userId) return;

        await db.update(users)
          .set({ lastSeen: new Date() })
          .where(eq(users.id, socket.userId));

        // Broadcast status to friends
        const friends = await db.select({ userId: users.id })
          .from(users)
          .innerJoin(chatRoomMembers, eq(users.id, chatRoomMembers.userId))
          .where(eq(chatRoomMembers.roomId, 1)); // This would need proper friend relationship query

        friends.forEach(friend => {
          io.to(`user-${friend.userId}`).emit('friend-status-update', {
            userId: socket.userId,
            status: data.status
          });
        });
      } catch (error) {
        console.error('Status update error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      try {
        if (socket.userId) {
          await db.update(users)
            .set({ isOnline: false, lastSeen: new Date() })
            .where(eq(users.id, socket.userId));

          console.log(`User ${socket.username} disconnected`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });
  });
}; 