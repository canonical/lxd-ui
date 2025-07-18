import { useEffect, useReducer } from "react";
import { useListener } from "@canonical/react-components";

interface EditHistoryState<T = unknown> {
  currentState: T;
  undoStack: T[];
  redoStack: T[];
}

type EditHistoryAction<T> =
  | {
      type: "save";
      payload: T;
    }
  | {
      type: "undo" | "redo";
    };

function createHistoryReducer<T>() {
  return (
    state: EditHistoryState<T>,
    action: EditHistoryAction<T>,
  ): EditHistoryState<T> => {
    if (action.type === "save") {
      const desiredState = action.payload;
      const newUndoStack = [...state.undoStack, desiredState];
      return {
        currentState: desiredState,
        undoStack: newUndoStack,
        // reset redo stack whenever an action is performed and saved
        redoStack: [],
      };
    }

    if (action.type === "undo") {
      if (state.undoStack.length < 2) {
        return state;
      }
      const latestState = state.undoStack[state.undoStack.length - 1];
      const desiredState = state.undoStack[state.undoStack.length - 2];
      const newUndoStack = state.undoStack.slice(0, state.undoStack.length - 1);
      const newRedoStack = [...state.redoStack, latestState];
      return {
        currentState: desiredState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      };
    }

    if (action.type === "redo") {
      if (!state.redoStack.length) {
        return state;
      }

      const desiredState = state.redoStack[state.redoStack.length - 1];
      const newUndoStack = [...state.undoStack, desiredState];
      const newRedoStack = state.redoStack.slice(0, state.redoStack.length - 1);
      return {
        currentState: desiredState,
        undoStack: newUndoStack,
        redoStack: newRedoStack,
      };
    }

    return state;
  };
}

interface EditHistoryProps<T = unknown> {
  initialState: T;
}

function useEditHistory<T>(props: EditHistoryProps<T>) {
  const { initialState } = props;
  const [state, dispatch] = useReducer(createHistoryReducer<T>(), {
    currentState: initialState,
    undoStack: [],
    redoStack: [],
  });

  useEffect(() => {
    save(initialState);
  }, []);

  useListener(
    window,
    (event: KeyboardEvent) => {
      const ctrlOrCmdKey = event.ctrlKey || event.metaKey;
      if (ctrlOrCmdKey && !event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        undo();
      }

      if (ctrlOrCmdKey && event.shiftKey && event.key.toLowerCase() === "z") {
        event.preventDefault();
        redo();
      }
    },
    "keydown",
  );

  const save = (payload: T) => {
    dispatch({ type: "save", payload });
  };

  const undo = () => {
    dispatch({ type: "undo" });
  };

  const redo = () => {
    dispatch({ type: "redo" });
  };

  return {
    desiredState: state.currentState,
    undo,
    redo,
    save,
  };
}

export default useEditHistory;
