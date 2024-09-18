import canvasStyle from 'models/canvas_style_model';

class canvasFeatures {
  transferStyles(value) {
    const styleObject = JSON.parse(value);

    const style = new canvasStyle(
      styleObject.rotation,
      styleObject.textColor,
      styleObject.bFontId,
      styleObject.fontSize,
      styleObject.fontStyle,
      styleObject.alignment,
      styleObject.transparency,
      styleObject.uppercase
    );

    return style;
  }

  getRandomHexColor() {
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);
    return `#${randomColor.padStart(6, '0')}`;
  }

  getProductContentValue(boxItemType) {
    let value = '';

    switch (boxItemType) {
      case 1:
        value = 'Header';
        break;

      case 2:
        value = 'N';
        break;

      case 3:
        value = 'D';
        break;

      case 4:
        value = 'P';
        break;

      case 5:
        value = 'Img';
        break;

      case 6:
        value = 'Icon';
        break;

      default:
        break;
    }

    return value;
  }
}

export default canvasFeatures;
