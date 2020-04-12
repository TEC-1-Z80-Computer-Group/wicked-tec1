import { Thunk } from "./types";

export const throttle = (thunk: Thunk, limit: number) => {
  let wait = false;
  return () => {
    if (!wait) {
      thunk();
      wait = true;
      setTimeout(function () {
        wait = false;
      }, limit);
    }
  };
};

