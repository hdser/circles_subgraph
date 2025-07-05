import { TX_HASH_REGEX, ADDRESS_REGEX } from './constants';
import { SearchType } from './types';

export const detectSearchType = (input: string): SearchType | null => {
  const cleanInput = input.trim().toLowerCase();
  
  if (TX_HASH_REGEX.test(cleanInput)) {
    return 'transaction';
  }
  
  if (ADDRESS_REGEX.test(cleanInput)) {
    return 'address';
  }
  
  return null;
};

export const isValidInput = (input: string, type: SearchType): boolean => {
  const cleanInput = input.trim().toLowerCase();
  
  if (type === 'transaction') {
    return TX_HASH_REGEX.test(cleanInput);
  }
  
  if (type === 'address') {
    return ADDRESS_REGEX.test(cleanInput);
  }
  
  return false;
};

export const getBlockExplorerUrl = (type: 'tx' | 'address', value: string): string => {
  const baseUrl = import.meta.env.VITE_BLOCK_EXPLORER_URL || 'https://gnosisscan.io';
  return `${baseUrl}/${type}/${value}`;
};

export const downloadData = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};