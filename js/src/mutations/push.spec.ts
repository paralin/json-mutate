import { applyMutationObject } from '../mutate';

describe('$push', () => {
  it('should apply a simple $push mutation', () => {
    let before = {'hello': [0, 1, 2, 3]};
    let mutation = {'hello': {'$push': [4, 5]}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, 1, 2, 3, 4, 5]});
  });
  it('should do nothing for empty argument', () => {
    let before = {'hello': [0, 1, 2, 3]};
    let pushArg: number[] = [];
    let mutation = {'hello': {'$push': pushArg}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, 1, 2, 3]});
  });
  it('should return the arg for a empty old value', () => {
    let beforeVal: Object = null;
    let before = {'hello': beforeVal};
    let mutation = {'hello': {'$push': [0, 1, 2]}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, 1, 2]});
  });
  it('should return the arg for a non-array old value', () => {
    let before = {'hello': 'world'};
    let mutation = {'hello': {'$push': [0, 1, 2]}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, 1, 2]});
  });
  it('should throw an error for non-array arg', () => {
    let before = {'hello': [1, 2, 3]};
    let mutation = {'hello': {'$push': 'kappa'}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Argument to $push mutation must be an array.'));
  });
});
