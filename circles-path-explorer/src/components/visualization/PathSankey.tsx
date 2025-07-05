import { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { TransferPath } from '../../utils/types';
import { formatAddress, formatCRC, weiToCrc } from '../../utils/formatters';
import { useSankeyData } from '../../hooks/useSankeyData';
import LoadingSpinner from '../common/LoadingSpinner';
import ExportControls from './ExportControls';
import TokenLegend from './TokenLegend';

interface PathSankeyProps {
  path: TransferPath;
}

export default function PathSankey({ path }: PathSankeyProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const { sankeyData, loading } = useSankeyData(path);

  // Debug logging
  console.log('PathSankey - path:', path);
  console.log('PathSankey - sankeyData:', sankeyData);
  console.log('PathSankey - transferHops:', path.transferHops);

  useEffect(() => {
    if (!chartRef.current || !sankeyData || loading) return;

    // Validate sankeyData
    if (!sankeyData.nodes || sankeyData.nodes.length === 0 || !sankeyData.links || sankeyData.links.length === 0) {
      console.error('Invalid sankey data:', sankeyData);
      return;
    }

    // Initialize or get existing chart instance
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    try {
      const option: echarts.EChartsOption = {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove',
          formatter: function(params: any) {
            if (params.dataType === 'node') {
              const node = params.data;
              const addr = node.name;
              let tooltip = `<strong>${node.label || formatAddress(addr)}</strong>`;
              if (node.label) {
                tooltip += `<br/><span style="color: #999">${addr}</span>`;
              }
              if (node.avatarType) {
                tooltip += `<br/>Type: ${node.avatarType}`;
              }
              return tooltip;
            } else if (params.dataType === 'edge') {
              const link = params.data;
              return `<strong>Transfer</strong><br/>
                      Amount: ${formatCRC(link.value)} CRC<br/>
                      From: ${formatAddress(link.source)}<br/>
                      To: ${formatAddress(link.target)}<br/>
                      Token: ${formatAddress(link.tokenOwner)}`;
            }
          }
        },
        toolbox: {
          show: true,
          feature: {
            restore: { show: true, title: 'Reset' },
            saveAsImage: { 
              show: true, 
              title: 'Save as Image',
              pixelRatio: 2,
              backgroundColor: '#fff'
            }
          },
          right: 10,
          top: 10
        },
        series: [
          {
            type: 'sankey',
            data: sankeyData.nodes,
            links: sankeyData.links,
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                opacity: 0.8
              }
            },
            lineStyle: {
              curveness: 0.5
            },
            label: {
              show: true,
              position: 'right',
              formatter: function(params: any) {
                const node = params.data;
                return node.label || formatAddress(node.name);
              },
              fontSize: 11,
              overflow: 'truncate',
              width: 100
            },
            itemStyle: {
              borderWidth: 1,
              borderColor: '#aaa'
            },
            nodeWidth: 16,
            nodeGap: 12,
            layoutIterations: 32,
            left: 20,
            right: 120,
            top: 20,
            bottom: 20,
            orient: 'horizontal',
            draggable: true
          }
        ]
      };

      console.log('Setting ECharts option:', option);
      chartInstance.current.setOption(option, true);

      // Ensure the chart is properly sized initially
      setTimeout(() => {
        chartInstance.current?.resize();
      }, 100);
    } catch (error) {
      console.error('Error rendering Sankey chart:', error);
    }

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [sankeyData, loading]);

  // Add ResizeObserver for better responsiveness
  useEffect(() => {
    if (!chartRef.current || !chartInstance.current) return;

    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });

    resizeObserver.observe(chartRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!sankeyData || !path.transferHops || path.transferHops.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        <p>No visualization data available</p>
        <p className="text-sm mt-2">Transfer hops: {path.transferHops?.length || 0}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Transfer Flow Visualization</h3>
        <ExportControls 
          chartInstance={chartInstance.current} 
          data={{ path, sankeyData }}
        />
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div 
          ref={chartRef} 
          style={{ width: '100%', height: '500px' }}
        />
      </div>

      {path.transferHops.length > 0 && (
        <TokenLegend transferHops={path.transferHops} />
      )}
    </div>
  );
}