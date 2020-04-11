import * as React from "react";
import styled from "styled-components";
import { Stylable, EventFunc } from "../types";

interface Tec1FooterProps extends Stylable {
  classic: boolean;
  worker: any;
  handleChangeLayout: EventFunc;
}

const BaseTec1Footer = ({
  classic,
  worker,
  handleChangeLayout,
  className,
}: Tec1FooterProps) => {
  const [speed, setSpeed] = React.useState(localStorage.getItem("speed"));

  const postSpeed = (speed: string) => {
    setSpeed(speed);
    worker.postMessage({ type: "SET_SPEED", value: speed });
  };

  const changeROM = async (name: string) => {
    //import must be a static string for parcelJS
    const p =
      name == "MON-1A"
        ? import("../roms/MON-1A")
        : name == "MON-1B"
        ? import("../roms/MON-1B")
        : name == "MON-2"
        ? import("../roms/MON-2")
        : name == "JMON"
        ? import("../roms/JMON")
        : import("../roms/MON-1");
    const result = await p;
    worker.postMessage({ type: "UPDATE_MEMORY", value: result.ROM });
  };

  React.useEffect(() => {
    const s = localStorage.getItem("speed") || '100';
    postSpeed(s);
    changeROM("MON-1");
  }, []);

  const handleChangeROM = async (event: any) => {
    const name = event.target.value || "MON-1";
    changeROM(name);
  };

  const handleChangeSpeed = (event: any) => {
    const value = event.target.value;
    localStorage.setItem("speed", String(value));
    postSpeed(value);
  };

  return (
    <div className={`${className} tec1-footer`}>
      <div className={`${className} first-row`}>
        <label htmlFor="rom-select">ROM</label>
        <select id="rom-select" onChange={handleChangeROM}>
          <option>MON-1</option>
          <option>MON-1A</option>
          <option>MON-1B</option>
          <option>MON-2</option>
          <option>JMON</option>
        </select>
        <div>
          <input
            id="key-layout"
            type="checkbox"
            checked={classic}
            onChange={handleChangeLayout}
          />
          <label htmlFor="key-layout">original key layout</label>
        </div>
        <div>
          <label htmlFor="speed">Speed</label>
          Speed
          <input
            id="speed"
            type="range"
            min="0"
            max="99"
            value={speed || "50"}
            onChange={handleChangeSpeed}
          />
        </div>
      </div>
      <p>MON 1 Restart:</p>
      <div className="restarts-panel">
        <div>
          <div>CF (RST 1) INVADERS</div>
          <div>D7 (RST 2) NIM</div>
          <div>DF (RST 3) LUNALANDER</div>
        </div>
        <div>
          <div>EF (RST 5) TUNE 1 Bealach An Doirín</div>
          <div>F7 (RST 6) TUNE 2 Biking up the Strand</div>
        </div>
      </div>
    </div>
  );
};

export const Tec1Footer = styled(BaseTec1Footer)`
  .first-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin: 3px;
  }

  .restarts-panel {
    display: flex;
    justify-content: space-between;
  }
`;
