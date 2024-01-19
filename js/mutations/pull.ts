import { IMutation } from "./interface";

export class PullMutation implements IMutation {
  public mutationKey = "$pull";

  public apply(oldVal: unknown[], arg: unknown[]): unknown {
    if (!oldVal) {
      return null;
    }

    if (oldVal.constructor !== Array) {
      throw new TypeError("Old value in $pull mutation must be an array.");
    }
    if (arg.constructor !== Array) {
      throw new TypeError("Argument to $pull mutation must be an array.");
    }
    if (oldVal.length === 0) {
      return oldVal;
    }

    const indexArr: number[] = [];
    for (const idx of arg) {
      if (typeof idx !== "number") {
        throw new TypeError(
          "Argument to $pull mutation must be an array of integers.",
        );
      }
      indexArr.push(idx);
    }

    if (indexArr.length === 0) {
      return oldVal;
    }

    // sort indexes
    indexArr.sort((a: number, b: number): number => {
      return a - b;
    });

    // build output array
    const res: unknown[] = [];
    // next index to ignore
    let nextIgnore = indexArr[0];
    // ignore index (current)
    let ii = 0;
    for (let i = 0; i < oldVal.length; i++) {
      if (nextIgnore !== -1 && i === nextIgnore) {
        ii++;
        if (ii === indexArr.length) {
          nextIgnore = -1;
        } else {
          nextIgnore = indexArr[ii];
        }
        continue;
      }
      // add to output
      res.push(oldVal[i]);
    }

    return res;
  }
}
