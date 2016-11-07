import { SetMutation } from './mutations/set';
import { PushMutation } from './mutations/push';
import { TruncateMutation } from './mutations/truncate';
import { IndexMutation } from './mutations/mutate-index';
import { UnsetMutation } from './mutations/unset';

const staticSet = new SetMutation();
const staticPush = new PushMutation();
const staticTruncate = new TruncateMutation();
const staticIndex = new IndexMutation();
const staticUnset = new UnsetMutation();

function deepEqual(oldObj: any, newObj: any): boolean {
  return JSON.stringify(oldObj) === JSON.stringify(newObj);
}

function buildArrayMutation(oldObj: any[], newObj: any[], res: any) {
  // -- mutatepush --
  let lenNew = newObj.length;
  let lenOld = oldObj.length;
  let lenDiff = lenNew - lenOld;
  if (lenDiff > 0) {
    let pushMutation: any[] = [];
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
  let mutateIndex: any = {};
  for (let idx = 0; idx < newObj.length; idx++) {
    let v: any = newObj[idx];
    let mutation = doBuildMutation(oldObj[idx], v);
    if (mutation === undefined) {
      continue;
    }
    mutateIndex['' + idx] = mutation;
  }
  if (Object.keys(mutateIndex).length > 0) {
    res[staticIndex.mutationKey] = mutateIndex;
  }
}

function buildObjectMutation(oldObj: Object, newObj: Object, res: any) {
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

  // Check for any unsets
  for (let k in oldObj) {
    if (!oldObj.hasOwnProperty(k)) {
      continue;
    }
    if (!newObj.hasOwnProperty(k)) {
      let mutation: any = {};
      mutation[staticUnset.mutationKey] = null;
      res[k] = mutation;
    }
  }
}

// Returns undefined for no change, null for literal null.
function doBuildMutation(oldObj: any, newObj: any): any {
  // Check if they are equal, this is probably slow.
  if (deepEqual(oldObj, newObj)) {
    return undefined;
  }

  if (!oldObj && newObj) {
    return newObj;
  }

  if (!newObj) {
    return null;
  }

  let res: any = {};
  let isPrimitive = (typeof newObj !== 'object');
  if (isPrimitive) {
    return newObj;
  }

  // if the types changed, use a $set
  // both are objects here, so check constructor for [] vs {}
  if (oldObj.constructor !== newObj.constructor) {
    res[staticSet.mutationKey] = newObj;
  } else if (newObj.constructor === Array) {
    buildArrayMutation(<any[]>oldObj, <any[]>newObj, res);
  } else if (newObj.constructor === Object) {
    buildObjectMutation(<Object>oldObj, <Object>newObj, res);
  }

  return res;
}

export function buildMutation(oldObj: Object, newObj: Object): Object {
  return doBuildMutation(oldObj, newObj);
}
