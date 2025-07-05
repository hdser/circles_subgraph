export const echartsTheme = {
  color: [
    '#7B3FF2', // Circles purple
    '#10B981', // Circles green
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#14B8A6', // Teal
  ],
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  title: {
    textStyle: {
      color: '#111827',
      fontSize: 18,
      fontWeight: 600,
    },
    subtextStyle: {
      color: '#6B7280',
      fontSize: 14,
    },
  },
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderColor: '#E5E7EB',
    borderWidth: 1,
    textStyle: {
      color: '#111827',
      fontSize: 12,
    },
    extraCssText: 'box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);',
  },
  toolbox: {
    iconStyle: {
      borderColor: '#9CA3AF',
    },
    emphasis: {
      iconStyle: {
        borderColor: '#6B7280',
      },
    },
  },
  label: {
    color: '#374151',
  },
};

// Export function to apply theme to an echarts instance
export const applyTheme = (echarts: any) => {
  echarts.registerTheme('circles', echartsTheme);
};