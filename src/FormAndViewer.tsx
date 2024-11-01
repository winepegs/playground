// prettier-ignore
// FormAndViewer.tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { Template, checkTemplate, getInputFromTemplate } from "@pdfme/common";
import { Form, Viewer } from "@pdfme/ui";
import {
  getFontsData,
  getTemplateByPreset,
  handleLoadTemplate,
  generatePDF,
  getPlugins,
  isJsonString,
} from "./helper";

const headerHeight = 71;
type Mode = "form" | "viewer";

const initTemplate = () => {
  try {
    const templateString = localStorage.getItem("template");
    if (!templateString) {
      return getTemplateByPreset(localStorage.getItem('templatePreset') || "");
    }
    const templateJson = JSON.parse(templateString);
    checkTemplate(templateJson);
    return templateJson as Template;
  } catch {
    localStorage.removeItem("template");
    return getTemplateByPreset(localStorage.getItem('templatePreset') || "");
  }
};

function App() {
  const uiRef = useRef<HTMLDivElement | null>(null);
  const ui = useRef<Form | Viewer | null>(null);
  const [mode, setMode] = useState<Mode>(
    (localStorage.getItem("mode") as Mode) ?? "form"
  );

  const buildUi = useCallback(async (mode: Mode) => {
    if (!uiRef.current) return;

    const template = initTemplate();
    let inputs = getInputFromTemplate(template);
    try {
      const inputsString = localStorage.getItem("inputs");
      if (inputsString) {
        inputs = JSON.parse(inputsString);
      }
    } catch {
      localStorage.removeItem("inputs");
    }

    const font = await getFontsData();
    
    if (ui.current) {
      ui.current.destroy();
    }

    ui.current = new (mode === "form" ? Form : Viewer)({
      domContainer: uiRef.current,
      template,
      inputs,
      options: {
        font,
        lang: 'ja',
        labels: { 'clear': '消去' },
        theme: {
          token: {
            colorPrimary: '#25c2a0',
          },
        },
      },
      plugins: getPlugins(),
    });
  }, []);

  useEffect(() => {
    buildUi(mode);
  }, [mode, buildUi]);

  const onChangeMode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value as Mode;
    setMode(value);
    localStorage.setItem("mode", value);
  }, []);

  const onGetInputs = useCallback(() => {
    if (!ui.current) return;
    const inputs = ui.current.getInputs();
    alert(JSON.stringify(inputs, null, 2));
    console.log(inputs);
  }, []);

  const onSetInputs = useCallback(() => {
    if (!ui.current) return;
    const prompt = window.prompt("Enter Inputs JSONString") || "";
    try {
      const json = isJsonString(prompt) ? JSON.parse(prompt) : [{}];
      ui.current.setInputs(json);
    } catch (e) {
      alert(e);
    }
  }, []);

  const onSaveInputs = useCallback(() => {
    if (!ui.current) return;
    const inputs = ui.current.getInputs();
    localStorage.setItem("inputs", JSON.stringify(inputs));
    alert("Saved!");
  }, []);

  const onResetInputs = useCallback(() => {
    localStorage.removeItem("inputs");
    if (!ui.current) return;
    const template = initTemplate();
    ui.current.setInputs(getInputFromTemplate(template));
  }, []);

  return (
    <div style={{ 
      background: '#f5f5f7',
      height: '100vh',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        display: "flex",
        flex: '0 0 auto',
        alignItems: "center",
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        gap: '1.5rem',
        height: `${headerHeight}px`,
        boxSizing: 'border-box'
      }}>
        <strong style={{ fontSize: '1.1rem', color: '#1d1d1f' }}>Form, Viewer</strong>
        <span style={{ margin: "0 1rem" }}>:</span>
        <div>
          <input 
            type="radio" 
            onChange={onChangeMode} 
            id="form" 
            value="form" 
            checked={mode === "form"} 
          />
          <label htmlFor="form">Form</label>
          <input 
            type="radio" 
            onChange={onChangeMode} 
            id="viewer" 
            value="viewer" 
            checked={mode === "viewer"} 
          />
          <label htmlFor="viewer">Viewer</label>
        </div>

        <label style={{ width: 180 }}>
          Load Template
          <input 
            type="file" 
            accept="application/json" 
            onChange={(e) => handleLoadTemplate(e, ui.current)} 
          />
        </label>

        <button onClick={onGetInputs} style={buttonStyle}>Get Inputs</button>
        <button onClick={onSetInputs} style={buttonStyle}>Set Inputs</button>
        <button onClick={onSaveInputs} style={buttonStyle}>Save Inputs</button>
        <button onClick={onResetInputs} style={buttonStyle}>Reset Inputs</button>
        <button 
          onClick={() => generatePDF(ui.current)} 
          style={{
            ...buttonStyle,
            background: '#0071e3',
            color: 'white',
          }}
        >
          Generate PDF
        </button>
      </header>

      <div ref={uiRef} style={{ 
        flex: '1 1 auto',
        width: '100%',
        overflow: 'auto'
      }} />
    </div>
  );
}

const buttonStyle = {
  padding: '0.6rem 1.2rem',
  borderRadius: '6px',
  border: '1px solid #d2d2d7',
  background: 'white',
  fontSize: '0.9rem',
  color: '#1d1d1f',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    background: '#f5f5f7'
  }
};

export default App;