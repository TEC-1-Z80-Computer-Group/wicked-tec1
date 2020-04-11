import * as React from "react";
import styled from "styled-components";
import { SevenSeg } from "./seven-seg";

interface SevenSegDisplayProps {
  display: number[];
}

const BaseSevenSegDisplay = ({ display, className }: Stylable) => {
  return (
    <div className={`${className} seven-seg-display`}>
      {display.map((segs: number, index: number) => (
        <SevenSeg
          key={index}
          marginLeft={index == 1 ? "2.2%" : ""}
          segments={segs}
        ></SevenSeg>
      ))}
    </div>
  );
};

export const SevenSegDisplay = styled(BaseSevenSegDisplay)`
  white-space: nowrap;
`;
