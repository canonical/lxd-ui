/**
MIT License

Copyright (c) 2020 Robert Harbison

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Terminal, ITerminalOptions, ITerminalAddon } from "xterm";
import "xterm/css/xterm.css";

interface Props {
  /**
   * Class name to add to the terminal container.
   */
  className?: string;

  /**
   * Options to initialize the terminal with.
   */
  options?: ITerminalOptions;

  /**
   * An array of XTerm addons to load along with the terminal.current.
   */
  addons?: Array<ITerminalAddon>;

  /**
   * Adds an event listener for when a binary event fires. This is used to
   * enable non UTF-8 conformant binary messages to be sent to the backend.
   * Currently this is only used for a certain type of mouse reports that
   * happen to be not UTF-8 compatible.
   * The event value is a JS string, pass it to the underlying pty as
   * binary data, e.g. `pty.write(Buffer.from(data, 'binary'))`.
   */
  onBinary?(data: string): void;

  /**
   * Adds an event listener for the cursor moves.
   */
  onCursorMove?(): void;

  /**
   * Adds an event listener for when a data event fires. This happens for
   * example when the user types or pastes into the terminal.current. The event value
   * is whatever `string` results, in a typical setup, this should be passed
   * on to the backing pty.
   */
  onData?(data: string): void;

  /**
   * Adds an event listener for when a key is pressed. The event value contains the
   * string that will be sent in the data event as well as the DOM event that
   * triggered it.
   */
  onKey?(event: { key: string; domEvent: KeyboardEvent }): void;

  /**
   * Adds an event listener for when a line feed is added.
   */
  onLineFeed?(): void;

  /**
   * Adds an event listener for when a scroll occurs. The event value is the
   * new position of the viewport.
   * @returns an `IDisposable` to stop listening.
   */
  onScroll?(newPosition: number): void;

  /**
   * Adds an event listener for when a selection change occurs.
   */
  onSelectionChange?(): void;

  /**
   * Adds an event listener for when rows are rendered. The event value
   * contains the start row and end rows of the rendered area (ranges from `0`
   * to `terminal.current.rows - 1`).
   */
  onRender?(event: { start: number; end: number }): void;

  /**
   * Adds an event listener for when the terminal is resized. The event value
   * contains the new size.
   */
  onResize?(event: { cols: number; rows: number }): void;

  /**
   * Adds an event listener for when an OSC 0 or OSC 2 title change occurs.
   * The event value is the new title.
   */
  onTitleChange?(newTitle: string): void;

  /**
   * Attaches a custom key event handler which is run before keys are
   * processed, giving consumers of xterm.js ultimate control as to what keys
   * should be processed by the terminal and what keys should not.
   *
   * @param event The custom KeyboardEvent handler to attach.
   * This is a function that takes a KeyboardEvent, allowing consumers to stop
   * propagation and/or prevent the default action. The function returns
   * whether the event should be processed by xterm.js.
   */
  customKeyEventHandler?(event: KeyboardEvent): boolean;

  /**
   * This callback porovides an interface for running actions directly after
   * the terminal is open. Some useful cations includes resizing the terminal
   * or focusing on the terminal etc.
   */
  onOpen?(): void;
}

export default forwardRef<Terminal, Props>(function Xterm(
  {
    options = {},
    addons,
    className,
    onBinary,
    onCursorMove,
    onData,
    onKey,
    onLineFeed,
    onScroll,
    onSelectionChange,
    onRender,
    onResize,
    onTitleChange,
    customKeyEventHandler,
    onOpen,
  }: Props,
  ref,
) {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal>(new Terminal(options));

  useImperativeHandle(ref, () => {
    return xtermRef.current;
  });

  const initialiseXterm = () => {
    // Load addons if the prop exists.
    if (addons) {
      addons.forEach((addon) => {
        xtermRef.current?.loadAddon(addon);
      });
    }

    // Create Listeners
    if (onBinary) xtermRef.current.onBinary(onBinary);
    if (onCursorMove) xtermRef.current.onCursorMove(onCursorMove);
    if (onData) xtermRef.current.onData(onData);
    if (onKey) xtermRef.current.onKey(onKey);
    if (onLineFeed) xtermRef.current.onLineFeed(onLineFeed);
    if (onScroll) xtermRef.current.onScroll(onScroll);
    if (onSelectionChange)
      xtermRef.current.onSelectionChange(onSelectionChange);
    if (onRender) xtermRef.current.onRender(onRender);
    if (onResize) xtermRef.current.onResize(onResize);
    if (onTitleChange) xtermRef.current.onTitleChange(onTitleChange);

    // Add Custom Key Event Handler
    if (customKeyEventHandler) {
      xtermRef.current.attachCustomKeyEventHandler(customKeyEventHandler);
    }
  };

  useEffect(() => {
    const terminal = terminalRef.current;
    if (terminal) {
      initialiseXterm();
      xtermRef.current?.open(terminal);
      setTerminalOpen(true);
    }

    return () => {
      xtermRef.current?.dispose();
    };
  }, []);

  useLayoutEffect(() => {
    if (terminalOpen && onOpen) {
      onOpen();
    }
  }, [terminalOpen]);

  return <div className={className} ref={terminalRef} />;
});
