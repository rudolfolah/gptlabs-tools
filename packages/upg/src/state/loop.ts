import { State } from "./types";

// import { error, log } from "../utils/log";
import { displayProgram } from "../utils/displayProgram";
import { nextState } from "./next";
import { error, log, style } from "@tsmodule/log";

export const loop = async (
  initialState: State,
): Promise<State | null> => {
  const stack: State[] = [initialState];
  let stackIndex = 0;
  let current: State;

  while (true) {
    current = stack[stackIndex] || null;
    if (!current) {
      break;
    }

    if (current.explanation) {
      log();
      log(`${style("Explanation", ["dim", "bold"])}\n${current.explanation}`, [], { newlines: 0 });
    }

    displayProgram(current);

    if (!current?.code) {
      error("Warning: Empty program. Reverting.");

      stack.pop();
      stackIndex--;
      continue;
    }

    const { next, done, undo } = await nextState(current);

    if (done) {
      break;
    } else if (undo) {
      stack.pop();
      stackIndex--;
    } else if (next) {
      stack.push(next);
      stackIndex++;
    }
  }

  return current;
};