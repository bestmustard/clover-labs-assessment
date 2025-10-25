import { useCallback, useRef, useState } from 'react';

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface HistoryActions<T> {
  set: (newPresent: T, overwrite?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

const MAX_HISTORY_SIZE = 50;

export function useHistory<T>(initialPresent: T): [T, HistoryActions<T>] {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newPresent: T, overwrite = false) => {
    setState((currentState) => {
      // If overwrite is true, replace the present without adding to history
      if (overwrite) {
        return {
          ...currentState,
          present: newPresent,
        };
      }

      // Add current present to past, clear future
      const newPast = [...currentState.past, currentState.present].slice(
        -MAX_HISTORY_SIZE
      );

      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((currentState) => {
      if (currentState.past.length === 0) {
        return currentState;
      }

      const newPast = currentState.past.slice(0, -1);
      const newPresent = currentState.past[currentState.past.length - 1];
      const newFuture = [currentState.present, ...currentState.future];

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((currentState) => {
      if (currentState.future.length === 0) {
        return currentState;
      }

      const newPast = [...currentState.past, currentState.present];
      const newPresent = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: newPast,
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const clear = useCallback(() => {
    setState((currentState) => ({
      past: [],
      present: currentState.present,
      future: [],
    }));
  }, []);

  return [
    state.present,
    {
      set,
      undo,
      redo,
      canUndo,
      canRedo,
      clear,
    },
  ];
}
