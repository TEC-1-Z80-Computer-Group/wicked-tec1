import * as React from 'react';
import  styled  from 'styled-components';
import { EventFunc } from '../types';

interface KeyButtonProps extends Stylable {
  code: string;
  text: string;
  color: string;
  left: number;
  top: number;
  handleButton: EventFunc;
}

const BaseKeyButton = ({ code, text, handleButton, className }: KeyButtonProps) => {

  const handleEvent = () => {
    handleButton(code)
  }

  return (
    <div
      className={`${className} key-button`}
      onMouseDown={handleEvent}
    >
      {text}
    </div>
  );
};

export const KeyButton = styled(BaseKeyButton)`

background-color: ${(props) => props.color};
left: ${(props) => props.left}px;
top: ${(props) => props.top}px

`
