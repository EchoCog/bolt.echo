interface RecursiveAgent {
  id: string;
  namespace: string;
  arena: string;
  relations: Map<string, (...args: any[]) => any>;
}

export class RecursivePattern {
  private _agents: Map<string, RecursiveAgent>;
  private _arenas: Set<string>;

  constructor() {
    this._agents = new Map();
    this._arenas = new Set(['ElizaOS', 'bolt.echo', 'app']);
  }

  registerAgent(agent: RecursiveAgent) {
    if (!this._arenas.has(agent.arena)) {
      throw new Error(`Arena ${agent.arena} not recognized`);
    }

    this._agents.set(agent.id, agent);
  }

  // recursive namespace resolution following Marduk pattern
  resolveNamespace(path: string[]): string {
    return path.reduce((ns, segment) => {
      const agent = this._agents.get(segment);

      if (agent) {
        return `${ns}/${agent.namespace}`;
      }

      return `${ns}/${segment}`;
    }, '');
  }

  // arena boundary enforcement
  validateBoundary(agent: string, target: string): boolean {
    const sourceAgent = this._agents.get(agent);
    const targetAgent = this._agents.get(target);

    if (!sourceAgent || !targetAgent) {
      return false;
    }

    // check if target is in allowed arena
    return sourceAgent.arena === targetAgent.arena || this._arenas.has(targetAgent.arena);
  }
}
