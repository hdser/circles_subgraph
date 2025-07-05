import { Download, Image, FileJson } from 'lucide-react';
import * as echarts from 'echarts';
import { exportChartAsImage, exportChartData } from '../../services/sankey/exporter';
import toast from 'react-hot-toast';

interface ExportControlsProps {
  chartInstance: echarts.ECharts | null;
  data: any;
}

export default function ExportControls({ chartInstance, data }: ExportControlsProps) {
  const handleExportPNG = async () => {
    if (!chartInstance) {
      toast.error('Chart not ready');
      return;
    }

    try {
      await exportChartAsImage(chartInstance, 'circles-path-flow', 'png');
      toast.success('Image exported successfully');
    } catch (error) {
      toast.error('Failed to export image');
    }
  };

  const handleExportSVG = async () => {
    if (!chartInstance) {
      toast.error('Chart not ready');
      return;
    }

    try {
      await exportChartAsImage(chartInstance, 'circles-path-flow', 'svg');
      toast.success('SVG exported successfully');
    } catch (error) {
      toast.error('Failed to export SVG');
    }
  };

  const handleExportData = () => {
    try {
      exportChartData(data, 'circles-path-data');
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleExportPNG}
        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Export as PNG"
      >
        <Image className="h-4 w-4" />
        <span>PNG</span>
      </button>
      
      <button
        onClick={handleExportSVG}
        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Export as SVG"
      >
        <Download className="h-4 w-4" />
        <span>SVG</span>
      </button>
      
      <button
        onClick={handleExportData}
        className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Export JSON data"
      >
        <FileJson className="h-4 w-4" />
        <span>JSON</span>
      </button>
    </div>
  );
}