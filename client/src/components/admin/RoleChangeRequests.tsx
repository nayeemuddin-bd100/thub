import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, User, Home, Briefcase } from "lucide-react";
import { format } from "date-fns";

interface RoleChangeRequest {
  id: string;
  userId: string;
  requestedRole: string;
  status: "pending" | "approved" | "rejected";
  requestNote?: string;
  adminNote?: string;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

const roleConfig = {
  client: {
    label: "Client",
    icon: User,
    color: "text-blue-600 bg-blue-50",
  },
  property_owner: {
    label: "Property Owner",
    icon: Home,
    color: "text-green-600 bg-green-50",
  },
  service_provider: {
    label: "Service Provider",
    icon: Briefcase,
    color: "text-purple-600 bg-purple-50",
  },
};

export default function RoleChangeRequests() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RoleChangeRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [adminNote, setAdminNote] = useState("");

  const { data: requests, isLoading } = useQuery<RoleChangeRequest[]>({
    queryKey: ["/api/admin/role-change-requests", statusFilter],
    queryFn: async () => {
      const url = statusFilter === "all" 
        ? "/api/admin/role-change-requests"
        : `/api/admin/role-change-requests?status=${statusFilter}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      action, 
      adminNote 
    }: { 
      requestId: string; 
      action: "approve" | "reject"; 
      adminNote?: string;
    }) => {
      return await apiRequest("PUT", `/api/admin/role-change-request/${requestId}`, {
        action,
        adminNote,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/role-change-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Success",
        description: `Role change request ${reviewAction}d successfully.`,
      });
      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setAdminNote("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to process request.",
        variant: "destructive",
      });
    },
  });

  const handleReview = (request: RoleChangeRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setAdminNote("");
    setReviewDialogOpen(true);
  };

  const handleConfirmReview = () => {
    if (!selectedRequest) return;
    
    if (reviewAction === "reject" && !adminNote.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    reviewRequestMutation.mutate({
      requestId: selectedRequest.id,
      action: reviewAction,
      adminNote: adminNote.trim() || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredRequests = requests || [];
  const pendingCount = requests?.filter(r => r.status === "pending").length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Role Change Requests</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Review and manage user role change requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {pendingCount} Pending
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading requests...</div>
      ) : filteredRequests.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No role change requests found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const RoleIcon = roleConfig[request.requestedRole as keyof typeof roleConfig]?.icon || User;
            const roleInfo = roleConfig[request.requestedRole as keyof typeof roleConfig];
            
            return (
              <Card key={request.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${roleInfo?.color || "bg-gray-50"}`}>
                      <RoleIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground">
                          {request.user?.firstName && request.user?.lastName
                            ? `${request.user.firstName} ${request.user.lastName}`
                            : request.user?.email}
                        </h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Email:</span> {request.user?.email}
                        </p>
                        <p>
                          <span className="font-medium">Current Role:</span>{" "}
                          <Badge variant="secondary" className="ml-1">
                            {request.user?.role}
                          </Badge>
                        </p>
                        <p>
                          <span className="font-medium">Requested Role:</span>{" "}
                          <Badge className="ml-1">
                            {roleInfo?.label || request.requestedRole}
                          </Badge>
                        </p>
                        <p>
                          <span className="font-medium">Requested:</span>{" "}
                          {format(new Date(request.requestedAt), "PPp")}
                        </p>
                        {request.requestNote && (
                          <div className="mt-2 p-3 bg-muted/50 rounded-md">
                            <p className="font-medium text-sm">User's Note:</p>
                            <p className="text-sm mt-1">{request.requestNote}</p>
                          </div>
                        )}
                        {request.status !== "pending" && request.reviewedAt && (
                          <p>
                            <span className="font-medium">Reviewed:</span>{" "}
                            {format(new Date(request.reviewedAt), "PPp")}
                          </p>
                        )}
                        {request.adminNote && (
                          <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
                            <p className="font-medium text-sm">Admin Note:</p>
                            <p className="text-sm mt-1">{request.adminNote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleReview(request, "approve")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReview(request, "reject")}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === "approve" ? "Approve" : "Reject"} Role Change Request
            </DialogTitle>
            <DialogDescription>
              {reviewAction === "approve"
                ? "This will change the user's role and grant them the associated permissions."
                : "This will reject the role change request. Please provide a reason."}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">User:</span> {selectedRequest.user?.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Requested Role:</span>{" "}
                  {roleConfig[selectedRequest.requestedRole as keyof typeof roleConfig]?.label}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">
                  {reviewAction === "reject" ? "Rejection Reason *" : "Note (Optional)"}
                </Label>
                <Textarea
                  id="adminNote"
                  placeholder={
                    reviewAction === "reject"
                      ? "Explain why this request is being rejected..."
                      : "Add a note to the user (optional)..."
                  }
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={reviewRequestMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmReview}
              disabled={reviewRequestMutation.isPending}
              variant={reviewAction === "approve" ? "default" : "destructive"}
            >
              {reviewRequestMutation.isPending
                ? "Processing..."
                : reviewAction === "approve"
                ? "Approve Request"
                : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
