import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Moon, Sun, User, MessageSquare, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
              <span className="text-xl font-bold text-foreground">TravelHub</span>
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

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
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
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" data-testid="link-dashboard">{t('header.dashboard')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites" data-testid="link-favorites">{t('header.favorites')}</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" data-testid="link-messages">{t('header.messages')}</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" data-testid="link-admin">{t('header.admin_panel')}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/bookings" data-testid="link-bookings">{t('header.my_bookings')}</Link>
                  </DropdownMenuItem>
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
        </div>
      </div>
    </header>
  );
}
