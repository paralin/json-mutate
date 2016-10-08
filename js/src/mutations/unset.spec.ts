import { applyMutationObject } from '../mutate';

describe('$unset', () => {
  it('should apply a simple $unset mutation', () => {
    let before = {'hello': 'world'};
    let mutation = {'hello': {'$unset': true}};
    expect(applyMutationObject(before, mutation))
      .toEqual({});
  });
});
