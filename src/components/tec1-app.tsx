import * as React from "react";
import styled from "styled-components";
import { audioInit, audioPlay, audioValue } from "../util/audio";
import MemoryMap from "nrf-intel-hex";
import { keyCodes, layouts } from "../constants";
import { Stylable, CPUMessage, MemoryMessage } from "../types";
import { Tec1Header } from "./tec1-header";
import { Tec1Main } from "./tec1-main";
import { Tec1Footer } from "./tec1-footer";
import {
  isHidden,
  addVisibilityListener,
  removeVisiblityListener,
} from "../util/page-visibility";

const anchor = document.createElement("a");

const BaseTec1App = ({ className }: Stylable) => {
  const [display, setDisplay] = React.useState(Array(6).fill(0));
  const [shiftLocked, setShiftLocked] = React.useState(false);
  const [worker] = React.useState(new Worker("../worker/worker.ts"));
  const [layout, setLayout] = React.useState(
    localStorage.getItem("layout") || layouts.classic
  );
  const [hidden, setHidden] = React.useState(false);

  const postWorkerMessage = (message: any) => {
    if (worker) {
      worker.postMessage(message);
    }
  };

  const handleVisibility = () => {
    setHidden(isHidden());
  };

  const handleChangeLayout = (newLayout: string) => {
    const n = newLayout?.toUpperCase() || '';
    if (!n) {
      setLayout(layouts.classic);
    } else if (n in layouts) {
      setLayout(layouts[n]);
    } else {
      setLayout(n);
    }
  };

  const handleCode = (code: string) => {
    audioInit();
    if (code === "Escape") {
      postWorkerMessage({ type: "RESET" });
      return true;
    } else if (code === "ShiftLock") {
      setShiftLocked(!shiftLocked);
      return true;
    } else if (code in keyCodes) {
      const keyCode = keyCodes[code];
      if (keyCode == null) return false;
      const bit5 = 0b00100000;
      const mask = ~bit5;
      let keyCode1 = keyCode & mask;
      if (!shiftLocked) keyCode1 = keyCode1 | bit5;
      postWorkerMessage({ type: "SET_INPUT_VALUE", port: 0, value: keyCode1 });
      postWorkerMessage({
        type: "SET_KEY_VALUE",
        code: keyCode1,
        pressed: !shiftLocked,
      });
      postWorkerMessage({ type: "NMI" });
      return true;
    }
    return false;
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Shift") {
      setShiftLocked(true);
    } else if (handleCode(event.code)) {
      event.preventDefault();
    } else {
      console.log(event, event.code, event.key);
    }
  };

  const handleKeyUp = (event: any) => {
    if (event.key === "Shift") {
      setShiftLocked(false);
    }
  };

  const receiveMessage = (event: { data: CPUMessage | MemoryMessage }) => {
    if (event.data.type === "POST_OUTPORTS") {
      const { display, wavelength } = event.data;
      setDisplay([...new Uint8Array(display)]);
      const frequency = wavelength ? 500000 / wavelength : 0;
      audioValue(frequency);
    } else {
      const { from, buffer } = event.data;
      const memMap = new MemoryMap();
      const bytes = new Uint8Array(buffer);
      memMap.set(from, bytes);

      anchor.download = `TEC-1-${new Date().getTime()}.hex`;
      const hexString = memMap.asHexString();
      anchor.href = URL.createObjectURL(
        new Blob([hexString], { type: "application/octet-stream" })
      );
      anchor.dataset.downloadurl = [
        "text/plain",
        anchor.download,
        anchor.href,
      ].join(":");
      anchor.click();
    }
  };

  React.useEffect(() => {
    worker.onmessage = receiveMessage;
    worker.postMessage({ type: "INIT" });

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    addVisibilityListener(handleVisibility);
    return () => {
      if (worker) {
        worker.terminate();
      }
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      removeVisiblityListener(handleVisibility);
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem("layout", layout);
  }, [layout]);

  React.useEffect(() => {
    audioPlay(!hidden);
    postWorkerMessage({ type: "HIDDEN", value: hidden });
  }, [worker, hidden]);

  return (
    <div className={`${className} tec1-app`}>
      {worker && <Tec1Header worker={worker} />}
      <Tec1Main
        layout={layout}
        display={display}
        shiftLocked={shiftLocked}
        handleCode={handleCode}
      />
      {worker && (
        <Tec1Footer
          worker={worker}
          layout={layout}
          onChangeLayout={handleChangeLayout}
        />
      )}
    </div>
  );
};

export const Tec1App = styled(BaseTec1App)`
  outline: none;
  margin: 20px;
  margin-right: auto;
  margin-left: auto;
  display: inline-block;
  position: relative;
`;
