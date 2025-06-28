/**
 * Test suite for Hardware-Optimized Data-Free Quantization-Aware Training (QAT) Framework
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { QATFramework, OpenCogQATFramework, QATDemonstrator } from '../qat';
import { QuantizationType } from '../qat/types';

describe('QAT Framework', () => {
  let framework: QATFramework;

  beforeEach(() => {
    framework = new QATFramework();
  });

  describe('Initialization', () => {
    it('should initialize with default configuration', () => {
      expect(framework).toBeDefined();
      expect(framework.getMetrics()).toEqual({
        accuracyLoss: 0,
        memoryReduction: 0,
        inferenceSpeedup: 0,
        klDivergence: 0,
        quantizationError: 0,
      });
    });

    it('should accept custom configuration', () => {
      const customFramework = new QATFramework({
        targetAccuracy: 0.95,
        targetMemoryReduction: 0.8,
        hardwareTarget: 'gpu',
      });
      expect(customFramework).toBeDefined();
    });
  });

  describe('Layer Management', () => {
    it('should initialize layers correctly', () => {
      const layerSpecs = [
        { name: 'embedding', type: 'embedding' as const, size: 1000 },
        { name: 'attention', type: 'attention' as const, size: 2000 },
      ];
      
      framework.initializeLayers(layerSpecs);
      const layers = framework.getLayers();
      
      expect(layers).toHaveLength(2);
      expect(layers[0].name).toBe('embedding');
      expect(layers[0].type).toBe('embedding');
      expect(layers[0].size).toBe(1000);
      expect(layers[0].quantized).toBe(false);
    });
  });

  describe('Synthetic Data Generation', () => {
    it('should generate synthetic calibration data', () => {
      const calibrationData = framework.generateSyntheticCalibrationData(10);
      
      expect(calibrationData.synthetic).toBe(true);
      expect(calibrationData.samples).toHaveLength(10);
      expect(calibrationData.distribution).toBe('learned');
      expect(calibrationData.samples[0]).toBeInstanceOf(Float32Array);
      expect(calibrationData.samples[0]).toHaveLength(512);
    });

    it('should generate different samples each time', () => {
      const data1 = framework.generateSyntheticCalibrationData(5);
      const data2 = framework.generateSyntheticCalibrationData(5);
      
      // Check that samples are different
      const sample1 = Array.from(data1.samples[0]);
      const sample2 = Array.from(data2.samples[0]);
      expect(sample1).not.toEqual(sample2);
    });
  });

  describe('Progressive Quantization', () => {
    beforeEach(() => {
      framework.initializeLayers([
        { name: 'test_embedding', type: 'embedding', size: 1000 },
        { name: 'test_attention', type: 'attention', size: 2000 },
        { name: 'test_ffn', type: 'ffn', size: 3000 },
        { name: 'test_norm', type: 'layernorm', size: 100 },
      ]);
    });

    it('should quantize all layers progressively', () => {
      const metrics = framework.progressiveQuantization();
      const layers = framework.getLayers();
      
      // All layers should be quantized
      expect(layers.every(layer => layer.quantized)).toBe(true);
      expect(layers.every(layer => layer.quantizationType)).toBeTruthy();
      
      // Metrics should be reasonable
      expect(metrics.memoryReduction).toBeGreaterThan(0);
      expect(metrics.memoryReduction).toBeLessThan(1);
      expect(metrics.accuracyLoss).toBeGreaterThanOrEqual(0);
      expect(metrics.inferenceSpeedup).toBeGreaterThan(1);
    });

    it('should use correct quantization types for different layer types', () => {
      framework.progressiveQuantization();
      const layers = framework.getLayers();
      
      const embedding = layers.find(l => l.type === 'embedding');
      const attention = layers.find(l => l.type === 'attention');
      const ffn = layers.find(l => l.type === 'ffn');
      const norm = layers.find(l => l.type === 'layernorm');
      
      expect(embedding?.quantizationType).toBe(QuantizationType.Q8_0);
      expect(attention?.quantizationType).toBe(QuantizationType.Q4_K);
      expect(ffn?.quantizationType).toBe(QuantizationType.Q6_K);
      expect(norm?.quantizationType).toBe(QuantizationType.Q8_0);
    });
  });

  describe('Memory Usage Estimation', () => {
    beforeEach(() => {
      framework.initializeLayers([
        { name: 'test_layer', type: 'embedding', size: 1000 },
      ]);
    });

    it('should calculate memory usage before quantization', () => {
      const usage = framework.estimateMemoryUsage();
      
      expect(usage.original).toBe(1000 * 4); // 1000 weights * 4 bytes per float32
      expect(usage.quantized).toBe(1000 * 4); // Not quantized yet
      expect(usage.reduction).toBe(0);
    });

    it('should calculate memory usage after quantization', () => {
      framework.progressiveQuantization();
      const usage = framework.estimateMemoryUsage();
      
      expect(usage.original).toBe(1000 * 4);
      expect(usage.quantized).toBeLessThan(usage.original);
      expect(usage.reduction).toBeGreaterThan(0);
    });
  });

  describe('KL Divergence Calculation', () => {
    it('should calculate KL divergence between arrays', () => {
      const original = new Float32Array([1, 2, 3, 4, 5]);
      const quantized = new Float32Array([1.1, 1.9, 3.1, 3.9, 5.1]);
      
      const klDiv = framework.calculateKLDivergenceLoss(original, quantized);
      
      expect(klDiv).toBeGreaterThanOrEqual(0);
      expect(isFinite(klDiv)).toBe(true);
    });

    it('should handle identical arrays', () => {
      const data = new Float32Array([1, 2, 3, 4, 5]);
      const klDiv = framework.calculateKLDivergenceLoss(data, data);
      
      expect(klDiv).toBeLessThan(0.001); // Should be very small (numerical precision)
    });

    it('should throw error for arrays of different lengths', () => {
      const array1 = new Float32Array([1, 2, 3]);
      const array2 = new Float32Array([1, 2]);
      
      expect(() => {
        framework.calculateKLDivergenceLoss(array1, array2);
      }).toThrow('Arrays must have same length for KL divergence calculation');
    });
  });
});

describe('OpenCog QAT Framework', () => {
  let openCogFramework: OpenCogQATFramework;

  beforeEach(() => {
    openCogFramework = new OpenCogQATFramework({
      atomSpace: { atomCount: 100, connectionCount: 50, quantizedTruthValues: true },
      moses: { nodeCount: 50, treeDepth: 4, quantizedWeights: true, geneticOperationCompatibility: true },
      ecan: { elementCount: 256, quantizedAttentionScores: true, importanceThreshold: 0.5 },
    });
  });

  describe('AtomSpace Creation', () => {
    it('should create quantized AtomSpace', () => {
      const atomSpace = openCogFramework.createQuantizedAtomSpace();
      
      expect(atomSpace.atoms).toHaveLength(100);
      expect(atomSpace.connections).toHaveLength(50);
      expect(atomSpace.metrics.averageTruthValue).toBeGreaterThan(0);
      expect(atomSpace.metrics.averageTruthValue).toBeLessThanOrEqual(1);
      expect(atomSpace.metrics.connectionDensity).toBeGreaterThan(0);
      
      // Check that atoms have required properties
      const atom = atomSpace.atoms[0];
      expect(atom).toHaveProperty('id');
      expect(atom).toHaveProperty('truthValue');
      expect(atom).toHaveProperty('type');
      expect(typeof atom.truthValue).toBe('number');
    });

    it('should create valid connections between atoms', () => {
      const atomSpace = openCogFramework.createQuantizedAtomSpace();
      
      atomSpace.connections.forEach(connection => {
        expect(connection.from).toBeGreaterThanOrEqual(0);
        expect(connection.from).toBeLessThan(100);
        expect(connection.to).toBeGreaterThanOrEqual(0);
        expect(connection.to).toBeLessThan(100);
        expect(connection.from).not.toBe(connection.to);
        expect(connection.strength).toBeGreaterThanOrEqual(0);
        expect(connection.strength).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('MOSES Tree Creation', () => {
    it('should create quantized MOSES tree', () => {
      const mosesTree = openCogFramework.createQuantizedMOSESTree();
      
      expect(mosesTree.nodes).toHaveLength(50);
      expect(mosesTree.metrics.averageWeight).toBeGreaterThan(0);
      expect(mosesTree.metrics.maxDepth).toBeGreaterThanOrEqual(0);
      expect(mosesTree.metrics.maxDepth).toBeLessThan(4);
      
      // Check node properties
      const node = mosesTree.nodes[0];
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('weight');
      expect(node).toHaveProperty('operation');
      expect(node).toHaveProperty('depth');
      expect(typeof node.weight).toBe('number');
      expect(typeof node.operation).toBe('string');
    });
  });

  describe('ECAN Creation', () => {
    it('should create quantized ECAN attention mechanism', () => {
      const ecan = openCogFramework.createQuantizedECAN();
      
      expect(ecan.elements).toHaveLength(256);
      expect(ecan.metrics.peakAttention).toBeGreaterThan(0);
      expect(ecan.metrics.peakAttention).toBeLessThanOrEqual(1);
      expect(ecan.metrics.averageImportance).toBeGreaterThanOrEqual(0);
      expect(ecan.metrics.averageImportance).toBeLessThanOrEqual(1);
      
      // Check element properties
      const element = ecan.elements[0];
      expect(element).toHaveProperty('id');
      expect(element).toHaveProperty('attentionScore');
      expect(element).toHaveProperty('importance');
      expect(typeof element.attentionScore).toBe('number');
      expect([0, 1]).toContain(element.importance);
    });
  });
});

describe('QAT Demonstrator', () => {
  describe('Basic QAT Demonstration', () => {
    it('should run basic QAT demonstration without errors', async () => {
      const result = await QATDemonstrator.demonstrateBasicQAT();
      
      expect(result.framework).toBeInstanceOf(QATFramework);
      expect(result.results).toBeDefined();
      expect(result.layers).toHaveLength(8);
      expect(result.results.memoryReduction).toBeGreaterThan(0);
    });
  });

  describe('OpenCog QAT Demonstration', () => {
    it('should run OpenCog QAT demonstration without errors', async () => {
      const result = await QATDemonstrator.demonstrateOpenCogQAT();
      
      expect(result.framework).toBeInstanceOf(OpenCogQATFramework);
      expect(result.atomSpace).toBeDefined();
      expect(result.mosesTree).toBeDefined();
      expect(result.ecan).toBeDefined();
      expect(result.results).toBeDefined();
    });
  });

  describe('Strategy Comparison', () => {
    it('should compare different quantization strategies', async () => {
      const result = await QATDemonstrator.compareQuantizationStrategies();
      
      expect(result.strategies).toHaveLength(3);
      expect(result.strategies[0].name).toBe('Conservative (8-bit uniform)');
      expect(result.strategies[1].name).toBe('Aggressive (4-bit mixed)');
      expect(result.strategies[2].name).toBe('Optimal (component-specific)');
      
      // Each strategy should have results
      result.strategies.forEach(strategy => {
        expect(strategy.results).toBeDefined();
        expect(strategy.results.memoryReduction).toBeGreaterThan(0);
      });
    });
  });

  describe('KL Divergence Demonstration', () => {
    it('should demonstrate KL divergence calculation', () => {
      const result = QATDemonstrator.demonstrateKLDivergence();
      
      expect(result.originalData).toBeInstanceOf(Float32Array);
      expect(result.quantizedData).toBeInstanceOf(Float32Array);
      expect(result.originalData).toHaveLength(1000);
      expect(result.quantizedData).toHaveLength(1000);
      expect(result.klDivergence).toBeGreaterThanOrEqual(0);
      expect(result.analysis).toBeTruthy();
      expect(typeof result.analysis).toBe('string');
    });
  });
});