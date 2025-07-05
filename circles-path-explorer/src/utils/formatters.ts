import { format, formatDistance } from 'date-fns';

export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatCRC = (value: string | number): string => {
  // Format with thousand separators
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value));
};

export const weiToCrc = (wei: string): number => {
  return Number(wei) / 1e18;
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(Number(timestamp) * 1000);
  return format(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(Number(timestamp) * 1000);
  return formatDistance(date, new Date(), { addSuffix: true });
};

export const formatBlockNumber = (blockNumber: string): string => {
  return new Intl.NumberFormat('en-US').format(Number(blockNumber));
};

export const truncateMiddle = (str: string, startLen: number = 6, endLen: number = 4): string => {
  if (str.length <= startLen + endLen) return str;
  return `${str.slice(0, startLen)}...${str.slice(-endLen)}`;
};