import { IMutation } from './interface';

// All possible mutations
import { SetMutation } from './set';
import { UnsetMutation } from './unset';
import { PullMutation } from './pull';
import { PushMutation } from './push';
import { TruncateMutation } from './truncate';
import { IndexMutation } from './mutate-index';

// We use an array here to enforce order of operations
export const MUTATIONS: IMutation[] = [
  new SetMutation(),
  new PushMutation(),
  new PullMutation(),
  new TruncateMutation(),
  new IndexMutation(),
  new UnsetMutation(),
];
