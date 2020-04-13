/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import * as React from "react";
import styled from "styled-components";
import { KeyButton } from "./key-button";
import { Stylable, EventFunc } from "../types";
import { keyNames } from "../constants";

const getKeyText = (key: string) => {
  if (key === "@") {
    return "AD";
  } if (key === "G") {
    return "GO";
  }
  return key;
};

interface KeypadProps extends Stylable {
  keyMap: string;
  onClick: EventFunc;
}

const BaseKeypad = ({ keyMap, onClick, className }: KeypadProps) => {
  return (
    <div className={`${className} keypad-classic`}>
      {Array(5 * 4)
        .fill(0)
        .map((_item, index) => {
          const key = keyMap[index];
          const x = index % 5;
          const y = Math.floor(index / 5);
          const code = keyNames[key];
          return (
            <KeyButton
              key={index}
              code={code}
              text={getKeyText(key)}
              left={438 + 31 * x}
              top={239 + 31 * y}
              onClick={onClick}
            />
          );
        })}
    </div>
  );
};

export const Keypad = styled(BaseKeypad)``;
