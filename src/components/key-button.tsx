import * as React from "react";
import styled from "styled-components";
import { EventFunc, Stylable } from "../types";

interface KeyButtonProps extends Stylable {
  code: string;
  text: string;
  color: string;
  left: number;
  top: number;
  onClick: EventFunc;
}

const BaseKeyButton = ({ code, text, onClick, className }: KeyButtonProps) => {
  console.log({ onClick });

  const handleEvent = () => {
    onClick(code);
  };

  return (
    <div className={`${className} key-button`} onMouseDown={handleEvent}>
      {text}
    </div>
  );
};

export const KeyButton = styled(BaseKeyButton)`
  background-color: ${(props) => props.color};
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
`;
