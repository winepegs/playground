import { useRef, useState } from "react";
import { cloneDeep, Template, checkTemplate } from "@pdfme/common";
import { Designer } from "@pdfme/ui";
import {
  getFontsData,
  getTemplatePresets,
  getTemplateByPreset,
  readFile,
  getPlugins,
  handleLoadTemplate,
  generatePDF,
  downloadJsonFile,
} from "./helper";

const headerHeight = 80;

const initialTemplatePresetKey = "invoice"
const customTemplatePresetKey = "custom";

const templatePresets = getTemplatePresets();

function App() {
  const designerRef = useRef<HTMLDivElement | null>(null);
  const designer = useRef<Designer | null>(null);
  const [templatePreset, setTemplatePreset] = useState<string>(localStorage.getItem("templatePreset") || initialTemplatePresetKey);
  const [prevDesignerRef, setPrevDesignerRef] = useState<Designer | null>(null);

  const buildDesigner = () => {
    let template: Template = getTemplateByPreset(localStorage.getItem('templatePreset') || "");
    try {
      const templateString = localStorage.getItem("template");
      if (templateString) {
        setTemplatePreset(customTemplatePresetKey);
      }

      const templateJson = templateString
        ? JSON.parse(templateString)
        : getTemplateByPreset(localStorage.getItem('templatePreset') || "");
      checkTemplate(templateJson);
      template = templateJson as Template;
    } catch {
      localStorage.removeItem("template");
    }

    getFontsData().then((font) => {
      if (designerRef.current) {
        designer.current = new Designer({
          domContainer: designerRef.current,
          template,
          options: {
            font,
            labels: {
              'clear': '🗑️', // Add custom labels to consume them in your own plugins
            },
            theme: {
              token: {
                colorPrimary: '#25c2a0',
              },
            },
            icons: {
              multiVariableText: '<svg fill="#000000" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.643,13.072,17.414,2.3a1.027,1.027,0,0,1,1.452,0L20.7,4.134a1.027,1.027,0,0,1,0,1.452L9.928,16.357,5,18ZM21,20H3a1,1,0,0,0,0,2H21a1,1,0,0,0,0-2Z"/></svg>'
            },
          },
          plugins: getPlugins(),
        });

      

        designer.current.onSaveTemplate(onSaveTemplate);
        designer.current.onChangeTemplate(() => {
          setTemplatePreset(customTemplatePresetKey);
        })
      }
    });
  }

  const onChangeBasePDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target && e.target.files) {
      readFile(e.target.files[0], "dataURL").then(async (basePdf) => {
        if (designer.current) {
          designer.current.updateTemplate(
            Object.assign(cloneDeep(designer.current.getTemplate()), {
              basePdf,
            })
          );
        }
      });
    }
  };

  const onDownloadTemplate = () => {
    if (designer.current) {
      downloadJsonFile(designer.current.getTemplate(), "template");
      console.log(designer.current.getTemplate());
    }
  };

  const onSaveTemplate = (template?: Template) => {
    if (designer.current) {
      localStorage.setItem(
        "template",
        JSON.stringify(template || designer.current.getTemplate())
      );
      alert("Saved!");
    }
  };

  const onChangeTemplatePresets = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTemplatePreset(e.target.value);
    localStorage.setItem("template", JSON.stringify(getTemplateByPreset(localStorage.getItem('templatePreset') || "")));
    localStorage.removeItem("template");
    localStorage.setItem("templatePreset", e.target.value);
    buildDesigner();
  }

  if (designerRef != prevDesignerRef) {
    if (prevDesignerRef && designer.current) {
      designer.current.destroy();
    }
    buildDesigner();
    setPrevDesignerRef(designerRef);
  }

  return (
    <div style={{ 
      background: '#f5f5f7',
      height: '100vh',  // or use CSS custom property
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <header style={{
        display: "flex",
        flex: '0 0 auto' ,
        alignItems: "center",
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        gap: '1.5rem',
        height: `${headerHeight}px`,
        boxSizing: 'border-box'  // Include padding in height calculation
      }}>
        <strong style={{ 
          fontSize: '1.1rem', 
          color: '#1d1d1f'
        }}>Proposal Designer</strong>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem',
          flex: 1
        }}>
          <label style={labelStyle}>
            Template Preset
            <select onChange={onChangeTemplatePresets} value={templatePreset} style={selectStyle}>
              {templatePresets.map((preset) => (
                <option key={preset.key}
                  disabled={preset.key === customTemplatePresetKey}
                  value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
          Change BasePDF
            <input 
              type="file" 
              accept="application/json" 
              onChange={onChangeBasePDF}
              style={{ 
                display: 'none'  // Hide the default file input
              }} 
              id="basefileInput"
            />
            <button 
              onClick={() => document.getElementById('basefileInput')?.click()} 
              style={buttonStyle}
            >
              Choose File
            </button>
          </label>

          <label style={labelStyle}>
            Load Template
            <input 
              type="file" 
              accept="application/json" 
              onChange={(e) => {
                handleLoadTemplate(e, designer.current);
                setTemplatePreset(customTemplatePresetKey);
              }} 
              style={{ 
                display: 'none'  // Hide the default file input
              }} 
              id="fileInput"
            />
            <button 
              onClick={() => document.getElementById('fileInput')?.click()} 
              style={buttonStyle}
            >
              Choose File
            </button>
          </label>
          </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem',
          flex: 1
        }}>
          <button onClick={onDownloadTemplate} style={buttonStyle}>Download Template</button>
          <button onClick={() => onSaveTemplate()} style={buttonStyle}>Save Template</button>
          <button onClick={() => generatePDF(designer.current)} style={{
            ...buttonStyle,
            background: '#0071e3',
            color: 'white',
          }}>Generate PDF</button>
        </div>
      </header>
      <div ref={designerRef} style={{ 
        flex: '1 1 auto',  // Take up remaining space
        width: '100%',     // Don't need vw since parent constrains
        overflow: 'auto',
      }} />
    </div>
  );
}

// Add these style objects at the bottom of your file
const labelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  fontSize: '0.8rem',
  color: '#86868b',
  gap: '0.3rem'
};

const selectStyle = {
  padding: '0.5rem',
  borderRadius: '6px',
  border: '1px solid #d2d2d7',
  fontSize: '0.9rem',
  color: '#1d1d1f',
  background: 'white',
  cursor: 'pointer',
  outline: 'none'
};

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

const fileInputStyle = {
  fontSize: '0.9rem',
  color: '#1d1d1f',
  background: 'white',
};

export default App;
