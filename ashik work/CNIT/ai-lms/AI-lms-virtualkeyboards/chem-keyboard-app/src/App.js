import React, { useState, useRef, useMemo, useEffect } from 'react';
import ChemKeyboardModal from './components/ChemKeyboardModal'; // Renamed import
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import './App.css';

// Parser function (Keep as is - handles delimiters)
const parseTextWithLatex = (text) => { /* ... same as before ... */
  if (!text) return [];
  const regex = /(\$\$[\s\S]*?\$\$)|(\$[^\$\n]*?\$)/g;
  const segments = []; let lastIndex = 0; let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) { segments.push({ type: 'text', content: text.substring(lastIndex, match.index) }); }
    if (match[1]) { segments.push({ type: 'block', content: match[1].slice(2, -2) }); }
    else if (match[2]) { segments.push({ type: 'inline', content: match[2].slice(1, -1) }); }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) { segments.push({ type: 'text', content: text.substring(lastIndex) }); }
  return segments;
};

// KaTeX Settings (Keep as is - needed for \ce)
const katexSettings = { trust: true };

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [answerText, setAnswerText] = useState('Example: $$ \{H_2O(l) <=> H+(aq) + OH-(aq)} $$ and ions like $\{SO_4^{2-}}$.');
  const answerTextAreaRef = useRef(null);

  // Debug check for mhchem (keep as is)
  useEffect(() => {
     setTimeout(() => {
         if (window.katex && window.katex.__mhchem) { console.log("mhchem appears loaded."); }
         else { console.warn("mhchem may not be loaded. \\ce{...} might not render chemistry correctly."); }
     }, 1000);
  }, []);

  // Renamed handler
  const openChemKeyboard = () => setIsModalOpen(true);
  const closeChemKeyboard = () => setIsModalOpen(false);

  // Insert Formula/Equation
  const insertChemFormula = (latex) => { // Renamed function
    const textarea = answerTextAreaRef.current;
    if (!textarea || !latex) return;
    const start = textarea.selectionStart; const end = textarea.selectionEnd; const text = textarea.value;
    // Wrap with \ce inside $$ for best chemistry rendering
    const textToInsert = `$\{${latex.trim()}}$`;
    const newValue = text.substring(0, start) + textToInsert + text.substring(end);
    setAnswerText(newValue);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const renderedSegments = useMemo(() => parseTextWithLatex(answerText), [answerText]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chemistry Answer Section</h1> {/* Renamed */}
      </header>
      <main>
        <div className="answer-area">
          {/* Updated Label */}
          <label htmlFor="studentAnswer">Type Your Answer :</label>
          <div className="input-wrapper">
            <textarea
              id="studentAnswer"
              ref={answerTextAreaRef}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              rows="8"
              placeholder="Type your answer. Use delimiters like $ or $$. Use the button to open the keyboard..." // Updated placeholder
            />
            {/* Use renamed handler and class */}
            <button
              onClick={openChemKeyboard}
              className="open-chem-keyboard-btn"
              title="Open Chemistry Keyboard" // Updated title
              aria-label="Open Chemistry Keyboard" // Updated aria-label
            >
              {/* Consider a chemistry icon? */}
              ⇌ {/* Example Icon */}
            </button>
          </div>

          {/* Rendered Display (Pass settings) */}
          <div className="rendered-answer-display">
            <label>Rendered Preview:</label>
            <div className="rendered-content">
              {renderedSegments.map((segment, index) => {
                if (segment.type === 'block') {
                  try { return <BlockMath key={index} math={segment.content} settings={katexSettings} />; }
                  catch (error) { console.error("KaTeX Error (Block):", error); return <span key={index} style={{color: 'red', display: 'block'}}> $$[Invalid Input]$$ </span>; }
                } else if (segment.type === 'inline') {
                  try { return <InlineMath key={index} math={segment.content} settings={katexSettings} />; }
                  catch (error) { console.error("KaTeX Error (Inline):", error); return <span key={index} style={{color: 'red'}}> $[Invalid Input]$ </span>; }
                } else {
                  return <span key={index} style={{ whiteSpace: 'pre-wrap' }}>{segment.content}</span>;
                }
              })}
            </div>
          </div>
        </div>

        {/* Use renamed component and props */}
        <ChemKeyboardModal
          isOpen={isModalOpen}
          onClose={closeChemKeyboard}
          onInsertFormula={insertChemFormula}
        />
      </main>
    </div>
  );
}

export default App;