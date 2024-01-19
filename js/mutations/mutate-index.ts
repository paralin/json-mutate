import { IMutation, IMutationRecurse } from "./interface";

export class IndexMutation implements IMutation {
  public mutationKey = "$mutateIdx";
  private mutationRecurse: IMutationRecurse;

  public setRecurse(rec: IMutationRecurse) {
    this.mutationRecurse = rec;
  }

  public apply(oldVal: unknown[], arg: Record<string, unknown>): Record<string, unknown> {
    if (typeof oldVal !== "object" || oldVal.constructor !== Array) {
      throw new TypeError("Old value in $mutateIdx mutation must be an array.");
    }
    if (typeof arg !== "object" || arg.constructor !== Object) {
      throw new TypeError("Argument to $mutateIdx must be an object.");
    }

    for (const key in arg) {
      if (!(key in arg)) {
        continue;
      }

      const idx: number = parseInt(key);
      if (isNaN(idx)) {
        throw new TypeError("Keys in $mutateIdx arg must be integer indexes.");
      }

      if (idx < 0 || idx > oldVal.length) {
        throw new RangeError(
          "Key in $mutateIdx arg must be in range of old value.",
        );
      }

      const mutation: unknown = arg[key];
      if (typeof mutation !== "object" || mutation.constructor !== Object) {
        oldVal[idx] = mutation;
        continue;
      }

      const oldPosVal = oldVal[idx];
      if (typeof oldPosVal === "object" && oldPosVal.constructor === Object) {
        oldVal[idx] = this.mutationRecurse.applyMutationObject(
          oldPosVal,
          mutation,
        );
      } else {
        oldVal[idx] = this.mutationRecurse.applyMutation(oldPosVal, mutation);
      }
    }
    return oldVal;
  }
}
