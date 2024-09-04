class dataHandler {
  //convert alignment property to number before sending to api
  convertAlignmentToNumber(value) {
    let result;

    switch (value) {
      case 'left':
        result = 0;
        break;

      case 'center':
        result = 1;
        break;

      case 'right':
        result = 2;

        break;

      default:
        break;
    }

    return result;
  }

  //convert fontstyle property to number before sending to api
  convertFontStyleToNumber(value) {
    let result;

    switch (value) {
      case 'bold':
        result = 0;
        break;

      case 'italic':
        result = 1;
        break;

      case 'normal':
        result = 2;
        break;

      default:
        break;
    }

    return result;
  }
}

export default dataHandler;
