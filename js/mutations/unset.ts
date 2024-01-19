import { IMutation } from "./interface";

export class UnsetMutation implements IMutation {
  public mutationKey = "$unset";

  public apply(): unknown {
    return undefined;
  }
}
