/**
 * QAT Framework Demonstration Component
 * Interactive UI component for demonstrating quantization concepts
 */

import React, { useState, useEffect } from 'react';
import { QATFramework, OpenCogQATFramework, QATDemonstrator } from '~/lib/qat';
import type { QATMetrics, LayerInfo } from '~/lib/qat/types';

interface QATDemoProps {
  className?: string;
}

export const QATDemo: React.FC<QATDemoProps> = ({ className = '' }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    basic: { results: QATMetrics; layers: LayerInfo[] } | null;
    openCog: { results: QATMetrics; atomSpace: any; mosesTree: any; ecan: any } | null;
    strategies: any[] | null;
  }>({
    basic: null,
    openCog: null,
    strategies: null,
  });

  const runBasicDemo = async () => {
    setIsRunning(true);
    try {
      const result = await QATDemonstrator.demonstrateBasicQAT();
      setResults(prev => ({ ...prev, basic: result }));
    } catch (error) {
      console.error('Basic QAT demo failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runOpenCogDemo = async () => {
    setIsRunning(true);
    try {
      const result = await QATDemonstrator.demonstrateOpenCogQAT();
      setResults(prev => ({ ...prev, openCog: result }));
    } catch (error) {
      console.error('OpenCog QAT demo failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runStrategyComparison = async () => {
    setIsRunning(true);
    try {
      const result = await QATDemonstrator.compareQuantizationStrategies();
      setResults(prev => ({ ...prev, strategies: result.strategies }));
    } catch (error) {
      console.error('Strategy comparison failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const formatPercentage = (value: number) => (value * 100).toFixed(1) + '%';
  const formatNumber = (value: number, decimals = 2) => value.toFixed(decimals);

  return (
    <div className={`qat-demo ${className}`}>
      <div className="bg-bolt-elements-background-depth-2 p-6 rounded-lg border border-bolt-elements-borderColor">
        <h2 className="text-2xl font-bold text-bolt-elements-textPrimary mb-4">
          🧠 Hardware-Optimized QAT Framework Demo
        </h2>
        
        <p className="text-bolt-elements-textSecondary mb-6">
          Demonstrate data-free quantization-aware training for OpenCog-aligned large language models.
          This framework shows how to achieve significant memory reduction while preserving cognitive capabilities.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={runBasicDemo}
            disabled={isRunning}
            className="px-4 py-2 bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text rounded hover:bg-bolt-elements-button-primary-backgroundHover disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Basic QAT Demo'}
          </button>
          
          <button
            onClick={runOpenCogDemo}
            disabled={isRunning}
            className="px-4 py-2 bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text rounded hover:bg-bolt-elements-button-primary-backgroundHover disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'OpenCog QAT Demo'}
          </button>
          
          <button
            onClick={runStrategyComparison}
            disabled={isRunning}
            className="px-4 py-2 bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text rounded hover:bg-bolt-elements-button-primary-backgroundHover disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Compare Strategies'}
          </button>
        </div>

        {/* Basic QAT Results */}
        {results.basic && (
          <div className="mb-6 p-4 bg-bolt-elements-background-depth-3 rounded border">
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-3">
              🚀 Basic QAT Framework Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-bolt-elements-textSecondary">Memory Reduction:</span>
                <div className="text-green-400 font-semibold">
                  {formatPercentage(results.basic.results.memoryReduction)}
                </div>
              </div>
              <div>
                <span className="text-bolt-elements-textSecondary">Inference Speedup:</span>
                <div className="text-blue-400 font-semibold">
                  {formatNumber(results.basic.results.inferenceSpeedup)}x
                </div>
              </div>
              <div>
                <span className="text-bolt-elements-textSecondary">Accuracy Loss:</span>
                <div className="text-yellow-400 font-semibold">
                  {formatPercentage(results.basic.results.accuracyLoss)}
                </div>
              </div>
              <div>
                <span className="text-bolt-elements-textSecondary">KL Divergence:</span>
                <div className="text-purple-400 font-semibold">
                  {formatNumber(results.basic.results.klDivergence, 4)}
                </div>
              </div>
            </div>
            <div className="mt-3 text-xs text-bolt-elements-textSecondary">
              Quantized {results.basic.layers.length} layers with component-specific strategies
            </div>
          </div>
        )}

        {/* OpenCog QAT Results */}
        {results.openCog && (
          <div className="mb-6 p-4 bg-bolt-elements-background-depth-3 rounded border">
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-3">
              🧠 OpenCog-Aligned QAT Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
              <div>
                <span className="text-bolt-elements-textSecondary">Cognitive Memory:</span>
                <div className="text-green-400 font-semibold">
                  {formatPercentage(results.openCog.results.memoryReduction)}
                </div>
              </div>
              <div>
                <span className="text-bolt-elements-textSecondary">Hypergraph Speed:</span>
                <div className="text-blue-400 font-semibold">
                  {formatNumber(results.openCog.results.inferenceSpeedup)}x
                </div>
              </div>
              <div>
                <span className="text-bolt-elements-textSecondary">Truth Precision:</span>
                <div className="text-yellow-400 font-semibold">
                  {formatPercentage(results.openCog.results.accuracyLoss)}
                </div>
              </div>
              <div>
                <span className="text-bolt-elements-textSecondary">Atoms/Connections:</span>
                <div className="text-purple-400 font-semibold">
                  {results.openCog.atomSpace.atoms.length}/{results.openCog.atomSpace.connections.length}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              <div className="text-bolt-elements-textSecondary">
                AtomSpace: {formatNumber(results.openCog.atomSpace.metrics.averageTruthValue, 4)} avg truth
              </div>
              <div className="text-bolt-elements-textSecondary">
                MOSES: {results.openCog.mosesTree.nodes.length} nodes, depth {results.openCog.mosesTree.metrics.maxDepth}
              </div>
              <div className="text-bolt-elements-textSecondary">
                ECAN: {formatNumber(results.openCog.ecan.metrics.peakAttention, 4)} peak attention
              </div>
            </div>
          </div>
        )}

        {/* Strategy Comparison */}
        {results.strategies && (
          <div className="mb-6 p-4 bg-bolt-elements-background-depth-3 rounded border">
            <h3 className="text-lg font-semibold text-bolt-elements-textPrimary mb-3">
              ⚖️ Quantization Strategy Comparison
            </h3>
            <div className="space-y-2">
              {results.strategies.map((strategy, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-bolt-elements-background-depth-2 rounded text-sm">
                  <span className="font-medium text-bolt-elements-textPrimary">{strategy.name}</span>
                  <div className="flex gap-4 text-xs">
                    <span className="text-green-400">
                      Memory: {formatPercentage(strategy.results.memoryReduction)}
                    </span>
                    <span className="text-yellow-400">
                      Accuracy: -{formatPercentage(strategy.results.accuracyLoss)}
                    </span>
                    <span className="text-blue-400">
                      Speed: +{formatNumber(strategy.results.inferenceSpeedup)}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Panel */}
        <div className="mt-6 p-4 bg-bolt-elements-background-depth-1 rounded border border-bolt-elements-borderColor">
          <h4 className="text-md font-semibold text-bolt-elements-textPrimary mb-2">
            📋 QAT Framework Features
          </h4>
          <ul className="text-sm text-bolt-elements-textSecondary space-y-1">
            <li>• <strong>Data-Free Training:</strong> Synthetic calibration data generation</li>
            <li>• <strong>Progressive Quantization:</strong> Layer-wise quantization with minimal accuracy loss</li>
            <li>• <strong>Component-Specific:</strong> Optimized strategies for embeddings, attention, FFN, and layer norms</li>
            <li>• <strong>OpenCog Integration:</strong> AtomSpace, MOSES, and ECAN quantization support</li>
            <li>• <strong>Hardware Optimization:</strong> Target-specific optimization for CPU/GPU/mixed environments</li>
            <li>• <strong>KL Divergence:</strong> Information-theoretic loss minimization</li>
          </ul>
        </div>
      </div>
    </div>
  );
};