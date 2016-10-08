export interface IMutationRecurse {
  applyMutation(oldVal: any, mutation: Object): any;
  applyMutationObject(oldObj: any, mutations: Object): Object;
}

export interface IMutation {
  // The key, like $set
  mutationKey: string;

  // Supply the recursion functions if needed
  setRecurse?(rec: IMutationRecurse): void;

  // Apply the mutation to oldVal with argument arg.
  apply(oldVal: any, arg: any): any;
}
