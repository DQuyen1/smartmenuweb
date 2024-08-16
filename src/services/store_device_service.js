import axios from 'axios';
import StoreDevice from 'models/store_device_model';
class storeDeviceService {
  async getAllStoreDevice() {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/StoreDevices?pageNumber=1&pageSize=100`
      );

      const storeDevices = response.data.map((storeDevice) => {
        return new StoreDevice(
          storeDevice.storeDeviceId,
          storeDevice.storeId,
          storeDevice.storeDeviceName,
          storeDevice.deviceWidth,
          storeDevice.deviceHeight,
          storeDevice.isApproved,
          storeDevice.displays,
          storeDevice.isDeleted
        ); // Explicitly return the new StoreDevice instance
      });

      // console.log('Store Devide data: ', storeDevices);

      return storeDevices;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }
}

export default storeDeviceService;
