import { useCurrency } from '@/contexts/CurrencyContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

export default function CurrencySelector() {
  const { currency, setCurrency, currencies } = useCurrency();

  if (currencies.length === 0) {
    return null;
  }

  return (
    <Select value={currency} onValueChange={setCurrency}>
      <SelectTrigger className="w-[130px] h-9 text-sm">
        <div className="flex items-center gap-1.5">
          <DollarSign className="h-3.5 w-3.5" />
          <SelectValue>{currency}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((curr) => (
          <SelectItem key={curr.code} value={curr.code}>
            <div className="flex items-center justify-between gap-2 min-w-[150px]">
              <span className="font-medium">{curr.code}</span>
              <span className="text-xs text-muted-foreground">{curr.symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
