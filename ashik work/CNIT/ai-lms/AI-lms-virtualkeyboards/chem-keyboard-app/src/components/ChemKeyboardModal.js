import React, { useState, useEffect, useCallback } from 'react';
import ChemFormulaInput from './ChemFormulaInput'; 
import './ChemKeyboardModal.css'; 
import { InlineMath } from 'react-katex'; 

const MAX_HISTORY_SIZE = 15;
const HISTORY_KEY = 'chemKeyboardHistory'; 

const ChemKeyboardModal = ({ isOpen, onClose, onInsertFormula, initialLatex = '' }) => { 
  const [currentLatex, setCurrentLatex] = useState(initialLatex);
  const [activeTab, setActiveTab] = useState('editor');
  const [history, setHistory] = useState(() => {
    try {
        const savedHistory = localStorage.getItem(HISTORY_KEY); 
        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) { console.error("Failed to load history:", error); return []; }
  });

  useEffect(() => {
    if (isOpen) { setCurrentLatex(initialLatex); setActiveTab('editor'); }
    const handleEsc = (event) => { if (event.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, initialLatex, onClose]);

  useEffect(() => {
     try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } 
     catch (error) { console.error("Failed to save history:", error); }
  }, [history]);

  const addToHistory = useCallback((latexValue) => {
    if (!latexValue || latexValue.trim() === '') return;
    setHistory(prev => {
      const filtered = prev.filter(item => item !== latexValue);
      const newHist = [latexValue, ...filtered];
      return newHist.length > MAX_HISTORY_SIZE ? newHist.slice(0, MAX_HISTORY_SIZE) : newHist;
    });
  }, []);

  const handleInsert = useCallback((latexValue) => {
    addToHistory(latexValue);
    onInsertFormula(latexValue); 
    onClose();
  }, [onInsertFormula, onClose, addToHistory]);

  const handleHistoryItemClick = (latexItem) => {
    setCurrentLatex(latexItem);
    setActiveTab('editor');
  };

  const handleContentClick = (e) => e.stopPropagation();

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
      <div className="modal-content" onClick={handleContentClick}>
         <div className="modal-header">
            <h4>Chemistry Formula Editor</h4> 
            <button className="modal-close-button" onClick={onClose} aria-label="Close">×</button>
         </div>
         <div className="modal-tabs">
            <button className={`tab-button ${activeTab === 'editor' ? 'active' : ''}`} onClick={() => setActiveTab('editor')}>Editor</button>
            <button className={`tab-button ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History ({history.length})</button>
         </div>
         <div className="modal-body">
            {activeTab === 'editor' && (
               <ChemFormulaInput 
                  initialLatex={currentLatex}
                  onInsert={handleInsert}
                  key={currentLatex}
               />
            )}
            {activeTab === 'history' && (
               <div className="history-section">
                  {history.length === 0 ? (
                     <p className="no-history">No formulas or equations saved yet.</p>
                  ) : (
                     <ul className="history-list">
                        {history.map((item, index) => (
                           <li key={index} className="history-item" onClick={() => handleHistoryItemClick(item)} title="Click to load into editor">
                               <InlineMath math={item} settings={{trust:true, throwOnError: false}} />
                           </li>
                        ))}
                     </ul>
                  )}
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default ChemKeyboardModal; 