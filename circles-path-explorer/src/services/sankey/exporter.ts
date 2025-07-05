import * as echarts from 'echarts';

export const exportChartAsImage = async (
  chartInstance: echarts.ECharts,
  filename: string = 'circles-path-flow',
  format: 'png' | 'svg' = 'png'
): Promise<void> => {
  if (!chartInstance) {
    throw new Error('Chart instance not found');
  }

  const url = chartInstance.getDataURL({
    type: format,
    pixelRatio: 2,
    backgroundColor: '#fff'
  });

  const link = document.createElement('a');
  link.download = `${filename}.${format}`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportChartData = (data: any, filename: string = 'circles-path-data'): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.download = `${filename}.json`;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};