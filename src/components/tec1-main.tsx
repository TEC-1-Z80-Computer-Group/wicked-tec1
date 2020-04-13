/* eslint-disable import/prefer-default-export */
/* eslint-disable import/no-unresolved */
/* eslint-disable import/extensions */
import * as React from "react";
import styled from "styled-components";
import { Keypad } from "./keypad";
import { KeyButton } from "./key-button";
import { DigitPane } from "./digit-pane";
import tec1Image from "../../assets/TEC-1x.jpg";
import { Stylable, EventFunc } from "../types";

interface Tec1MainProps extends Stylable {
  layout: string;
  display: any[];
  shiftLocked: boolean;
  handleCode: EventFunc;
}

const BaseTec1Main = ({
  layout,
  display,
  shiftLocked,
  handleCode,
  className,
}: Tec1MainProps) => {
  return (
    <div className={`${className} tec1-main`}>
      <div className="digit-pane">
        <DigitPane display={display} />
      </div>
      <Keypad onClick={handleCode} keyMap={layout} />
      <KeyButton
        code={"Escape"}
        text={"R"}
        left={349}
        top={301}
        onClick={handleCode}
      />
      <KeyButton
        code={"ShiftLock"}
        text={"SH"}
        locked={shiftLocked}
        left={386}
        top={333}
        onClick={handleCode}
      />
    </div>
  );
};
export const Tec1Main = styled(BaseTec1Main)`
  width: 600px;
  height: 375px;
  background-image: url(${tec1Image});
  background-size: 100% 100%;
  position: relative;

  .digit-pane {
    direction: rtl;
    padding: 0px 20px;
    position: relative;
    top: 74.4%;
    right: 42.6%;
  }
`;
