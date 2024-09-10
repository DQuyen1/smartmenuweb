import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import '../../assets/scss/template.scss';
import 'toastify-js/src/toastify.css';
import { Button } from '@mui/material';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { FormatAlignLeft, FormatAlignCenter, FormatAlignRight } from '@mui/icons-material';
import ImageIcon from '@mui/icons-material/Image';
import CldImage from 'ui-component/CldImage';
import FontFaceObserver from 'fontfaceobserver';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import html2canvas from 'html2canvas';
import axios from 'axios';
import Toastify from 'toastify-js';

import boxService from 'services/box_service';
import layerService from 'services/layer_service';
//import templateService from 'services/template_service';
import boxItemService from 'services/box_item_service';
import layerItemService from 'services/layer_item_service';
import fontService from 'services/font_service';
import cloudinaryService from 'services/cloudinary_service';
import { useParams } from 'react-router';

import canvasFeatures from 'utils/canvasFeatures';
import dataHandler from 'utils/dataHandler';

function Template() {
  const { templateId } = useParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(null);

  const [color, setColor] = useState('#35363a');
  const [fontSize, setFontSize] = useState(20);
  const [opacity, setOpacity] = useState(1);
  // const [templateId, setTemplateId] = useState(null);
  // const [isDisabled, setIsDisabled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [backgroundColor, setBackgroundColor] = useState('green');
  const [assetImage, setAssetImage] = useState([]);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [activeSubtab, setActiveSubtab] = useState('position');
  const [quantity, setQuantity] = useState('1');
  const [descriptionCounter, setDescriptionCounter] = useState(0);
  const [nameCounter, setNameCounter] = useState(0);
  const [priceCounter, setPriceCounter] = useState(0);
  const [rect, setRect] = useState(null);
  const [boxId, setBoxId] = useState(null);
  const [textAlign, setTextAlign] = useState('left');

  const [imageCounter, setImageCounter] = useState(0);

  const [iconCounter, setIconCounter] = useState(0);
  const [headerCounter, setHeaderCounter] = useState(0);
  const [renderQuantity, setRenderQuantity] = useState(0);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedRect, setSelectedRect] = useState(null);
  const [rotationAngle, setRotationAngle] = useState(0); // Add this state to track selected rectangle

  const box_service = new boxService();
  const layer_service = new layerService();
  //const template_service = new templateService();
  const box_item_service = new boxItemService();
  const layer_item_service = new layerItemService();
  const font_service = new fontService();
  const cloudinary_service = new cloudinaryService();
  const canvasFeature = new canvasFeatures();
  const dataConvert = new dataHandler();

  // const cloudName = import.meta.env.VITE_CLOUD_NAME;
  // const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

  // const cloudName = 'dchov8fes';
  // const uploadPreset = 'ml_default';
  const templateType = location.state.templateType;

  // const userId = localStorage.getItem('userId');
  const canvasWidth = location.state.templateWidth;
  const canvasHeight = location.state.templateHeight;
  const displayWidth = templateType === 0 ? canvasWidth : 608;
  const displayHeight = templateType === 0 ? canvasHeight : 800;

  const defaultCanvasWidth = 608;
  const defaultCanvasHeight = 1080;
  const defaultDisplayWidth = 608;
  const defaultDisplayHeight = 800;

  const lowestZIndex = 1;

  const [canvasDimensions, setCanvasDimensions] = useState({
    canvasWidth: defaultCanvasWidth,
    canvasHeight: defaultCanvasHeight,
    displayWidth: defaultDisplayWidth,
    displayHeight: defaultDisplayHeight
  });

  const fonts = ['Pacifico', 'Edoz', 'Open Sans', 'Times New Roman'];
  const [fontLoaded, setFontLoaded] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Times New Roman');
  //const [fonts, setFonts] = useState([]);

  const cycleTextAlign = () => {
    setTextAlign((prevAlign) => {
      const newAlign = prevAlign === 'left' ? 'center' : prevAlign === 'center' ? 'right' : 'left';

      // Update the active text box with the new alignment
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('textAlign', newAlign);
        editor.canvas.renderAll();
      }
      return newAlign;
    });
  };

  const changeOpacity = (e) => {
    setOpacity(e.target.value);
    // Update the opacity of the active object in the canvas
    const activeObject = editor.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set('opacity', e.target.value);
      editor.canvas.renderAll();
    }
  };

  const toggleHeaderVisibility = () => {
    setIsHeaderVisible(!isHeaderVisible);
  };

  const handleSubtabClick = (subtab) => {
    setActiveSubtab(subtab);
  };

  const deleteBoxItem = (boxItemId) => {
    box_item_service.deleteBoxItem(boxItemId);
  };

  const deleteText = (layerId) => {
    layer_service.deleteLayer(layerId);
  };

  const deleteRenderLayer = (layerId) => {
    layer_service.deleteLayer(layerId);
  };

  const deleteImage = (layerId) => {
    layer_service.deleteLayer(layerId);
  };

  const deleteProductElement = (boxItemId) => {
    box_item_service.deleteBoxItem(boxItemId);
  };

  // const handleDimensionChange = (e, type) => {
  //   let value = parseFloat(e.target.value);
  //   let element = editor.canvas.getActiveObject();

  //   switch (type) {
  //     case 'width':
  //       setWidth(value);
  //       element.set('width', value);
  //       console.log('height');
  //       editor.canvas.renderAll();
  //       break;
  //     case 'height':
  //       setHeight(value);
  //       element.set('height', value);
  //       editor.canvas.renderAll();
  //       break;
  //     case 'positionX':
  //       setPositionX(value);
  //       element.set('left', value);
  //       editor.canvas.renderAll();
  //       break;
  //     case 'positionY':
  //       setPositionY(value);
  //       element.set('top', value);
  //       editor.canvas.renderAll();
  //       break;
  //     default:
  //       break;
  //   }
  // };

  // const handleDimensionChange = (e, type) => {
  //   let value = parseFloat(e.target.value);
  //   let element = editor.canvas.getActiveObject();

  //   if(element.type === 'text') {

  //     const renderLayerBounds = {
  //       left: selectedRect.left, // Render layer's top-left X position
  //       top: selectedRect.top, // Render layer's top-left Y position
  //       right: selectedRect.left + selectedRect.width, // Render layer's width
  //       bottom: selectedRect.top + selectedRect.height // Render layer's height
  //     };

  //     let newPositionX = element.left;
  //     let newPositionY = element.top;
  //     let newWidth = element.width;
  //     let newHeight = element.height;

  //     let isValid = true; // Flag to check if the input is valid

  //     switch (type) {
  //       case 'width':
  //         newWidth = value;
  //         if (newPositionX + newWidth > renderLayerBounds.right) {
  //           Toastify({
  //             text: 'Width exceeds the render layer bounds!',
  //             className: 'info',
  //             gravity: 'top',
  //             position: 'right',
  //             duration: 3000,
  //             style: {
  //               background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //             }
  //           }).showToast();
  //           isValid = false;
  //         }
  //         break;

  //       case 'height':
  //         newHeight = value;
  //         if (newPositionY + newHeight > renderLayerBounds.bottom) {
  //           Toastify({
  //             text: 'Height exceeds the render layer bounds!',
  //             className: 'info',
  //             gravity: 'top',
  //             position: 'right',
  //             duration: 3000,
  //             style: {
  //               background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //             }
  //           }).showToast();
  //           isValid = false;
  //         }
  //         break;

  //       case 'positionX':
  //         newPositionX = value;
  //         if (newPositionX < renderLayerBounds.left || newPositionX + newWidth > renderLayerBounds.right) {
  //           Toastify({
  //             text: 'X position exceeds the render layer bounds!',
  //             className: 'info',
  //             gravity: 'top',
  //             position: 'right',
  //             duration: 3000,
  //             style: {
  //               background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //             }
  //           }).showToast();
  //           isValid = false;
  //         }
  //         break;

  //       case 'positionY':
  //         newPositionY = value;
  //         if (newPositionY < renderLayerBounds.top || newPositionY + newHeight > renderLayerBounds.bottom) {
  //           Toastify({
  //             text: 'Y position exceeds the render layer bounds!',
  //             className: 'info',
  //             gravity: 'top',
  //             position: 'right',
  //             duration: 3000,
  //             style: {
  //               background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //             }
  //           }).showToast();
  //           isValid = false;
  //         }
  //         break;

  //       default:
  //         break;
  //     }

  //   }

  //   // Assuming renderLayer is an object with left, top, width, and height

  //   // Update the UI input, but do not apply the change to the element if it's invalid
  //   switch (type) {
  //     case 'width':
  //       setWidth(value);
  //       if (isValid) element.set('width', value);
  //       break;
  //     case 'height':
  //       setHeight(value);
  //       if (isValid) element.set('height', value);
  //       break;
  //     case 'positionX':
  //       setPositionX(value);
  //       if (isValid) element.set('left', value);
  //       break;
  //     case 'positionY':
  //       setPositionY(value);
  //       if (isValid) element.set('top', value);
  //       break;
  //     default:
  //       break;
  //   }

  //   editor.canvas.renderAll();
  // };

  const handleDimensionChange = (e, type) => {
    let value = parseFloat(e.target.value);
    let element = editor.canvas.getActiveObject();

    if (!element) return; // Exit if no object is selected

    // Apply constraints only if the selected element is of type 'text'
    let isValid = true;
    if (element.type === 'text') {
      // Assuming renderLayer is an object with left, top, width, and height
      const renderLayerBounds = {
        left: selectedRect.left, // Render layer's top-left X position
        top: selectedRect.top, // Render layer's top-left Y position
        right: selectedRect.left + selectedRect.width, // Render layer's width
        bottom: selectedRect.top + selectedRect.height // Render layer's height
      };

      let newPositionX = element.left;
      let newPositionY = element.top;
      let newWidth = element.width;
      let newHeight = element.height;

      switch (type) {
        case 'width':
          newWidth = value;
          if (newPositionX + newWidth > renderLayerBounds.right) {
            Toastify({
              text: 'Width exceeds the render layer bounds!',
              className: 'info',
              gravity: 'top',
              position: 'right',
              duration: 3000,
              style: {
                background: 'linear-gradient(to right, #ff0000, #ff6347)'
              }
            }).showToast();
            isValid = false;
          }
          break;

        case 'height':
          newHeight = value;
          if (newPositionY + newHeight > renderLayerBounds.bottom) {
            Toastify({
              text: 'Height exceeds the render layer bounds!',
              className: 'info',
              gravity: 'top',
              position: 'right',
              duration: 3000,
              style: {
                background: 'linear-gradient(to right, #ff0000, #ff6347)'
              }
            }).showToast();
            isValid = false;
          }
          break;

        case 'positionX':
          newPositionX = value;
          if (newPositionX < renderLayerBounds.left || newPositionX + newWidth > renderLayerBounds.right) {
            Toastify({
              text: 'X position exceeds the render layer bounds!',
              className: 'info',
              gravity: 'top',
              position: 'right',
              duration: 3000,
              style: {
                background: 'linear-gradient(to right, #ff0000, #ff6347)'
              }
            }).showToast();
            isValid = false;
          }
          break;

        case 'positionY':
          newPositionY = value;
          if (newPositionY < renderLayerBounds.top || newPositionY + newHeight > renderLayerBounds.bottom) {
            Toastify({
              text: 'Y position exceeds the render layer bounds!',
              className: 'info',
              gravity: 'top',
              position: 'right',
              duration: 3000,
              style: {
                background: 'linear-gradient(to right, #ff0000, #ff6347)'
              }
            }).showToast();
            isValid = false;
          }
          break;

        default:
          break;
      }
    }

    // Update the UI input and object properties regardless of type
    switch (type) {
      case 'width':
        setWidth(value);
        if (isValid || element.type !== 'text') element.set('width', value); // Apply to all, but check constraints for 'text'
        break;
      case 'height':
        setHeight(value);
        if (isValid || element.type !== 'text') element.set('height', value); // Apply to all, but check constraints for 'text'
        break;
      case 'positionX':
        setPositionX(value);
        if (isValid || element.type !== 'text') element.set('left', value); // Apply to all, but check constraints for 'text'
        break;
      case 'positionY':
        setPositionY(value);
        if (isValid || element.type !== 'text') element.set('top', value); // Apply to all, but check constraints for 'text'
        break;
      default:
        break;
    }

    editor.canvas.renderAll(); // Re-render the canvas
  };

  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const getAssetImages = async (tag) => {
    try {
      // Fetch asset images
      const assetResult = await cloudinary_service.getAllImages(tag);
      const assetImages = assetResult.resources; // Access the resources property
      // console.log('Asset Images: ', assetImages);

      // Fetch user images
      const userResult = await cloudinary_service.getAllImages('469');
      const userImages = userResult.resources; // Access the resources property
      // console.log('User Images: ', userImages);

      // Combine the images
      const combinedImages = [...userImages, ...assetImages];

      // Optionally set state or process the combined images
      setAssetImage(combinedImages);

      return combinedImages;
    } catch (error) {
      console.log('Error message: ', error.message);
    }
  };

  const getUserImages = async (tag) => {
    try {
      const images = await cloudinary_service.getAllImages(tag);

      console.log('images: ', images);
      // setAssetImage(images);

      return images;
    } catch (error) {
      console.log('Error message: ', error.message);
    }
  };

  const getAllFont = async () => {
    try {
      await font_service.getAll().then((value) => {
        setFonts(value);
        console.log('value: ', value);
      });
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const updateLayerItem = async (layerItemId, layerItemType, layerItemValue) => {
    try {
      const id = await layer_item_service.updateLayerItem(layerItemId, layerItemType, layerItemValue);
      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const createLayer = async (templateId, layerType) => {
    try {
      const { layerId, zIndex } = await layer_service.createLayer(templateId, layerType);
      return { layerId, zIndex };
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const createLayerItem = async (layerId, layerItemValue) => {
    try {
      const id = await layer_item_service.createLayerItem(layerId, layerItemValue);

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const createBox = async (layerId, boxPositionX, boxPositionY, boxWidth, boxHeight, boxType) => {
    try {
      const id = await box_service.createBox(layerId, boxPositionX, boxPositionY, boxWidth, boxHeight, boxType);

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const createBoxItem = async (boxId, bFontId, boxItemX, boxItemY, boxItemWidth, boxItemHeight, boxItemType, style) => {
    try {
      const id = await box_item_service.createBoxItem(boxId, bFontId, boxItemX, boxItemY, boxItemWidth, boxItemHeight, boxItemType, style);

      return id;
    } catch (error) {
      console.log('Error message: ' + JSON.stringify(error.message));
    }
  };

  const updateLayer = async (layerId, zIndex) => {
    try {
      const response = await layer_service.updateLayer(layerId, zIndex);

      console.log('Response: ', JSON.stringify(response));
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const updateBox = async (boxId, boxPositionX, boxPositionY, boxWidth, boxHeight, maxProductItem) => {
    try {
      const response = await box_service.updateBox(boxId, boxPositionX, boxPositionY, boxWidth, boxHeight, maxProductItem);

      console.log('Response update box: ', JSON.stringify(response));
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const updateBoxItem = async (boxId, bFontId, boxItemX, boxItemY, boxItemWidth, boxItemHeight, boxItemType, style) => {
    try {
      await box_item_service.updateBoxItem(boxId, bFontId, boxItemX, boxItemY, boxItemWidth, boxItemHeight, boxItemType, style);

      // console.log('Response update box item: ', JSON.stringify(response));
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  // const myFunction = () => {
  //   createUserTemplate();
  // };

  // const handleBeforeUnload = () => {
  //   // Call your function here
  //   myFunction();
  //   event.preventDefault();
  //   event.returnValue = '';
  //   // Standard way to display a confirmation dialog
  // };

  useEffect(() => {
    //getAllFont();

    console.log('api key: ', process.env.REACT_APP_PRESET_KEY);

    getAssetImages('asset/images');

    getUserImages(`46`);

    document.addEventListener('keydown', detectKeydown);

    const uwScript = document.getElementById('uw');
    if (!loaded && !uwScript) {
      const script = document.createElement('script');
      script.setAttribute('async', '');
      script.setAttribute('id', 'uw');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.addEventListener('load', () => setLoaded(true));
      document.body.appendChild(script);
    }

    // return () => {
    //   window.removeEventListener('beforeunload', handleBeforeUnload);
    // };
  }, []);

  // const detectKeydown = (e) => {
  //   console.log('key: ', e.key);
  // };

  const { editor, onReady } = useFabricJSEditor();
  const [historyStack, setHistoryStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  let clipboard = null;
  const addToUndoStack = useCallback(() => {
    if (editor && editor.canvas) {
      setHistoryStack((prevStack) => [...prevStack, editor.canvas.toJSON()]);
      setRedoStack([]); // Clear redo stack when a new action is performed
    }
  }, [editor]);

  const undo = useCallback(() => {
    if (!editor || !editor.canvas || historyStack.length === 0) return;

    const currentState = editor.canvas.toJSON();
    const previousState = historyStack[historyStack.length - 1];

    setRedoStack((prevRedoStack) => [...prevRedoStack, currentState]);
    setHistoryStack((prevStack) => prevStack.slice(0, -1));

    editor.canvas.loadFromJSON(previousState, () => {
      editor.canvas.renderAll();
    });
  }, [editor, historyStack]);

  const redo = useCallback(() => {
    if (!editor || !editor.canvas || redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    const currentState = editor.canvas.toJSON();

    setHistoryStack((prevStack) => [...prevStack, currentState]);
    setRedoStack((prevRedoStack) => prevRedoStack.slice(0, -1));

    editor.canvas.loadFromJSON(nextState, () => {
      editor.canvas.renderAll();
    });
  }, [editor, redoStack]);

  // const removeSelectedObject = useCallback(() => {
  //   if (editor && editor.canvas) {
  //     const activeObject = editor.canvas.getActiveObject();

  //     if (!activeObject) {
  //       // console.log('No active object selected, doing nothing.');
  //       return; // Early return if no object is selected
  //     }

  //     const activeObjectType = activeObject.type;

  //     if (activeObjectType === 'textbox') {
  //       editor.canvas.remove(activeObject);
  //       const layerId = activeObject.layerId;

  //       deleteText(layerId);
  //     } else if (activeObjectType === 'rect') {
  //       editor.canvas.remove(activeObject);
  //       const layerId = activeObject.layerId;
  //       deleteRenderLayer(layerId);
  //     } else if (activeObjectType === 'image') {
  //       editor.canvas.remove(activeObject);
  //       const layerId = activeObject.layerId;
  //       deleteImage(layerId);
  //     } else if (activeObject === 'text') {
  //       editor.canvas.remove(activeObject);
  //       const boxItemId = activeObject.boxItemId;
  //       deleteBoxItem(boxItemId);
  //     }

  //     console.log('activeObject: ', activeObjectType);
  //   }
  // }, [editor]);
  const removeSelectedObject = useCallback(() => {
    if (editor && editor.canvas) {
      const activeObject = editor.canvas.getActiveObject();

      if (!activeObject) {
        return; // Early return if no object is selected
      }

      const activeObjectType = activeObject.type;

      // Remove the object from the canvas immediately
      editor.canvas.remove(activeObject);

      // Set a 7-second delay before calling the delete functions
      setTimeout(() => {
        if (activeObjectType === 'textbox') {
          const layerId = activeObject.layerId;
          deleteText(layerId);
        } else if (activeObjectType === 'rect') {
          const layerId = activeObject.layerId;
          deleteRenderLayer(layerId);
        } else if (activeObjectType === 'image') {
          const layerId = activeObject.layerId;
          deleteImage(layerId);
        } else if (activeObjectType === 'text') {
          const boxItemId = activeObject.boxItemId;
          deleteBoxItem(boxItemId);
        }

        console.log('Deleted after 7 seconds: ', activeObjectType);
      }, 7000); // Delay of 7 seconds (7000 milliseconds)
    }
  }, [editor]);

  const handleBackspace = useCallback(() => {
    if (editor && editor.canvas) {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject && activeObject.type === 'textbox' && activeObject.isEditing) {
        // If it's a textbox and in editing mode, let the default behavior handle it
        return;
      } else if (activeObject && activeObject.type === 'textbox') {
        // If it's a textbox but not in editing mode, remove the last character
        const newText = activeObject.text.slice(0, -1);
        activeObject.set('text', newText);
        editor.canvas.renderAll();
      } else {
        // For non-text objects, remove the entire object
        removeSelectedObject();
      }
    }
  }, [editor, removeSelectedObject]);
  const copy = useCallback(() => {
    if (editor && editor.canvas.getActiveObject()) {
      editor.canvas.getActiveObject().clone((cloned) => {
        clipboard = cloned;
      });
    }
  }, [editor]);

  const paste = useCallback(() => {
    if (clipboard) {
      clipboard.clone((clonedObj) => {
        editor.canvas.discardActiveObject();
        clonedObj.set({
          left: clonedObj.left + 10,
          top: clonedObj.top + 10,
          evented: true
        });
        if (clonedObj.type === 'activeSelection') {
          clonedObj.canvas = editor.canvas;
          clonedObj.forEachObject((obj) => editor.canvas.add(obj));
          clonedObj.setCoords();
        } else {
          editor.canvas.add(clonedObj);
        }
        clipboard.top += 10;
        clipboard.left += 10;
        editor.canvas.setActiveObject(clonedObj);
        editor.canvas.requestRenderAll();
      });
    }
  }, [editor, clipboard]);

  const detectKeydown = useCallback(
    (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          // console.log('Redo action');
          // redo();
        } else {
          // console.log('Undo action');
          // undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        // redo();
        // console.log('Redo action');
      } else if (e.key === 'Delete') {
        removeSelectedObject();
      } else if (e.key === 'Backspace') {
        // handleBackspace();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        // copy();
        // console.log('Copy action');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // paste();
        // console.log('Paste action');
      } else {
        // console.log('key: ', e.key);
      }
    },
    [editor, copy, paste, undo, redo, removeSelectedObject]
  );
  useEffect(() => {
    window.addEventListener('keydown', detectKeydown);
    return () => {
      window.removeEventListener('keydown', detectKeydown);
    };
  }, [detectKeydown]);

  const loadCanvas = () => {
    getLayersByTemplateId(2).then((canvasJson) => {
      editor.canvas.loadFromJSON(canvasJson, function () {
        editor.canvas.renderAll();
        // console.log('json: ', canvasJson);
      });
    });
  };

  const getLayersByTemplateId = async (templateId) => {
    const canvas = await layer_service.getLayersByTemplateId(templateId);
    console.log('asdads');

    return canvas;
  };

  useEffect(() => {
    if (!editor) return;

    // Preload all custom fonts
    Promise.all(fonts.map((font) => new FontFaceObserver(font).load()))
      .then(() => {
        setFontLoaded(true); // Set state to indicate fonts are loaded
        console.log('Fonts loaded successfully');
      })
      .catch((err) => {
        console.error('Failed to load fonts:', err);
      });

    // Add a textbox to the canvas with default font
  }, [editor]); // Trigge

  // function Copy() {
  //   // clone what are you copying since you
  //   // may want copy and paste on different moment.
  //   // and you do not want the changes happened
  //   // later to reflect on the copy.
  //   editor.canvas.getActiveObject().clone(function (cloned) {
  //     _clipboard = cloned;
  //   });
  // }

  // function Paste() {
  //   // clone again, so you can do multiple copies.
  //   _clipboard.clone(function (clonedObj) {
  //     canvas.discardActiveObject();
  //     clonedObj.set({
  //       left: clonedObj.left + 10,
  //       top: clonedObj.top + 10,
  //       evented: true
  //     });
  //     if (clonedObj.type === 'activeSelection') {
  //       // active selection needs a reference to the canvas.
  //       clonedObj.canvas = canvas;
  //       clonedObj.forEachObject(function (obj) {
  //         canvas.add(obj);
  //       });
  //       // this should solve the unselectability
  //       clonedObj.setCoords();
  //     } else {
  //       canvas.add(clonedObj);
  //     }
  //     _clipboard.top += 10;
  //     _clipboard.left += 10;
  //     canvas.setActiveObject(clonedObj);
  //     canvas.requestRenderAll();
  //   });
  // }

  // const undo = () => {
  //   if (editor.canvas._objects.length > 0) {
  //     history.push(editor.canvas._objects.pop());
  //   }
  //   editor.canvas.renderAll();
  // };
  // const redo = () => {
  //   if (history.length > 0) {
  //     editor.canvas.add(history.pop());
  //   }
  // };

  // const removeSelectedObject = () => {
  //   editor.canvas.remove(editor.canvas.getActiveObject());
  // };

  // const addSampleText = (top, left, width, height, fontSize) => {
  //   let text = new fabric.Text('Text', {
  //     top: top,
  //     left: left,
  //     fill: 'black',
  //     width: width,
  //     fontSize: fontSize,
  //     height: height
  //   });
  //   console.log('add text');

  //   editor.addText(text);
  //   editor.canvas.renderAll();
  // };

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }

    editor.canvas.setHeight(canvasHeight);
    editor.canvas.setWidth(canvasWidth);

    editor.canvas.preserveObjectStacking = true;

    //loadCanvas();

    editor.canvas.renderAll();
  }, []);

  useEffect(() => {
    if (editor) {
      // Set preserveObjectStacking to true
      editor.canvas.preserveObjectStacking = true;

      // Add a rectangle to the canvas
    }
  }, [editor]);

  // const addBackgroundImage = (file) => {
  //   const reader = new FileReader();

  //   reader.onload = (e) => {
  //     fabric.Image.fromURL(e.target.result, (img) => {
  //       img.scale(0.75);
  //       img.scaleX = editor.canvas.width / img.width;
  //       img.scaleY = editor.canvas.height / img.height;
  //       editor.canvas.add(img);
  //       editor.canvas.renderAll();
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // };

  // const handleBackgroundImageUpload = async (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     // const url = URL.createObjectURL(file);

  //     addBackgroundImage(file);
  //     // console.log('File url:', url);
  //     // console.log('File Name:', file.name);
  //     // console.log('File Type:', file.type);
  //     // console.log('File Size:', file.size);
  //     const layerId = await createLayer(templateId, 'BackGroundImage', 0);
  //     const layerItemId = await createLayerItem(layerId, file.name);
  //     console.log('layerId: ', layerId);
  //     console.log('layerItemId: ', layerItemId);
  //   }
  // };

  const addImage = (file) => {
    const reader = new FileReader();
    const userId = 46;
    const formData = new FormData();
    const preset_key = process.env.REACT_APP_PRESET_KEY;
    const folder = `users/${userId}`;
    const tags = `${userId}`;
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, async (img) => {
        const myImg = img.set({
          left: 100,
          top: 100,
          selectable: true, // Make sure the image is selectable
          evented: true,
          scaleX: 0.5,
          scaleY: 0.5
        });

        let width = myImg.getScaledWidth();
        let height = myImg.getScaledHeight();
        let positionX = myImg.left;
        let positionY = myImg.top;

        formData.append('file', file);
        formData.append('upload_preset', preset_key);
        formData.append('tags', tags);
        formData.append('folder', folder);
        axios.post('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', formData).then(async (result) => {
          const layerItemValue = result.data.secure_url;
          const { layerId, zIndex } = await createLayer(templateId, 1);
          const layerItemId = await createLayerItem(layerId, layerItemValue);

          const public_id = result.data.public_id;

          setAssetImage((preImages) => [public_id, ...preImages]);

          console.log('Result hihi: ', result);
          console.log('layerId: ', layerId);
          console.log('zIndex: ', zIndex);

          console.log('layerItemId: ', layerItemId);

          const boxId = await createBox(layerId, positionX, positionY, width, height, 0);

          const boxItemId = await createBoxItem(
            boxId,
            5,
            positionX,
            positionY,
            width,
            height,
            7,
            JSON.stringify({
              transparency: 100
            })
          );

          myImg.boxId = boxId;
          myImg.boxItemId = boxItemId;
          myImg.layerId = layerId;

          // console.log('Response from cloudinary when upload image:', JSON.stringify(layerItemValue));
        });

        // console.log('boxItemId: ', boxItemId);
        // console.log('boxId: ', boxId);

        editor.canvas.on('mouse:down', function (options) {
          if (options.target !== rect) {
            setActiveTab(null);
          }
          setSelectedTool(null);
        });

        myImg.on('mouseup', () => {
          console.log('clicked to images layer');
          setActiveTab('positionSize');
          setSelectedTool('text');
        });

        editor.canvas.add(myImg);
        editor.canvas.renderAll();
      });
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      addImage(file);
    }
  };

  const changeBackgroundColor = (e) => {
    const newColor = e.target.value;
    setBackgroundColor(newColor);
    console.log(newColor);
    const activeObject = editor.canvas.getActiveObject();

    activeObject.set('fill', newColor);
    // editor.canvas.backgroundColor = newColor;
    editor.canvas.renderAll();
  };

  const changeFontSize = (e) => {
    const newFontSize = e.target.value;
    setFontSize(newFontSize);
    console.log('FontSize: ', newFontSize);
    const activeObject = editor.canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
      activeObject.set('fontSize', newFontSize);
      activeObject.fire('modified');
      editor.canvas.renderAll();
    } else if (activeObject && activeObject.type === 'text') {
      activeObject.set('fontSize', newFontSize);
      activeObject.fire('modified');
      editor.canvas.renderAll();
    }
  };

  const changeColor = (e) => {
    const newColor = e.target.value;

    setColor(newColor);

    const activeObject = editor.canvas.getActiveObject(); // Get the active object
    if ((activeObject && activeObject.type === 'textbox') || activeObject.type === 'text') {
      // Ensure it's a text object
      activeObject.set('fill', newColor); // Set the new color
      editor.canvas.renderAll(); // Re-render the canvas
    }
  };

  const updateCanvas = () => {
    requestAnimationFrame(() => {
      editor.canvas.renderAll(); // Ensure the canvas is re-rendered immediately
    });
  };

  // const changeZIndex = (action) => {
  //   const activeObject = editor.canvas.getActiveObject();
  //   const layerId = activeObject.layerId; // Get the active object
  //   if (activeObject) {
  //     switch (action) {
  //       case 'sendBackward':
  //         editor.canvas.sendBackwards(activeObject);
  //         updateCanvas(); // Send one step back
  //         break;
  //       case 'sendToBack':
  //         editor.canvas.sendToBack(activeObject);
  //         activeObject.set('zIndex', 1);
  //         updateLayer(layerId, 1);
  //         updateCanvas(); // Send to back
  //         break;
  //       case 'bringForward':
  //         editor.canvas.bringForward(activeObject);
  //         updateCanvas(); // Bring one step forward
  //         break;
  //       case 'bringToFront':
  //         editor.canvas.bringToFront(activeObject);
  //         activeObject.set('zIndex', 10);
  //         updateLayer(layerId, 10);
  //         updateCanvas(); // Bring to front
  //         break;
  //       default:
  //         return;
  //     }
  //     editor.canvas.renderAll(); // Re-render the canvas after the action
  //   }
  // };

  const changeZIndex = (action) => {
    const activeObject = editor.canvas.getActiveObject();
    if (!activeObject || !activeObject.layerId) return;

    const layerId = activeObject.layerId; // Get the active object's layerId
    let currentZIndex = activeObject.zIndex; // Track the current zIndex

    const maxZIndex = 10;
    if (activeObject) {
      switch (action) {
        case 'sendBackward':
          editor.canvas.sendBackwards(activeObject);
          currentZIndex = Math.max(currentZIndex - 1, 1); // Decrement zIndex but ensure it doesn't go below 1
          activeObject.set('zIndex', currentZIndex);
          updateLayer(layerId, currentZIndex); // Update zIndex in the backend
          updateCanvas(); // Send one step back
          break;

        case 'sendToBack':
          editor.canvas.sendToBack(activeObject);
          activeObject.set('zIndex', 1); // Set zIndex to 1 (the lowest)
          updateLayer(layerId, 1); // Update backend with zIndex 1
          updateCanvas(); // Send to back
          break;

        case 'bringForward':
          editor.canvas.bringForward(activeObject);
          currentZIndex += 1; // Increment zIndex
          activeObject.set('zIndex', currentZIndex);
          updateLayer(layerId, currentZIndex); // Update zIndex in the backend
          updateCanvas(); // Bring one step forward
          break;

        case 'bringToFront':
          editor.canvas.bringToFront(activeObject);
          // Set the maximum zIndex (can adjust according to your logic)
          activeObject.set('zIndex', maxZIndex);
          updateLayer(layerId, maxZIndex); // Update backend with the highest zIndex
          updateCanvas(); // Bring to front
          break;

        default:
          return;
      }

      editor.canvas.renderAll(); // Re-render the canvas after the action
    }
  };

  const handleRotationChange = (e) => {
    const inputValue = e.target.value;
    const newAngle = parseFloat(inputValue);
    const element = editor.canvas.getActiveObject();

    // Check if the input is invalid (empty or NaN)
    if (inputValue === '' || isNaN(newAngle)) {
      Toastify({
        text: 'Please enter a valid number. Resetting to 0.',
        className: 'info',
        gravity: 'top',
        position: 'right',
        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();

      // Automatically reset to 0
      setRotationAngle(0);
      if (element) {
        element.set('angle', 0);
        editor.canvas.renderAll();
      }
      return;
    }

    // Check if the new angle is within the allowed range (0-360)
    if (newAngle < 0 || newAngle > 360) {
      Toastify({
        text: 'The angle must be between 0 and 360',
        className: 'info',
        gravity: 'top',
        position: 'right',
        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();
      return;
    }

    // Update the UI input and the element's rotation if valid
    setRotationAngle(newAngle);
    if (element) {
      element.set('angle', newAngle);
      editor.canvas.renderAll();
    }
  };

  const toggleItalic = () => {
    let element = editor.canvas.getActiveObject();

    if (element && (element.type === 'text' || element.type === 'textbox')) {
      const currentFontStyle = element.fontStyle;

      // Toggle between 'italic' and 'normal'
      const newFontStyle = currentFontStyle === 'italic' ? 'normal' : 'italic';
      element.set('fontStyle', newFontStyle);

      // Re-render the canvas to apply the change
      editor.canvas.renderAll();
    }
  };

  const toggleBold = () => {
    const o = editor.canvas.getActiveObject();
    if (o) {
      setIsBold((prev) => !prev);
      o.set('fontWeight', !isBold ? 'bold' : 'normal');
      //o.fire('modified');
      editor.canvas.renderAll();
    }
  };

  const updateRotation = (angle) => {
    const activeObject = editor.canvas.getActiveObject();
    if (activeObject) {
      activeObject.set('angle', parseFloat(angle));
      editor.canvas.renderAll(); // Re-render the canvas to reflect changes
    }
  };

  // const handleRotationChange = (e) => {
  //   const newAngle = parseFloat(e.target.value);

  //   if (isNaN(newAngle)) {
  //     Toastify({
  //       text: 'Vui lòng nhập số hợp lệ',
  //       className: 'info',
  //       gravity: 'top',
  //       position: 'right',

  //       duration: 3000,
  //       style: {
  //         background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //       }
  //     }).showToast();
  //     return;
  //   }

  //   if (newAngle < 0 || newAngle > 360) {
  //     Toastify({
  //       text: 'Số phải nằm từ 0 đến 360',
  //       className: 'info',
  //       gravity: 'top',
  //       position: 'right',

  //       duration: 3000,
  //       style: {
  //         background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //       }
  //     }).showToast();
  //     return;
  //   }

  //   setRotationAngle(newAngle);
  //   updateRotation(newAngle);
  // };

  // const updateStyle = (style, object) => {
  //   // style = {
  //   style.textColor = object.fill;
  //   style.bFontId = 1;
  //   (style.fontSize = object.fontSize),
  //     (style.fontStyle = getFontStyleValue(object.fontStyle)),
  //     (style.alignment = getAlignmentValue(object.textAlign)),
  //     (style.transparency = object.opacity),
  //     (style.uppercase = false);
  //   // };
  // };

  // const getFontSize = () => {
  //   const o = editor.canvas.getActiveObject();
  //   if (!o) {
  //     return 0;
  //   }

  //   let size = o.fontSize || 0;
  //   let result = +(size * o.scaleX).toFixed();
  //   setFontSize(result);
  //   return result;
  // };

  // const getFontSizeV2 = () => {
  //   const activeObject = editor.canvas.getActiveObject();
  //   if (!activeObject || activeObject.type !== 'text') {
  //     return 0;
  //   }

  //   const fontSizeInPixels = activeObject.fontSize * activeObject.scaleY;

  //   const fontSizeInPoints = fontSizeInPixels / 1.333;

  //   return parseFloat(fontSizeInPoints.toFixed(1));
  // };
  const getFontSizeV2 = (textObject) => {
    if (!textObject || textObject.type !== 'text') {
      return 0;
    }

    const fontSizeInPixels = textObject.fontSize * textObject.scaleY;
    const fontSizeInPoints = fontSizeInPixels / 1.333;
    console.log('Scale Y: ', textObject.scaleY);
    console.log('Font Size: ', textObject.fontSize);
    console.log('Font Size In Points: ', parseFloat(fontSizeInPoints.toFixed(1)));

    return parseFloat(fontSizeInPoints.toFixed(1));
  };

  const convertAngleToDegree = (angle) => {
    if (angle === 180) {
      return -angle;
    } else if (angle > 180) {
      return angle - 360;
    }
    return angle;
  };

  const addText = async () => {
    //setColor(color);
    let text = new fabric.Textbox('Text', {
      top: 300,
      left: 300,
      fill: '#000000',
      // zIndex: 1,
      backgroundColor: 'transparent',
      //fontStyle: isItalic ? 'italic' : 'normal',
      // fontWeight: isBold ? 'bold' : 'normal',
      // textAlign: textAlign,
      //fontFamily: selectedFont,

      fontFamily: selectedFont,
      editable: true,
      angle: 0
    });
    // addToUndoStack();

    text.setControlsVisibility({
      mt: false, // middle top disable
      mb: false // midle bottom
    });

    text.on('scaling', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      const scaledWidth = text.getScaledWidth();
      const scaledHeight = text.getScaledHeight();

      setActiveTab('positionSize');
      // console.log('scale');
      //console.log('Text fontSize after scaled: ', text.fontSize * text.scaleY);
      console.log('Text fontSize after scaled: ', text.fontSize * text.scaleX);

      setPositionX((text.left * scaleX).toFixed(1));
      setPositionY((text.top * scaleY).toFixed(1));

      setHeight((scaledHeight * scaleX).toFixed(1));
      setWidth((scaledWidth * scaleY).toFixed(1));
    });

    text.on('moving', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;
      setActiveTab('positionSize');
      setSelectedTool('textBox');
      // setHeight(text.getScaledHeight());
      // setWidth(text.getScaledWidth());
      setPositionX((text.left * scaleX).toFixed(1));
      setPositionY((text.top * scaleY).toFixed(1));
    });

    editor.canvas.on('mouse:down', function (options) {
      setActiveTab(null);

      setSelectedTool(null);
    });

    text.on('mouseup', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      const scaledWidth = text.getScaledWidth();
      const scaledHeight = text.getScaledHeight();
      setFontSize((text.fontSize * text.scaleX).toFixed(1));
      setColor(text.fill);

      setHeight((scaledHeight * scaleX).toFixed(1));
      setWidth((scaledWidth * scaleY).toFixed(1));
      setPositionX((text.left * scaleX).toFixed(1));
      setPositionY((text.top * scaleY).toFixed(1));
      setRotationAngle(text.angle);

      setIsHeaderVisible(true);

      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('textBox');
      //       var fonts = ['Pacifico', 'Edoz', 'Open Sans'];

      //       const fontFaceRule = `
      //   @font-face {
      //     font-family: 'Edoz';
      //     src: url('https://res.cloudinary.com/dchov8fes/raw/upload/v1723621070/fonts/edosz.ttf');
      //     font-display: swap;
      //   }

      //     @font-face {
      //     font-family: 'Open Sans';
      //     src: url('https://res.cloudinary.com/dchov8fes/raw/upload/v1721531764/fonts/OpenSans-VariableFont_wdth%2Cwght.ttf');
      //     font-display: swap;
      //   }
      // `;

      //       const styleElement = document.createElement('style');
      //       document.head.appendChild(styleElement);

      //       styleElement.textContent = fontFaceRule;

      //       var select = document.getElementById('font-family');
      //       fonts.forEach(function (font) {
      //         var option = document.createElement('option');
      //         option.innerHTML = font;
      //         option.value = font;
      //         select.appendChild(option);
      //       });

      //       function loadAndUse(font) {
      //         var myfont = new FontFaceObserver(font);
      //         myfont
      //           .load()
      //           .then(function () {
      //             // when font is loaded, use it.
      //             editor.canvas.getActiveObject().set('fontFamily', font);
      //             editor.canvas.requestRenderAll();
      //           })
      //           .catch(function (e) {
      //             console.log(e);
      //             alert('font loading failed ' + font);
      //           });
      //       }
      //       document.getElementById('font-family').onchange = function () {
      //         if (this.value !== 'Times New Roman') {
      //           loadAndUse(this.value);
      //         } else {
      //           editor.canvas.getActiveObject().set('fontFamily', this.value);
      //           editor.canvas.requestRenderAll();
      //         }
      //       };
    });

    editor.canvas.add(text);

    let style = {
      textColor: text.fill,
      bFontId: 5,
      fontSize: getFontSizeV2(),
      fontStyle: getFontStyleValue(text.fontStyle),
      alignment: getAlignmentValue(text.textAlign),
      transparency: text.opacity,
      uppercase: false
    };

    const { layerId, zIndex } = await createLayer(templateId, 2);
    const layerItemId = await createLayerItem(layerId, 'Text');
    const boxId = await createBox(layerId, text.left, text.top, text.width, text.height, 0);
    const boxItemId = await createBoxItem(boxId, 5, text.left, text.top, text.width, text.height, 0, JSON.stringify(style));

    text.layerItemId = layerItemId;
    text.layerId = layerId;
    text.boxItemId = boxItemId;
    text.boxId = boxId;
    text.zIndex = zIndex;

    // text.fire('modified');

    console.log('Layer id: ', layerId);
    console.log('layer item id: ', layerItemId);
    console.log('Box id: ', boxId);
    console.log('Box item id: ', boxItemId);
    console.log('zIndex: ', zIndex);

    text.on('modified', function () {
      // console.log('color: ', text.fill);
      // console.log('alignemnt: ', text.textAlign);
      // console.log('Angle: ', convertAngleToDegree(text.angle));
    });

    text.on('editing:exited', function () {
      console.log('Text editing exited, new text: ', text.text);
      updateLayerItem(text.layerItemId, 2, text.text);
    });

    editor.canvas.renderAll();
  };

  const addRenderLayer = async () => {
    let rect = new fabric.Rect({
      left: 100,
      top: 150,
      fill: '#228B22',
      borderColor: 'dark',
      width: 200,
      height: 200,
      opacity: 1
    });

    editor.canvas.add(rect);

    rect.id = `rect-${new Date().getTime()}`;

    rect.productCounter = 1;
    rect.imageCounter = 1;
    rect.nameCounter = 1;
    rect.priceCounter = 1;

    rect.setControlsVisibility({
      mtr: false,
      mt: false // middle top disable
      // mb: false, // midle bottom
      // ml: false, // middle left
      // mr: false // middle right
    });

    rect.on('moving', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      setPositionX((rect.left * scaleX).toFixed(1));
      setPositionY((rect.top * scaleY).toFixed(1));
      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('rect');
    });

    rect.on('mouseup', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      const scaledWidth = rect.getScaledWidth();
      const scaledHeight = rect.getScaledHeight();

      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('rect');
      setSelectedRect(rect);
      // console.log('touched');

      setHeight((scaledHeight * scaleX).toFixed(1));
      setWidth((scaledWidth * scaleY).toFixed(1));
      setPositionX((rect.left * scaleX).toFixed(1));
      setPositionY((rect.top * scaleY).toFixed(1));
      // let object = event.target;
      editor.canvas.sendToBack(rect);
      console.log('ok');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== rect) {
        setActiveTab(null);
      }
      setSelectedTool(null);
    });

    //setRect(rect);
    setRenderQuantity((prevCounter) => prevCounter + 1);

    const { layerId, zIndex } = await createLayer(templateId, 3);
    const boxId = await createBox(layerId, rect.left, rect.top, rect.width, rect.height, 0);
    setBoxId(boxId);
    rect.layerId = layerId;
    rect.boxId = boxId;

    console.log('Layer id: ', layerId);
    console.log('Box id: ', boxId);

    rect.on('modified', function () {});

    rect.on('object:order', function () {
      console.log('change zindex');
    });

    rect.on('scaling', function () {
      const newWidth = rect.width * rect.scaleX;
      const newHeight = rect.height * rect.scaleY;

      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      rect.set({
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1
      });
      setHeight(newHeight.toFixed(1));
      setWidth(newWidth.toFixed(1));

      setPositionX((rect.left * scaleX).toFixed(1));
      setPositionY((rect.top * scaleY).toFixed(1));
    });

    // editor.canvas.renderAll();
  };

  const addMenuCollection = async () => {
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      fill: '#FFC5CB',
      borderColor: 'dark',
      width: 200,
      height: 200,
      selectionBackgroundColor: 'black'
    });

    let width = rect.width;
    let height = rect.height;

    editor.canvas.add(rect);

    rect.on('modified', function () {
      updateBox(boxId, rect.left, rect.top, width, height, 100);
    });

    const layerId = await createLayer(4);
    const boxId = await createBox(layerId, 1);

    const boxItemId = await createBoxItem(boxId, 1, 0);
    console.log('Layer id: ', layerId);
    console.log('Box id: ', boxId);
    console.log('Box item id: ', boxItemId);

    rect.on('scaling', function () {
      width = rect.width * rect.scaleX;
      height = rect.height * rect.scaleY;
    });
  };

  // const addBackgroundImage = (file) => {
  //   const reader = new FileReader();

  //   reader.onload = (e) => {
  //     fabric.Image.fromURL(e.target.result, (img) => {
  //       img.scale(0.75);
  //       img.scaleX = editor.canvas.width / img.width;
  //       img.scaleY = editor.canvas.height / img.height;

  //       img.set({
  //         selectable: true,
  //         hasControls: true,
  //         evented: true, // Allow interaction
  //         lockMovementX: false, // If you want to allow movement
  //         lockMovementY: false
  //       });

  //       //editor.canvas.add(img);
  //       editor.canvas.setBackgroundImage(img, editor.canvas.renderAll.bind(editor.canvas), {
  //         scaleX: editor.canvas.width / img.width, // Scale to canvas width
  //         scaleY: editor.canvas.height / img.height
  //         // selectable: true,
  //         // selectionBackgroundColor: 'black',
  //         // hasControls: true
  //         // Scale to canvas height
  //       });

  //       img.on('mouseup', () => {
  //         console.log('Background image mouse:up event triggered');
  //         // Perform any additional logic when mouse is released
  //       });

  //       editor.canvas.renderAll();
  //     });
  //   };
  //   reader.readAsDataURL(file);
  // };

  const addBackgroundImage = (file) => {
    const reader = new FileReader();
    const userId = 469;
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;
    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, async (img) => {
        // Scale the image to fit the canvas dimensions
        img.scaleX = editor.canvas.width / img.width;
        img.scaleY = editor.canvas.height / img.height;

        // Set the image properties
        img.set({
          selectable: true, // Make it selectable
          hasControls: true, // Disable controls if you don't want to resize it
          evented: true, // Allow interaction
          lockMovementX: true, // Lock horizontal movement
          lockMovementY: true, // Lock vertical movement
          lockScalingX: true, // Lock scaling horizontally
          lockScalingY: true, // Lock scaling vertically
          lockRotation: true, // Lock rotation
          hasBorders: true // Hide borders
        });

        // Add the image to the canvas
        editor.canvas.add(img);

        // Ensure the background image is always at the lowest z-index
        editor.canvas.sendToBack(img);

        // Attach the 'mouseup' event to the image
        // img.on('mouseup', () => {
        //   console.log('Background image mouse:up event triggered');
        //   // Additional logic for mouse:up event
        // });
        img.on('object:selected', () => {
          editor.canvas.sendToBack(img); // Send back on selection
        });
        // Render the canvas
        editor.canvas.renderAll();

        formData.append('file', file);
        formData.append('upload_preset', preset_key);
        formData.append('tags', tags);
        formData.append('folder', folder);

        try {
          const response = await fetch('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          const layerItemValue = result.secure_url;

          const { layerId, zIndex } = await createLayer(templateId, 0);
          const layerItemId = await createLayerItem(layerId, layerItemValue);

          img.layerId = layerId;

          console.log('layerId: ', layerId);
          console.log('layerItemId: ', layerItemId);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      });
    };

    reader.readAsDataURL(file);
  };

  const handleBackgroundImageUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      addBackgroundImage(file);
    }
  };

  const clickToImage = async (photo) => {
    const public_id = photo.public_id;
    const layerId = await createLayer(templateId, 1);
    const layerItemValue = `https://res.cloudinary.com/dchov8fes/image/upload/v1722891805/${public_id}`;
    addImageToFabric(layerItemValue, layerId);
    const layerItemId = await createLayerItem(layerId, layerItemValue);
    console.log('LayerId: ', layerId);
    console.log('LayerItemId: ', layerItemId);
  };

  const addImageToFabric = (url, layerId) => {
    fabric.Image.fromURL(url, async (img) => {
      let myImg = img.set({
        left: 100, // Adjust as necessary
        top: 100, // Adjust as necessary
        angle: 0,
        scaleX: 0.5,
        scaleY: 0.5
      });

      editor.canvas.add(myImg);

      let width = myImg.getScaledWidth();
      let height = myImg.getScaledHeight();
      let positionX = myImg.left;
      let positionY = myImg.top;

      const boxId = await createBox(layerId, positionX, positionY, width, height, 0);

      const boxItemId = await createBoxItem(
        boxId,
        5,
        positionX,
        positionY,
        width,
        height,
        7,
        JSON.stringify({
          transparency: 100
        })
      );
      myImg.boxId = boxId;
      myImg.boxItemId = boxItemId;

      console.log('boxItemId: ', boxItemId);
      console.log('boxId: ', boxId);
    });
  };

  // const clickedElement = () => {
  //   console.log('width', 'height');
  // };

  const updateTemplateImg = (templateId, data) => {
    try {
      axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates/${templateId}/image?TemplateImgPath=${data}`);
    } catch (error) {
      console.log('Failed to upload template image: ' + JSON.stringify(error));
    }
  };

  const takeScreenShot = () => {
    const preset_key = 'xdm798lx';
    const formData = new FormData();

    html2canvas(document.querySelector('.sample-canvas'), {
      allowTaint: true,
      useCORS: true
    }).then(async (canvas) => {
      const base64 = canvas.toDataURL('image/png');
      // console.log('URL: ', base64);
      // const screenShot = base64Decoder(base64);
      // console.log('Screen Shot: ', screenShot);
      formData.append('file', base64);
      formData.append('upload_preset', preset_key);
      // console.log('Result ', canvas.toDataURL('image/png'));
      try {
        await axios
          .post(`https://api.cloudinary.com/v1_1/dchov8fes/image/upload`, formData)
          .then(async (result) => {
            const templateImg = result.data.url;
            updateTemplateImg(templateId, templateImg);
            // console.log('Response from cloudinary: ' + JSON.stringify(result.data.url));
          })
          .catch((error) => {
            console.log('Failed to upload to cloundinary: ' + error);
          });
      } catch (error) {
        console.log('Failed to upload to cloundinary: ' + error.toString());
      }
    });
  };

  const getAllCanvasProperties = () => {
    const scaleX = canvasWidth / displayWidth;
    const scaleY = canvasHeight / displayHeight;

    takeScreenShot();

    try {
      // Get all objects on the canvas
      const objects = editor.canvas.getObjects();

      console.log('Convert canvas to JSON: ', editor.canvas.toJSON(['boxId', 'boxItemId']));

      // Collect properties of each object
      objects.map((obj) => {
        if (obj instanceof fabric.Rect) {
          updateBox(
            obj.boxId,
            obj.left * scaleX,
            obj.top * scaleY,
            obj.getScaledWidth() * scaleX,
            obj.getScaledHeight() * scaleY,
            quantity
          );
        } else if (obj instanceof fabric.Text) {
          if (obj.boxId) {
            console.log('obj: ', obj);

            updateBox(obj.boxId, obj.left * scaleX, obj.top * scaleY, obj.getScaledWidth() * scaleX, obj.getScaledHeight() * scaleY, 1);
            updateBoxItem(
              obj.boxItemId,
              5,
              obj.left * scaleX,
              obj.top * scaleY,
              obj.getScaledWidth() * scaleX,
              obj.getScaledHeight() * scaleY,
              obj.boxItemType,
              JSON.stringify({
                textColor: obj.fill,
                bFontId: 5,
                // fontSize: getFontSizeV2(obj),
                fontSize: obj.fontSize * obj.scaleX,
                fontStyle:
                  obj.fontStyle && obj.fontStyle !== 'normal'
                    ? getFontStyleValue(obj.fontStyle)
                    : obj.fontWeight === 'bold' || obj.fontWeight === 'italic'
                      ? getFontStyleValue(obj.fontWeight)
                      : 0,

                alignment: getAlignmentValue(obj.textAlign),
                transparency: 100,
                uppercase: false,
                rotation: convertAngleToDegree(obj.angle)
              })
            );
            // updateLayerItem(obj.layerItemId);
          } else if (obj.boxItemId) {
            updateBoxItem(
              obj.boxItemId,
              5,
              obj.left * scaleX,
              obj.top * scaleY,
              obj.getScaledWidth() * scaleX,
              obj.getScaledHeight() * scaleY,
              obj.boxItemType,
              JSON.stringify({
                textColor: obj.fill,
                bFontId: 5,
                fontSize: 12,
                fontStyle: getFontStyleValue(obj.fontStyle),
                alignment: getAlignmentValue(obj.textAlign),
                transparency: 100,
                uppercase: false,
                rotation: convertAngleToDegree(obj.angle)
              })
            );
            // return {
            //   color: obj.fill
            // };
          }
        } else if (obj instanceof fabric.Image) {
          if (obj.boxId) {
            updateBox(obj.boxId, obj.left * scaleX, obj.top * scaleY, obj.getScaledWidth() * scaleX, obj.getScaledHeight() * scaleY, 1);
            updateBoxItem(
              obj.boxItemId,
              5,
              obj.left * scaleX,
              obj.top * scaleY,
              obj.getScaledWidth() * scaleX,
              obj.getScaledHeight() * scaleY,
              obj.boxItemType,
              JSON.stringify({
                transparency: 100
              })
            );

            console.log('obj: ', obj);
          }
        }
      });
    } catch (error) {
      console.log('Error getting canvas properties: ', error.message);
    }
  };

  // const handleQuantityChange = (e) => {
  //   const value = e.target.value;
  //   if (/^\d*$/.test(value)) {
  //     // Allows only digits
  //     // setQuantity(value);
  //     // console.log('value: ', value);

  //     if (rect && value > 0) {
  //       const rect = editor.canvas.getActiveObject();
  //       rect.set('quantity', value);
  //       console.log('Rect information: ', rect);

  //       // rect.quantity = value;
  //       setQuantity(value);
  //       updateBox(rect.boxId, rect.top, rect.left, rect.width, rect.height, value);
  //     } else if (value <= 0) {
  //       Toastify({
  //         text: 'Quantity must be greater than 0',
  //         className: 'info',
  //         gravity: 'top',
  //         position: 'right',

  //         duration: 3000,
  //         style: {
  //           background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //         }
  //       }).showToast();
  //     }
  //   }
  // };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    do {
      color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
    } while (color === '#FFFFFF');
    return color;
  };

  function getAlignmentValue(alignment) {
    switch (alignment.toLowerCase()) {
      case 'left':
        return 0;
      case 'center':
        return 1;
      case 'right':
        return 2;
      default:
        return -1; // Return a default value or handle the unexpected input
    }
  }

  function getFontStyleValue(fontStyle) {
    switch (fontStyle.toLowerCase()) {
      case 'normal':
        return 0;
      case 'bold':
        return 1;
      case 'italic':
        return 2;
      default:
        return -1; // Return a default value or handle the unexpected input
    }
  }

  const addProductDescription = async () => {
    let textBox = new fabric.Text(`Product Description  ${selectedRect.productCounter}`, {
      left: selectedRect.left + 10,
      top: selectedRect.left + 10,
      // fontSize: fontSize,
      fontSize: 13,
      backgroundColor: getRandomColor(),
      borderColor: 'dark',

      // width: 100,
      // height: 100,
      fill: 'white',
      // fontFamily: 'Arial',
      // fontStyle: 'normal',
      // textAlign: 'left',
      opacity: 100,
      productCounter: 1
      // selectionBackgroundColor: 'black'
    });

    textBox.rectId = selectedRect.id;

    selectedRect.productCounter += 1;

    setDescriptionCounter((prevCounter) => prevCounter + 1);

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      // mb: false, // midle bottom
      ml: false // middle left
      // mr: false // middle right
    });

    editor.canvas.add(textBox);
    let height = textBox.height;
    let width = textBox.width;
    // const layerId = await createLayer(3);
    // const layerItemId = await createLayerItem(layerId, `Product Description ${descriptionCounter + 1}`);

    let style = {
      // textColor: textBox.fill,
      textColor: '#ffffff',
      bFontId: 1,
      fontSize: textBox.fontSize,
      // fontStyle: getFontStyleValue(textBox.fontStyle),
      // alignment: getAlignmentValue(textBox.textAlign),
      transparency: textBox.opacity,
      uppercase: true
    };

    if (boxId) {
      const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 3, JSON.stringify(style));

      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 3;
      console.log('boxItemId: ', boxItemId);
    }

    textBox.on('modified', function () {});

    textBox.on('scaling', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      const scaledWidth = textBox.getScaledWidth();
      const scaledHeight = textBox.getScaledHeight();

      const newWidth = textBox.width * textBox.scaleX;
      const newHeight = textBox.height * textBox.scaleY;
      console.log('scaledWidth: ', (scaledHeight * scaleX).toFixed(1), ' scaledHeight: ', (scaledWidth * scaleY).toFixed(1));

      setHeight(newHeight.toFixed(1));
      setWidth(newWidth.toFixed(1));
      setActiveTab('positionSize');
    });

    textBox.on('moving', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      setPositionX((textBox.left * scaleX).toFixed(1));
      setPositionY((textBox.top * scaleY).toFixed(1));
      // console.log('moving');

      const scaledWidth = textBox.getScaledWidth();
      const scaledHeight = textBox.getScaledHeight();

      setHeight((scaledHeight * scaleX).toFixed(1));
      setWidth((scaledWidth * scaleY).toFixed(1));

      const textLeft = textBox.left;
      const textTop = textBox.top;
      const textWidth = textBox.width * textBox.scaleX; // consider scaling
      const textHeight = textBox.height * textBox.scaleY; // consider scaling

      const rectLeft = selectedRect.left;
      const rectTop = selectedRect.top;
      const rectRight = selectedRect.left + selectedRect.width;
      const rectBottom = selectedRect.top + selectedRect.height;

      //Restrict text movement within the rectangle boundaries
      if (textLeft < rectLeft) {
        textBox.set('left', rectLeft);
      }
      if (textTop < rectTop) {
        textBox.set('top', rectTop);
      }
      if (textLeft + textWidth > rectRight) {
        textBox.set('left', rectRight - textWidth);
      }
      if (textTop + textHeight > rectBottom) {
        textBox.set('top', rectBottom - textHeight);
      }
    });

    textBox.on('mouseup', function () {
      setHeight(height.toFixed(1));
      setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      //setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setFontSize((textBox.fontSize * textBox.scaleX).toFixed(1));
      setColor(textBox.fill);
      setActiveTab('positionSize');
      setIsHeaderVisible(true);
      setSelectedTool('text');
      console.log('selectedRect: ', selectedRect);
    });

    textBox.on('mousemove', function () {
      setHeight(textBox.height.toFixed(1));
      setWidth(textBox.width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      // console.log('Move');

      // setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      //setActiveTab('positionSize');
      //setSelectedTool('text');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });
  };

  const addProductName = async () => {
    const textBox = new fabric.Text(`Product Name ${selectedRect.nameCounter} `, {
      left: selectedRect.left + 15,
      top: selectedRect.top + 15,
      fontSize: 20,
      fill: 'white',

      backgroundColor: getRandomColor()
    });

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      // mb: false, // midle bottom
      ml: false // middle left
      // mr: false // middle right
    });

    let style = {
      // textColor: textBox.fill,
      textColor: '#ffffff',
      bFontId: 1,
      fontSize: textBox.fontSize,
      fontStyle: getFontStyleValue(textBox.fontStyle),
      alignment: getAlignmentValue(textBox.textAlign),
      transparency: textBox.opacity,
      uppercase: true
    };

    editor.canvas.add(textBox);
    setNameCounter((prevCounter) => prevCounter + 1);

    selectedRect.nameCounter += 1;

    if (boxId) {
      const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 2, JSON.stringify(style));
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 2;
      console.log('boxItemId: ', boxItemId);
    }
    let height = textBox.height;
    let width = textBox.width;

    textBox.on('mouseup', function () {
      setHeight(height.toFixed(1));
      setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize((textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setActiveTab('positionSize');
      setSelectedTool('text');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });

    textBox.on('modified', function () {
      // updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
      // console.log(
      //   'width: ',
      //   textBox.width,
      //   'height: ',
      //   textBox.height,
      //   'top',
      //   textBox.top,
      //   'left: ',
      //   textBox.left,
      //   'fontSize: ',
      //   textBox.fontSize,
      //   'color: ',
      //   textBox.fill,
      //   'fontFamily: ',
      //   textBox.fontFamily,
      //   'opacity: ',
      //   textBox.opacity,
      //   'textAlign: ',
      //   textBox.textAlign
      // );
    });

    textBox.on('moving', function () {
      const textLeft = textBox.left;
      const textTop = textBox.top;
      const textWidth = textBox.width * textBox.scaleX; // consider scaling
      const textHeight = textBox.height * textBox.scaleY; // consider scaling

      // Get the rectangle boundaries
      const rectLeft = selectedRect.left;
      const rectTop = selectedRect.top;
      const rectRight = selectedRect.left + selectedRect.width;
      const rectBottom = selectedRect.top + selectedRect.height;

      // Restrict text movement within the rectangle boundaries
      if (textLeft < rectLeft) {
        textBox.set('left', rectLeft);
      }
      if (textTop < rectTop) {
        textBox.set('top', rectTop);
      }
      if (textLeft + textWidth > rectRight) {
        textBox.set('left', rectRight - textWidth);
      }
      if (textTop + textHeight > rectBottom) {
        textBox.set('top', rectBottom - textHeight);
      }
    });
  };

  const addProductPrice = async () => {
    const textBox = new fabric.Text(`Product Price ${selectedRect.priceCounter} `, {
      left: selectedRect.left + 20,
      top: selectedRect.top + 20,
      fontSize: 20,
      fill: 'white',
      borderColor: 'dark',
      width: 200,
      height: 200,
      backgroundColor: getRandomColor()
      // selectionBackgroundColor: 'black'
    });

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      mb: false, // midle bottom
      ml: false, // middle left
      mr: false // middle right
    });

    editor.canvas.add(textBox);

    let style = {
      // textColor: textBox.fill,
      textColor: '#ffffff',
      bFontId: 5,
      fontSize: textBox.fontSize,
      fontStyle: getFontStyleValue(textBox.fontStyle),
      alignment: getAlignmentValue(textBox.textAlign),
      transparency: textBox.opacity,
      uppercase: true
    };

    if (boxId) {
      const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 4, JSON.stringify(style));
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 4;
      console.log('boxItemId: ', boxItemId);
    }

    let height = textBox.height;
    let width = textBox.width;

    textBox.on('mouseup', function () {
      setHeight(height.toFixed(1));
      setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize((textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setActiveTab('positionSize');
      setSelectedTool('text');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });

    textBox.on('modified', function () {
      // console.log(
      //   'boxItemId: ',
      //   textBox.boxItemId,
      //   'left',
      //   textBox.left,
      //   'top',
      //   textBox.top,
      //   'width',
      //   textBox.width,
      //   'height',
      //   textBox.height
      // );
      // if (textBox.boxItemId) {
      //   // updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
      //   updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
      // }
    });

    setPriceCounter((prevCounter) => prevCounter + 1);

    selectedRect.priceCounter += 1;

    textBox.on('modified', function () {
      // updateBoxItem(textBox.boxItemId, rect.left, rect.top, width, height, priceCounter + 1, JSON.stringify(style));
    });

    textBox.on('moving', function () {
      const textLeft = textBox.left;
      const textTop = textBox.top;
      const textWidth = textBox.width * textBox.scaleX; // consider scaling
      const textHeight = textBox.height * textBox.scaleY; // consider scaling

      // Get the rectangle boundaries
      const rectLeft = selectedRect.left;
      const rectTop = selectedRect.top;
      const rectRight = selectedRect.left + selectedRect.width;
      const rectBottom = selectedRect.top + selectedRect.height;

      // Restrict text movement within the rectangle boundaries
      if (textLeft < rectLeft) {
        textBox.set('left', rectLeft);
      }
      if (textTop < rectTop) {
        textBox.set('top', rectTop);
      }
      if (textLeft + textWidth > rectRight) {
        textBox.set('left', rectRight - textWidth);
      }
      if (textTop + textHeight > rectBottom) {
        textBox.set('top', rectBottom - textHeight);
      }
    });
  };

  const addProductImage = async () => {
    const textBox = new fabric.Text(`Product Image ${selectedRect.imageCounter} `, {
      left: selectedRect.left + 25,
      top: selectedRect.top + 25,
      fontSize: 20,
      fill: color,
      borderColor: 'dark',
      width: 200,
      height: 200,
      backgroundColor: getRandomColor()
      // selectionBackgroundColor: 'black'
    });
    textBox.setControlsVisibility({
      mtr: false,
      mt: false,
      // mb: false, // midle bottom
      ml: false // middle left
      // mr: false // middle right
    });

    editor.canvas.add(textBox);

    let height = textBox.height;
    let width = textBox.width;

    let style = {
      // textColor: textBox.fill,
      textColor: '#ffffff',
      bFontId: 1,
      fontSize: textBox.fontSize,
      fontStyle: getFontStyleValue(textBox.fontStyle),
      alignment: getAlignmentValue(textBox.textAlign),
      transparency: textBox.opacity,
      uppercase: true
    };

    if (boxId) {
      const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 5, JSON.stringify(style));
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 5;
      console.log('boxItemId: ', boxItemId);
    }
    textBox.on('mouseup', function () {
      setHeight(height.toFixed(1));
      setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize((textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setSelectedTool('text');
      setActiveTab('positionSize');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });

    setImageCounter((prevCounter) => prevCounter + 1);
    selectedRect.imageCounter += 1;

    textBox.on('modified', function () {
      // updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
    });

    textBox.on('moving', function () {
      const textLeft = textBox.left;
      const textTop = textBox.top;
      const textWidth = textBox.width * textBox.scaleX; // consider scaling
      const textHeight = textBox.height * textBox.scaleY; // consider scaling

      // Get the rectangle boundaries
      const rectLeft = selectedRect.left;
      const rectTop = selectedRect.top;
      const rectRight = selectedRect.left + selectedRect.width;
      const rectBottom = selectedRect.top + selectedRect.height;

      // Restrict text movement within the rectangle boundaries
      if (textLeft < rectLeft) {
        textBox.set('left', rectLeft);
      }
      if (textTop < rectTop) {
        textBox.set('top', rectTop);
      }
      if (textLeft + textWidth > rectRight) {
        textBox.set('left', rectRight - textWidth);
      }
      if (textTop + textHeight > rectBottom) {
        textBox.set('top', rectBottom - textHeight);
      }
    });
  };

  const addProductIcon = async () => {
    const textBox = new fabric.Text(`Product Icon ${iconCounter} `, {
      left: 100,
      top: 150,
      fontSize: 20,
      fill: color,
      borderColor: 'dark',
      width: 150,
      height: 100,
      backgroundColor: getRandomColor()
      // selectionBackgroundColor: 'black'
    });

    editor.canvas.add(textBox);
    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      mb: false, // midle bottom
      ml: false, // middle left
      mr: false // middle right
    });

    let style = {
      // textColor: textBox.fill,
      textColor: '#ffffff',
      bFontId: 1,
      fontSize: textBox.fontSize,
      fontStyle: getFontStyleValue(textBox.fontStyle),
      alignment: getAlignmentValue(textBox.textAlign),
      transparency: textBox.opacity,
      uppercase: true
    };

    if (boxId) {
      // const boxItemId = await createBoxItem(boxId, 2, textBox.left, textBox.top, textBox.width, textBox.height, 6, JSON.stringify(style));
      const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 6, JSON.stringify(style));
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 6;
      console.log('boxItemId: ', boxItemId);
    }

    setIconCounter((prevCounter) => prevCounter + 1);

    textBox.on('mouseup', function () {
      // setHeight(height.toFixed(1));
      // setWidth(width.toFixed(1));
      setPositionX(rect.left.toFixed(1));
      setPositionY(rect.top.toFixed(1));

      setIsHeaderVisible(true);
      setSelectedTool('text');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });

    textBox.on('modified', function () {
      // updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
    });

    textBox.on('moving', function () {
      const textLeft = textBox.left;
      const textTop = textBox.top;
      const textWidth = textBox.width * textBox.scaleX; // consider scaling
      const textHeight = textBox.height * textBox.scaleY; // consider scaling

      // Get the rectangle boundaries
      const rectLeft = rect.left;
      const rectTop = rect.top;
      const rectRight = rect.left + rect.width;
      const rectBottom = rect.top + rect.height;

      // Restrict text movement within the rectangle boundaries
      if (textLeft < rectLeft) {
        textBox.set('left', rectLeft);
      }
      if (textTop < rectTop) {
        textBox.set('top', rectTop);
      }
      if (textLeft + textWidth > rectRight) {
        textBox.set('left', rectRight - textWidth);
      }
      if (textTop + textHeight > rectBottom) {
        textBox.set('top', rectBottom - textHeight);
      }
    });
  };

  const addProductHeader = async () => {
    const textBox = new fabric.Text('Header', {
      left: selectedRect.left + 15,
      top: selectedRect.top + 15,
      fontSize: 20,
      fill: color,
      fontFamily: 'Arial',
      fontStyle: 'normal', // fontStyle: 'normal', 'italic', or 'bold'
      textAlign: 'center',
      opacity: 1.0,
      borderColor: 'dark',
      width: 200,
      height: 200,
      backgroundColor: getRandomColor()
      // selectionBackgroundColor: 'black'
    });

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      mb: false, // midle bottom
      ml: false, // middle left
      mr: false // middle right
    });

    let style = {
      // textColor: textBox.fill,
      textColor: '#ffffff',
      bFontId: 1,
      fontSize: textBox.fontSize,
      fontStyle: getFontStyleValue(textBox.fontStyle),
      alignment: getAlignmentValue(textBox.textAlign),
      transparency: textBox.opacity,
      uppercase: true
    };

    if (selectedRect.boxId) {
      const boxItemId = await createBoxItem(
        selectedRect.boxId,
        5,
        textBox.left,
        textBox.top,
        textBox.width,
        textBox.height,
        1,
        JSON.stringify(style)
      );
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 1;
      console.log('boxItemId: ', boxItemId);
    }

    let height = textBox.height;
    let width = textBox.width;

    textBox.on('mouseup', function () {
      setHeight(height.toFixed(1));
      setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize((textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setActiveTab('positionSize');
      setSelectedTool('text');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });

    textBox.on('modified', function () {
      // updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
    });

    editor.canvas.add(textBox);
    setHeaderCounter((prevCounter) => prevCounter + 1);

    textBox.on('moving', function () {
      const textLeft = textBox.left;
      const textTop = textBox.top;
      const textWidth = textBox.width * textBox.scaleX; // consider scaling
      const textHeight = textBox.height * textBox.scaleY; // consider scaling

      // Get the rectangle boundaries
      const rectLeft = selectedRect.left;
      const rectTop = selectedRect.top;
      const rectRight = selectedRect.left + selectedRect.width;
      const rectBottom = selectedRect.top + selectedRect.height;

      // Restrict text movement within the rectangle boundaries
      if (textLeft < rectLeft) {
        textBox.set('left', rectLeft);
      }
      if (textTop < rectTop) {
        textBox.set('top', rectTop);
      }
      if (textLeft + textWidth > rectRight) {
        textBox.set('left', rectRight - textWidth);
      }
      if (textTop + textHeight > rectBottom) {
        textBox.set('top', rectBottom - textHeight);
      }
    });

    textBox.on('mouseup', function () {
      toggleHeaderVisibility();
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
      }
    });
  };

  const getTextAlignIcon = () => {
    switch (textAlign) {
      case 'left':
        return <FormatAlignLeft />;
      case 'center':
        return <FormatAlignCenter />;
      case 'right':
        return <FormatAlignRight />;
      default:
        return <FormatAlignLeft />;
    }
  };

  const toggleTextCase = () => {
    const o = editor.canvas.getActiveObject();
    if (o && o.type === 'textbox') {
      // Get the current text and toggle its case
      const currentText = o.text;
      const newText = currentText === currentText.toUpperCase() ? currentText.toLowerCase() : currentText.toUpperCase();
      o.set('text', newText);
      o.fire('modified');
      editor.canvas.renderAll();
    }
  };

  const fontFaceRule = `
  @font-face {
    font-family: 'Edoz';
    src: url('https://res.cloudinary.com/dchov8fes/raw/upload/v1723621070/fonts/edosz.ttf');
    font-display: swap;
  }
  
    @font-face {
    font-family: 'Open Sans';
    src: url('https://res.cloudinary.com/dchov8fes/raw/upload/v1721531764/fonts/OpenSans-VariableFont_wdth%2Cwght.ttf');
    font-display: swap;
  }
`;

  const styleElement = document.createElement('style');
  document.head.appendChild(styleElement);

  styleElement.textContent = fontFaceRule;

  function loadAndUse(font) {
    var myfont = new FontFaceObserver(font);
    myfont
      .load()
      .then(function () {
        // when font is loaded, use it.
        editor.canvas.getActiveObject().set('fontFamily', font);
        editor.canvas.requestRenderAll();
      })
      .catch(function (e) {
        console.log(e);
        alert('font loading failed ' + font);
      });
  }

  useEffect(() => {
    const fontFaceRule = `
    @font-face {
      font-family: 'Edoz';
      src: url('https://res.cloudinary.com/dchov8fes/raw/upload/v1723621070/fonts/edosz.ttf');
      font-display: swap;
    }
    @font-face {
      font-family: 'Open Sans';
      src: url('https://res.cloudinary.com/dchov8fes/raw/upload/v1721531764/fonts/OpenSans-VariableFont_wdth%2Cwght.ttf');
      font-display: swap;
    }
  `;

    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    styleElement.textContent = fontFaceRule;
  }, []);

  const loadAndUseFont = (fontName) => {
    const myFont = new FontFaceObserver(fontName);
    myFont
      .load()
      .then(() => {
        // When the font is loaded, apply it to the active object
        const activeObject = editor.canvas.getActiveObject();
        if (activeObject) {
          activeObject.set('fontFamily', fontName);
          editor.canvas.requestRenderAll();
        }
      })
      .catch((e) => {
        console.error(`Font loading failed: ${fontName}`, e);
        alert('Font loading failed: ' + fontName);
      });
  };

  const handleFontChange = (event) => {
    const selectedFont = event.target.value;
    setSelectedFont(selectedFont); // Set selected font in state

    if (selectedFont !== 'Times New Roman') {
      loadAndUseFont(selectedFont); // Load and use the custom font
    } else {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        activeObject.set('fontFamily', 'Times New Roman');
        editor.canvas.requestRenderAll(); // Re-render the canvas
      }
    }
  };

  return (
    <div className="app">
      <header className="header">
        {(selectedTool == 'text' || selectedTool == 'textBox') && (
          <>
            {/* <select value={selectedFont} onChange={handleFontChange}>
              {fonts.map((font) => (
                <option key={font.fontId} value={font.fontName}>
                  {font.fontName}
                </option>
              ))}
            </select> */}

            {/* <select id="font-family"></select> */}

            <select value={selectedFont} onChange={handleFontChange}>
              {fonts.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            <input
              type="number"
              id="font-size"
              value={fontSize}
              onChange={changeFontSize}
              min="1" // Set minimum value if needed
              max="150" // Set maximum value if needed
            />
            <input type="color" id="font-color" onChange={(e) => changeColor(e)} value={color} />
            <button onClick={toggleBold}>B</button>
            <button onClick={toggleItalic}>I</button>
            <button onClick={cycleTextAlign} className="align-button">
              {getTextAlignIcon()}
            </button>
            <input
              type="number"
              value={rotationAngle}
              placeholder="Enter rotation angle"
              onChange={handleRotationChange}
              min="0"
              max="360"
            />
          </>
        )}

        {selectedTool == 'rect' && (
          <>
            <label htmlFor="font-color">Background Color:</label>
            <input type="color" id="font-color" onChange={(e) => changeBackgroundColor(e)} value={backgroundColor} />
            {/* <Button onClick={() => handleTabClick('positionSize')} style={{ color: 'white' }}>
          Position & Size
        </Button> */}
            <input type="range" id="opacity" value={opacity} onChange={(e) => changeOpacity(e)} min="0" max="1" step="0.01" />

            {/* <button onClick={toggleTextCase} className="case-button">
              Toggle Case
            </button> */}
          </>
        )}
        <div className="actions">
          <button className="save-btn" onClick={() => getAllCanvasProperties()}>
            Save
          </button>
          <div className="profile">User</div>
        </div>
      </header>

      <div className="main">
        <div className="sidebar-container">
          <aside className="sidebar" style={{ marginLeft: '10%', borderRadius: '20px', marginTop: '10%' }}>
            <Button onClick={() => handleTabClick('text')} startIcon={<TextFieldsIcon />} style={{ color: 'white' }}>
              Text
            </Button>
            <Button onClick={() => handleTabClick('background')} startIcon={<ViewModuleIcon />} style={{ color: 'white' }}>
              Background
            </Button>
            <Button onClick={() => handleTabClick('images')} startIcon={<ImageIcon />} style={{ color: 'white' }}>
              Image
            </Button>

            <Button onClick={() => handleTabClick('renderLayer')} startIcon={<CloudUploadIcon />} style={{ color: 'white' }}>
              Render Layer
            </Button>
            {/* <Button onClick={() => handleTabClick('menuCollection')} startIcon={<CloudUploadIcon />} style={{ color: 'white' }}>
              Menu Collection
            </Button> */}
          </aside>

          <div className={`tab-container ${activeTab ? 'open' : ''}`}>
            {activeTab === 'positionSize' && (
              <div className="tab">
                {/* <h4 style={{ color: 'white' }}>Position & Size</h4> */}
                <div className="subtabs">
                  <Button onClick={() => handleSubtabClick('position')} style={{ color: 'black', marginRight: '2%' }}>
                    Position
                  </Button>
                  {selectedTool === 'rect' && (
                    <Button onClick={() => handleSubtabClick('product')} style={{ color: 'black' }}>
                      Product
                    </Button>
                  )}
                </div>
                {activeSubtab === 'position' && (
                  <div className="subtab-content">
                    {/* {selectedTool == 'rect' && (
                      <> */}
                    <label htmlFor="width">Width:</label>
                    <input type="number" id="width" value={width} onChange={(e) => handleDimensionChange(e, 'width')} />

                    <label htmlFor="height">Height:</label>
                    <input type="number" id="height" value={height} onChange={(e) => handleDimensionChange(e, 'height')} />
                    {/* </>
                    )} */}
                    {/* {selectedTool !== 'text' && (
                      <> */}
                    <label htmlFor="positionX">Position X:</label>
                    <input
                      type="number"
                      id="positionX"
                      value={positionX}
                      onChange={(e) => handleDimensionChange(e, 'positionX')}
                      min={-Infinity}
                    />

                    <label htmlFor="positionY">Position Y:</label>
                    <input
                      type="number"
                      id="positionY"
                      value={positionY}
                      onChange={(e) => handleDimensionChange(e, 'positionY')}
                      min={-Infinity}
                    />
                    <div className="button-row">
                      <button onClick={() => changeZIndex('sendBackward')}>Send Backwards</button>
                      <button onClick={() => changeZIndex('sendToBack')}>Send to Back</button>
                    </div>
                    <div className="button-row">
                      <button onClick={() => changeZIndex('bringForward')}>Bring Forward</button>
                      <button onClick={() => changeZIndex('bringToFront')}>Bring to Front</button>
                    </div>
                    {/* </>
                    )} */}
                  </div>
                )}

                {activeSubtab === 'product' && selectedTool === 'rect' && (
                  <div className="subtab-content">
                    <Button onClick={() => addProductDescription()} style={{ color: 'black' }}>
                      Add Description
                    </Button>
                    <Button onClick={() => addProductImage()} style={{ color: 'black' }}>
                      Add Image
                    </Button>
                    <Button onClick={() => addProductName()} style={{ color: 'black' }}>
                      Add Name
                    </Button>
                    <Button onClick={() => addProductPrice()} style={{ color: 'black' }}>
                      Add Price
                    </Button>
                    {/* <Button onClick={() => addProductIcon()} style={{ color: 'black' }}>
                      Add Icon
                    </Button>*/}
                    <Button onClick={() => addProductHeader()} style={{ color: 'black' }}>
                      Add Header
                    </Button>
                    {/* <label htmlFor="product-quantity" style={{ color: 'white' }}>
                      Quantity:
                    </label> */}
                    {/* <input
                      type="number"
                      id="product-quantity"
                      value={quantity}
                      onChange={handleQuantityChange}
                      onKeyDown={(e) => {
                        if (e.key === '-' || e.key === '+') {
                          e.preventDefault(); // Prevent input of '-' or '+'
                        }
                      }}
                    /> */}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'text' && (
              <div className="tab">
                <h4 style={{ color: 'white' }}>Text</h4>
                {/* <button onClick={() => addText('Heading')}>Heading</button>
                <button onClick={() => addText('Subheading')}>Subheading</button> */}
                <button onClick={() => addText('Body Text')}>Body Text</button>
              </div>
            )}
            {activeTab === 'background' && (
              <div className="tab">
                <h4 style={{ color: 'white' }}>Background</h4>
                <input type="file" accept="image/*" onChange={handleBackgroundImageUpload} />
              </div>
            )}
            {activeTab === 'images' && (
              <div className="tab narrow-tab" style={{ width: '100%' }}>
                <h4 style={{ color: 'white' }}>Image</h4>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <div
                  className="custom-scrollbar"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'scroll',
                    maxHeight: '500px',
                    width: '100%',
                    paddingRight: '10px'
                  }}
                >
                  {assetImage.map((photo, idx) => {
                    return (
                      <button
                        onClick={() => clickToImage(photo)}
                        style={{ background: 'none', border: 'none', marginBottom: '0px', padding: '0px' }}
                        key={idx}
                      >
                        {/* <img src={value} width="90%" height="auto" alt="" key="" style={{ margin: '5px', borderRadius: '10px' }} />; */}
                        <CldImage publicId={photo.public_id} />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'renderLayer' && (
              <div className="tab">
                <h4 style={{ color: 'white' }}>Render Layer</h4>
                <button
                  onClick={() => {
                    addRenderLayer();
                  }}
                >
                  CREATE RENDER LAYER
                </button>
              </div>
            )}
            {activeTab === 'menuCollection' && (
              <div className="tab">
                <h4 style={{ color: 'white' }}>Menu Collection</h4>
                <button
                  onClick={() => {
                    addMenuCollection();
                  }}
                >
                  CREATE MENU COLLECTION
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={`canvas-area ${activeTab ? 'sidebar-open' : ''}`}>
          <div
            style={{
              width: `${displayWidth}px`,
              height: `${displayHeight}px`,
              background: '#f8f9fa',
              marginLeft: '10%'
            }}
          >
            <FabricJSCanvas className="sample-canvas" onReady={onReady} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Template;
