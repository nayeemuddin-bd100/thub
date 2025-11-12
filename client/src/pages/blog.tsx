import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featuredImage: string | null;
  authorId: string;
  category: string;
  tags: string[];
  status: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogPostWithAuthor extends BlogPost {
  author?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

export default function Blog() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const { data: blogPosts, isLoading, error, refetch } = useQuery<BlogPostWithAuthor[]>({
    queryKey: ['/api/blog'],
    retry: false,
  });

  const categories = blogPosts
    ? Array.from(new Set(blogPosts.map(post => post.category)))
    : [];

  const filteredPosts = blogPosts?.filter(post => {
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const getAuthorName = (post: BlogPostWithAuthor) => {
    if (post.author?.firstName || post.author?.lastName) {
      return `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim();
    }
    return post.author?.email || t('blog.anonymous_author');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleDarkMode={toggleDarkMode} 
        isDarkMode={isDarkMode} 
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-blog-title">
            {t('info_pages.blog_title')}
          </h1>
          <p className="text-lg text-muted-foreground" data-testid="text-blog-subtitle">
            {t('blog.subtitle')}
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                data-testid="input-search-blog"
                placeholder={t('blog.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger data-testid="select-category-blog">
                <SelectValue placeholder={t('blog.all_categories')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('blog.all_categories')}</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden" data-testid={`skeleton-blog-${i}`}>
                <Skeleton className="w-full aspect-video" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-lg text-destructive mb-4" data-testid="text-blog-error">
              {t('blog.error_loading')}
            </p>
            <Button 
              data-testid="button-retry-blog"
              onClick={() => refetch()}
              variant="outline"
            >
              {t('common.try_again')}
            </Button>
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground" data-testid="text-blog-count">
                {t('blog.posts_found', { count: filteredPosts.length })}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer group"
                  data-testid={`card-blog-${post.id}`}
                  onClick={() => setLocation(`/blog/${post.slug}`)}
                >
                  {/* Featured Image */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    {post.featuredImage ? (
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-blog-${post.id}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                        <span className="text-4xl text-muted-foreground">📝</span>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" data-testid={`badge-category-${post.id}`}>
                        {post.category}
                      </Badge>
                    </div>
                    <h3 
                      className="text-xl font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors"
                      data-testid={`text-title-${post.id}`}
                    >
                      {post.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="pb-3">
                    <p 
                      className="text-muted-foreground text-sm line-clamp-3"
                      data-testid={`text-excerpt-${post.id}`}
                    >
                      {post.excerpt || truncateText(post.content, 150)}
                    </p>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between pt-3 border-t">
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1" data-testid={`text-author-${post.id}`}>
                        <User className="w-3 h-3" />
                        <span>{getAuthorName(post)}</span>
                      </div>
                      <div className="flex items-center gap-1" data-testid={`text-date-${post.id}`}>
                        <Calendar className="w-3 h-3" />
                        <span>
                          {post.publishedAt 
                            ? format(new Date(post.publishedAt), 'MMM dd, yyyy')
                            : format(new Date(post.createdAt), 'MMM dd, yyyy')
                          }
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group-hover:text-primary"
                      data-testid={`button-read-more-${post.id}`}
                    >
                      {t('blog.read_more')}
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground" data-testid="text-no-blog-posts">
              {searchQuery || selectedCategory !== "all" 
                ? t('blog.no_posts_filter')
                : t('blog.no_posts')
              }
            </p>
            {(searchQuery || selectedCategory !== "all") && (
              <Button 
                data-testid="button-clear-filters-blog"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                {t('blog.clear_filters')}
              </Button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
