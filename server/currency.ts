// Currency conversion service with caching
// Uses exchangerate-api.io free tier (1500 requests/month)

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

// Popular currencies supported
export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED' },
];

class CurrencyService {
  private cache: Map<string, ExchangeRates> = new Map();
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds
  private readonly API_URL = 'https://open.er-api.com/v6/latest/USD';

  /**
   * Get exchange rates for USD base currency (cached)
   */
  async getExchangeRates(): Promise<ExchangeRates> {
    const cached = this.cache.get('USD');
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached;
    }

    try {
      const response = await fetch(this.API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      
      const rates: ExchangeRates = {
        base: 'USD',
        rates: data.rates,
        timestamp: Date.now(),
      };

      this.cache.set('USD', rates);
      return rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.log('Using expired cache due to API error');
        return cached;
      }

      // Fallback to 1:1 rates if no cache available
      console.log('Using fallback 1:1 exchange rates');
      return this.getFallbackRates();
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getExchangeRates();

    // Convert from source currency to USD, then USD to target currency
    const usdAmount = fromCurrency === 'USD' 
      ? amount 
      : amount / (rates.rates[fromCurrency] || 1);

    const targetAmount = toCurrency === 'USD'
      ? usdAmount
      : usdAmount * (rates.rates[toCurrency] || 1);

    return Math.round(targetAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Get exchange rate between two currencies
   */
  async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return 1;
    }

    const rates = await this.getExchangeRates();

    // Calculate cross rate
    const fromRate = rates.rates[fromCurrency] || 1;
    const toRate = rates.rates[toCurrency] || 1;

    return toRate / fromRate;
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currency: string): string {
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    const symbol = currencyInfo?.symbol || currency;

    // Format with thousands separator
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return `${symbol}${formatted}`;
  }

  /**
   * Get currency symbol
   */
  getCurrencySymbol(currency: string): string {
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    return currencyInfo?.symbol || currency;
  }

  /**
   * Get currency name
   */
  getCurrencyName(currency: string): string {
    const currencyInfo = SUPPORTED_CURRENCIES.find(c => c.code === currency);
    return currencyInfo?.name || currency;
  }

  /**
   * Check if currency is supported
   */
  isCurrencySupported(currency: string): boolean {
    return SUPPORTED_CURRENCIES.some(c => c.code === currency);
  }

  /**
   * Fallback rates when API is unavailable (all 1:1)
   */
  private getFallbackRates(): ExchangeRates {
    const rates: Record<string, number> = {};
    SUPPORTED_CURRENCIES.forEach(currency => {
      rates[currency.code] = 1;
    });

    return {
      base: 'USD',
      rates,
      timestamp: Date.now(),
    };
  }
}

export const currencyService = new CurrencyService();
