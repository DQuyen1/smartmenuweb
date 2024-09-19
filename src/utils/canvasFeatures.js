import canvasStyle from 'models/canvas_style_model';
import fontService from 'services/font_service';

class canvasFeatures {
  async getFontFamilyName(bFontId) {
    const font_service = new fontService();

    const response = await font_service.getOne(bFontId);

    return response.fontName;
  }

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

  getTextAlignment(value) {
    switch (value) {
      case 0:
        return 'left';
      case 1:
        return 'center';
      case 2:
        return 'right';
      default:
        return 'left';
    }
  }

  getFontStyle(value) {
    switch (value) {
      case 0:
        return 'regular';
      case 1:
        return 'bold';
      case 2:
        return 'italic';
      default:
        return 'regular';
    }
  }
}

export default canvasFeatures;
