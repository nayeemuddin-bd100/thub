import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  currencies: CurrencyInfo[];
  exchangeRates: ExchangeRates | null;
  convertPrice: (amount: number, fromCurrency: string) => number;
  formatPrice: (amount: number, fromCurrency?: string) => string;
  getCurrencySymbol: (currency: string) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<string>(() => {
    // Check localStorage first, then user preference, then default to USD
    return localStorage.getItem('preferredCurrency') || 'USD';
  });

  // Fetch supported currencies
  const { data: currencies = [] } = useQuery<CurrencyInfo[]>({
    queryKey: ['/api/currencies'],
    staleTime: Infinity, // Currencies list rarely changes
  });

  // Fetch exchange rates
  const { data: exchangeRates = null, isLoading: ratesLoading } = useQuery<ExchangeRates>({
    queryKey: ['/api/currencies/rates'],
    staleTime: 3600000, // 1 hour
    refetchInterval: 3600000, // Refetch every hour
  });

  // Update user preference mutation
  const updateCurrencyMutation = useMutation({
    mutationFn: async (newCurrency: string) => {
      const response = await apiRequest('PATCH', '/api/user/currency', { currency: newCurrency });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
  });

  // Set currency from user preference on login
  useEffect(() => {
    if (user && user.preferredCurrency) {
      setCurrencyState(user.preferredCurrency);
    }
  }, [user]);

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('preferredCurrency', newCurrency);
    
    // Update user preference if logged in
    if (user) {
      updateCurrencyMutation.mutate(newCurrency);
    }
  };

  const convertPrice = (amount: number, fromCurrency: string = 'USD'): number => {
    if (!exchangeRates || fromCurrency === currency) {
      return amount;
    }

    try {
      // Convert from source currency to USD, then USD to target currency
      const usdAmount = fromCurrency === 'USD' 
        ? amount 
        : amount / (exchangeRates.rates[fromCurrency] || 1);

      const targetAmount = currency === 'USD'
        ? usdAmount
        : usdAmount * (exchangeRates.rates[currency] || 1);

      return Math.round(targetAmount * 100) / 100;
    } catch (error) {
      console.error('Error converting currency:', error);
      return amount;
    }
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    const currencyInfo = currencies.find(c => c.code === currencyCode);
    return currencyInfo?.symbol || currencyCode;
  };

  const formatPrice = (amount: number, fromCurrency: string = 'USD'): string => {
    const convertedAmount = convertPrice(amount, fromCurrency);
    const symbol = getCurrencySymbol(currency);

    const formatted = convertedAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  };

  const value: CurrencyContextType = {
    currency,
    setCurrency,
    currencies,
    exchangeRates,
    convertPrice,
    formatPrice,
    getCurrencySymbol,
    isLoading: ratesLoading,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
