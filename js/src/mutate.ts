import { MUTATIONS } from './mutations';
import { IMutationRecurse } from './mutations/interface';

const RECURSE_FUNCS: IMutationRecurse = {
  applyMutation: applyMutation,
  applyMutationObject: applyMutationObject,
};

for (let mutt of MUTATIONS) {
  if (mutt.setRecurse) {
    mutt.setRecurse(RECURSE_FUNCS);
  }
}

// Apply a single mutation object to a value.
export function applyMutation(oldVal: any, mutation: Object): any {
  for (let mutt of MUTATIONS) {
    let arg = mutation[mutt.mutationKey];
    if (arg === undefined) {
      continue;
    }
    oldVal = mutt.apply(oldVal, arg);
  }
  return oldVal;
}

// Recursively apply an entire mutation tree to an object.
export function applyMutationObject(oldObj: Object, mutations: Object): Object {
  if (!oldObj || !mutations || !Object.keys(mutations).length) {
    return oldObj;
  }

  for (let key in mutations) {
    /* istanbul ignore next */
    if (!mutations.hasOwnProperty(key)) {
      continue;
    }

    let val = mutations[key];
    // Primitives are implicit $sets.
    if (!val || typeof val !== 'object') {
      oldObj[key] = val;
      continue;
    }

    let mutationKeys = Object.keys(val);
    // Check if the object is a mutation or a sub-object
    if (mutationKeys[0].charAt(0) === '$') {
      oldObj[key] = applyMutation(oldObj[key], val);
      if (oldObj[key] === undefined) {
        delete oldObj[key];
      }
    } else {
      // Recurse into the sub object
      oldObj[key] = applyMutationObject(oldObj[key], val);
    }
  }
  return oldObj;
}
