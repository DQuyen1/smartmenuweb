class Menu {
  constructor(menuId, brandId, menuName, menuDescription, productGroups, isDeleted) {
    this.menuId = menuId;
    this.brandId = brandId;
    this.menuName = menuName;
    this.menuDescription = menuDescription;
    this.productGroups = productGroups;
    this.isDeleted = isDeleted;
  }
}

export default Menu;
