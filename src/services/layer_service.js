import axios from 'axios';
// import Layer from 'models/layer_model';
class layerService {
  async getLayersByTemplateId(templateId) {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates/Layers?templateId=${templateId}&pageNumber=1&pageSize=100`
      );

      // const layers = response.data.map((layer) => {
      //   return new Layer(layer.layerId, layer.layerName, layer.layerType, layer.templateId, layer.isDeleted);
      // });

      // console.log(JSON.stringify(response.data[0].layers));

      return response.data[0].layers;
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

      return layerId;
    } catch (error) {
      console.log('Error message: ' + JSON.stringify(error));
    }
  }

  async updateLayer(layerName, layerId) {
    const reqBody = {
      layerName: layerName
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
      const response = axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Layers/${id}`);
      console.log('Api message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }
}

export default layerService;
