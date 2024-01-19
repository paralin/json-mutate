import { applyMutationObject } from "../mutate";

describe("$push", () => {
  it("should apply a simple $push mutation", () => {
    const before = { hello: [0, 1, 2, 3] };
    const mutation = { hello: { $push: [4, 5] } };
    expect(applyMutationObject(before, mutation)).toEqual({
      hello: [0, 1, 2, 3, 4, 5],
    });
  });
  it("should do nothing for empty argument", () => {
    const before = { hello: [0, 1, 2, 3] };
    const pushArg: number[] = [];
    const mutation = { hello: { $push: pushArg } };
    expect(applyMutationObject(before, mutation)).toEqual({
      hello: [0, 1, 2, 3],
    });
  });
  it("should return the arg for a empty old value", () => {
    const beforeVal: Record<string, unknown> = null;
    const before = { hello: beforeVal };
    const mutation = { hello: { $push: [0, 1, 2] } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: [0, 1, 2] });
  });
  it("should return the arg for a non-array old value", () => {
    const before = { hello: "world" };
    const mutation = { hello: { $push: [0, 1, 2] } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: [0, 1, 2] });
  });
  it("should throw an error for non-array arg", () => {
    const before = { hello: [1, 2, 3] };
    const mutation = { hello: { $push: "kappa" } };
    expect(() => {
      applyMutationObject(before, mutation);
    }).toThrow(new TypeError("Argument to $push mutation must be an array."));
  });
});
