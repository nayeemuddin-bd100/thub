import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, ArrowLeft, Plus, Home } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getAllowedMessagingRoles, ROLE_LABELS, type UserRole } from '@shared/messagingPermissions';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedNewUser, setSelectedNewUser] = useState<string>('');
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  
  // Check for user query parameter to auto-select conversation
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    if (userId) {
      setSelectedUserId(userId);
      // Clear the query parameter from URL
      window.history.replaceState({}, '', '/messages');
    }
  }, []);
  
  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  // WebSocket connection
  const { isConnected, lastMessage } = useWebSocket(currentUser?.id || null);

  // Fetch conversations list
  const { data: conversations = [], isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
    enabled: !!currentUser,
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: loadingMessages } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedUserId],
    enabled: !!selectedUserId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: string; content: string }) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(t('messages.message_failed'));
      return response.json();
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error'),
        description: error.message || t('messages.message_failed'),
        variant: 'destructive',
      });
    },
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (senderId: string) => {
      const response = await fetch('/api/messages/read', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId }),
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
    },
  });

  // Handle new WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const msg = lastMessage;
      
      // If message is for current conversation, add it
      if (msg.senderId === selectedUserId || msg.receiverId === selectedUserId) {
        queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
      }
      
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      
      // Show notification if not in current conversation
      if (msg.senderId !== selectedUserId) {
        toast({
          title: t('messages.new_message'),
          description: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
        });
      }
    }
  }, [lastMessage, selectedUserId, toast]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      const hasUnread = messages.some(m => m.senderId === selectedUserId && !m.isRead);
      if (hasUnread) {
        markAsReadMutation.mutate(selectedUserId);
      }
    }
  }, [selectedUserId, messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;

    sendMessageMutation.mutate({
      receiverId: selectedUserId,
      content: messageText.trim(),
    });
  };

  const selectedConversation = conversations.find(c => c.userId === selectedUserId);

  // Fetch user details if starting a new conversation
  const { data: selectedUser } = useQuery<User>({
    queryKey: ['/api/users', selectedUserId],
    enabled: !!selectedUserId && !selectedConversation,
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Get allowed messaging roles for current user
  const allowedRoles = currentUser ? getAllowedMessagingRoles(currentUser.role as UserRole) : [];

  // Fetch users by selected role for new message
  const { data: usersByRole = [] } = useQuery<User[]>({
    queryKey: ['/api/users/by-role', selectedRole],
    enabled: !!selectedRole && isNewMessageOpen,
  });

  const handleStartConversation = () => {
    if (selectedNewUser) {
      setSelectedUserId(selectedNewUser);
      setIsNewMessageOpen(false);
      setSelectedRole('');
      setSelectedNewUser('');
      setUserSearchQuery('');
    }
  };

  // Filter users based on search query
  const filteredUsers = usersByRole.filter(user => {
    if (!userSearchQuery.trim()) return true;
    const searchLower = userSearchQuery.toLowerCase();
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const email = user.email.toLowerCase();
    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{t('messages.login_to_message')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold" data-testid="heading-messages">{t('messages.title')}</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/'}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground" data-testid="status-connection">
            {isConnected ? t('messages.connected') : t('messages.disconnected')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className={`${selectedUserId ? 'hidden lg:block' : ''}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('messages.conversations')}</CardTitle>
              <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Message
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Conversation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select User Role</label>
                      <Select value={selectedRole} onValueChange={(value) => {
                        setSelectedRole(value);
                        setSelectedNewUser('');
                        setUserSearchQuery('');
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a role..." />
                        </SelectTrigger>
                        <SelectContent>
                          {allowedRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedRole && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select User</label>
                        {usersByRole.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No users found with this role
                          </p>
                        ) : (
                          <Select value={selectedNewUser} onValueChange={setSelectedNewUser}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a user..." />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 pb-2 sticky top-0 bg-popover z-10">
                                <Input
                                  placeholder="Search by name or email..."
                                  value={userSearchQuery}
                                  onChange={(e) => setUserSearchQuery(e.target.value)}
                                  className="h-8"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.stopPropagation()}
                                />
                              </div>
                              {filteredUsers.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                  No users match your search
                                </div>
                              ) : (
                                filteredUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName} ({user.email})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    )}

                    <Button
                      onClick={handleStartConversation}
                      disabled={!selectedNewUser}
                      className="w-full"
                    >
                      Start Conversation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {loadingConversations ? (
                <div className="p-4 text-center text-muted-foreground">
                  {t('messages.loading_conversations')}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t('messages.no_conversations')}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('messages.start_messaging')}
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedUserId(conv.userId)}
                    className={`w-full p-4 border-b hover:bg-accent transition-colors text-left ${
                      selectedUserId === conv.userId ? 'bg-accent' : ''
                    }`}
                    data-testid={`conversation-${conv.userId}`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{getInitials(conv.userName)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate flex-1 min-w-0" data-testid={`name-${conv.userId}`}>
                            {conv.userName}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 flex-shrink-0" data-testid={`unread-${conv.userId}`}>
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {format(new Date(conv.lastMessageTime), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className={`lg:col-span-2 ${!selectedUserId && 'hidden lg:block'}`}>
          {selectedUserId && (selectedConversation || selectedUser) ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                    onClick={() => setSelectedUserId(null)}
                    data-testid="button-back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Avatar>
                    <AvatarFallback>
                      {selectedConversation 
                        ? getInitials(selectedConversation.userName)
                        : selectedUser 
                          ? getInitials(`${selectedUser.firstName} ${selectedUser.lastName}`)
                          : '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg" data-testid="text-chat-username">
                      {selectedConversation 
                        ? selectedConversation.userName
                        : selectedUser 
                          ? `${selectedUser.firstName} ${selectedUser.lastName}`
                          : 'User'}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation 
                        ? selectedConversation.userEmail
                        : selectedUser?.email || ''}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[450px] p-4">
                  {loadingMessages ? (
                    <div className="text-center text-muted-foreground">
                      {t('messages.loading_messages')}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      {t('messages.no_messages')}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isSent = msg.senderId === currentUser.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                            data-testid={`message-${msg.id}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                isSent
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="break-words">{msg.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isSent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                }`}
                              >
                                {format(new Date(msg.createdAt), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
                <div className="p-4 border-t">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder={t('messages.type_message')}
                      disabled={sendMessageMutation.isPending}
                      data-testid="input-message"
                    />
                    <Button
                      type="submit"
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      data-testid="button-send"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-[600px]">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">{t('messages.select_conversation')}</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
