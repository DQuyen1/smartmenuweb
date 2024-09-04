import axios from 'axios';

class cloudinaryService {
  async getAllImages(tag) {
    const cloudName = 'dchov8fes';

    const url = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

    try {
      const response = await axios.get(url);
      console.log(tag);
      const data = response.data;
      // console.log('Data service: ', data);
      //   console.log('Response get image:', JSON.stringify(response.data));
      return data;
    } catch (error) {
      console.log('Error while get image from cloudinary', error);
    }
  }
}

export default cloudinaryService;
