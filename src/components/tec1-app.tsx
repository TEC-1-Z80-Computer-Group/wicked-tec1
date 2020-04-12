import * as React from "react";
import styled from "styled-components";
import { audioInit, audioPlay, audioValue } from "../util/audio";
import MemoryMap from "nrf-intel-hex";
import { keyCodes } from "../constants";
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

  const handleChangeLayout = (event: any) => {
    const checked = event.target.checked;
    setClassic(checked);
    localStorage.setItem("classic", String(checked));
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
        pressed: true,
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
    setClassic(localStorage.getItem("classic") === "true");

    const worker0 = new Worker("../worker/worker.ts");
    setWorker(worker0);
    worker0.onmessage = receiveMessage;
    worker0.postMessage({ type: "INIT" });

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

  return (
    <div className={`${className} tec1-app`}>
      {worker && <Tec1Header worker={worker} />}
      <Tec1Main
        classic={classic}
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

export const Tec1App = styled(BaseTec1App)`
  outline: none;
  margin: 20px;
  margin-right: auto;
  margin-left: auto;
  display: inline-block;
  position: relative;
`;
