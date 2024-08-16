import axios from 'axios';

class templateService {
  async getTemplate(templateId) {
    try {
      const response = await axios.get(
        `https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates?templateId=${templateId}&pageSize=10`
      );

      const result = response.data[0].templateImgPath;
      //console.log('result: ', response.data[0].templateImgPath);
      return result;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async createTemplate(brandId, templateName, templateDescription, templateWidth, templateHeight, templateImgPath) {
    const reqBody = {
      brandId: brandId,
      templateName: templateName,
      templateDescription: templateDescription,
      templateWidth: templateWidth,
      templateHeight: templateHeight,
      templateType: 0,
      templateImgPath: templateImgPath
    };

    try {
      const response = await axios.post('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates', reqBody);
      return response.data.templateId;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  async updateTemplate(templateId, templateName, templateDescription, templateWidth, templateHeight, templateImgPath) {
    const reqBody = {
      templateName: templateName,
      templateDescription: templateDescription,
      templateWidth: templateWidth,
      templateHeight: templateHeight,
      templateImgPath: templateImgPath
    };

    try {
      const response = await axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates/${templateId}`, reqBody);

      console.log('Resposne message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }

  deleteTemplate(id) {
    try {
      const response = axios.delete('https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Template?templateId=' + id);
      console.log('Api message: ' + response.data);
    } catch (error) {
      console.log('Error message: ' + error);
    }
  }
}

export default templateService;
