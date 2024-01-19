import { IMutation } from "./interface";

export class PushMutation implements IMutation {
  public mutationKey = "$push";

  public apply(oldVal: unknown[], arg: unknown[]): unknown {
    if (!oldVal) {
      return arg;
    }

    if (oldVal.constructor !== Array) {
      return arg;
    }
    if (arg.constructor !== Array) {
      throw new TypeError("Argument to $push mutation must be an array.");
    }

    return oldVal.concat(arg);
  }
}
