import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, Activity } from "lucide-react";

type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
  userName?: string;
};

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: logs = [], isLoading, error } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
  });

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="heading-activity-logs">
          <Activity className="w-5 h-5" />
          Activity Logs & Audit Trail
        </CardTitle>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-logs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" data-testid="loading-logs">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" data-testid={`skeleton-log-${i}`} />
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-destructive py-8" data-testid="error-logs">
            Failed to load activity logs. Please try again.
          </p>
        ) : filteredLogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-8" data-testid="empty-logs">
            No activity logs found
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border-l-4 border-primary pl-4 py-2" data-testid={`log-${log.id}`}>
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold" data-testid={`text-action-${log.id}`}>{log.action}</p>
                  <Badge variant="outline" data-testid={`badge-timestamp-${log.id}`}>
                    {new Date(log.timestamp).toLocaleString()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground" data-testid={`text-details-${log.id}`}>{log.details}</p>
                {log.userName && (
                  <p className="text-xs text-muted-foreground mt-1" data-testid={`text-user-${log.id}`}>
                    By: {log.userName}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
