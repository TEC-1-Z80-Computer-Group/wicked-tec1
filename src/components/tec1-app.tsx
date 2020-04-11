import * as React from "react";
import styled from "styled-components";
import { audioInit, audioPlay, audioValue } from "../util/audio";
import MemoryMap from "nrf-intel-hex";
import { keyMap } from "../constants";
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
  const [digits, setDigits] = React.useState(0);
  const [segments, setSegments] = React.useState(0);
  const [display, setDisplay] = React.useState(Array(6).fill(0));
  const [shiftLocked, setShiftLocked] = React.useState(false);
  const [classic, setClassic] = React.useState(
    localStorage.getItem("classic") === "true"
  );
  const [worker, setWorker] = React.useState<Worker>();

  const postWorkerMessage = (message: any) => {
    if (worker) {
      worker.postMessage(message);
    }
  };

  const handleVisibility = () => {
    console.log("isHidden", isHidden());
    audioPlay(!isHidden());
    postWorkerMessage({ type: "HIDDEN", value: isHidden() });
  };

  const handleCode = (code: string, shiftKey?: boolean) => {
    audioInit();
    if (code === "Escape") {
      postWorkerMessage({ type: "RESET" });
      return true;
    } else if (code === "ShiftLock") {
      setShiftLocked(!shiftLocked);
      return true;
    } else if (code in keyMap) {
      const keyCode = keyMap[code];
      if (keyCode == null) return false;
      const bit5 = 0b00100000;
      const mask = ~bit5;
      let keyCode1 = keyCode & mask;
      if (!shiftLocked && !shiftKey) keyCode1 = keyCode1 | bit5;
      postWorkerMessage({ type: "SET_INPUT_VALUE", port: 0, value: keyCode1 });
      postWorkerMessage({ type: "SET_KEY_VALUE", code: keyCode1, pressed: true });
      postWorkerMessage({ type: "NMI" });
      return true;
    }
    return false;
  };

  const handleKeyDown = (event: any) => {
    if (handleCode(event.code, event.shiftKey)) {
      event.preventDefault();
    } else {
      console.log(event, event.code, event.key);
    }
  };

  const receiveMessage = (event: { data: CPUMessage | MemoryMessage }) => {
    if (event.data.type === "POST_OUTPORTS") {
      const { buffer, display, wavelength } = event.data;
      const view = new Uint8Array(buffer);
      setDigits(view[1]);
      setSegments(view[2]);
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
    setClassic(localStorage.getItem("classic") === "true");

    const worker0 = new Worker("../worker/worker.ts");
    setWorker(worker0);
    worker0.onmessage = receiveMessage;
    // worker0.postMessage({ type: "INIT" });

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyDown);
    addVisibilityListener(handleVisibility);
    return () => {
      if (worker) {
        worker.terminate();
      }
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyDown);
      removeVisiblityListener(handleVisibility);
    };
  }, []);

  const handleChangeLayout = (event: any) => {
    const checked = event.target.checked;
    setClassic(checked);
    localStorage.setItem("classic", String(checked));
  };

  return (
    <div className={`${className} tec1-app`} tabIndex={0} onKeyDown={handleKeyDown}>
      {worker && <Tec1Header worker={worker} />}
      <Tec1Main
        classic={classic}
        digits={digits}
        segments={segments}
        display={display}
        shiftLocked={shiftLocked}
        handleCode={handleCode}
      />
      {worker && (
        <Tec1Footer
          classic={classic}
          worker={worker}
          handleChangeLayout={handleChangeLayout}
        />
      )}
    </div>
  );
};

export const Tec1App = styled(BaseTec1App)``;
