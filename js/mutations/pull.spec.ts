import { applyMutationObject } from "../mutate";

describe("$pull", () => {
  it("should apply a simple $pull mutation", () => {
    const before = { hello: [0, 1, 2, 3] };
    const mutation = { hello: { $pull: [0, 2] } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: [1, 3] });
  });
  it("should do nothing for empty argument", () => {
    const before = { hello: [0, 1, 2, 3] };
    const pullArg: number[] = [];
    const mutation = { hello: { $pull: pullArg } };
    expect(applyMutationObject(before, mutation)).toEqual({
      hello: [0, 1, 2, 3],
    });
  });
  it("should do nothing for empty old val", () => {
    const beforeArr: number[] = [];
    const before = { hello: beforeArr };
    const mutation = { hello: { $pull: [0, 1, 2] } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: beforeArr });
  });
  it("should return null for null arg", () => {
    const before: Record<string, unknown> = { hello: null };
    const mutation = { hello: { $pull: [0, 2] } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: null });
  });
  it("should throw an error for non-array old value", () => {
    const before = { hello: "there" };
    const mutation = { hello: { $pull: [0, 2] } };
    expect(() => {
      applyMutationObject(before, mutation);
    }).toThrow(new TypeError("Old value in $pull mutation must be an array."));
  });
  it("should throw an error for non-array arg", () => {
    const before = { hello: [1, 2, 3] };
    const mutation = { hello: { $pull: "kappa" } };
    expect(() => {
      applyMutationObject(before, mutation);
    }).toThrow(new TypeError("Argument to $pull mutation must be an array."));
  });
  it("should throw an error for non-integer arg member", () => {
    const before = { hello: [1, 2, 3] };
    const mutation = { hello: { $pull: [1, 2, "swag", 3] } };
    expect(() => {
      applyMutationObject(before, mutation);
    }).toThrow(
      new TypeError("Argument to $pull mutation must be an array of integers."),
    );
  });
});
