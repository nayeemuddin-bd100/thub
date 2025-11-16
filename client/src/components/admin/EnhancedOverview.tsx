import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    Building,
    DollarSign,
    TrendingUp,
    Users,
    Briefcase,
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface DashboardStats {
    totalUsers: number;
    totalProperties: number;
    totalServiceProviders: number;
    totalBookings: number;
    totalRevenue: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
    bookingTrends: Array<{ month: string; bookings: number }>;
    userRoleDistribution: Array<{ role: string; count: number }>;
    recentActivities: Array<{
        id: string;
        activityType: string;
        description: string;
        createdAt: string;
        user?: { firstName?: string; lastName?: string; email: string };
    }>;
    topProperties: Array<{
        id: string;
        title: string;
        location: string;
        bookingCount: number;
        revenue: number;
    }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0'];

export default function EnhancedOverview() {
    const { data: stats, isLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboardStats"],
        queryFn: async () => {
            const response = await apiRequest("GET", "/api/admin/dashboard-stats");
            return response.json();
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
                    <div className="h-64 bg-muted rounded-lg animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                Total Users
                            </p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                                {stats?.totalUsers || 0}
                            </p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                <TrendingUp className="inline w-3 h-3 mr-1" />
                                +12% from last month
                            </p>
                        </div>
                        <Users className="w-12 h-12 text-blue-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Properties
                            </p>
                            <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                                {stats?.totalProperties || 0}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                <TrendingUp className="inline w-3 h-3 mr-1" />
                                +8% from last month
                            </p>
                        </div>
                        <Building className="w-12 h-12 text-green-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                                Service Providers
                            </p>
                            <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">
                                {stats?.totalServiceProviders || 0}
                            </p>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                <TrendingUp className="inline w-3 h-3 mr-1" />
                                +15% from last month
                            </p>
                        </div>
                        <Briefcase className="w-12 h-12 text-purple-500 opacity-50" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                                Total Revenue
                            </p>
                            <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-2">
                                ${(stats?.totalRevenue || 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                <TrendingUp className="inline w-3 h-3 mr-1" />
                                +23% from last month
                            </p>
                        </div>
                        <DollarSign className="w-12 h-12 text-orange-500 opacity-50" />
                    </div>
                </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Monthly Revenue Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={stats?.monthlyRevenue || []}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                {/* Booking Trends */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Booking Trends
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={stats?.bookingTrends || []}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="bookings"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Role Distribution */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        User Role Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={stats?.userRoleDistribution || []}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ role, count }) => `${role}: ${count}`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                            >
                                {(stats?.userRoleDistribution || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* Top Properties */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        Top Performing Properties
                    </h3>
                    <div className="space-y-3">
                        {(stats?.topProperties || []).slice(0, 5).map((property, index) => (
                            <div
                                key={property.id}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{property.title}</p>
                                        <p className="text-xs text-muted-foreground">{property.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">${property.revenue.toLocaleString()}</p>
                                    <p className="text-xs text-muted-foreground">{property.bookingCount} bookings</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Recent Activity
                </h3>
                <div className="space-y-3">
                    {(stats?.recentActivities || []).slice(0, 10).map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                        >
                            <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-xs text-muted-foreground">
                                        {activity.user?.firstName || activity.user?.email}
                                    </p>
                                    <span className="text-xs text-muted-foreground">•</span>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(activity.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                                {activity.activityType}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
