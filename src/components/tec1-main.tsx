import * as React from "react";
import styled from "styled-components";
import { KeypadClassic } from "./keypad-classic";
import { KeypadModern } from "./keypad-modern";
import { KeyButton } from "./key-button";
import { SevenSegDisplay } from "./seven-seg-display";
import tec1Image from "../../assets/TEC-1.jpg";
import { Stylable, EventFunc } from "../types";

interface Tec1MainProps extends Stylable {
  classic: boolean;
  digits: number;
  segments: number;
  display: any[];
  shiftLocked: boolean;
  handleCode: EventFunc;
}

const BaseTec1Main = ({
  classic,
  digits,
  segments,
  display,
  shiftLocked,
  handleCode,
  className,
}: Tec1MainProps) => {
  return (
    <div className={`${className} tec1-main`}>
      {classic ? (
        <KeypadClassic onClick={handleCode} />
      ) : (
        <KeypadModern onClick={handleCode} />
      )}
      <KeyButton
        code={"Escape"}
        text={"R"}
        color={"#cd3d45"}
        left={349}
        top={301}
        onClick={handleCode}
      />
      <KeyButton
        code={"ShiftLock"}
        text={"SH"}
        color={shiftLocked ? "#d8696f" : "#cd3d45"}
        left={386}
        top={333}
        onClick={handleCode}
      />
      <div id="digit-pane">
        <SevenSegDisplay
          id="seven"
          digits={digits}
          segments={segments}
          display={display}
        />
      </div>
    </div>
  );
};
export const Tec1Main = styled(BaseTec1Main)`
  width: 600px;
  height: 375px;
  background-image: url(${tec1Image});
  background-size: 100% 100%;
  position: relative;
`;
