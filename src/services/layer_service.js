import axios from 'axios';
import CanvasBackgroundImage from 'models/canvas_background_model';
import CanvasImage from 'models/canvas_image_model';
import Canvas from 'models/canvas_model';
import CanvasRect from 'models/canvas_rect_model';
import CanvasText from 'models/canvas_text_model';
import canvasFeatures from 'utils/canvasFeatures';
// import Layer from 'models/layer_model';
class layerService {
  async checkTemplateLength(templateId) {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates/Layers?templateId=${templateId}&pageNumber=1&pageSize=10`
      );

      const layers = response.data[0].layers;

      const length = layers.length;

      return length;
    } catch (error) {
      console.log('Error message: ', error.message);
    }
  }
  async getLayersByTemplateId(templateId, canvasWidth, canvasHeight) {
    let myCanvas = new Canvas();
    const canvasFeature = new canvasFeatures();

    let backgroundImage = null;

    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates/Layers?templateId=${templateId}&pageNumber=1&pageSize=100`
      );

      console.log('template data (working): ', response.data[0].layers);

      const layers = response.data[0].layers.map((layer) => {
        if (layer.layerType == 0) {
          let src = layer.layerItem.layerItemValue;
          let layerId = layer.layerItem.layerId;
          let width = canvasWidth;
          let height = canvasHeight;
          let scaleX = 1;
          let scaleY = 1;
          let crossOrigin = null;
          let opacity = 100;
          let type = 'image';
          let layerType = layer.layerType;

          const backgroundImageJson = new CanvasBackgroundImage(
            layerId,
            crossOrigin,
            height,
            opacity,
            scaleX,
            scaleY,
            src,
            type,
            width,
            layerType
          );

          backgroundImage = backgroundImageJson;

          console.log('Background image info: ', backgroundImageJson);

          //myCanvas.objects.push(backgroundImage);
        } else if (layer.layerType == 1) {
          let boxId = layer.boxes[0]?.boxId;
          let boxItemId = layer.boxes[0].boxItems[0].boxItemId;
          let crossOrigin = null;
          let height = layer.boxes[0].boxHeight;
          let width = layer.boxes[0].boxWidth;
          let left = layer.boxes[0].boxPositionX;
          let top = layer.boxes[0].boxPositionY;
          let scaleX = 1;
          let scaleY = 1;
          let src = layer.layerItem.layerItemValue;
          let type = 'image';
          let style = layer.boxes[0].boxItems[0].style;
          let layerType = layer.layerType;

          let imageStyle = canvasFeature.transferStyles(style);

          const image = new CanvasImage(
            boxId,
            boxItemId,
            crossOrigin,
            height,
            left,
            imageStyle.transparency,
            scaleX,
            scaleY,
            src,
            top,
            type,
            width,
            layerType
          );

          console.log('Image info: ', image);

          myCanvas.objects.push(image);
        } else if (layer.layerType == 2) {
          let boxId = layer.boxes[0]?.boxId;
          let boxItemId = layer.boxes[0].boxItems[0].boxItemId;
          let height = layer.boxes[0].boxHeight;
          let width = layer.boxes[0].boxWidth;
          let left = layer.boxes[0].boxPositionX;
          let top = layer.boxes[0].boxPositionY;

          let backgroundColor = 'transparent';
          //let angle = 0;
          //let fill = 'black';
          let fontFamily = 'Times New Roman';
          //let fontSize = '30';
          let opacity = 100;
          let type = 'textbox';
          let style = layer.boxes[0].boxItems[0].style;
          let layerType = layer.layerType;

          let textStyle = canvasFeature.transferStyles(style);
          let isUppercase = textStyle.uppercase;

          let layerItemId = layer.layerItem.layerItemId;

          let bFontId = layer.boxes[0].boxItems[0].bFontId;

          let fontFam = canvasFeature.getFontFamilyName(bFontId);

          console.log('font family result: ', fontFam);

          //let fontFamily = canvasFeature.getFontFamilyName(textStyle.bFontId);

          let text = isUppercase == true ? layer.layerItem.layerItemValue.toUpperCase() : layer.layerItem.layerItemValue;
          console.log(' this is text');

          let textAlign = canvasFeature.getTextAlignment(textStyle.alignment);

          let fontStyle = canvasFeature.getFontStyle(textStyle.fontStyle);

          const canvasText = new CanvasText(
            textStyle.angle ? textStyle.angle : 0,
            backgroundColor,
            boxId,
            boxItemId,
            textStyle.textColor ? textStyle.textColor : 'black',
            // fill,
            fontFamily,
            textStyle.fontSize ? textStyle.fontSize : 30,
            height,
            left,
            textStyle.transparency ? textStyle.transparency : 1,
            //opacity,
            text,
            top,
            type,
            width,
            layerType,
            textAlign,
            fontStyle,
            layerItemId
          );

          console.log('canvas text info: ', canvasText);

          myCanvas.objects.push(canvasText);
        } else if (layer.layerType == 3) {
          console.log('this is render layer content product content');
          if (layer.boxes[0].boxType == 1) {
            let boxId = layer.boxes[0]?.boxId;
            let fill = canvasFeature.getRandomHexColor();
            let height = layer.boxes[0].boxHeight;
            let left = layer.boxes[0].boxPositionX;
            let opacity = 50;
            let type = 'rect';
            let width = layer.boxes[0].boxWidth;
            let top = layer.boxes[0].boxPositionY;

            const layerRender = new CanvasRect(boxId, fill, height, left, opacity, top, type, width);

            console.log('layer render info: ', layerRender);

            myCanvas.objects.push(layerRender);

            layer.boxes[0].boxItems.map((boxItem) => {
              //let style = canvasFeature.transferStyles(boxItem.style);
              let boxItemType = boxItem.boxItemType;

              let productType = canvasFeature.getProductContentValue(boxItemType);

              let backgroundColor = canvasFeature.getRandomHexColor();
              //let opacity = 100;
              let boxId = boxItem.boxId;
              let boxItemId = boxItem.boxItemId;
              //let fill = 'black';
              //let angle = 0;
              let order = boxItem.order;
              let fontFamily = 'Times New Roman';
              //let fontSize = '30';
              let height = boxItem.boxItemHeight;
              let left = boxItem.boxItemX;
              let top = boxItem.boxItemY;

              let type = 'textbox';
              let width = boxItem.boxItemWidth;

              let style = boxItem.style;

              let textStyle = canvasFeature.transferStyles(style);

              let isUppercase = textStyle.uppercase;
              let text = isUppercase ? `${productType} ${order}`.toUpperCase() : `${productType} ${order}`;

              let fontSize = textStyle.fontSize ? (textStyle.fontSize * 1.333).toFixed(1) : 30;

              let textAlign = canvasFeature.getTextAlignment(textStyle.alignment);

              let fontStyle = canvasFeature.getFontStyle(textStyle.fontStyle);

              //let fontFamily = canvasFeature.getFontFamilyName(textStyle.bFontId);

              const productContent = new CanvasText(
                textStyle.angle ? textStyle.angle : 0,
                backgroundColor,
                boxId,
                boxItemId,
                textStyle.textColor ? textStyle.textColor : 'black',
                fontFamily,
                fontSize,
                height,
                left,
                textStyle.transparency ? textStyle.transparency : 1,
                text,
                top,
                type,
                width,
                null,
                textAlign,
                fontStyle,
                null
              );

              // console.log('product content info: ', productContent);

              myCanvas.objects.push(productContent);
            });
          }
        }
      });

      console.log('my canvas: ', myCanvas);

      return { canvasJson: JSON.stringify(myCanvas), backgroundImage };
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }
  async getAll() {
    try {
      const response = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Fonts?pageNumber=1&pageSize=100`);

      const fonts = response.data.map((font) => {
        return new Font(font.fontId, font.fontName, font.fontPath, font.isDeleted);
      });
      return fonts;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async createLayer(templateId, layerType) {
    const reqBody = {
      templateId: templateId,
      layerType: layerType
    };

    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Layers', reqBody);

      const layerId = response.data.layerId;
      const zIndex = response.data.zIndex;

      return { layerId, zIndex };
    } catch (error) {
      console.log('Error message: ' + JSON.stringify(error));
    }
  }

  async updateLayer(layerId, zIndex) {
    const reqBody = {
      zIndex: zIndex
    };

    try {
      const response = await axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Layers/${layerId}`, reqBody);

      console.log('Resposne message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  deleteLayer(id) {
    try {
      axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Layers/${id}`).then(() => {
        console.log('success');
      });
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }
}

export default layerService;
