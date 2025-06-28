/**
 * Hardware-Optimized, Data-Free Quantization-Aware Training (QAT) Framework
 * TypeScript types and interfaces for OpenCog-Aligned Large Language Models
 */

// Quantization types supported by the framework
export enum QuantizationType {
  Q4_0 = 'q4_0',
  Q4_1 = 'q4_1', 
  Q5_0 = 'q5_0',
  Q5_1 = 'q5_1',
  Q8_0 = 'q8_0',
  Q8_1 = 'q8_1',
  Q2_K = 'q2_k',
  Q3_K = 'q3_k',
  Q4_K = 'q4_k',
  Q5_K = 'q5_k',
  Q6_K = 'q6_k',
  Q8_K = 'q8_k',
}

// Component-specific quantization strategies
export interface ComponentQuantizationStrategy {
  embeddings: QuantizationType;     // 8-bit uniform for embeddings
  attention: QuantizationType;      // 4-bit row-wise for attention
  ffn: QuantizationType;           // 6-bit group-wise for FFN
  layerNorm: QuantizationType;     // 8-bit uniform for layer norms
}

// QAT configuration structure
export interface QATConfig {
  // Architecture-aware quantization settings
  quantizationStrategy: ComponentQuantizationStrategy;
  
  // Training protocol settings
  syntheticCalibration: boolean;
  progressiveQuantization: boolean;
  klDivergenceLoss: boolean;
  
  // Performance targets
  targetAccuracy: number;        // 98% baseline accuracy
  targetMemoryReduction: number; // 75% memory reduction
  
  // Hardware optimization
  hardwareTarget: 'cpu' | 'gpu' | 'mixed';
  batchSize: number;
  learningRate: number;
}

// OpenCog components integration
export interface AtomSpaceConfig {
  atomCount: number;
  connectionCount: number;
  quantizedTruthValues: boolean;
}

export interface MOSESConfig {
  nodeCount: number;
  treeDepth: number;
  quantizedWeights: boolean;
  geneticOperationCompatibility: boolean;
}

export interface ECANConfig {
  elementCount: number;
  quantizedAttentionScores: boolean;
  importanceThreshold: number;
}

// OpenCog-aligned QAT framework configuration
export interface OpenCogQATConfig extends QATConfig {
  atomSpace: AtomSpaceConfig;
  moses: MOSESConfig;
  ecan: ECANConfig;
}

// Training metrics and performance tracking
export interface QATMetrics {
  accuracyLoss: number;
  memoryReduction: number;
  inferenceSpeedup: number;
  klDivergence: number;
  quantizationError: number;
}

// Layer information for progressive quantization
export interface LayerInfo {
  name: string;
  type: 'embedding' | 'attention' | 'ffn' | 'layernorm';
  size: number;
  quantized: boolean;
  quantizationType?: QuantizationType;
}

// Calibration data for data-free training
export interface CalibrationData {
  synthetic: boolean;
  samples: Float32Array[];
  distribution: 'gaussian' | 'uniform' | 'learned';
}