import { deduplicateBy } from '@core/utils/helpers';
import { createReducer, on } from '@ngrx/store';
import { removeDirector, updatePartialDirectors } from './declaration-directors.actions';
import { DirectorState } from './declaration-directors.state';

export const initialDirectorState: DirectorState = {
  directorList: [],
  isDirectorModified: false,
  form32: {
    name: null,
    link: null,
  },
};

export const rekycDirectorReducer = createReducer(
  initialDirectorState,
  on(updatePartialDirectors, (state, data) => {
    const newState = { ...state, ...data };

    if (data.directorList) {
      const updatedDirList = deduplicateBy(data.directorList, 'dirId');
      newState.directorList = updatedDirList;
    }

    return newState;
  }),
  on(removeDirector, (state: DirectorState, data) => {
    const directors = state.directorList.map((dir) => {
      if (dir.dirId === data.dirId) {
        return { ...dir, status: 'inactive' };
      }
      return dir;
    });

    return {
      ...state,
      directorList: directors,
    };
  }),
);
