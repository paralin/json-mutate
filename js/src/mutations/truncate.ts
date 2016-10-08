import { IMutation } from './interface';

export class TruncateMutation implements IMutation {
  public mutationKey = '$truncate';

  public apply(oldVal: any[], arg: number): any {
    if (!oldVal) {
      return null;
    }

    if (oldVal.constructor !== Array) {
      throw new TypeError('Old value in $truncate mutation must be an array.');
    }
    if (typeof arg !== 'number') {
      throw new TypeError('Argument to $truncate mutation must be a number.');
    }
    if (oldVal.length === 0) {
      return oldVal;
    }

    return oldVal.splice(0, arg);
  }
}
