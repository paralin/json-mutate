import { buildMutation } from "./builder";

describe("buildMutation", () => {
  it("should change types correctly", () => {
    expect(buildMutation({ test: "hello" }, { test: 5 })).toEqual({
      test: 5,
    });
  });
  it("should set null correctly", () => {
    expect(buildMutation({ test: "hello" }, { test: null })).toEqual({
      test: null,
    });
  });
  it("should set a new field correctly", () => {
    expect(buildMutation({}, { test: "hi" })).toEqual({
      test: "hi",
    });
  });
  it("should set a object correctly", () => {
    expect(buildMutation({ test: 1 }, { test: { hello: "world" } })).toEqual({
      test: {
        $set: {
          hello: "world",
        },
      },
    });
  });
  it("should unset a key correctly", () => {
    expect(buildMutation({ test: 1 }, {})).toEqual({
      test: {
        $unset: null,
      },
    });
  });
  it("should push to an array correctly", () => {
    expect(buildMutation({ a: [0, 1, 2] }, { a: [0, 1, 2, 3, 4] })).toEqual({
      a: {
        $push: [3, 4],
      },
    });
  });
  it("should truncate an array correctly", () => {
    expect(buildMutation({ a: [0, 1, 2, 3, 4] }, { a: [0, 1, 2] })).toEqual({
      a: {
        $truncate: 3,
      },
    });
  });
  it("should mutate an index correctly", () => {
    expect(
      buildMutation(
        { test: ["hello", { test: 1 }] },
        { test: ["goodbye", { test: 3 }] },
      ),
    ).toEqual({
      test: {
        $mutateIdx: {
          "0": "goodbye",
          "1": { test: 3 },
        },
      },
    });
  });
  it("should handle a complex set null case", () => {
    expect(
      buildMutation(
        {
          test: {
            test2: {
              test3: [0, 1, 2, 3],
            },
          },
        },
        {
          test: null,
        },
      ),
    ).toEqual({ test: null });
  });
  it("should handle setting a non-existant key", () => {
    expect(buildMutation({}, { test: 1 })).toEqual({ test: 1 });
  });
  it("should handle another index mutation", () => {
    expect(buildMutation({ test: ["dude", 1] }, { test: ["wow", 1] })).toEqual({
      test: {
        $mutateIdx: {
          0: "wow",
        },
      },
    });
  });
  it("should handle yet another index mutation", () => {
    expect(buildMutation({ test: ["dude", 1] }, { test: ["wow"] })).toEqual({
      test: {
        $truncate: 1,
        $mutateIdx: { 0: "wow" },
      },
    });
  });
});
