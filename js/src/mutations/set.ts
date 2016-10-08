import { IMutation } from './interface';

export class SetMutation implements IMutation {
  public mutationKey = '$set';

  public apply(oldVal: Object, arg: Object): Object {
    return arg;
  }
}
