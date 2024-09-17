import axios from 'axios';

class displayItemService {
  //   async getDisplayById(displayId) {
  //     try {
  //       const response = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Displays/V2/${displayId}/image`);
  //       const result = response.data;
  //       console.log('Display data: ', result);
  //       return result;
  //     } catch (error) {
  //       console.log('Error message: ' + error.message);
  //     }
  //   }

  async updateDisplayItem(displayItemId, boxId, productGroupId) {
    const reqBody = {
      boxID: boxId,
      productGroupID: productGroupId
    };

    try {
      const response = await axios.post(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/DisplayItems/${displayItemId}`,
        reqBody
      );

      console.log('Resposne message from update display item: ' + JSON.stringify(response.data));

      //   return response.data;
    } catch (error) {
      console.log('Error message: ' + JSON.stringify(error.message));
    }
  }
}

export default displayItemService;
