import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, TrendingUp, Gift, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";

interface LoyaltyPoints {
  id: string;
  userId: string;
  totalPoints: number;
  availablePoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  tier: string | null;
  nextTierPoints: number | null;
  pointsExpiringSoon: number | null;
  expirationDate: Date | null;
}

interface LoyaltyTransaction {
  id: string;
  userId: string;
  points: number;
  type: 'earned' | 'redeemed' | 'expired' | 'bonus';
  reason: string;
  bookingId: string | null;
  orderId: string | null;
  expirationDate: Date | null;
  createdAt: Date;
}

export default function LoyaltyPointsPage() {
  const { t } = useTranslation();
  const { data: loyaltyPoints, isLoading: pointsLoading } = useQuery<LoyaltyPoints>({
    queryKey: ['/api/loyalty-points'],
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<LoyaltyTransaction[]>({
    queryKey: ['/api/loyalty-points/history'],
  });

  const earnedTransactions = history.filter(t => t.type === 'earned' || t.type === 'bonus');
  const redeemedTransactions = history.filter(t => t.type === 'redeemed');
  const expiredTransactions = history.filter(t => t.type === 'expired');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('loyalty.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('loyalty.subtitle')}
          </p>
        </div>

        {/* Points Overview */}
        {pointsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : loyaltyPoints ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white" data-testid="card-available-points">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  {t('loyalty.available_points')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  <span className="text-3xl font-bold" data-testid="text-available-points">
                    {loyaltyPoints.availablePoints.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-lifetime-earned">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('loyalty.lifetime_earned')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-lifetime-earned">
                    {loyaltyPoints.lifetimeEarned.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-lifetime-redeemed">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {t('loyalty.lifetime_redeemed')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-lifetime-redeemed">
                    {loyaltyPoints.lifetimeRedeemed.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {loyaltyPoints.pointsExpiringSoon && loyaltyPoints.pointsExpiringSoon > 0 ? (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20" data-testid="card-expiring-soon">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {t('loyalty.expiring_soon')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="text-3xl font-bold text-orange-600 dark:text-orange-400" data-testid="text-expiring-points">
                      {loyaltyPoints.pointsExpiringSoon.toLocaleString()}
                    </span>
                  </div>
                  {loyaltyPoints.expirationDate && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1" data-testid="text-expiration-date">
                      {t('loyalty.expires', { date: format(new Date(loyaltyPoints.expirationDate), 'MMM d, yyyy') })}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card data-testid="card-tier">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('loyalty.current_tier')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-lg px-3 py-1" data-testid="badge-tier">
                    {loyaltyPoints.tier || t('loyalty.standard')}
                  </Badge>
                  {loyaltyPoints.nextTierPoints && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2" data-testid="text-next-tier">
                      {t('loyalty.points_to_next_tier', { points: loyaltyPoints.nextTierPoints })}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card className="mb-8">
            <CardContent className="text-center py-12">
              <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('loyalty.no_points_yet')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('loyalty.start_booking')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>{t('loyalty.points_history')}</CardTitle>
            <CardDescription>
              {t('loyalty.track_transactions')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="all" data-testid="tab-all">
                  {t('loyalty.all')} ({history.length})
                </TabsTrigger>
                <TabsTrigger value="earned" data-testid="tab-earned">
                  {t('loyalty.earned')} ({earnedTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="redeemed" data-testid="tab-redeemed">
                  {t('loyalty.redeemed')} ({redeemedTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="expired" data-testid="tab-expired">
                  {t('loyalty.expired')} ({expiredTransactions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <TransactionList transactions={history} isLoading={historyLoading} />
              </TabsContent>
              <TabsContent value="earned">
                <TransactionList transactions={earnedTransactions} isLoading={historyLoading} />
              </TabsContent>
              <TabsContent value="redeemed">
                <TransactionList transactions={redeemedTransactions} isLoading={historyLoading} />
              </TabsContent>
              <TabsContent value="expired">
                <TransactionList transactions={expiredTransactions} isLoading={historyLoading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* How to Earn Points */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t('loyalty.how_to_earn')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('loyalty.property_bookings')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('loyalty.property_bookings_desc')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('loyalty.service_orders')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('loyalty.service_orders_desc')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('loyalty.bonus_points')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('loyalty.bonus_points_desc')}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t('loyalty.point_expiration')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('loyalty.point_expiration_desc')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TransactionList({ transactions, isLoading }: { transactions: LoyaltyTransaction[], isLoading: boolean }) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400">{t('loyalty.no_transactions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          data-testid={`transaction-${transaction.id}`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction.type === 'earned' || transaction.type === 'bonus'
                ? 'bg-green-100 dark:bg-green-900'
                : transaction.type === 'redeemed'
                ? 'bg-purple-100 dark:bg-purple-900'
                : 'bg-gray-100 dark:bg-gray-800'
            }`}>
              {transaction.type === 'earned' || transaction.type === 'bonus' ? (
                <ArrowUp className="w-5 h-5 text-green-600" />
              ) : transaction.type === 'redeemed' ? (
                <ArrowDown className="w-5 h-5 text-purple-600" />
              ) : (
                <Calendar className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white" data-testid={`text-reason-${transaction.id}`}>
                {transaction.reason}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-date-${transaction.id}`}>
                {format(new Date(transaction.createdAt), 'MMM d, yyyy h:mm a')}
              </p>
              {transaction.expirationDate && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  {t('loyalty.expires', { date: format(new Date(transaction.expirationDate), 'MMM d, yyyy') })}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`text-lg font-bold ${
              transaction.type === 'earned' || transaction.type === 'bonus'
                ? 'text-green-600'
                : transaction.type === 'redeemed'
                ? 'text-purple-600'
                : 'text-gray-600'
            }`} data-testid={`text-points-${transaction.id}`}>
              {transaction.type === 'earned' || transaction.type === 'bonus' ? '+' : '-'}
              {Math.abs(transaction.points).toLocaleString()}
            </p>
            <Badge variant={
              transaction.type === 'earned' || transaction.type === 'bonus'
                ? 'default'
                : transaction.type === 'redeemed'
                ? 'secondary'
                : 'outline'
            } data-testid={`badge-type-${transaction.id}`}>
              {t(`loyalty.${transaction.type}`)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
