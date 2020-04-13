import * as React from 'react';
import styled from 'styled-components';
import MemoryMap from 'nrf-intel-hex';
import {
  audioInit,
  audioPlay,
  audioValue,
  isAudioInitialised,
} from '../../util/audio';
import { keyCodes, layouts } from '../../constants';
import { Stylable } from '../../types';
import { Header } from './header';
import { Main } from './main';
import { Footer } from './footer';
import {
  isHidden,
  addVisibilityListener,
  removeVisiblityListener,
} from '../../util/page-visibility';
import { ROM as Mon1BRom } from '../../roms/MON-1B';

const anchor = document.createElement('a');

const BaseTec1 = ({ className }: Stylable) => {
  const [display, setDisplay] = React.useState(Array(6).fill(0));
  const [shiftLocked, setShiftLocked] = React.useState(false);
  const [worker, setWorker] = React.useState<Worker>();
  const [layout, setLayout] = React.useState(
    localStorage.getItem('layout') || layouts.CLASSIC
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

  const handleInteraction = () => {
    if (!isAudioInitialised()) {
      // audioInit();
    }
  };

  const handleChangeLayout = (newLayout: string) => {
    const n = newLayout?.toUpperCase() || '';
    if (!n) {
      setLayout(layouts.CLASSIC);
    } else if (n in layouts) {
      setLayout(layouts[n]);
    } else {
      setLayout(n);
    }
  };

  const handleCode = (code: string) => {
    if (!isAudioInitialised()) {
      audioInit();
    }
    if (code === 'Escape') {
      postWorkerMessage({ type: 'RESET' });
      return true;
    }
    if (code === 'ShiftLock') {
      setShiftLocked(!shiftLocked);
      return true;
    }
    if (code in keyCodes) {
      const keyCode = keyCodes[code];
      if (keyCode == null) return false;
      const bit5 = 0b00100000;
      const mask = ~bit5;
      let keyCode1 = keyCode & mask;
      if (!shiftLocked) keyCode1 |= bit5;
      postWorkerMessage({ type: 'SET_INPUT_VALUE', port: 0, value: keyCode1 });
      postWorkerMessage({
        type: 'SET_KEY_VALUE',
        code: keyCode1,
        pressed: !shiftLocked,
      });
      postWorkerMessage({ type: 'NMI' });
      return true;
    }
    return false;
  };

  const handleKeyDown = (event: any) => {
    if (event.key === 'Shift') {
      setShiftLocked(true);
    } else if (handleCode(event.code)) {
      event.preventDefault();
    }
  };

  const handleKeyUp = (event: any) => {
    if (event.key === 'Shift') {
      setShiftLocked(false);
    }
  };

  const receiveMessage = (event: { data: any }) => {
    if (event.data.type === 'POST_DISPLAY') {
      setDisplay([...new Uint8Array(event.data.display)]);
    } else if (event.data.type === 'POST_WAVELENGTH') {
      const { wavelength } = event.data;
      const frequency = wavelength ? 500000 / wavelength : 0;
      audioValue(frequency);
    } else if (event.data.type === 'POST_ALL_MEMORY') {
      const { memory } = event.data;
      localStorage.setItem('memory', memory);
    } else if (event.data.type === 'POST_MEMORY') {
      const { from, buffer } = event.data;
      const memMap = new MemoryMap();
      const bytes = new Uint8Array(buffer);
      memMap.set(from, bytes);

      anchor.download = `TEC-1-${new Date().getTime()}.hex`;
      const hexString = memMap.asHexString();
      anchor.href = URL.createObjectURL(
        new Blob([hexString], { type: 'application/octet-stream' })
      );
      anchor.dataset.downloadurl = [
        'text/plain',
        anchor.download,
        anchor.href,
      ].join(':');
      anchor.click();
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    addVisibilityListener(handleVisibility);
    const newWorker = new Worker('../../worker/worker.ts');
    setWorker(newWorker);
    newWorker.onmessage = receiveMessage;
    newWorker.postMessage({ type: 'INIT' });
    let memory = localStorage.getItem('memory') || '';
    if (!memory) {
      memory = Mon1BRom;
    }
    newWorker.postMessage({ type: 'UPDATE_MEMORY', value: memory });
    return () => {
      if (newWorker) {
        newWorker.terminate();
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      removeVisiblityListener(handleVisibility);
    };
  }, []);

  React.useEffect(() => {
    localStorage.setItem('layout', layout);
  }, [layout]);

  React.useEffect(() => {
    if (isAudioInitialised()) {
      audioPlay(!hidden);
    }
    postWorkerMessage({ type: 'HIDDEN', value: hidden });
  }, [worker, hidden]);

  return (
    <div className={`${className} tec1-app`} onMouseEnter={handleInteraction}>
      {worker && <Header worker={worker} />}
      <Main
        layout={layout}
        display={display}
        shiftLocked={shiftLocked}
        handleCode={handleCode}
      />
      {worker && (
        <Footer
          worker={worker}
          layout={layout}
          onChangeLayout={handleChangeLayout}
        />
      )}
    </div>
  );
};

export const Tec1 = styled(BaseTec1)`
  outline: none;
  margin: 20px;
  margin-right: auto;
  margin-left: auto;
  display: inline-block;
  position: relative;
`;
