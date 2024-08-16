class Template {
  constructor(
    templateID,
    brandID,
    templateName,
    templateDescription,
    templateWidth,
    templateHeight,
    templateImgPath,
    brand,
    layers,
    isDeleted
  ) {
    this.templateID = templateID;
    this.brandID = brandID;
    this.templateName = templateName;
    this.templateDescription = templateDescription;
    this.templateWidth = templateWidth;
    this.templateHeight = templateHeight;
    this.templateImgPath = templateImgPath;
    this.brand = brand;
    this.layers = layers;
    this.isDeleted = isDeleted;
  }
}

export default Template;
