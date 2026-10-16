declare module 'jest-axe' {
  export interface AxeResults {
    violations: ReadonlyArray<{
      id: string;
      description: string;
      help: string;
      nodes: unknown[];
    }>;
  }

  export function axe(
    html: Element | string,
    options?: object,
  ): Promise<AxeResults>;

  export const toHaveNoViolations: {
    toHaveNoViolations(results?: AxeResults): {
      message(): string;
      pass: boolean;
    };
  };
}
