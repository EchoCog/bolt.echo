/**
 * Hardware-Optimized, Data-Free Quantization-Aware Training (QAT) Framework
 * for OpenCog-Aligned Large Language Models
 * 
 * This module provides TypeScript/JavaScript implementation of quantization concepts
 * that can be used within the bolt.echo AI development platform.
 */

// Core types and interfaces
export * from './types';

// Main framework implementation
export { QATFramework, OpenCogQATFramework } from './framework';

// Demonstration utilities
export { QATDemonstrator } from './demonstrator';

// Version and metadata
export const QAT_VERSION = '1.0.0';
export const QAT_DESCRIPTION = 'Hardware-Optimized, Data-Free Quantization-Aware Training Framework for OpenCog-Aligned LLMs';