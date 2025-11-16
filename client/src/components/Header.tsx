import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Moon, Sun, User, MessageSquare, Heart, Bell, ArrowRight, Menu, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "@/hooks/useWebSocket";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HeaderProps {
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
  isAuthenticated?: boolean;
  user?: any;
}

export default function Header({ onToggleDarkMode, isDarkMode, isAuthenticated = false, user }: HeaderProps) {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // WebSocket for real-time notifications
  const { lastNotification, unreadCount: wsUnreadCount } = useWebSocket(user?.id || null);

  // Fetch unread notification count (with longer polling interval as fallback)
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
    enabled: isAuthenticated,
    retry: false,
    refetchInterval: 60000, // Refetch every 60 seconds (fallback)
  });

  // Fetch recent notifications for popover (with longer polling interval as fallback)
  const { data: notifications } = useQuery<any[]>({
    queryKey: ["/api/notifications"],
    enabled: isAuthenticated,
    retry: false,
    refetchInterval: 60000, // Refetch every 60 seconds (fallback)
  });

  // Use WebSocket unread count if available, otherwise use API data
  const unreadCount = wsUnreadCount !== null ? wsUnreadCount : (unreadData?.count || 0);
  const recentNotifications = notifications?.slice(0, 5) || [];

  // Handle real-time notifications
  useEffect(() => {
    if (lastNotification) {
      // Invalidate queries to refresh the notification list
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    }
  }, [lastNotification]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      setLocation("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", "/api/notifications/mark-all-read", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append('location', searchQuery.trim());
      setLocation(`/properties?${params.toString()}`);
      setSearchQuery(''); // Clear search after navigating
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground">TravelHub</span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
            <div className="w-full relative">
              <Input
                data-testid="input-search"
                type="text"
                placeholder={t('header.search_placeholder')}
                className="pl-10 pr-4 py-2 rounded-full focus:ring-2 focus:ring-ring bg-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
              <Search 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer hover:text-foreground transition-colors" 
                onClick={handleSearch}
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <LanguageSwitcher />
            
            <Button variant="ghost" size="icon" onClick={onToggleDarkMode} data-testid="button-dark-mode">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>

            {isAuthenticated && (
              <>
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" data-testid="button-favorites" className="relative">
                    <Heart className="w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="ghost" size="icon" data-testid="button-messages" className="relative">
                    <MessageSquare className="w-5 h-5" />
                  </Button>
                </Link>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" data-testid="button-notifications" className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between border-b border-border p-4">
                      <h3 className="font-semibold text-foreground">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7"
                              onClick={handleMarkAllAsRead}
                              disabled={markAllAsReadMutation.isPending}
                            >
                              Mark all read
                            </Button>
                            <Badge variant="secondary" className="text-xs">
                              {unreadCount} new
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {recentNotifications.length > 0 ? (
                        <div className="divide-y divide-border">
                          {recentNotifications.map((notification: any) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                                !notification.isRead ? 'bg-primary/5' : ''
                              }`}
                              onClick={() => {
                                window.location.href = '/dashboard?tab=notifications';
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <Bell className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-sm text-foreground truncate">
                                      {notification.title}
                                    </p>
                                    {!notification.isRead && (
                                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-muted-foreground">No notifications</p>
                        </div>
                      )}
                    </div>
                    {recentNotifications.length > 0 && (
                      <div className="border-t border-border p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-sm"
                          onClick={() => {
                            window.location.href = '/dashboard?tab=notifications';
                          }}
                        >
                          See all notifications
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </>
            )}

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl} alt={user.firstName || 'User'} />
                      <AvatarFallback>
                        {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role !== 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" data-testid="link-dashboard">{t('header.dashboard')}</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="link-admin">{t('header.admin_panel')}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" data-testid="link-favorites">{t('header.favorites')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" data-testid="link-messages">{t('header.messages')}</Link>
                  </DropdownMenuItem>
                  {user.role === 'billing' && (
                    <DropdownMenuItem asChild>
                      <Link href="/billing-dashboard">Billing Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'operation' && (
                    <DropdownMenuItem asChild>
                      <Link href="/operation-dashboard">Operation Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'marketing' && (
                    <DropdownMenuItem asChild>
                      <Link href="/marketing-dashboard">Marketing Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'support' && (
                    <DropdownMenuItem asChild>
                      <Link href="/support-dashboard">Support Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'city_manager' && (
                    <DropdownMenuItem asChild>
                      <Link href="/city-manager-dashboard">City Manager Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'operation_support' && (
                    <DropdownMenuItem asChild>
                      <Link href="/support-dashboard">Support Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'service_provider' && (
                    <DropdownMenuItem asChild>
                      <Link href="/provider-config">Provider Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'country_manager' && (
                    <DropdownMenuItem asChild>
                      <Link href="/country-manager-dashboard">Country Manager Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} data-testid="link-logout">
                    {t('header.log_out')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2 bg-muted rounded-full p-1">
                <Link href="/host">
                  <Button variant="ghost" size="sm" data-testid="button-host">
                    {t('header.host')}
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm" className="rounded-full" data-testid="button-login">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 mt-6">
                  {/* Mobile Search */}
                  <div className="w-full relative">
                    <Input
                      type="text"
                      placeholder={t('header.search_placeholder')}
                      className="pl-10 pr-4 py-2"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                    />
                    <Search 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 cursor-pointer" 
                      onClick={() => {
                        handleSearch();
                        setMobileMenuOpen(false);
                      }}
                    />
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <LanguageSwitcher />
                    
                    {isAuthenticated ? (
                      <>
                        <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <User className="w-4 h-4 mr-2" />
                            {t('header.dashboard')}
                          </Button>
                        </Link>
                        
                        <Link href="/favorites" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <Heart className="w-4 h-4 mr-2" />
                            {t('header.favorites')}
                          </Button>
                        </Link>
                        
                        <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {t('header.messages')}
                            {unreadCount > 0 && (
                              <Badge variant="destructive" className="ml-auto">
                                {unreadCount}
                              </Badge>
                            )}
                          </Button>
                        </Link>

                        {user && (
                          <>
                            <div className="border-t pt-2 mt-2">
                              <div className="px-4 py-2">
                                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            </div>

                            {user.role === 'admin' && (
                              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                  {t('header.admin_panel')}
                                </Button>
                              </Link>
                            )}
                            
                            {user.role === 'country_manager' && (
                              <Link href="/country-manager-dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                  Country Manager
                                </Button>
                              </Link>
                            )}
                            
                            {user.role === 'city_manager' && (
                              <Link href="/city-manager-dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                  City Manager
                                </Button>
                              </Link>
                            )}
                            
                            {user.role === 'service_provider' && (
                              <Link href="/provider-config" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start">
                                  Provider Dashboard
                                </Button>
                              </Link>
                            )}

                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-destructive hover:text-destructive" 
                              onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                              }}
                            >
                              {t('header.log_out')}
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Link href="/host" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start">
                            {t('header.host')}
                          </Button>
                        </Link>
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">
                            <User className="w-4 h-4 mr-2" />
                            {t('header.log_in')}
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
