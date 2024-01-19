import { IMutation } from "./interface";

export class TruncateMutation implements IMutation {
  public mutationKey = "$truncate";

  public apply(oldVal: unknown[], arg: number): unknown {
    if (!oldVal) {
      return null;
    }

    if (!Array.isArray(oldVal)) {
      throw new TypeError("Old value in $truncate mutation must be an array.");
    }
    if (typeof arg !== "number") {
      throw new TypeError("Argument to $truncate mutation must be a number.");
    }
    if (oldVal.length === 0) {
      return oldVal;
    }

    return oldVal.slice(0, arg);
  }
}
