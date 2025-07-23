import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send,
  Search,
  Users,
  UserPlus,
  UserMinus,
  MoreVertical,
  Phone,
  Video,
  Image,
  Paperclip,
  Smile,
  Mic,
  Circle,
  Check,
  CheckCheck,
  Clock,
  MessageSquare,
  Plus,
  Settings,
  Filter
} from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

interface ChatUser {
  id: string;
  username: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: Date;
  isFriend: boolean;
  isOnline: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'direct' | 'group';
  participants: ChatUser[];
  lastMessage?: Message;
  unreadCount: number;
}

const Chat: React.FC = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<ChatUser[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showFriends, setShowFriends] = useState(true);

  // Mock data
  useEffect(() => {
    const mockFriends: ChatUser[] = [
      {
        id: '1',
        username: 'GamerPro123',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GamerPro123',
        status: 'online',
        isFriend: true,
        isOnline: true
      },
      {
        id: '2',
        username: 'SteamMaster',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SteamMaster',
        status: 'away',
        isFriend: true,
        isOnline: true
      },
      {
        id: '3',
        username: 'ConsoleKing',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ConsoleKing',
        status: 'offline',
        lastSeen: new Date(Date.now() - 3600000),
        isFriend: true,
        isOnline: false
      },
      {
        id: '4',
        username: 'PCGamer',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PCGamer',
        status: 'online',
        isFriend: false,
        isOnline: true
      }
    ];

    const mockChatRooms: ChatRoom[] = [
      {
        id: '1',
        name: 'GamerPro123',
        type: 'direct',
        participants: [mockFriends[0]],
        lastMessage: {
          id: '1',
          senderId: '1',
          senderName: 'GamerPro123',
          content: 'Hey, want to play some games?',
          timestamp: new Date(Date.now() - 300000),
          type: 'text',
          status: 'read'
        },
        unreadCount: 0
      },
      {
        id: '2',
        name: 'SteamMaster',
        type: 'direct',
        participants: [mockFriends[1]],
        lastMessage: {
          id: '2',
          senderId: '2',
          senderName: 'SteamMaster',
          content: 'Just finished a great game!',
          timestamp: new Date(Date.now() - 600000),
          type: 'text',
          status: 'delivered'
        },
        unreadCount: 1
      }
    ];

    setFriends(mockFriends);
    setChatRooms(mockChatRooms);
  }, []);

  // Check for URL parameters to start a direct message
  useEffect(() => {
    const targetUserId = searchParams.get('user');
    const targetUsername = searchParams.get('username');
    
    if (targetUserId && targetUsername) {
      // Create a direct chat room with the target user
      const directChat: ChatRoom = {
        id: `direct-${targetUserId}`,
        name: targetUsername,
        type: 'direct',
        participants: [
          {
            id: targetUserId,
            username: targetUsername,
            status: 'online',
            isFriend: false,
            isOnline: true
          }
        ],
        unreadCount: 0
      };
      
      setSelectedChat(directChat);
      setShowFriends(false);
      
      // Clear URL parameters
      window.history.replaceState({}, '', '/chat');
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedChat) {
      // Mock messages for selected chat
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: selectedChat.participants[0].id,
          senderName: selectedChat.participants[0].username,
          senderAvatar: selectedChat.participants[0].avatar,
          content: 'Hey there! How are you doing?',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text',
          status: 'read'
        },
        {
          id: '2',
          senderId: user?.id || 'current',
          senderName: user?.username || 'You',
          content: 'I\'m doing great! Just playing some games.',
          timestamp: new Date(Date.now() - 3000000),
          type: 'text',
          status: 'read'
        },
        {
          id: '3',
          senderId: selectedChat.participants[0].id,
          senderName: selectedChat.participants[0].username,
          senderAvatar: selectedChat.participants[0].avatar,
          content: 'That sounds awesome! What are you playing?',
          timestamp: new Date(Date.now() - 2400000),
          type: 'text',
          status: 'read'
        },
        {
          id: '4',
          senderId: user?.id || 'current',
          senderName: user?.username || 'You',
          content: 'Currently playing Cyberpunk 2077. It\'s amazing!',
          timestamp: new Date(Date.now() - 1800000),
          type: 'text',
          status: 'read'
        }
      ];
      setMessages(mockMessages);
    }
  }, [selectedChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'current',
      senderName: user?.username || 'You',
      content: newMessage,
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === message.id 
            ? { ...msg, status: 'sent' }
            : msg
        )
      );
    }, 1000);

    // Send via socket if available
    if (socket) {
      socket.emit('send-message', {
        chatId: selectedChat.id,
        content: newMessage,
        type: 'text'
      });
    }
  };

  const addFriend = (friendId: string) => {
    setFriends(prev => 
      prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, isFriend: true }
          : friend
      )
    );
    toast.success('Friend request sent!');
  };

  const removeFriend = (friendId: string) => {
    setFriends(prev => 
      prev.map(friend => 
        friend.id === friendId 
          ? { ...friend, isFriend: false }
          : friend
      )
    );
    toast.success('Friend removed');
  };

  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChatRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending': return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent': return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered': return <CheckCheck className="h-3 w-3 text-blue-400" />;
      case 'read': return <CheckCheck className="h-3 w-3 text-green-400" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-80 bg-slate-800 border-r border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Chat</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFriends(!showFriends)}
                className="text-gray-400 hover:text-white"
              >
                {showFriends ? <MessageSquare className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={showFriends ? "Search friends..." : "Search chats..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {showFriends ? (
            // Friends List
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-300">Friends</h3>
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {filteredFriends.map(friend => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-700 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-slate-600 text-white">
                          {friend.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 ${getStatusColor(friend.status)}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{friend.username}</p>
                      <p className="text-xs text-gray-400">
                        {friend.isOnline ? friend.status : `Last seen ${friend.lastSeen?.toLocaleTimeString()}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {friend.isFriend ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFriend(friend.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => addFriend(friend.id)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Chat Rooms
            <div className="p-4 space-y-2">
              {filteredChatRooms.map(room => (
                <div
                  key={room.id}
                  onClick={() => setSelectedChat(room)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === room.id ? 'bg-slate-700' : 'hover:bg-slate-700'
                  }`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={room.participants[0]?.avatar} />
                      <AvatarFallback className="bg-slate-600 text-white">
                        {room.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {room.participants[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 bg-green-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white truncate">{room.name}</p>
                      {room.unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {room.unreadCount}
                        </Badge>
                      )}
                    </div>
                    {room.lastMessage && (
                      <p className="text-xs text-gray-400 truncate">
                        {room.lastMessage.senderName}: {room.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedChat.participants[0]?.avatar} />
                      <AvatarFallback className="bg-slate-600 text-white">
                        {selectedChat.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedChat.participants[0]?.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-800 bg-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{selectedChat.name}</h3>
                    <p className="text-sm text-gray-400">
                      {selectedChat.participants[0]?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end gap-2 max-w-xs lg:max-w-md ${
                    message.senderId === user?.id ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    {message.senderId !== user?.id && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.senderAvatar} />
                        <AvatarFallback className="bg-slate-600 text-white text-xs">
                          {message.senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      message.senderId === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {message.senderId === user?.id && (
                          <div className="ml-2">
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {typingUsers.length > 0 && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-lg px-4 py-2">
                    <p className="text-sm text-gray-400">
                      {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </p>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-700 bg-slate-800">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Image className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Smile className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-gray-400 pr-20"
                  />
                </div>
                
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          // No chat selected
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Select a chat</h3>
              <p className="text-gray-400">Choose a friend to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat; 