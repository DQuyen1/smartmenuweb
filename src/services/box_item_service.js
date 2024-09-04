import axios from 'axios';

class boxItemService {
  async getBoxItem(boxId) {
    try {
      const response = await axios.get(
        `http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BoxItem?boxId=${boxId}&pageNumber=1&pageSize=10`
      );

      console.log(response.data);

      return response.data;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async createBoxItem(boxId, bFontId, boxItemX, boxItemY, boxItemWidth, boxItemHeight, boxItemType, style) {
    const reqBody = {
      boxId: boxId,
      bFontId: bFontId,
      boxItemX: boxItemX,
      boxItemY: boxItemY,
      boxItemWidth: boxItemWidth,
      boxItemHeight: boxItemHeight,
      boxItemType: boxItemType,
      style: style
    };

    try {
      const response = await axios.post('http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BoxItem', reqBody);

      console.log('response create box item: ' + JSON.stringify(response.data));
      const result = response.data.boxItemId;

      return result;
    } catch (error) {
      console.log('Error message: ' + JSON.stringify(error));
    }
  }

  async updateBoxItem(boxId, bFontId, boxItemX, boxItemY, boxItemWidth, boxItemHeight, boxItemType, style) {
    const reqBody = {
      bFontId: bFontId,
      boxItemX: boxItemX,
      boxItemY: boxItemY,
      boxItemWidth: boxItemWidth,
      boxItemHeight: boxItemHeight,
      boxItemType: boxItemType,
      style: style
    };

    try {
      const response = await axios.put(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BoxItem/${boxId}`, reqBody);

      console.log('Resposne update box item: ' + JSON.stringify(response.data));
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async deleteBoxItem(id) {
    try {
      await axios.delete(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/BoxItem/${id}`);
      // console.log('Api message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }
}

export default boxItemService;
