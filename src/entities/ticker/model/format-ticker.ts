import {
  CHANGE_PCT_DIGITS,
  CHANGE_PLUS_SIGN,
  NUMBER_GROUP_PATTERN,
  THOUSANDS_SEPARATOR,
} from "@/shared/config";

export const formatPrice = (displayPrice: number) => {
  const [whole, fraction] = String(displayPrice).split(".");
  const grouped = whole.replace(NUMBER_GROUP_PATTERN, THOUSANDS_SEPARATOR);
  return fraction ? `${grouped}.${fraction}` : grouped;
};

export const formatChangePct = (changePct: number) => {
  const sign = changePct > 0 ? CHANGE_PLUS_SIGN : "";
  return `${sign}${changePct.toFixed(CHANGE_PCT_DIGITS)}%`;
};
