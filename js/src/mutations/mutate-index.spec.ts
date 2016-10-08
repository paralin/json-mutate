import { applyMutationObject } from '../mutate';

describe('$mutateIdx', () => {
  it('should apply a simple $mutateIdx mutation', () => {
    let before = {'hello': [0, 1, 2, 3]};
    let mutation = {'hello': {'$mutateIdx': {'1': 5, '3': 'test'}}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, 5, 2, 'test']});
  });
  it('should apply a nested $mutateIdx mutation', () => {
    let before = {'hello': [0, {'test': [1]}, 2, [0, 1]]};
    let mutation = {'hello': {'$mutateIdx': {'1': {'test': {'$push': [2]}}, '3': {'$push': [2]}}}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, {'test': [1, 2]}, 2, [0, 1, 2]]});
  });
  it('should throw an error for non-array old value', () => {
    let before = {'hello': 'there'};
    let mutation = {'hello': {'$mutateIdx': {'0': 5}}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Old value in $mutateIdx mutation must be an array.'));
  });
  it('should throw an error for non-object arg', () => {
    let before = {'hello': [1, 2, 3]};
    let mutation = {'hello': {'$mutateIdx': 'kappa'}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Argument to $mutateIdx must be an object.'));
  });
  it('should throw an error for non-integer arg keys', () => {
    let before = {'hello': [1, 2, 3]};
    let mutation = {'hello': {'$mutateIdx': {'swag': 2}}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Keys in $mutateIdx arg must be integer indexes.'));
  });
  it('should throw an error for out of range arg keys', () => {
    let before = {'hello': [1, 2, 3]};
    let mutation: Object = {'hello': {'$mutateIdx': {'-1': 2}}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new RangeError('Key in $mutateIdx arg must be in range of old value.'));
    before = {'hello': [1, 2, 3]};
    mutation = {'hello': {'$mutateIdx': {'5': 2}}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new RangeError('Key in $mutateIdx arg must be in range of old value.'));
  });
});
