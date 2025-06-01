import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CurrencyConverterProps {
  toolInvocation: {
    args: {
      amount?: string;
      from: string;
      to: string;
    };
  };
  result?: {
    rate: string | number;
  } | null;
}

export const CurrencyConverter = ({ toolInvocation, result }: CurrencyConverterProps) => {
  const [amount, setAmount] = useState<string>(toolInvocation.args.amount || "1");
  const [error, setError] = useState<string | null>(null);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty string for better UX
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null);
    } else {
      setError("Please enter a valid number");
    }
  }, []);

  // Memoize expensive calculations
  const { convertedAmount, rate, isValidAmount } = useMemo(() => {
    const numAmount = parseFloat(amount);
    const numRate = result ? parseFloat(result.rate.toString()) : null;
    
    return {
      convertedAmount: result && numRate && !isNaN(numAmount) && numAmount > 0 
        ? numRate * numAmount 
        : null,
      rate: numRate,
      isValidAmount: !isNaN(numAmount) && numAmount > 0
    };
  }, [amount, result]);

  // Format currency with proper localization
  const formatCurrency = useCallback((value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }, []);

  const { fromCurrency, toCurrency } = toolInvocation.args;

  return (
    <Card className="w-full bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">
          Convert {fromCurrency} to {toCurrency}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              className="pl-12 h-12 text-lg"
              placeholder="Enter amount"
              aria-label={`Amount in ${fromCurrency}`}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-500">
              {fromCurrency}
            </span>
          </div>
          
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-500"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Result Display */}
        <div className="space-y-2">
          {!result ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-neutral-500"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Getting latest rates...</span>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {convertedAmount !== null && isValidAmount ? (
                  <>
                    <div className="text-2xl font-semibold" aria-live="polite">
                      {formatCurrency(convertedAmount, toCurrency)} {toCurrency}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                      <span>
                        1 {fromCurrency} = {rate?.toFixed(4)} {toCurrency}
                      </span>
                      {rate && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {rate > 1 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" aria-label="Strong rate" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" aria-label="Weak rate" />
                          )}
                        </motion.div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-lg text-neutral-400">
                    Enter a valid amount to see conversion
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
