import React, { useState } from 'react';
import axios from 'axios';

const SamplePage = () => {
  const [boxItem, setBoxItem] = useState({
    boxId: '',
    bFontId: '',
    boxItemX: '',
    boxItemY: '',
    boxItemWidth: '',
    boxItemHeight: '',
    boxItemType: '',
    order: ''
  });

  const [style, setStyle] = useState({
    textColor: '#ffffff',
    bFontId: 1,
    fontSize: 20,
    fontStyle: 1,
    alignment: 2,
    transparency: 100,
    uppercase: true,
    currency: 0
  });

  const handleBoxItemChange = (e) => {
    const { name, value } = e.target;
    setBoxItem((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleStyleChange = (e) => {
    const { name, value } = e.target;
    setStyle((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleStyleSubmit = (e) => {
    e.preventDefault();
    console.log('Style saved:', style);
  };

  const handleBoxItemSubmit = async (e) => {
    e.preventDefault();

    // Convert style to JSON string
    const styleString = JSON.stringify(style);

    // Create payload for BoxItem
    const payload = {
      boxId: parseInt(boxItem.boxId, 10),
      bFontId: parseInt(boxItem.bFontId, 10),
      boxItemX: parseInt(boxItem.boxItemX, 10),
      boxItemY: parseInt(boxItem.boxItemY, 10),
      boxItemWidth: parseInt(boxItem.boxItemWidth, 10),
      boxItemHeight: parseInt(boxItem.boxItemHeight, 10),
      boxItemType: parseInt(boxItem.boxItemType, 10),
      order: parseInt(boxItem.order, 10),
      style: styleString
    };

    console.log('Payload to be sent:', payload);

    try {
      const response = await axios.post('http://localhost:801/api/BoxItem', payload);
      console.log('BoxItem saved successfully:', response.data);
    } catch (error) {
      if (error.response) {
        console.error('Error saving BoxItem:', error.response.data); // Log API error response
      } else {
        console.error('Error saving BoxItem:', error.message);
      }
    }
  };

  return (
    <div>
      <h2>Input Style</h2>
      <form onSubmit={handleStyleSubmit}>
        <input type="text" name="textColor" value={style.textColor} placeholder="Text Color" onChange={handleStyleChange} />
        <input type="number" name="bFontId" value={style.bFontId} placeholder="Font ID" onChange={handleStyleChange} />
        <input type="number" name="fontSize" value={style.fontSize} placeholder="Font Size" onChange={handleStyleChange} />
        <input
          type="number"
          name="fontStyle"
          value={style.fontStyle}
          placeholder="Font Style (0: Regular, 1: Bold, ...)"
          onChange={handleStyleChange}
        />
        <input
          type="number"
          name="alignment"
          value={style.alignment}
          placeholder="Alignment (0: Left, 1: Center, 2: Right)"
          onChange={handleStyleChange}
        />
        <input type="number" name="transparency" value={style.transparency} placeholder="Transparency" onChange={handleStyleChange} />
        <label>
          Uppercase:
          <input
            type="checkbox"
            name="uppercase"
            checked={style.uppercase}
            onChange={() => setStyle((prevState) => ({ ...prevState, uppercase: !prevState.uppercase }))}
          />
        </label>
        <button type="submit">Save Style</button>
      </form>

      <h2>Input BoxItem</h2>
      <form onSubmit={handleBoxItemSubmit}>
        <input type="number" name="boxId" placeholder="Box ID" onChange={handleBoxItemChange} value={boxItem.boxId} />
        <input type="number" name="bFontId" placeholder="Font ID" onChange={handleBoxItemChange} value={boxItem.bFontId} />
        <input type="number" name="boxItemX" placeholder="X Position" onChange={handleBoxItemChange} value={boxItem.boxItemX} />
        <input type="number" name="boxItemY" placeholder="Y Position" onChange={handleBoxItemChange} value={boxItem.boxItemY} />
        <input type="number" name="boxItemWidth" placeholder="Width" onChange={handleBoxItemChange} value={boxItem.boxItemWidth} />
        <input type="number" name="boxItemHeight" placeholder="Height" onChange={handleBoxItemChange} value={boxItem.boxItemHeight} />
        <input type="number" name="boxItemType" placeholder="Item Type" onChange={handleBoxItemChange} value={boxItem.boxItemType} />
        <input type="number" name="order" placeholder="Order" onChange={handleBoxItemChange} value={boxItem.order} />

        <button type="submit">Save BoxItem</button>
      </form>
    </div>
  );
};

export default SamplePage;
