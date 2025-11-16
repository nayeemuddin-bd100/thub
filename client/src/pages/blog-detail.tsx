import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import { useRoute } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";
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

export default function BlogDetail() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, params] = useRoute("/blog/:slug");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const slug = params?.slug;

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

  const { data: blogPost, isLoading, error } = useQuery<BlogPostWithAuthor>({
    queryKey: [`/api/blog/${slug}`],
    enabled: !!slug,
    retry: false,
  });

  const handleShare = () => {
    if (navigator.share && blogPost) {
      navigator.share({
        title: blogPost.title,
        text: blogPost.excerpt || blogPost.title,
        url: window.location.href,
      }).catch(() => {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="h-96 bg-muted rounded-2xl animate-pulse mb-8"></div>
          <div className="h-12 bg-muted rounded w-3/4 mb-4 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-1/2 mb-8 animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
          isAuthenticated={isAuthenticated}
          user={user}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t('blog.post_not_found') || 'Blog Post Not Found'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {t('blog.post_not_found_message') || 'The blog post you are looking for does not exist or has been removed.'}
          </p>
          <Button onClick={() => window.location.href = '/blog'}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.back_to_blog') || 'Back to Blog'}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const authorName = blogPost.author
    ? `${blogPost.author.firstName || ''} ${blogPost.author.lastName || ''}`.trim() || t('blog.anonymous_author')
    : t('blog.anonymous_author');

  return (
    <div className="min-h-screen bg-background">
      <Header
        onToggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        isAuthenticated={isAuthenticated}
        user={user}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/blog'}
          className="mb-8"
          data-testid="button-back-to-blog"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.back_to_blog') || 'Back to Blog'}
        </Button>

        {/* Featured Image */}
        {blogPost.featuredImage && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={blogPost.featuredImage}
              alt={blogPost.title}
              className="w-full h-96 object-cover"
              data-testid="image-featured"
            />
          </div>
        )}

        {/* Category Badge */}
        {blogPost.category && (
          <div className="mb-4">
            <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              {blogPost.category}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6" data-testid="text-title">
          {blogPost.title}
        </h1>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-muted-foreground mb-8 pb-8 border-b border-border">
          <div className="flex items-center gap-2" data-testid="meta-author">
            <User className="w-4 h-4" />
            <span>{authorName}</span>
          </div>
          {blogPost.publishedAt && (
            <div className="flex items-center gap-2" data-testid="meta-date">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(blogPost.publishedAt), 'MMMM dd, yyyy')}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="ml-auto"
            data-testid="button-share"
          >
            <Share2 className="w-4 h-4 mr-2" />
            {t('common.share') || 'Share'}
          </Button>
        </div>

        {/* Excerpt */}
        {blogPost.excerpt && (
          <p className="text-xl text-muted-foreground mb-8 italic" data-testid="text-excerpt">
            {blogPost.excerpt}
          </p>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: blogPost.content }}
          data-testid="content-body"
        />

        {/* Tags */}
        {blogPost.tags && blogPost.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t('blog.tags') || 'Tags'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {blogPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block bg-muted text-foreground px-3 py-1 rounded-full text-sm"
                  data-testid={`tag-${tag}`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog Button */}
        <div className="mt-12 text-center">
          <Button onClick={() => window.location.href = '/blog'} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('blog.back_to_all_posts') || 'Back to All Posts'}
          </Button>
        </div>
      </article>

      <Footer />
    </div>
  );
}
