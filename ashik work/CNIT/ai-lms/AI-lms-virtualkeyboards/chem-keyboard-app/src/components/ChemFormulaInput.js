import React, { useState, useRef, useEffect, useCallback } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill'; // Keep library import
import 'mathquill/build/mathquill.css'; // Keep library import
import './ChemFormulaInput.css'; // Renamed import

addStyles(); // Keep library call

const getShortcutKeyDisplay = (shortcut) => {
  if (!shortcut) return '';
  const parts = shortcut.split('+');
  return parts[parts.length - 1] || '';
};

// Renamed Component
const ChemFormulaInput = ({ initialLatex = '', onInsert }) => {
  const [latex, setLatex] = useState(initialLatex);
  const quillFieldRef = useRef(null); // Renamed ref variable

  // Effect to sync internal state when initialLatex prop changes
  useEffect(() => {
    if (initialLatex !== latex) {
      setLatex(initialLatex);
      if (quillFieldRef.current) { // Use renamed ref
        setTimeout(() => {
          if (quillFieldRef.current) { // Use renamed ref
            quillFieldRef.current.latex(initialLatex);
          }
        }, 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLatex]);

  // --- Symbol Definitions (Chemistry Focused) ---
  // Renamed variable, content remains focused on chemistry
  const keyboardSymbols = [
    // Row 1: Numbers, Basic Ops, Parentheses
    { display: '7', type: 'write', insert: '7' }, { display: '8', type: 'write', insert: '8' }, { display: '9', type: 'write', insert: '9' }, { display: '+', type: 'write', insert: '+', shortcut: 'Alt+Shift+='},
    { display: '(', type: 'cmd', insert: '(' }, { display: ')', type: 'cmd', insert: ')' }, { display: 'Sup', type: 'cmd', insert: '^', title:'Superscript xʸ', shortcut: 'Alt+Shift+6' },

    // Row 2: Numbers, Sub/Super, Arrows
    { display: '4', type: 'write', insert: '4' }, { display: '5', type: 'write', insert: '5' }, { display: '6', type: 'write', insert: '6' }, { display: '-', type: 'write', insert: '-' }, // Minus / Charge
    { display: 'Sub', type: 'cmd', insert: '_', title:'Subscript x<0xE1><0xB5><0xA7>', shortcut: 'Alt+Shift+-' },
    { display: '→', type: 'write', insert: '\\rightarrow', title: 'Reaction Arrow', shortcut: 'Alt+Shift+.' },
    { display: '⇌', type: 'write', insert: '\\rightleftharpoons', title: 'Reversible Arrow', shortcut: 'Alt+Shift+,' },

    // Row 3: Numbers, Equals, Common Elements
    { display: '1', type: 'write', insert: '1' }, { display: '2', type: 'write', insert: '2' }, { display: '3', type: 'write', insert: '3' }, { display: '=', type: 'write', insert: '=' },
    { display: 'H', type: 'write', insert: 'H' }, { display: 'C', type: 'write', insert: 'C' }, { display: 'O', type: 'write', insert: 'O' },

    // Row 4: Zero, Dot, Phases, Clear/Bksp
    { display: '0', type: 'write', insert: '0' }, { display: '.', type: 'write', insert: '.' },
    { display: '(s)', type: 'write', insert: '(s)'}, { display: '(l)', type: 'write', insert: '(l)'}, { display: '(g)', type: 'write', insert: '(g)'}, { display: '(aq)', type: 'write', insert: '(aq)'},
    { display: 'N', type: 'write', insert: 'N' }, // Example element

    // Row 5: Navigation, Control
     { display: '←', type: 'keystroke', insert: 'Left', style: {gridColumn: 'span 1'} },
     { display: '→', type: 'keystroke', insert: 'Right', style: {gridColumn: 'span 1'} },
     { display: 'Bksp', type: 'keystroke', insert: 'Backspace', style: {gridColumn: 'span 2'} },
     { display: 'Clear', type: 'clear', insert: '', style: {gridColumn: 'span 3'} },
  ];

   // --- Shortcut Map (Auto-generated) ---
   // Use renamed variable
   const shortcutMap = keyboardSymbols.reduce((acc, symbol) => {
    if (symbol.shortcut) {
      acc[symbol.shortcut.toUpperCase()] = { type: symbol.type, insert: symbol.insert };
    }
    return acc;
  }, {});

  // --- Focus & Insertion Logic ---
  // Renamed function
  const executeQuillCommand = useCallback((type, value) => {
    const mq = quillFieldRef.current; // Use renamed ref
    if (!mq) return;
    mq.focus();
    try {
      switch (type) {
        case 'cmd': mq.cmd(value); break;
        case 'write': mq.write(value); break;
        case 'keystroke': mq.keystroke(value); break;
        case 'clear': mq.latex(''); setLatex(''); break;
        default: console.warn(`Unknown command type: ${type}`); return;
      }
    } catch (error) { console.error("Error executing command:", error); }
  }, []);

  // --- Event Handlers ---
  const handleButtonClick = (symbol) => {
    executeQuillCommand(symbol.type, symbol.insert); // Use renamed function
  };

  // Renamed handler
  const handleQuillFieldChange = (quillField) => {
    setLatex(quillField.latex());
    quillFieldRef.current = quillField; // Use renamed ref
  };

  const handleInsertClick = useCallback(() => {
    if (onInsert) onInsert(latex);
  }, [latex, onInsert]);

  // --- Shortcut Effect Hook ---
  useEffect(() => {
    const handleKeyDown = (event) => {
       // ... (shortcut logic remains the same)
       const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
       const modifier = isMac ? 'OPTION+' : 'ALT+';
       let shortcutString = '';
       if ((event.altKey || event.metaKey) && event.shiftKey) {
           shortcutString += modifier + 'SHIFT+';
       } else { return; }
       if (/^[A-Z0-9=<>+\-*/.,]$/i.test(event.key)) {
          shortcutString += event.key.toUpperCase();
       } else { return; }
       const lookupKey = `ALT+SHIFT+${event.key.toUpperCase()}`;
       const command = shortcutMap[lookupKey];
       if (command) {
          // Use renamed ref
          if (quillFieldRef.current && quillFieldRef.current.el().contains(event.target)) {
               event.preventDefault();
               executeQuillCommand(command.type, command.insert); // Use renamed function
          }
       }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
    // Use renamed function in dependencies
  }, [executeQuillCommand, shortcutMap]);

  // --- Render Logic ---
  return (
    // Use renamed CSS class
    <div className="chem-formula-input-content">
      <p className="shortcut-instructions">
         Use <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>KEY</kbd> (Win/Linux) or <kbd>Option</kbd>+<kbd>Shift</kbd>+<kbd>KEY</kbd> (Mac) for <span className="shortcut-indicator-example">KEY</span> shortcuts.
      </p>
      {/* Use renamed CSS class */}
      <div className="chem-input-field-wrapper">
        {/* Keep library component name */}
        <EditableMathField
          latex={latex}
          onChange={handleQuillFieldChange} // Use renamed handler
           // Use renamed ref and library prop name
          mathquillDidMount={(mf) => { quillFieldRef.current = mf; }}
          config={{ autoCommands: 'pi theta sqrt sum prod int', /* Default MathQuill commands */ }}
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', fontSize: '1.3em', minHeight: '50px' }}
        />
      </div>
      <div className="action-button-container">
        <button onClick={handleInsertClick} className="insert-button" disabled={!latex.trim()}>
          Insert Formula/Eq {/* Slightly updated text */}
        </button>
      </div>
      {/* Use updated CSS class if defined */}
      <div className="virtual-keyboard chem-layout">
        {/* Use renamed variable */}
        {keyboardSymbols.map((symbol, index) => {
          const shortcutKey = getShortcutKeyDisplay(symbol.shortcut);
          return (
            <button
              key={index}
              onClick={() => handleButtonClick(symbol)}
              title={symbol.title || (symbol.shortcut ? `Shortcut: ${symbol.shortcut.replace('ALT', 'Alt/Option')}` : '')}
              className="key-button"
              style={symbol.style || {}}
            >
              {shortcutKey && (<span className="shortcut-indicator">{shortcutKey}</span>)}
              {symbol.display}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ChemFormulaInput; // Renamed export