/**
 * QAT Framework Demonstration Utilities
 * Educational components for understanding quantization concepts
 */

import { QATFramework, OpenCogQATFramework } from './framework';
import type { QATConfig, LayerInfo, QATMetrics } from './types';

export class QATDemonstrator {
  /**
   * Demonstrate basic QAT framework with a simple model
   */
  static async demonstrateBasicQAT(): Promise<{
    framework: QATFramework;
    results: QATMetrics;
    layers: LayerInfo[];
  }> {
    console.log('🚀 Starting Basic QAT Framework Demonstration');
    console.log('='.repeat(50));
    
    // Initialize QAT framework
    const framework = new QATFramework({
      targetAccuracy: 0.98,
      targetMemoryReduction: 0.75,
      hardwareTarget: 'mixed',
    });
    
    // Define a simple transformer-like model structure
    const layerSpecs = [
      { name: 'token_embedding', type: 'embedding' as const, size: 50257 * 768 },
      { name: 'pos_embedding', type: 'embedding' as const, size: 1024 * 768 },
      { name: 'layer_0_attention', type: 'attention' as const, size: 768 * 768 * 4 },
      { name: 'layer_0_ffn', type: 'ffn' as const, size: 768 * 3072 * 2 },
      { name: 'layer_0_norm', type: 'layernorm' as const, size: 768 },
      { name: 'layer_1_attention', type: 'attention' as const, size: 768 * 768 * 4 },
      { name: 'layer_1_ffn', type: 'ffn' as const, size: 768 * 3072 * 2 },
      { name: 'layer_1_norm', type: 'layernorm' as const, size: 768 },
    ];
    
    framework.initializeLayers(layerSpecs);
    
    console.log(`📊 Model initialized with ${layerSpecs.length} layers`);
    console.log(`💾 Estimated original model size: ${(framework.estimateMemoryUsage().original / 1024 / 1024).toFixed(2)} MB`);
    
    // Generate synthetic calibration data
    console.log('\n🔄 Generating synthetic calibration data...');
    const calibrationData = framework.generateSyntheticCalibrationData(100);
    console.log(`✅ Generated ${calibrationData.samples.length} synthetic samples`);
    
    // Run progressive quantization
    console.log('\n⚡ Running progressive quantization...');
    const results = framework.progressiveQuantization();
    
    const memoryUsage = framework.estimateMemoryUsage();
    console.log(`\n📈 Final Results:`);
    console.log(`  Memory reduction: ${(results.memoryReduction * 100).toFixed(1)}%`);
    console.log(`  Inference speedup: ${results.inferenceSpeedup.toFixed(2)}x`);
    console.log(`  Accuracy loss: ${(results.accuracyLoss * 100).toFixed(2)}%`);
    console.log(`  KL divergence: ${results.klDivergence.toFixed(4)}`);
    console.log(`  Final model size: ${(memoryUsage.quantized / 1024 / 1024).toFixed(2)} MB`);
    
    return {
      framework,
      results,
      layers: framework.getLayers(),
    };
  }

  /**
   * Demonstrate OpenCog-aligned QAT with cognitive architectures
   */
  static async demonstrateOpenCogQAT(): Promise<{
    framework: OpenCogQATFramework;
    atomSpace: any;
    mosesTree: any;
    ecan: any;
    results: QATMetrics;
  }> {
    console.log('🧠 Starting OpenCog-Aligned QAT Demonstration');
    console.log('='.repeat(50));
    
    // Initialize OpenCog QAT framework
    const framework = new OpenCogQATFramework({
      targetAccuracy: 0.98,
      targetMemoryReduction: 0.75,
      atomSpace: {
        atomCount: 1000,
        connectionCount: 500,
        quantizedTruthValues: true,
      },
      moses: {
        nodeCount: 100,
        treeDepth: 6,
        quantizedWeights: true,
        geneticOperationCompatibility: true,
      },
      ecan: {
        elementCount: 512,
        quantizedAttentionScores: true,
        importanceThreshold: 0.5,
      },
    });
    
    // Initialize cognitive architecture layers
    const cognitiveLayerSpecs = [
      { name: 'concept_embedding', type: 'embedding' as const, size: 10000 * 512 },
      { name: 'predicate_embedding', type: 'embedding' as const, size: 5000 * 512 },
      { name: 'hypergraph_attention', type: 'attention' as const, size: 512 * 512 * 8 },
      { name: 'cognitive_ffn', type: 'ffn' as const, size: 512 * 2048 * 2 },
      { name: 'atom_norm', type: 'layernorm' as const, size: 512 },
      { name: 'truth_value_projection', type: 'ffn' as const, size: 512 * 1 },
    ];
    
    framework.initializeLayers(cognitiveLayerSpecs);
    
    console.log(`🧮 Cognitive model initialized with ${cognitiveLayerSpecs.length} layers`);
    
    // Create OpenCog components with quantization
    console.log('\n🌐 Creating OpenCog components...');
    
    const atomSpace = framework.createQuantizedAtomSpace();
    console.log(`  AtomSpace: ${atomSpace.atoms.length} atoms, ${atomSpace.connections.length} connections`);
    console.log(`  Connection density: ${(atomSpace.metrics.connectionDensity * 100).toFixed(2)}%`);
    
    const mosesTree = framework.createQuantizedMOSESTree();
    console.log(`  MOSES tree: ${mosesTree.nodes.length} nodes, max depth: ${mosesTree.metrics.maxDepth}`);
    
    const ecan = framework.createQuantizedECAN();
    console.log(`  ECAN: ${ecan.elements.length} elements, ${ecan.elements.filter(e => e.importance).length} important`);
    
    // Run quantization on cognitive layers
    console.log('\n⚡ Quantizing cognitive architecture...');
    const results = framework.progressiveQuantization();
    
    const memoryUsage = framework.estimateMemoryUsage();
    console.log(`\n🎯 OpenCog QAT Results:`);
    console.log(`  Cognitive memory reduction: ${(results.memoryReduction * 100).toFixed(1)}%`);
    console.log(`  Hypergraph inference speedup: ${results.inferenceSpeedup.toFixed(2)}x`);
    console.log(`  Truth value precision loss: ${(results.accuracyLoss * 100).toFixed(2)}%`);
    console.log(`  Cognitive model size: ${(memoryUsage.quantized / 1024 / 1024).toFixed(2)} MB`);
    
    return {
      framework,
      atomSpace,
      mosesTree,
      ecan,
      results,
    };
  }

  /**
   * Compare different quantization strategies
   */
  static async compareQuantizationStrategies(): Promise<{
    strategies: Array<{
      name: string;
      config: QATConfig;
      results: QATMetrics;
    }>;
  }> {
    console.log('⚖️  Comparing Quantization Strategies');
    console.log('='.repeat(50));
    
    const strategies = [
      {
        name: 'Conservative (8-bit uniform)',
        config: {
          quantizationStrategy: {
            embeddings: 'q8_0' as const,
            attention: 'q8_0' as const,
            ffn: 'q8_0' as const,
            layerNorm: 'q8_0' as const,
          },
        },
      },
      {
        name: 'Aggressive (4-bit mixed)',
        config: {
          quantizationStrategy: {
            embeddings: 'q4_k' as const,
            attention: 'q4_k' as const,
            ffn: 'q4_k' as const,
            layerNorm: 'q4_k' as const,
          },
        },
      },
      {
        name: 'Optimal (component-specific)',
        config: {
          quantizationStrategy: {
            embeddings: 'q8_0' as const,
            attention: 'q4_k' as const,
            ffn: 'q6_k' as const,
            layerNorm: 'q8_0' as const,
          },
        },
      },
    ];
    
    const results = [];
    
    for (const strategy of strategies) {
      console.log(`\n🔍 Testing ${strategy.name}...`);
      
      const framework = new QATFramework(strategy.config as any);
      framework.initializeLayers([
        { name: 'test_embedding', type: 'embedding', size: 1000 * 512 },
        { name: 'test_attention', type: 'attention', size: 512 * 512 * 4 },
        { name: 'test_ffn', type: 'ffn', size: 512 * 2048 * 2 },
        { name: 'test_norm', type: 'layernorm', size: 512 },
      ]);
      
      const metrics = framework.progressiveQuantization();
      
      console.log(`  Memory reduction: ${(metrics.memoryReduction * 100).toFixed(1)}%`);
      console.log(`  Accuracy loss: ${(metrics.accuracyLoss * 100).toFixed(2)}%`);
      console.log(`  Inference speedup: ${metrics.inferenceSpeedup.toFixed(2)}x`);
      
      results.push({
        name: strategy.name,
        config: strategy.config as any,
        results: metrics,
      });
    }
    
    console.log('\n📊 Strategy Comparison Summary:');
    results.forEach(result => {
      console.log(`${result.name}:`);
      console.log(`  Memory: -${(result.results.memoryReduction * 100).toFixed(1)}% | Accuracy: -${(result.results.accuracyLoss * 100).toFixed(2)}% | Speed: +${result.results.inferenceSpeedup.toFixed(2)}x`);
    });
    
    return { strategies: results };
  }

  /**
   * Demonstrate KL divergence loss calculation
   */
  static demonstrateKLDivergence(): {
    originalData: Float32Array;
    quantizedData: Float32Array;
    klDivergence: number;
    analysis: string;
  } {
    console.log('📐 Demonstrating KL Divergence Loss Calculation');
    console.log('='.repeat(50));
    
    const framework = new QATFramework();
    
    // Generate test data
    const size = 1000;
    const originalData = new Float32Array(size);
    const quantizedData = new Float32Array(size);
    
    // Fill with test pattern
    for (let i = 0; i < size; i++) {
      originalData[i] = Math.sin(i * 0.01) + 0.1 * Math.cos(i * 0.05);
      // Simulate quantization noise
      quantizedData[i] = originalData[i] + 0.05 * (Math.random() - 0.5);
    }
    
    const klDivergence = framework.calculateKLDivergenceLoss(originalData, quantizedData);
    
    let analysis = '';
    if (klDivergence < 0.01) {
      analysis = 'Excellent: Very low information loss';
    } else if (klDivergence < 0.1) {
      analysis = 'Good: Acceptable quantization quality';
    } else if (klDivergence < 0.5) {
      analysis = 'Fair: Noticeable but manageable loss';
    } else {
      analysis = 'Poor: Significant information loss';
    }
    
    console.log(`KL Divergence: ${klDivergence.toFixed(6)}`);
    console.log(`Quality Assessment: ${analysis}`);
    
    return {
      originalData,
      quantizedData,
      klDivergence,
      analysis,
    };
  }
}