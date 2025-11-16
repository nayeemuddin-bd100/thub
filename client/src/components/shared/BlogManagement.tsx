import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Calendar, Edit, Eye, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt?: string;
    content: string;
    featuredImage?: string;
    authorId: string;
    category: string;
    tags: string[];
    status: "draft" | "published" | "archived";
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    author?: {
        firstName?: string;
        lastName?: string;
        email: string;
    };
}

export default function BlogManagement() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        tags: "",
        status: "draft" as "draft" | "published" | "archived",
    });

    // Fetch all blog posts
    const { data: posts, isLoading } = useQuery<BlogPost[]>({
        queryKey: ["allBlogPosts"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/blog/all");
            return response.json();
        },
    });

    // Create blog post
    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await apiRequest("POST", "/api/blog", data);
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Blog post created successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["allBlogPosts"] });
            setIsCreateOpen(false);
            resetForm();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create blog post",
                variant: "destructive",
            });
        },
    });

    // Update blog post
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const response = await apiRequest("PATCH", `/api/blog/${id}`, data);
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Blog post updated successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["allBlogPosts"] });
            setEditingPost(null);
            resetForm();
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to update blog post",
                variant: "destructive",
            });
        },
    });

    // Delete blog post
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest("DELETE", `/api/blog/${id}`);
            return response.json();
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Blog post deleted successfully",
            });
            queryClient.invalidateQueries({ queryKey: ["allBlogPosts"] });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to delete blog post",
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            category: "",
            tags: "",
            status: "draft",
        });
    };

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            content: post.content,
            category: post.category,
            tags: post.tags.join(", "),
            status: post.status,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = {
            ...formData,
            tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
            publishedAt: formData.status === "published" ? new Date() : null,
        };

        if (editingPost) {
            updateMutation.mutate({ id: editingPost.id, data: submitData });
        } else {
            createMutation.mutate(submitData);
        }
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this blog post?")) {
            deleteMutation.mutate(id);
        }
    };

    // Filter posts
    const filteredPosts = posts?.filter((post) => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || post.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-2xl font-bold">Blog Management</h2>
                <Dialog open={isCreateOpen || !!editingPost} onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateOpen(false);
                        setEditingPost(null);
                        resetForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Blog Post
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPost ? "Edit Blog Post" : "Create Blog Post"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => {
                                        const title = e.target.value;
                                        setFormData({
                                            ...formData,
                                            title,
                                            slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                                        });
                                    }}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) =>
                                        setFormData({ ...formData, slug: e.target.value })
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, category: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="travel-tips">Travel Tips</SelectItem>
                                        <SelectItem value="destinations">Destinations</SelectItem>
                                        <SelectItem value="guides">Guides</SelectItem>
                                        <SelectItem value="news">News</SelectItem>
                                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                                        <SelectItem value="food">Food & Dining</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="excerpt">Excerpt</Label>
                                <Textarea
                                    id="excerpt"
                                    value={formData.excerpt}
                                    onChange={(e) =>
                                        setFormData({ ...formData, excerpt: e.target.value })
                                    }
                                    rows={2}
                                />
                            </div>
                            <div>
                                <Label htmlFor="content">Content *</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={(e) =>
                                        setFormData({ ...formData, content: e.target.value })
                                    }
                                    rows={10}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="tags">Tags (comma separated)</Label>
                                <Input
                                    id="tags"
                                    value={formData.tags}
                                    onChange={(e) =>
                                        setFormData({ ...formData, tags: e.target.value })
                                    }
                                    placeholder="travel, tips, vacation"
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">Status *</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: any) =>
                                        setFormData({ ...formData, status: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateOpen(false);
                                        setEditingPost(null);
                                        resetForm();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingPost ? "Update" : "Create"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search blog posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Blog Posts Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPosts?.map((post) => (
                        <Card key={post.id} className="p-4 flex flex-col">
                            <div className="flex items-start justify-between mb-3">
                                <Badge
                                    variant={
                                        post.status === "published"
                                            ? "default"
                                            : post.status === "draft"
                                            ? "secondary"
                                            : "outline"
                                    }
                                >
                                    {post.status}
                                </Badge>
                                <div className="flex gap-1">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleEdit(post)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDelete(post.id)}
                                        disabled={deleteMutation.isPending}
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                            <h3 className="font-bold text-lg mb-2 line-clamp-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">
                                {post.excerpt || post.content.substring(0, 150)}
                            </p>
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline">{post.category}</Badge>
                                    {post.tags.length > 0 && (
                                        <span>+{post.tags.length} tags</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(post.createdAt).toLocaleDateString()}
                                </div>
                                {post.author && (
                                    <div>
                                        By: {post.author.firstName || post.author.email}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {!isLoading && filteredPosts?.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No blog posts found. Create your first post!
                </div>
            )}
        </div>
    );
}
