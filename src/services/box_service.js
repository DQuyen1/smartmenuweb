import axios from 'axios';

class boxService {
  async getBox() {
    try {
      const response = await axios.get(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Boxes?pageNumber=1&pageSize=10`);

      console.log('response from get box: ', JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async createBox(layerId, boxPositionX, boxPositionY, boxWidth, boxHeight, boxType, maxProductItem) {
    const reqBody = {
      layerId: layerId,
      boxPositionX: boxPositionX,
      boxPositionY: boxPositionY,
      boxWidth: boxWidth,
      boxHeight: boxHeight,
      boxType: boxType,
      maxProductItem: maxProductItem
    };

    try {
      const response = await axios.post('http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Boxes', reqBody);

      // console.log('Response from create box: ' + JSON.stringify(response.data));

      const boxId = response.data.boxId;

      return boxId;
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }

  async updateBox(boxId, boxPositionX, boxPositionY, boxWidth, boxHeight) {
    const reqBody = {
      boxPositionX: boxPositionX,
      boxPositionY: boxPositionY,
      boxWidth: boxWidth,
      boxHeight: boxHeight
    };

    try {
      const response = await axios.put(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Boxes/${boxId}`, reqBody);
      return response.data;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }
  async deleteBox(id) {
    try {
      const response = await axios.delete(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Box/${id}`);
      console.log('Api message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }
}

export default boxService;
