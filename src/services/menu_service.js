import axios from 'axios';
import Menu from 'models/menu_model';
class menuService {
  async getAllByBrand(brandId) {
    try {
      const response = await axios.get(
        `http://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Menus?brandId=${brandId}&pageNumber=1&pageSize=10`
      );

      const menus = response.data.map((menu) => {
        return new Menu(menu.menuId, menu.brandId, menu.menuName, menu.menuDescription, menu.productGroups, menu.isDeleted);
      });

      // console.log('All menu by brand: ', menus[1].menuId);

      return menus;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  }
}

export default menuService;
