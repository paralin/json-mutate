import { applyMutationObject } from '../mutate';

describe('$pull', () => {
  it('should apply a simple $pull mutation', () => {
    let before = {'hello': [0, 1, 2, 3]};
    let mutation = {'hello': {'$pull': [0, 2]}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [1, 3]});
  });
  it('should do nothing for empty argument', () => {
    let before = {'hello': [0, 1, 2, 3]};
    let pullArg: number[] = [];
    let mutation = {'hello': {'$pull': pullArg}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, 1, 2, 3]});
  });
  it('should do nothing for empty old val', () => {
    let beforeArr: number[] = [];
    let before = {'hello': beforeArr};
    let mutation = {'hello': {'$pull': [0, 1, 2]}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': beforeArr});
  });
  it('should return null for null arg', () => {
    let before: Object = {'hello': null};
    let mutation = {'hello': {'$pull': [0, 2]}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': null});
  });
  it('should throw an error for non-array old value', () => {
    let before = {'hello': 'there'};
    let mutation = {'hello': {'$pull': [0, 2]}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Old value in $pull mutation must be an array.'));
  });
  it('should throw an error for non-array arg', () => {
    let before = {'hello': [1, 2, 3]};
    let mutation = {'hello': {'$pull': 'kappa'}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Argument to $pull mutation must be an array.'));
  });
  it('should throw an error for non-integer arg member', () => {
    let before = {'hello': [1, 2, 3]};
    let mutation = {'hello': {'$pull': [1, 2, 'swag', 3]}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Argument to $pull mutation must be an array of integers.'));
  });
});
