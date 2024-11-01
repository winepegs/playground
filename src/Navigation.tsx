import { PDFME_VERSION } from "@pdfme/common"
import { Link } from "react-router-dom";

const Navigation = () => (
  <div style={{ 
    margin: "0.5rem 1rem", 
    display: 'flex', 
    position: 'absolute', 
    top: '0px', 
    right: '0px', 
    zIndex: 1000, 
    pointerEvents: 'auto', 
    textTransform: 'uppercase', 
    fontSize: 'small', 
    letterSpacing: '0.3px' 
  }}>
    
    <span>v {PDFME_VERSION}</span>
    <span style={{ margin: "0 1rem" }}>/</span>
    <Link to="/designer">Design mode</Link>
    <span style={{ margin: "0 1rem" }}>/</span>
    <Link to="/">Form, Viewer mode</Link>
  </div>
);

export default Navigation;
