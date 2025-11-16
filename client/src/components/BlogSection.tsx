import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string | null;
  author: string;
  publishedAt: string;
  status: string;
}

export default function BlogSection() {
  const { t } = useTranslation();
  
  const { data: blogPosts, isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    queryFn: async () => {
      const response = await fetch('/api/blog');
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    },
  });

  const recentPosts = blogPosts?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-muted rounded-2xl"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!blogPosts || blogPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2" data-testid="text-blog-title">
              {t('home.latest_stories') || "Latest Stories"}
            </h2>
            <p className="text-lg text-muted-foreground" data-testid="text-blog-subtitle">
              {t('home.travel_tips_insights') || "Travel tips, destination guides, and insider insights"}
            </p>
          </div>
          <Link href="/blog">
            <Button variant="ghost" className="hidden md:flex items-center space-x-2 text-primary hover:text-primary/80 font-semibold" data-testid="button-view-all-blog">
              <span>{t('common.view_all') || "View all"}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card 
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
                data-testid={`card-blog-${post.slug}`}
              >
                {/* Featured Image */}
                <div className="relative h-48 overflow-hidden bg-muted">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <svg className="w-16 h-16 text-primary/40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author || 'TravelHub'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.excerpt || post.content.substring(0, 150) + '...'}
                  </p>

                  {/* Read More Link */}
                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    <span>{t('blog.read_more') || "Read More"}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Button - Mobile */}
        <div className="text-center mt-8 md:hidden">
          <Link href="/blog">
            <Button className="w-full sm:w-auto" data-testid="button-view-all-blog-mobile">
              {t('common.view_all_blog') || "View All Blog Posts"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
