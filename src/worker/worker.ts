/* eslint-disable @typescript-eslint/camelcase */

import { Z80 } from "./z80";
import MemoryMap from "nrf-intel-hex";

let running = false;
// eslint-disable-next-line prefer-const
let active = true;
let speed = 30;

let cycles = 0;
const buffer = new ArrayBuffer(0xffff);
const memory = new Uint8Array(buffer).fill(0xff);
const inPorts = Array(256).fill(0xff);
const outPorts = Array(256).fill(0xff);
const display = Array(6).fill(0);
let speaker = 1;
let wavelength = 0;

const cpu = Z80({
  mem_read: (addr: number) => memory[addr],
  mem_write: (addr: number, value: number) => (memory[addr] = value),
  io_read: (port: number) => {
    return inPorts[port & 0xff];
  },
  io_write: (port: number, value: number) => {
    const port1 = port & 0xff;
    outPorts[port1] = value;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    updateDisplay();
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    postOutPorts(port1, value);
  },
});

function updateDisplay() {
  const digits = outPorts[1];
  const segments = outPorts[2];
  let mask = 0x01;
  for (let i = 0; i < 6; i++) {
    if (digits & mask) {
      display[i] = segments;
    }
    mask = mask << 1;
  }
}

function updateMemory(rom: string) {
  const blocks = MemoryMap.fromHex(rom);
  for (const address of blocks.keys()) {
    const block = blocks.get(address);
    for (let i = 0; i < block.length; i++) {
      memory[i + address] = block[i];
    }
  }
}

function getPortsBuffer() {
  const buffer = new ArrayBuffer(4);
  const view = new Uint8Array(buffer);
  view[0] = outPorts[0];
  view[1] = outPorts[1];
  view[2] = outPorts[2];
  return buffer;
}

function getDisplayBuffer() {
  const buffer = new ArrayBuffer(6);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < 6; i++) {
    view[i] = display[i];
  }
  return buffer;
}

function readMemory(from: number, size: number) {
  const buffer = new ArrayBuffer(size);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < size; i++) {
    bytes[i] = memory[i + from];
  }
  (self as any).postMessage(
    {
      type: "POST_MEMORY",
      from,
      size,
      buffer,
    },
    [buffer]
  );
}

function postOutPorts(port: number, value: number) {
  const buffer = getPortsBuffer();
  const display = getDisplayBuffer();

  if (port === 1) {
    const speaker1 = value >> 7;
    if (speaker1 === 1 && speaker === 0) {
      wavelength = cycles;
      cycles = 0;
    }
    speaker = speaker1;
  }
  if (cycles > 10000) wavelength = 0;

  (self as any).postMessage(
    {
      type: "POST_OUTPORTS",
      buffer,
      display,
      speaker,
      wavelength,
      pc: cpu.getPC(),
    },
    [buffer, display]
  );
}

function* runGen() {
  while (true) {
    for (let i = 0; i < 1000; i++) {
      try {
        const count = cpu.run_instruction();
        cycles += count;
      } catch (e) {
        const pc = cpu.getPC();
        const mem = memory[cpu.getPC()] || 0;
        console.log(
          `Illegal operation at ${pc.toString(16)}: ${mem.toString(16)}`
        );
        cpu.reset();
      }
    }
    yield cycles;
  }
}

let pending = false;
const iter = runGen();
function run() {
  if (pending) return;
  if (!running) return;
  iter.next();
  const delay = Math.floor((1 - Number(speed)) * 30);
  if (running) {
    pending = true;
    setTimeout(function () {
      pending = false;
      run();
    }, delay);
  }
}

const resetRun = (reset: boolean) => {
  if (reset){
    cpu.reset();
  }
  // running = true;
  // run();
}

self.onmessage = (event: any) => {
  if (event.data.type === "INIT") {
    resetRun(true);
  // } else if (event.data.type === "PAUSE") {
  //   if (active) {
  //     active = false;
  //     running = false;
  //   } else {
  //     active = true;
  //     running = true;
  //     run();
  //   }
  } else if (event.data.type === "RESET") {
    console.log("resetting");
    resetRun(true);
  } else if (event.data.type === "SET_INPUT_VALUE") {
    const { port, value } = event.data;
    inPorts[port] = value;
  } else if (event.data.type === "SET_KEY_VALUE") {
    const { code, pressed } = event.data;
    inPorts[0] = code;
    const bit6 = 0b01000000;
    const bit6mask = ~bit6;
    inPorts[3] = (inPorts[3] & bit6mask) | (!pressed ? bit6 : 0);
  } else if (event.data.type === "SET_SPEED") {
    speed = Number(event.data.value) / 100;
    console.log("set speed", speed);
  } else if (event.data.type === "NMI") {
    cpu.interrupt(true, 0);
  } else if (event.data.type === "UPDATE_MEMORY") {
    updateMemory(event.data.value);
    resetRun(true);
  } else if (event.data.type === "READ_MEMORY") {
    readMemory(event.data.from, event.data.size);
  } else if (event.data.type === "HIDDEN") {
    const hidden = event.data.value;
    if (hidden) {
      running = false;
    } else if (active) {
      running = true;
      run();
      resetRun(false);
    } else {
      console.log("not active");
    }
  }
};


