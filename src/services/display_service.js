import axios from 'axios';

class displayService {
  async getDisplayById(displayId) {
    try {
      const response = await axios.get(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Displays/V2/${displayId}/image`);
      const result = response.data;
      console.log('Display data: ', result);
      return result;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async createDisplay(storeDeviceId, menuId, templateId, activeHour) {
    const reqBody = {
      storeDeviceId: storeDeviceId,
      menuId: menuId,
      collectionId: 0,
      templateId: templateId,
      activeHour: activeHour
    };

    try {
      const response = await axios.post(`http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Displays/V4`, reqBody);
      console.log('Response message: ' + JSON.stringify(response.data.templateId));
      return response.data;
    } catch (error) {
      console.log('Error message: ' + JSON.stringify(error.message));
    }
  }
}

export default displayService;
