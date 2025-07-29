import type { MardukDaemon } from '../types/marduk';

interface RecursiveAgent {
  id: string;
  namespace: string;
  arena: string;
  relations: Map<string, Function>;
}

export class RecursivePattern {
  private agents: Map<string, RecursiveAgent>;
  private arenas: Set<string>;
  
  constructor() {
    this.agents = new Map();
    this.arenas = new Set(['ElizaOS', 'bolt.echo', 'app']);
  }

  registerAgent(agent: RecursiveAgent) {
    if (!this.arenas.has(agent.arena)) {
      throw new Error(`Arena ${agent.arena} not recognized`);
    }
    this.agents.set(agent.id, agent);
  }

  // Recursive namespace resolution following Marduk pattern
  resolveNamespace(path: string[]): string {
    return path.reduce((ns, segment) => {
      const agent = this.agents.get(segment);
      if (agent) {
        return `${ns}/${agent.namespace}`;
      }
      return `${ns}/${segment}`;
    }, '');
  }

  // Arena boundary enforcement
  validateBoundary(agent: string, target: string): boolean {
    const sourceAgent = this.agents.get(agent);
    const targetAgent = this.agents.get(target);
    
    if (!sourceAgent || !targetAgent) {
      return false;
    }

    // Check if target is in allowed arena
    return sourceAgent.arena === targetAgent.arena || 
           this.arenas.has(targetAgent.arena);
  }
}
