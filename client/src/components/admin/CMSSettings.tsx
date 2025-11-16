import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, Plus, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface CMSContent {
    id: string;
    pageKey: string;
    pageName: string;
    title: string;
    content: string;
    metaDescription?: string;
    metaKeywords?: string;
    isPublished: boolean;
    updatedBy?: string;
    updatedAt?: string;
}

export default function CMSSettings() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingContent, setEditingContent] = useState<CMSContent | null>(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewContent, setPreviewContent] = useState<CMSContent | null>(null);
    
    const [formData, setFormData] = useState({
        pageKey: "",
        pageName: "",
        title: "",
        content: "",
        metaDescription: "",
        metaKeywords: "",
        isPublished: true,
    });

    // Fetch CMS content
    const { data: cmsContentList, isLoading } = useQuery<CMSContent[]>({
        queryKey: ["cmsContent"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/cms-content");
            return response.json();
        },
    });

    // Create/Update CMS content mutation
    const saveMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const url = editingContent
                ? `/api/cms-content/${editingContent.id}`
                : "/api/cms-content";
            const method = editingContent ? "PATCH" : "POST";
            
            const response = await apiRequest(method, url, data);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cmsContent"] });
            setDialogOpen(false);
            setEditingContent(null);
            resetForm();
            toast({
                title: editingContent ? "Content updated" : "Content created",
                description: editingContent
                    ? "CMS content has been updated successfully"
                    : "CMS content has been created successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    // Delete CMS content mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const response = await apiRequest("DELETE", `/api/cms-content/${id}`);
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["cmsContent"] });
            toast({
                title: "Content deleted",
                description: "CMS content has been deleted successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const resetForm = () => {
        setFormData({
            pageKey: "",
            pageName: "",
            title: "",
            content: "",
            metaDescription: "",
            metaKeywords: "",
            isPublished: true,
        });
    };

    const handleEdit = (content: CMSContent) => {
        setEditingContent(content);
        setFormData({
            pageKey: content.pageKey,
            pageName: content.pageName,
            title: content.title,
            content: content.content,
            metaDescription: content.metaDescription || "",
            metaKeywords: content.metaKeywords || "",
            isPublished: content.isPublished,
        });
        setDialogOpen(true);
    };

    const handlePreview = (content: CMSContent) => {
        setPreviewContent(content);
        setPreviewOpen(true);
    };

    const handleSubmit = () => {
        saveMutation.mutate(formData);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">CMS Content Management</h2>
                    <p className="text-muted-foreground">
                        Manage informational pages content
                    </p>
                </div>
                <Button
                    onClick={() => {
                        setEditingContent(null);
                        resetForm();
                        setDialogOpen(true);
                    }}
                    data-testid="button-add-cms-content"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Page
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="h-48 bg-muted rounded-lg animate-pulse"
                        />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cmsContentList?.map((content) => (
                        <Card key={content.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">
                                        {content.pageName}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Key: {content.pageKey}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1">
                                    {content.isPublished ? (
                                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                            Published
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                                            Draft
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <p className="text-sm font-medium">{content.title}</p>
                                {content.metaDescription && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {content.metaDescription}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePreview(content)}
                                    data-testid={`button-preview-${content.pageKey}`}
                                >
                                    <Eye className="h-3 w-3 mr-1" />
                                    Preview
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(content)}
                                    data-testid={`button-edit-${content.pageKey}`}
                                >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        if (window.confirm("Delete this page?")) {
                                            deleteMutation.mutate(content.id);
                                        }
                                    }}
                                    data-testid={`button-delete-${content.pageKey}`}
                                >
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit/Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingContent ? "Edit CMS Content" : "Add CMS Content"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="pageKey">Page Key *</Label>
                            <Input
                                id="pageKey"
                                value={formData.pageKey}
                                onChange={(e) =>
                                    setFormData({ ...formData, pageKey: e.target.value })
                                }
                                placeholder="about, careers, press, etc."
                                disabled={!!editingContent}
                                data-testid="input-page-key"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Unique identifier for the page (e.g., 'about', 'careers')
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="pageName">Page Name *</Label>
                            <Input
                                id="pageName"
                                value={formData.pageName}
                                onChange={(e) =>
                                    setFormData({ ...formData, pageName: e.target.value })
                                }
                                placeholder="About Us"
                                data-testid="input-page-name"
                            />
                        </div>

                        <div>
                            <Label htmlFor="title">Page Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData({ ...formData, title: e.target.value })
                                }
                                placeholder="About TravelHub - Your Travel Companion"
                                data-testid="input-title"
                            />
                        </div>

                        <div>
                            <Label htmlFor="content">Content (HTML) *</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData({ ...formData, content: e.target.value })
                                }
                                placeholder="<div>Your HTML content here</div>"
                                rows={10}
                                data-testid="input-content"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                HTML content for the page
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="metaDescription">Meta Description</Label>
                            <Textarea
                                id="metaDescription"
                                value={formData.metaDescription}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        metaDescription: e.target.value,
                                    })
                                }
                                placeholder="Brief description for search engines"
                                rows={2}
                                data-testid="input-meta-description"
                            />
                        </div>

                        <div>
                            <Label htmlFor="metaKeywords">Meta Keywords</Label>
                            <Input
                                id="metaKeywords"
                                value={formData.metaKeywords}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        metaKeywords: e.target.value,
                                    })
                                }
                                placeholder="keyword1, keyword2, keyword3"
                                data-testid="input-meta-keywords"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Switch
                                id="isPublished"
                                checked={formData.isPublished}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isPublished: checked })
                                }
                                data-testid="switch-is-published"
                            />
                            <Label htmlFor="isPublished">Published</Label>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDialogOpen(false);
                                    setEditingContent(null);
                                    resetForm();
                                }}
                                data-testid="button-cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={
                                    saveMutation.isPending ||
                                    !formData.pageKey ||
                                    !formData.pageName ||
                                    !formData.title ||
                                    !formData.content
                                }
                                data-testid="button-save"
                            >
                                {saveMutation.isPending
                                    ? "Saving..."
                                    : editingContent
                                    ? "Update"
                                    : "Create"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{previewContent?.title}</DialogTitle>
                    </DialogHeader>
                    <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{
                            __html: previewContent?.content || "",
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
