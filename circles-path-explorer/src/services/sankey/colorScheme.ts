// Generate consistent color for each token
export const getTokenColor = (tokenAddress: string): string => {
  let hash = 0;
  const str = tokenAddress.toLowerCase();
  
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Predefined colors for special cases
export const SPECIAL_COLORS = {
  source: '#7B3FF2',
  target: '#10B981',
  circular: '#F59E0B',
  default: '#94A3B8'
};

// Generate a gradient for value-based coloring
export const getValueGradient = (value: number, max: number): string => {
  const ratio = Math.min(value / max, 1);
  const hue = 120 - (ratio * 60); // Green to yellow
  return `hsl(${hue}, 70%, 50%)`;
};