import { applyMutationObject } from "../mutate";

describe("$set", () => {
  it("should apply a simple $set mutation", () => {
    const before = { hello: "world" };
    const mutation = { hello: { $set: "there", $doesntexist: "yes" } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: "there" });
  });
});
