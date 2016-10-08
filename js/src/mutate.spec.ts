import { applyMutationObject } from './mutate';

describe('applyMutationObject', () => {
  it('should apply a simple value mutation', () => {
    let before = {'hello': 'world'};
    let mutation = {'hello': 'there'};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': 'there'});
  });
  it('should apply a nested value mutation', () => {
    let before = {'hello': {'world': 'world'}};
    let mutation = {'hello': {'world': 'there'}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': {'world': 'there'}});
  });
  it('should return null if given null', () => {
    let before: Object = null;
    let mutation = {'hello': {'world': 'there'}};
    expect(applyMutationObject(before, mutation))
      .toEqual(null);
  });
  it('should accept an empty mutation object', () => {
    let before = {'hello': 'world'};
    let mutation = {};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': 'world'});
  });
});
