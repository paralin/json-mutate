import { SetMutation } from "./mutations/set";
import { PushMutation } from "./mutations/push";
import { TruncateMutation } from "./mutations/truncate";
import { IndexMutation } from "./mutations/mutate-index";
import { UnsetMutation } from "./mutations/unset";

const staticSet = new SetMutation();
const staticPush = new PushMutation();
const staticTruncate = new TruncateMutation();
const staticIndex = new IndexMutation();
const staticUnset = new UnsetMutation();

function deepEqual(oldObj: unknown, newObj: unknown): boolean {
  return JSON.stringify(oldObj) === JSON.stringify(newObj);
}

function buildArrayMutation(oldObj: unknown[], newObj: unknown[], res: Record<string, unknown>) {
  // -- mutatepush --
  let lenNew = newObj.length;
  let lenOld = oldObj.length;
  let lenDiff = lenNew - lenOld;
  if (lenDiff > 0) {
    let pushMutation: unknown[] = [];
    pushMutation.length = lenDiff;
    for (let i = lenOld; i < lenNew; i++) {
      pushMutation[i - lenOld] = newObj[i];
      oldObj.push(newObj[i]);
    }
    res[staticPush.mutationKey] = pushMutation;
  } else if (lenDiff < 0) {
    // -- mutate truncate --
    res[staticTruncate.mutationKey] = lenNew;
    oldObj.length = lenNew;
  }

  // Mutate index
  let mutateIndex: Record<string, unknown> = {};
  for (let idx = 0; idx < newObj.length; idx++) {
    let v: unknown = newObj[idx];
    let mutation = doBuildMutation(oldObj[idx], v);
    if (mutation === undefined) {
      continue;
    }
    mutateIndex["" + idx] = mutation;
  }
  if (Object.keys(mutateIndex).length > 0) {
    res[staticIndex.mutationKey] = mutateIndex;
  }
}

function buildObjectMutation(oldObj: Record<string, unknown>, newObj: Record<string, unknown>, res: Record<string, unknown>) {
  for (let k in newObj) {
    if (!newObj.hasOwnProperty(k)) {
      continue;
    }
    let mutation = doBuildMutation(oldObj[k], newObj[k]);
    if (mutation === undefined) {
      continue;
    }
    res[k] = mutation;
  }

  // Check for unknown unsets
  for (let k in oldObj) {
    if (!oldObj.hasOwnProperty(k)) {
      continue;
    }
    if (!newObj.hasOwnProperty(k)) {
      let mutation: Record<string, unknown> = {};
      mutation[staticUnset.mutationKey] = null;
      res[k] = mutation;
    }
  }
}

// Returns undefined for no change, null for literal null.
function doBuildMutation(oldObj: unknown, newObj: unknown): unknown {
  // Check if they are equal, this is probably slow.
  if (deepEqual(oldObj, newObj)) {
    return undefined;
  }

  if (oldObj === null || oldObj === undefined) {
    return newObj;
  }

  let res: Record<string, unknown> = {};

  // Type guard to ensure oldObj and newObj are objects before comparing constructors
  if (typeof oldObj === "object" && oldObj !== null && typeof newObj === "object" && newObj !== null && oldObj.constructor !== newObj.constructor) {
    res[staticSet.mutationKey] = newObj;
  } else if (Array.isArray(newObj)) {
    buildArrayMutation(<unknown[]>oldObj, <unknown[]>newObj, res);
  } else if (newObj.constructor === Object) {
  } else if (newObj && typeof newObj === "object" && newObj.constructor === Object) {
    buildObjectMutation(<Record<string, unknown>>oldObj, <Record<string, unknown>>newObj, res);
  }

  return res;
  if (newObj === null || newObj === undefined) {
    return null;
  }

  let res: Record<string, unknown> = {};
  if (typeof newObj !== "object" || newObj === null) {
    return newObj;
  }

  let res: Record<string, unknown> = {};

  // Type guard to ensure oldObj and newObj are objects before comparing constructors
  if (typeof oldObj === "object" && oldObj !== null && typeof newObj === "object" && newObj !== null && oldObj.constructor !== newObj.constructor) {
    res[staticSet.mutationKey] = newObj;
  } else if (Array.isArray(newObj)) {
    buildArrayMutation(<unknown[]>oldObj, <unknown[]>newObj, res);
  } else if (newObj.constructor === Object) {
  } else if (newObj && typeof newObj === "object" && newObj.constructor === Object) {
    buildObjectMutation(<Record<string, unknown>>oldObj, <Record<string, unknown>>newObj, res);
  }

  return res;
}

export function buildMutation(oldObj: Record<string, unknown>, newObj: Record<string, unknown>): Record<string, unknown> {
  return doBuildMutation(oldObj, newObj);
}
