import { applyMutationObject } from '../mutate';

describe('$truncate', () => {
  it('should apply a simple $truncate mutation', () => {
    let before = {'hello': [0, 1, 2, 3, 4, 5]};
    let mutation = {'hello': {'$truncate': 3}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': [0, 1, 2]});
  });
  it('should do nothing for empty old val', () => {
    let beforeArr: number[] = [];
    let before = {'hello': beforeArr};
    let mutation = {'hello': {'$truncate': 2}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': beforeArr});
  });
  it('should return nothing for null old val', () => {
    let beforeOld: Object = null;
    let before = {'hello': beforeOld};
    let mutation = {'hello': {'$truncate': 2}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': beforeOld});
  });
  it('should throw an error for non-array old value', () => {
    let before = {'hello': 'there'};
    let mutation = {'hello': {'$truncate': 2}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Old value in $truncate mutation must be an array.'));
  });
  it('should throw an error for non-number arg', () => {
    let before = {'hello': [1, 2, 3]};
    let mutation = {'hello': {'$truncate': 'kappa'}};
    expect(() => { applyMutationObject(before, mutation); })
      .toThrow(new TypeError('Argument to $truncate mutation must be a number.'));
  });
});
