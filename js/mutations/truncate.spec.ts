import { applyMutationObject } from "../mutate";

describe("$truncate", () => {
  it("should apply a simple $truncate mutation", () => {
    const before = { hello: [0, 1, 2, 3, 4, 5] };
    const mutation = { hello: { $truncate: 3 } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: [0, 1, 2] });
  });
  it("should do nothing for empty old val", () => {
    const beforeArr: number[] = [];
    const before = { hello: beforeArr };
    const mutation = { hello: { $truncate: 2 } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: beforeArr });
  });
  it("should return nothing for null old val", () => {
    const beforeOld: Record<string, unknown> = null;
    const before = { hello: beforeOld };
    const mutation = { hello: { $truncate: 2 } };
    expect(applyMutationObject(before, mutation)).toEqual({ hello: beforeOld });
  });
  it("should throw an error for non-array old value", () => {
    const before = { hello: "there" };
    const mutation = { hello: { $truncate: 2 } };
    expect(() => {
      applyMutationObject(before, mutation);
    }).toThrow(
      new TypeError("Old value in $truncate mutation must be an array."),
    );
  });
  it("should throw an error for non-number arg", () => {
    const before = { hello: [1, 2, 3] };
    const mutation = { hello: { $truncate: "kappa" } };
    expect(() => {
      applyMutationObject(before, mutation);
    }).toThrow(
      new TypeError("Argument to $truncate mutation must be a number."),
    );
  });
});
