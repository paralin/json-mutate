import { applyMutationObject } from '../mutate';

describe('$set', () => {
  it('should apply a simple $set mutation', () => {
    let before = {'hello': 'world'};
    let mutation = {'hello': {'$set': 'there', '$doesntexist': 'yes'}};
    expect(applyMutationObject(before, mutation))
      .toEqual({'hello': 'there'});
  });
});
