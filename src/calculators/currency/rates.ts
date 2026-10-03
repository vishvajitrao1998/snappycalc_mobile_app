// Free, key-less rates from open.er-api.com (updated daily; attribution to exchangerate-api.com is required).
const URL = 'https://open.er-api.com/v6/latest/USD';
const MAX_AGE_MS = 6 * 60 * 60 * 1000;

export type RateData = { rates: Record<string, number>; updated: string; fetchedAt: number };
let cache: RateData | null = null;

export async function loadRates(force = false): Promise<RateData> {
  if (cache && !force && Date.now() - cache.fetchedAt < MAX_AGE_MS) return cache;
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.result !== 'success' || !json.rates) throw new Error('Unexpected response');
  cache = { rates: json.rates, updated: json.time_last_update_utc ?? '', fetchedAt: Date.now() };
  return cache;
}

export const convert = (amount: number, from: string, to: string, rates: Record<string, number>) =>
  (amount / rates[from]) * rates[to];

export const POPULAR = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'AUD', 'CAD', 'SGD', 'CHF', 'CNY', 'SAR'];

export const NAMES: Record<string, string> = {
  INR: 'Indian Rupee', USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', AED: 'UAE Dirham', JPY: 'Japanese Yen',
  AUD: 'Australian Dollar', CAD: 'Canadian Dollar', SGD: 'Singapore Dollar', CHF: 'Swiss Franc', CNY: 'Chinese Yuan',
  SAR: 'Saudi Riyal', HKD: 'Hong Kong Dollar', NZD: 'New Zealand Dollar', KRW: 'South Korean Won', THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit', IDR: 'Indonesian Rupiah', PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka', LKR: 'Sri Lankan Rupee',
  NPR: 'Nepalese Rupee', QAR: 'Qatari Riyal', KWD: 'Kuwaiti Dinar', OMR: 'Omani Rial', BHD: 'Bahraini Dinar',
  ZAR: 'South African Rand', BRL: 'Brazilian Real', MXN: 'Mexican Peso', RUB: 'Russian Ruble', TRY: 'Turkish Lira',
  SEK: 'Swedish Krona', NOK: 'Norwegian Krone', DKK: 'Danish Krone', PLN: 'Polish Zloty', PHP: 'Philippine Peso',
  VND: 'Vietnamese Dong', EGP: 'Egyptian Pound', NGN: 'Nigerian Naira', KES: 'Kenyan Shilling', ILS: 'Israeli Shekel',
};
