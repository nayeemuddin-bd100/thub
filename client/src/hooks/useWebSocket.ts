import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: 'auth_success' | 'new_message' | 'notification' | 'error' | 'typing_start' | 'typing_stop' | 'message_delivered' | 'message_read' | 'user_online' | 'user_offline';
  message?: any;
  data?: any;
  unreadCount?: number;
  error?: string;
  userId?: string;
  messageId?: string;
  timestamp?: string;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  lastMessage: any | null;
  lastNotification: any | null;
  unreadCount: number | null;
  typingUsers: Set<string>;
  sendTypingStart: (receiverId: string) => void;
  sendTypingStop: (receiverId: string) => void;
  sendMessageDelivered: (messageId: string) => void;
  sendMessageRead: (messageId: string) => void;
  onlineUsers: Set<string>;
}

export function useWebSocket(userId: string | null): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [lastNotification, setLastNotification] = useState<any | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (!userId) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    const connect = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;
        
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          reconnectAttemptsRef.current = 0;
          // No need to send auth - session cookie handles authentication
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            
            if (data.type === 'auth_success') {
              console.log('WebSocket authenticated');
            } else if (data.type === 'new_message') {
              setLastMessage(data.message);
            } else if (data.type === 'notification') {
              // Create a new object with timestamp to ensure React detects change
              setLastNotification({ 
                ...data.data, 
                _receivedAt: Date.now() 
              });
              if (data.unreadCount !== undefined) {
                setUnreadCount(data.unreadCount);
              }
            } else if (data.type === 'typing_start') {
              if (data.userId) {
                setTypingUsers(prev => new Set(prev).add(data.userId!));
                
                // Clear any existing timeout for this user
                if (typingTimeoutRef.current[data.userId]) {
                  clearTimeout(typingTimeoutRef.current[data.userId]);
                }
                
                // Auto-stop typing after 5 seconds
                typingTimeoutRef.current[data.userId] = setTimeout(() => {
                  setTypingUsers(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(data.userId!);
                    return newSet;
                  });
                  delete typingTimeoutRef.current[data.userId!];
                }, 5000);
              }
            } else if (data.type === 'typing_stop') {
              if (data.userId) {
                setTypingUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(data.userId!);
                  return newSet;
                });
                
                // Clear timeout
                if (typingTimeoutRef.current[data.userId]) {
                  clearTimeout(typingTimeoutRef.current[data.userId]);
                  delete typingTimeoutRef.current[data.userId];
                }
              }
            } else if (data.type === 'message_delivered' || data.type === 'message_read') {
              // Trigger a message status update
              setLastMessage({ 
                ...data, 
                _statusUpdate: Date.now() 
              });
            } else if (data.type === 'user_online') {
              if (data.userId) {
                setOnlineUsers(prev => new Set(prev).add(data.userId!));
              }
            } else if (data.type === 'user_offline') {
              if (data.userId) {
                setOnlineUsers(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(data.userId!);
                  return newSet;
                });
              }
            } else if (data.type === 'error') {
              console.error('WebSocket error:', data.error);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          wsRef.current = null;

          // Attempt to reconnect
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
            console.log(`Reconnecting in ${delay}ms...`);
            reconnectAttemptsRef.current += 1;
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    };

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [userId]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  };

  const sendTypingStart = (receiverId: string) => {
    sendMessage({ type: 'typing_start', receiverId });
  };

  const sendTypingStop = (receiverId: string) => {
    sendMessage({ type: 'typing_stop', receiverId });
  };

  const sendMessageDelivered = (messageId: string) => {
    sendMessage({ type: 'message_delivered', messageId });
  };

  const sendMessageRead = (messageId: string) => {
    sendMessage({ type: 'message_read', messageId });
  };

  return {
    isConnected,
    sendMessage,
    lastMessage,
    lastNotification,
    unreadCount,
    typingUsers,
    sendTypingStart,
    sendTypingStop,
    sendMessageDelivered,
    sendMessageRead,
    onlineUsers,
  };
}
