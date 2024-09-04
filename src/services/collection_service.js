import axios from 'axios';

class collectionService {
  async getCollection(brandId) {
    try {
      const response = await axios.get(
        `http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Collections?brandId=${brandId}&pageNumber=1&pageSize=10`
      );

      return response.data;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }
}

export default collectionService;
