import axios from 'axios';

class layerItemService {
  async getLayerItem() {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/LayerItems?pageNumber=1&pageSize=10`
      );

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async createLayerItem(layerID, layerItemValue) {
    const reqBody = {
      layerID: layerID,
      layerItemValue: layerItemValue
    };

    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/LayerItems', reqBody);

      const layerItemId = response.data.layerItemId;

      return layerItemId;
    } catch (error) {
      console.log('Error message: ' + JSON.stringify(error));
    }
  }

  async updateLayerItem(layerItemId, layerItemValue) {
    const reqBody = {
      layerItemValue: layerItemValue
    };

    try {
      const response = await axios.put(`http://26.87.156.112/api/LayerItem/${layerItemId}`, reqBody);

      return response.data;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  deleteLayerItem(id) {
    try {
      const response = axios.delete(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/LayerItems/${id}`);
      console.log('Api message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }
}

export default layerItemService;
