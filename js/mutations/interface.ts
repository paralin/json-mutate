export interface IMutationRecurse {
  applyMutation(oldVal: unknown, mutation: Record<string, unknown>): unknown;
  applyMutationObject(oldObj: unknown, mutations: Record<string, unknown>): Record<string, unknown>;
}

export interface IMutation {
  // The key, like $set
  mutationKey: string;

  // Supply the recursion functions if needed
  setRecurse?(rec: IMutationRecurse): void;

  // Apply the mutation to oldVal with argument arg.
  apply(oldVal: unknown, arg: unknown): unknown;
}
