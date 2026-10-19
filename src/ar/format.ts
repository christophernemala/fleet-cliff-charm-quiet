const aed = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function money(value: number) {
  return aed.format(value || 0);
}

export function moneyCompact(value: number) {
  return compact.format(value || 0);
}

export function pct(value: number) {
  return `${value.toFixed(1)}%`;
}

export function round2(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
