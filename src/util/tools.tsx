/* eslint-disable func-names */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
/* eslint-disable import/prefer-default-export */
import { Thunk } from "../types";

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

