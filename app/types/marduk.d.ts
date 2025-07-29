// types for Marduk integration
export interface MardukAgent {
  id: string;
  arena: string;
  namespace: string;
  relations: {
    [key: string]: (...args: any[]) => any;
  };
}

export interface MardukArena {
  id: string;
  agents: Set<string>;
  boundaries: Map<string, string[]>;
}

export interface MardukRelation {
  source: string;
  target: string;
  type: 'namespace' | 'boundary' | 'permission';
  rules: any[];
}

// recursive pattern types
export interface RecursiveNamespace {
  path: string[];
  arena: string;
  agent: string;
}

export interface BoundaryRule {
  arena: string;
  allowed: string[];
  denied: string[];
}
