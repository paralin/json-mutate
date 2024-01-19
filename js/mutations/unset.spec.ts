import { applyMutationObject } from "../mutate";

describe("$unset", () => {
  it("should apply a simple $unset mutation", () => {
    const before = { hello: "world" };
    const mutation = { hello: { $unset: true } };
    expect(applyMutationObject(before, mutation)).toEqual({});
  });
});
