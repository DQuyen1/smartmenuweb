import axios from 'axios';
import CanvasImage from 'models/canvas_image_model';
import Canvas from 'models/canvas_model';
import CanvasRect from 'models/canvas_rect_model';
import CanvasText from 'models/canvas_text_model';
import canvasFeatures from 'utils/canvasFeatures';
// import Layer from 'models/layer_model';
class layerService {
  async getLayersByTemplateId(templateId) {
    let myCanvas = new Canvas();
    const canvasFeature = new canvasFeatures();

    try {
      const response = await axios.get(
        `http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates/Layers?templateId=${templateId}&pageNumber=1&pageSize=100`
      );

      console.log('template data: ', response.data[0].layers);
      console.log('');

      const layers = response.data[0].layers.map((layer) => {
        if (layer.layerType == 0) {
          console.log(' this is background');
        } else if (layer.layerType == 1) {
          let boxId = layer.boxes[0]?.boxId;
          let boxItemId = layer.boxes[0].boxItems[0].boxItemId;
          let crossOrigin = null;
          let height = layer.boxes[0].boxHeight;
          let width = layer.boxes[0].boxWidth;
          let left = layer.boxes[0].boxPositionX;
          let top = layer.boxes[0].boxPositionY;
          let scaleX = 0.5;
          let scaleY = 0.5;
          let opacity = 100;
          let src = layer.layerItem.layerItemValue;
          let type = 'image';
          let style = layer.boxes[0].boxItems[0].style;

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
            width
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
          let text = layer.layerItem.layerItemValue;
          let backgroundColor = 'transparent';
          //let angle = 0;
          //let fill = 'black';
          let fontFamily = 'Times New Roman';
          //let fontSize = '30';
          let opacity = 100;
          let type = 'text';
          let style = layer.boxes[0].boxItems[0].style;

          let textStyle = canvasFeature.transferStyles(style);
          console.log(' this is text');
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
            width
          );

          console.log('canvas text info: ', canvasText);

          myCanvas.objects.push(canvasText);
        } else if (layer.layerType == 3) {
          //console.log('this is render layer content product content');
          if (layer.boxes[0].maxProductItem) {
            //let backgroundColor = 'pink';
            let boxId = layer.boxes[0]?.boxId;
            let fill = canvasFeature.getRandomHexColor();
            let height = layer.boxes[0].boxHeight;
            let left = layer.boxes[0].boxPositionX;
            let opacity = 100;
            let type = 'rect';
            let width = layer.boxes[0].boxWidth;
            let top = layer.boxes[0].boxPositionY;

            const layerRender = new CanvasRect(boxId, fill, height, left, opacity, top, type, width);

            console.log('layer render info: ', layerRender);

            myCanvas.objects.push(layerRender);

            layer.boxes[0].boxItems.map((boxItem) => {
              let backgroundColor = 'transparent';
              //let opacity = 100;
              let boxId = null;
              let boxItemId = boxItem.boxItemId;
              //let fill = 'black';
              //let angle = 0;
              let fontFamily = 'Times New Roman';
              //let fontSize = '30';
              let height = boxItem.boxItemHeight;
              let left = boxItem.boxItemX;
              let top = boxItem.boxItemY;
              let text = 'Product Content';
              let type = 'text';
              let width = boxItem.boxItemWidth;

              let style = layer.boxes[0].boxItems[0].style;

              let textStyle = canvasFeature.transferStyles(style);

              const productContent = new CanvasText(
                textStyle.angle ? textStyle.angle : 0,
                backgroundColor,
                boxId,
                boxItemId,
                textStyle.textColor ? textStyle.textColor : 'black',
                fontFamily,
                textStyle.fontSize ? textStyle.fontSize : 30,
                height,
                left,
                textStyle.transparency ? textStyle.transparency : 1,
                text,
                top,
                type,
                width
              );
              // console.log('product content info: ', productContent);

              myCanvas.objects.push(productContent);
            });
          }
        }
      });

      console.log('my canvas: ', myCanvas);

      return JSON.stringify(myCanvas);
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }
  async getAll() {
    try {
      const response = await axios.get(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Fonts?pageNumber=1&pageSize=100`);

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
      const response = await axios.post('http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Layers', reqBody);

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
      const response = await axios.put(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Layers/${layerId}`, reqBody);

      console.log('Resposne message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  deleteLayer(id) {
    try {
      axios.delete(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Layers/${id}`).then(() => {
        console.log('success');
      });
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }
}

export default layerService;
