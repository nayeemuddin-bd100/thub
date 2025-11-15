import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageSquare, Search, Send, User, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface Conversation {
    userId: string;
    userName: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
}

interface Message {
    id: string;
    senderId: string;
    receiverId: string;
    content: string;
    createdAt: Date;
    isRead: boolean;
}

export default function SupportDashboard() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDarkMode(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !isDarkMode;
        setIsDarkMode(newMode);

        if (newMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "Please log in to access the support dashboard",
                variant: "destructive",
            });
            setTimeout(() => {
                window.location.href = "/login";
            }, 500);
        } else if (!authLoading && user?.role !== "operation_support") {
            toast({
                title: "Access Denied",
                description: "Only operation support staff can access this page",
                variant: "destructive",
            });
            setTimeout(() => {
                setLocation("/dashboard");
            }, 500);
        }
    }, [isAuthenticated, authLoading, user, toast, setLocation]);

    // Fetch all conversations for the operation_support user
    const { data: conversations, isLoading: conversationsLoading } = useQuery<Conversation[]>({
        queryKey: ["/api/conversations"],
        enabled: isAuthenticated && user?.role === "operation_support",
        retry: false,
    });

    // Fetch messages for selected conversation
    const { data: messages, isLoading: messagesLoading } = useQuery<any[]>({
        queryKey: ["/api/messages", selectedUserId],
        enabled: !!selectedUserId,
        retry: false,
    });

    // Send reply mutation
    const sendReplyMutation = useMutation({
        mutationFn: async (message: string) => {
            if (!selectedUserId) throw new Error("No user selected");
            return await apiRequest("POST", "/api/messages", {
                receiverId: selectedUserId,
                content: message,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/messages", selectedUserId] });
            queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
            setReplyMessage("");
            toast({
                title: "Success",
                description: "Message sent successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to send message",
                variant: "destructive",
            });
        },
    });

    const handleSendReply = () => {
        if (!replyMessage.trim()) {
            toast({
                title: "Error",
                description: "Please enter a message",
                variant: "destructive",
            });
            return;
        }
        sendReplyMutation.mutate(replyMessage);
    };

    const filteredConversations = conversations?.filter((conv) =>
        conv.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (user.role !== "operation_support") {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header onToggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} />

            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Support Dashboard</h1>
                        <p className="text-muted-foreground">Manage and respond to support requests</p>
                    </div>
                    <Button variant="outline" onClick={() => setLocation('/')}>
                        <Home className="w-4 h-4 mr-2" />
                        Home
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                    {/* Conversations List */}
                    <Card className="p-4 flex flex-col">
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            {conversationsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
                                    ))}
                                </div>
                            ) : filteredConversations && filteredConversations.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredConversations.map((conv) => (
                                        <div
                                            key={conv.userId}
                                            onClick={() => setSelectedUserId(conv.userId)}
                                            className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                                selectedUserId === conv.userId
                                                    ? "bg-primary/10 border-2 border-primary"
                                                    : "bg-muted hover:bg-muted/80"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-muted-foreground" />
                                                    <span className="font-semibold text-foreground">
                                                        {conv.userName}
                                                    </span>
                                                </div>
                                                {conv.unreadCount > 0 && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {conv.unreadCount}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {conv.lastMessage}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(conv.lastMessageTime).toLocaleString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                    <p className="text-muted-foreground">No conversations yet</p>
                                </div>
                            )}
                        </ScrollArea>
                    </Card>

                    {/* Messages Panel */}
                    <Card className="md:col-span-2 p-4 flex flex-col">
                        {selectedUserId ? (
                            <>
                                <div className="mb-4 pb-4 border-b">
                                    <h2 className="text-xl font-semibold text-foreground">
                                        Conversation with{" "}
                                        {filteredConversations?.find((c) => c.userId === selectedUserId)?.userName}
                                    </h2>
                                </div>

                                <ScrollArea className="flex-1 mb-4">
                                    {messagesLoading ? (
                                        <div className="space-y-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse"></div>
                                            ))}
                                        </div>
                                    ) : messages && Array.isArray(messages) && messages.length > 0 ? (
                                        <div className="space-y-3">
                                            {messages.map((message: any) => (
                                                <div
                                                    key={message.id}
                                                    className={`p-3 rounded-lg ${
                                                        message.senderId === user.id
                                                            ? "bg-primary text-primary-foreground ml-12"
                                                            : "bg-muted mr-12"
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.content}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            message.senderId === user.id
                                                                ? "text-primary-foreground/70"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        {new Date(message.createdAt).toLocaleString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">No messages in this conversation</p>
                                        </div>
                                    )}
                                </ScrollArea>

                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="Type your reply..."
                                        value={replyMessage}
                                        onChange={(e) => setReplyMessage(e.target.value)}
                                        rows={3}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendReply();
                                            }
                                        }}
                                    />
                                    <Button
                                        onClick={handleSendReply}
                                        disabled={sendReplyMutation.isPending || !replyMessage.trim()}
                                        className="self-end"
                                    >
                                        <Send className="w-4 h-4 mr-2" />
                                        {sendReplyMutation.isPending ? "Sending..." : "Send"}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        Select a conversation to view messages
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            <Footer />
        </div>
    );
}
