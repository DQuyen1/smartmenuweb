import axios from 'axios';
import Font from 'models/font_model';

class fontService {
  async getAll() {
    try {
      const response = await axios.get(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Fonts?pageNumber=1&pageSize=100`);

      const fonts = response.data.map((font) => {
        return new Font(font.bFontId, font.fontName, font.fontPath, font.isDeleted);
      });
      return fonts;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }
}

export default fontService;
