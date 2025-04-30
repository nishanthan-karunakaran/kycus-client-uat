import { createEntityAdapter } from '@ngrx/entity';

export function createMongoEntityAdapter<T extends { _id: string }>() {
  return createEntityAdapter<T>({
    selectId: (entity) => entity._id, // use `_id` as the unique identifier
  });
}
