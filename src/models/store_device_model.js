class StoreDevice {
  constructor(storeDeviceId, storeId, storeDeviceName, deviceHeight, devicewidth, isApproved, displays, isDeleted) {
    this.storeDeviceId = storeDeviceId;
    this.storeId = storeId;
    this.storeDeviceName = storeDeviceName;
    this.deviceHeight = deviceHeight;
    this.devicewidth = devicewidth;
    this.isApproved = isApproved;
    this.displays = displays;
    this.isDeleted = isDeleted;
  }
}

export default StoreDevice;
