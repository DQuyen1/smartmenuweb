import React from 'react';
import { SketchPicker } from 'react-color';

const OptionsBar = ({ color, setColor, fontSize, setFontSize, fontFamily, setFontFamily }) => {
  return (
    <div className="options-bar">
      <div className="option">
        <text>Color:</text>
        <SketchPicker color={color} onChangeComplete={(color) => setColor(color.hex)} />
      </div>
      <div className="option">
        <text>Font Size:</text>
        <input type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} min="1" max="100" />
      </div>
      <div className="option">
        <text>Font Family:</text>
        <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
          <option value="Arial">Arial</option>
          <option value="Verdana">Verdana</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
        </select>
      </div>
    </div>
  );
};

export default OptionsBar;
