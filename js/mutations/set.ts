import { IMutation } from "./interface";

export class SetMutation implements IMutation {
  public mutationKey = "$set";

  public apply(oldVal: Record<string, unknown>, arg: Record<string, unknown>): Record<string, unknown> {
    return arg;
  }
}
