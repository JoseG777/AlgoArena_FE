import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import type { OnChange } from '@monaco-editor/react';

const MonacoEditor: React.FC = () => {
  const [code, setCode] = useState<string>('// Start typing your code here...');
  const [language, setLanguage] = useState<string>('javascript');

  const handleEditorChange: OnChange = (value) => {
    if (value !== undefined) setCode(value);
  };

  const handleStartClick = (): void => {
    console.log('Start clicked');
    // You can later trigger backend or run code here
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Page Title */}
      <h1 style={{ textAlign: 'center' }}>Monaco Editor Integration</h1>

      {/* Side by side layout */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
        
        {/* Left side: Editor */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {/* Language Selector */}
          <div style={{ marginBottom: '10px', textAlign: 'center' }}>
            <label htmlFor="language-select">Language: </label>
            <select
              id="language-select"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Monaco Editor */}
          <Editor
            height="400px"
            width="100%"
            defaultLanguage={language}
            language={language}
            value={code}
            onChange={handleEditorChange}
            theme="vs-dark"
          />
        </div>

        {/* Right side: Live Output */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
    

          {/* Output Box */}
          <div
            style={{
              flex: 1,
              backgroundColor: '#010101ff',
              padding: '10px',
              borderRadius: '5px',
              minHeight: '400px',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              overflowY: 'auto'
            }}
          >
            <h3>Live Output:</h3>
            {code}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonacoEditor;
