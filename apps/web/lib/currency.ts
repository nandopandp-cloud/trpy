/**
 * Currency conversion using Open Exchange Rates (free tier, no key needed).
 * Falls back to 1:1 if the API is unavailable — avoids blocking trip operations.
 *
 * Rate cache: 1 hour TTL, stored in-process (resets on cold start).
 */

let ratesCache: { rates: Record<string, number>; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1h

export async function getExchangeRates(): Promise<Record<string, number>> {
  const now = Date.now();
  if (ratesCache && now - ratesCache.fetchedAt < CACHE_TTL_MS) {
    return ratesCache.rates;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('exchange rate API error');
    const data = await res.json();
    const rates: Record<string, number> = data.rates ?? {};
    ratesCache = { rates, fetchedAt: now };
    return rates;
  } catch {
    // Return empty — convertAmount will fall back to 1:1
    return ratesCache?.rates ?? {};
  }
}

/**
 * Convert `amount` from `fromCurrency` to `toCurrency`.
 * Returns the original amount if rates are unavailable or currencies are the same.
 */
export async function convertAmount(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency === toCurrency || amount === 0) return amount;

  const rates = await getExchangeRates();
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) return amount;

  // Convert via USD as base
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
}
