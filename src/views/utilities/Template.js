import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import '../../assets/scss/template.scss';
import uploadCloud from '../../assets/images/icons/uploadcloud.svg';
import text from '../../assets/images/icons/text.svg';
import images from '../../assets/images/icons/images.svg';
import background from '../../assets/images/icons/background.svg';
import close from '../../assets/images/icons/close.svg';
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
import { IconStackForward, IconStackBackward, IconStackBack, IconStackFront } from '@tabler/icons-react';
import { replace } from 'lodash';

function Template() {
  const { templateId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(null);

  const [color, setColor] = useState('#35363a');
  const [fontSize, setFontSize] = useState(30);
  const [opacity, setOpacity] = useState(1);
  // const [templateId, setTemplateId] = useState(null);
  // const [isDisabled, setIsDisabled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [backgroundColor, setBackgroundColor] = useState('#00FF00');
  const [assetImage, setAssetImage] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState([]);
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
  const [rotationAngle, setRotationAngle] = useState(0);
  // Add this state to track selected rectangle

  const box_service = new boxService();
  const layer_service = new layerService();
  //const template_service = new templateService();
  const box_item_service = new boxItemService();
  const layer_item_service = new layerItemService();
  const font_service = new fontService();
  const cloudinary_service = new cloudinaryService();
  const canvasFeature = new canvasFeatures();
  const dataConvert = new dataHandler();

  const currentPath = location.pathname;
  const [loading, setLoading] = useState(false);
  // const cloudName = import.meta.env.VITE_CLOUD_NAME;
  // const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

  // const cloudName = 'dchov8fes';
  // const uploadPreset = 'ml_default';
  const templateType = location.state.templateType;

  // const userId = localStorage.getItem('userId');
  const canvasWidth = location.state.templateWidth;
  const canvasHeight = location.state.templateHeight;
  const displayWidth = templateType === 0 ? canvasWidth : 720;
  const displayHeight = templateType === 0 ? canvasHeight : 1080;

  const [fontLoaded, setFontLoaded] = useState(false);
  const [selectedFont, setSelectedFont] = useState('Times New Roman');
  const [fonts, setFonts] = useState([]);
  const [allText, setAllText] = useState([]);

  //for background image
  const [backgroundLayerId, setBackgroundLayerId] = useState(null);
  const [backgroundLayerItemId, setBackgroundLayerItemId] = useState(null);

  const user_id = localStorage.getItem('userId');

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
  //   let value = e.target.value;

  //   // Allow both commas and dots in the input without changing the display value
  //   // Only replace for parsing
  //   const normalizedValue = value.replace(/,/g, '.'); // Replace commas with dots for parsing
  //   let parsedValue = parseFloat(normalizedValue);

  //   // If parsed value is NaN, we should stop further processing
  //   if (isNaN(parsedValue)) {
  //     return; // Exit if the value is not a number
  //   }

  //   let element = editor.canvas.getActiveObject();
  //   if (!element) return; // Exit if no object is selected

  //   // Apply constraints only if the selected element is of type 'text'
  //   let isValid = true;

  //   if (element.type === 'image') {
  //     const originalWidth = element.originalWidth; // Use original dimensions
  //     const originalHeight = element.originalHeight;

  //     switch (type) {
  //       case 'width':
  //         element.scaleX = parsedValue / originalWidth; // Update scale
  //         break;
  //       case 'height':
  //         element.scaleY = parsedValue / originalHeight; // Update scale
  //         break;
  //       case 'positionX':
  //         element.left = parsedValue;
  //         break;
  //       case 'positionY':
  //         element.top = parsedValue;
  //         break;
  //       default:
  //         break;
  //     }

  //     // Update the width and height properties accordingly
  //     // element.set({
  //     //   width: newWidth,
  //     //   height: newHeight
  //     // });
  //   }

  //   if (element.type === 'text') {
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

  //     switch (type) {
  //       case 'width':
  //         newWidth = parsedValue;
  //         if (newPositionX + newWidth > renderLayerBounds.right) {
  //           showToast('Width exceeds the render layer bounds!');
  //           isValid = false;
  //         }
  //         break;

  //       case 'height':
  //         newHeight = parsedValue;
  //         if (newPositionY + newHeight > renderLayerBounds.bottom) {
  //           showToast('Height exceeds the render layer bounds!');
  //           isValid = false;
  //         }
  //         break;

  //       case 'positionX':
  //         newPositionX = parsedValue;
  //         if (newPositionX < renderLayerBounds.left || newPositionX + newWidth > renderLayerBounds.right) {
  //           showToast('X position exceeds the render layer bounds!');
  //           isValid = false;
  //         }
  //         break;

  //       case 'positionY':
  //         newPositionY = parsedValue;
  //         if (newPositionY < renderLayerBounds.top || newPositionY + newHeight > renderLayerBounds.bottom) {
  //           showToast('Y position exceeds the render layer bounds!');
  //           isValid = false;
  //         }
  //         break;

  //       default:
  //         break;
  //     }
  //   }

  //   // Update the UI input and object properties regardless of type
  //   switch (type) {
  //     case 'width':
  //       setWidth(parsedValue);
  //       if (isValid || element.type !== 'text') element.set({ scaleX: 1 });
  //       element.set('width', parsedValue); // Apply to all, but check constraints for 'text'
  //       break;
  //     case 'height':
  //       setHeight(parsedValue);
  //       if (isValid || element.type !== 'text') element.set({ scaleY: 1 });
  //       element.set('height', parsedValue); // Apply to all, but check constraints for 'text'
  //       break;
  //     case 'positionX':
  //       setPositionX(parsedValue);
  //       if (isValid || element.type !== 'text') element.set('left', parsedValue); // Apply to all, but check constraints for 'text'
  //       break;
  //     case 'positionY':
  //       setPositionY(parsedValue);
  //       if (isValid || element.type !== 'text') element.set('top', parsedValue); // Apply to all, but check constraints for 'text'
  //       break;
  //     default:
  //       break;
  //   }

  //   editor.canvas.renderAll(); // Re-render the canvas
  // };

  const handleDimensionChange = (e, type) => {
    let value = e.target.value;

    // Normalize input to handle both commas and dots
    const normalizedValue = value.replace(/,/g, '.');
    let parsedValue = parseFloat(normalizedValue);

    // Update the input field (this allows the user to type normally)
    switch (type) {
      case 'width':
        setWidth(value); // Update state with current input
        break;
      case 'height':
        setHeight(value);
        break;
      case 'positionX':
        setPositionX(value);
        break;
      case 'positionY':
        setPositionY(value);
        break;
      default:
        break;
    }

    // Prevent further processing if the input is invalid
    if (isNaN(parsedValue)) return;

    const element = editor.canvas.getActiveObject();
    if (!element) return; // Exit if no object is selected

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        let isValid = true;

        if (element.type === 'image') {
          const originalWidth = element.originalWidth;
          const originalHeight = element.originalHeight;

          switch (type) {
            case 'width':
              element.scaleX = parsedValue / originalWidth;
              break;
            case 'height':
              element.scaleY = parsedValue / originalHeight;
              break;
            case 'positionX':
              element.left = parsedValue;
              break;
            case 'positionY':
              element.top = parsedValue;
              break;
            default:
              break;
          }
        }

        if (element.type === 'text') {
          const renderLayerBounds = {
            left: selectedRect.left,
            top: selectedRect.top,
            right: selectedRect.left + selectedRect.width,
            bottom: selectedRect.top + selectedRect.height
          };

          let newPositionX = element.left;
          let newPositionY = element.top;
          let newWidth = element.width;
          let newHeight = element.height;

          switch (type) {
            case 'width':
              newWidth = parsedValue;
              if (newPositionX + newWidth > renderLayerBounds.right) {
                showToast('Width exceeds the render layer bounds!');
                isValid = false;
              }
              break;

            case 'height':
              newHeight = parsedValue;
              if (newPositionY + newHeight > renderLayerBounds.bottom) {
                showToast('Height exceeds the render layer bounds!');
                isValid = false;
              }
              break;

            case 'positionX':
              newPositionX = parsedValue;
              if (newPositionX < renderLayerBounds.left || newPositionX + newWidth > renderLayerBounds.right) {
                showToast('X position exceeds the render layer bounds!');
                isValid = false;
              }
              break;

            case 'positionY':
              newPositionY = parsedValue;
              if (newPositionY < renderLayerBounds.top || newPositionY + newHeight > renderLayerBounds.bottom) {
                showToast('Y position exceeds the render layer bounds!');
                isValid = false;
              }
              break;

            default:
              break;
          }
        }

        // Update the object properties and render canvas if valid
        if (isValid || element.type !== 'text') {
          switch (type) {
            case 'width':
              element.set('width', parsedValue);
              if (element.type !== 'text') element.set({ scaleX: 1 });
              break;
            case 'height':
              element.set('height', parsedValue);
              if (element.type !== 'text') element.set({ scaleY: 1 });
              break;
            case 'positionX':
              element.set('left', parsedValue);
              break;
            case 'positionY':
              element.set('top', parsedValue);
              break;
            default:
              break;
          }
          editor.canvas.renderAll();
        }
      }
    };

    // Add the keydown event listener for Enter key
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  };

  // Helper function to show toast notifications
  const showToast = (message) => {
    Toastify({
      text: message,
      className: 'info',
      gravity: 'top',
      position: 'right',
      duration: 3000,
      style: {
        background: 'linear-gradient(to right, #ff0000, #ff6347)'
      }
    }).showToast();
  };

  // Helper function to show toast notifications

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
      const userResult = await cloudinary_service.getAllImages(`${user_id}`);
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

  const getBackgroundImages = async (tag) => {
    try {
      // Fetch asset images
      const assetResult = await cloudinary_service.getAllImages(tag);
      const backgroundImages = assetResult.resources; // Access the resources property
      // console.log('Asset Images: ', assetImages);

      // Fetch user images
      const userResult = await cloudinary_service.getAllImages(`${user_id}`);
      const userImages = userResult.resources; // Access the resources property
      // console.log('User Images: ', userImages);

      // Combine the images
      const combinedImages = [...userImages, ...backgroundImages];

      // Optionally set state or process the combined images
      setBackgroundImage(combinedImages);

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
      const value = await font_service.getAll();
      setFonts(value); // Update fonts state with the fetched value
      // console.log('Updated fonts: ', value);

      console.log('Updated fonts: ', value);
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const findFontNameById = (bFontId) => {
    const font = fonts.find((font) => font.fontId === bFontId);

    return font ? font.fontName : 'Times New Roman';
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

  const createBoxItem = async (boxId, fontId, boxItemX, boxItemY, boxItemWidth, boxItemHeight, boxItemType, style) => {
    try {
      const { boxItemId, bFontId } = await box_item_service.createBoxItem(
        boxId,
        fontId,
        boxItemX,
        boxItemY,
        boxItemWidth,
        boxItemHeight,
        boxItemType,
        style
      );

      return { boxItemId, bFontId };
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
    console.log('api key: ', process.env.REACT_APP_PRESET_KEY);

    getAssetImages('asset/images');

    getUserImages(`${user_id}`);

    getBackgroundImages('asset/background');

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

  const removeSelectedObject = useCallback(() => {
    if (editor && editor.canvas) {
      const activeObject = editor.canvas.getActiveObject();
      console.log('activeObject: ', activeObject);

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
          const boxItemId = activeObject.boxItemId;

          if (layerId) {
            deleteText(layerId);
          } else if (boxItemId) {
            deleteBoxItem(boxItemId);
          }
        } else if (activeObjectType === 'rect') {
          const layerId = activeObject.layerId;
          deleteRenderLayer(layerId);
        } else if (activeObjectType === 'image') {
          const layerId = activeObject.layerId;

          deleteImage(layerId);

          // if (activeObject.isBackground) {
          //   console.log('this is background');
          //   console.log('layerId background: ', backgroundLayerId);
          //   deleteImage(backgroundLayerId);
          // } else {

          //   console.log('this is image');
          // }
        }

        // else if (activeObjectType === 'text') {
        //   const boxItemId = activeObject.boxItemId;

        // }

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

  const isNewTemplate = async (templateId) => {
    const isNew = await layer_service.checkTemplateLength(templateId);

    if (isNew === 0) {
      return true;
    }
    return false;
  };

  const loadCanvas = async (templateId, canvasWidth, canvasHeight) => {
    const newTemplate = await isNewTemplate(templateId);

    if (newTemplate === true) {
      console.log('new template');

      return;
    }
    getLayersByTemplateId(templateId, canvasWidth, canvasHeight).then(({ canvasJson, backgroundImage, textBox }) => {
      // console.log('This is all textbox: ', textBox);

      setAllText(textBox);

      editor.canvas.loadFromJSON(canvasJson, function () {
        const scaleX = canvasWidth / displayWidth;
        const scaleY = canvasHeight / displayHeight;
        console.log('data in textbox: ', textBox);

        if (textBox && textBox.length > 0) {
          // Iterate over the textBox array and add each text box
          textBox.forEach((textStyle) => {
            const fabricTextbox = new fabric.Textbox(textStyle.text, {
              left: textStyle.left,
              top: textStyle.top,
              width: textStyle.width,
              height: textStyle.height + 50,
              fontSize: textStyle.fontSize * 1.333,
              fill: textStyle.fill,
              angle: textStyle.angle,
              backgroundColor: textStyle.backgroundColor,
              fontFamily: textStyle.fontFamily,
              fontStyle: textStyle.fontStyle === 'regular' ? 'normal' : textStyle.fontStyle, // Handle 'regular'
              textAlign: textStyle.textAlign,
              opacity: textStyle.opacity / 100,
              lockScalingFlip: true
            });

            //textbox.lineHeight = textbox.height / textbox.fontSize;

            console.log('check data: ', fabricTextbox);

            // fabricTextbox.minHeight = textStyle.height;
            // fabricTextbox.height = textStyle.height;
            // fabricTextbox.setCoords(); // Recalc

            // fabricTextbox.set({
            //   height: textStyle.height
            //   // lineHeight: textStyle.height / textStyle.fontSize
            //   // width: textStyle.width,
            //   // positionX: textStyle.positionX,
            //   // positionY: textStyle.positionY
            // });

            // fabricTextbox.on('modified', function () {
            //   fabricTextbox.set({
            //     height: textStyle.height
            //   });
            // });

            //fabricTextbox.setCoords();

            // Add the text box to the canvas
            editor.canvas.add(fabricTextbox);
          });

          // Render the canvas after adding all text boxes
          editor.canvas.renderAll();
        }

        if (backgroundImage) {
          fabric.Image.fromURL(
            backgroundImage.src,
            function (img) {
              img.scaleX = editor.canvas.width / img.width;
              img.scaleY = editor.canvas.height / img.height;

              // img.scaleToWidth(canvasWidth);
              // img.scaleToHeight(canvasHeight);
              editor.canvas.setBackgroundImage(img);
              editor.canvas.requestRenderAll();
            }
            // { crossOrigin: 'anonymous' }
          ); // Ensure CORS if necessary
        }

        console.log('loading template');

        editor.canvas.getObjects().forEach((object) => {
          if (object.type === 'image' && object.layerType == 1) {
            object.on('mouseup', () => {
              console.log('Clicked on image with boxId:', boxId);
              setActiveTab('positionSize');
              setSelectedTool('text');
            });

            editor.canvas.on('mouse:down', function (options) {
              if (options.target !== rect) {
                setActiveTab(null);
              }
              setSelectedTool(null);
            });
          } else if (object.type === 'image' && object.layerType == 0) {
            // object.on('object:selected', function () {
            //   console.log('click to background image');
            // });
            // fabric.Image.fromURL(`${backgroundImage.src}`, function (img) {
            //   img.scaleToWidth(canvasWidth);
            //   img.scaleToHeight(canvasHeight);
            //   editor.canvas.setBackgroundImage(img);
            //   editor.canvas.requestRenderAll();
            // });
          } else if (object.type === 'rect') {
            object.on('mouseup', function () {
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              const scaledWidth = object.getScaledWidth();
              const scaledHeight = object.getScaledHeight();

              setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
              setSelectedTool('rect');
              setSelectedRect(object);

              setHeight((scaledHeight * scaleX).toFixed(1));
              setWidth((scaledWidth * scaleY).toFixed(1));
              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));
              // let object = event.target;
              // editor.canvas.sendToBack(rect);
              console.log('selected: ', editor.canvas.getActiveObject());
            });

            object.setControlsVisibility({
              mtr: false,
              mt: false // middle top disable
              // mb: false, // midle bottom
              // ml: false, // middle left
              // mr: false // middle right
            });

            object.set({
              opacity: 0.5
            });

            object.on('moving', function () {
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));
              setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
              setSelectedTool('rect');

              // object.linkedText.forEach((textBox) => {
              //   textBox.left += object.left - object.prevLeft; // Move text by the same distance as the rectangle
              //   textBox.top += object.top - object.prevTop;
              //   textBox.setCoords();
              // });

              // Store the current position for the next move
              object.prevLeft = object.left;
              object.prevTop = object.top;

              editor.canvas.renderAll();

              // Move the group (rectangle + text) together
            });

            object.on('scaling', function () {
              const newWidth = object.width * object.scaleX;
              const newHeight = object.height * object.scaleY;

              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              object.set({
                width: newWidth,
                height: newHeight,
                scaleX: 1,
                scaleY: 1
              });
              setHeight(newHeight.toFixed(1));
              setWidth(newWidth.toFixed(1));

              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));
            });

            // editor.canvas.renderAll();

            editor.canvas.on('mouse:down', function (options) {
              if (options.target !== rect) {
                setActiveTab(null);
              }
              setSelectedTool(null);
            });
          } else if (object.type === 'textbox') {
            const scaleX = canvasWidth / displayWidth;
            const scaleY = canvasHeight / displayHeight;

            object.set({
              fontSize: object.fontSize
            });

            // object.set({
            //   // scaleX: 1,
            //   // scaleY: 1,
            //   fontSize: object.fontSize * scaleY
            // });

            object.setControlsVisibility({
              mt: false, // middle top disable
              mb: false // midle bottom
            });

            object.on('scaling', function () {
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              const scaledWidth = object.getScaledWidth();
              const scaledHeight = object.getScaledHeight();

              setActiveTab('positionSize');

              const newFontSize = (object.fontSize * object.scaleX).toFixed(1); // Using scaleX for proportional scaling

              setFontSize((newFontSize / 1.333).toFixed(1)); // Convert back t

              console.log('Text fontSize after scaled: ', object.fontSize * object.scaleX);

              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));

              setHeight((scaledHeight * scaleX).toFixed(1));
              setWidth((scaledWidth * scaleY).toFixed(1));

              setIsHeaderVisible(true);

              setSelectedTool('textBox');
            });

            editor.canvas.on('mouse:down', function (options) {
              setActiveTab(null);

              setSelectedTool(null);
            });

            object.on('moving', function () {
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;
              setActiveTab('positionSize');
              setSelectedTool('textBox');

              const newFontSize = (object.fontSize * object.scaleX).toFixed(1); // Using scaleX for proportional scaling

              // Set the new font size in the UI, adjusting for the factor
              setFontSize((newFontSize / 1.333).toFixed(1)); // Convert back t

              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));
            });

            object.on('editing:exited', function () {
              console.log('Text editing exited, new text: ', object.text);
              updateLayerItem(object.layerItemId, 2, object.text);
            });

            object.on('mouseup', function () {
              // console.log('touched text box');
              //console.log('selected text box: ', object);

              console.log('textbox left: ', object.left);
              console.log('textbox top: ', object.top);
              console.log('textbox width: ', object.width);
              console.log('textbox height: ', object.height);
              console.log('textbox fontSize: ', object.fontSize);
              console.log('textbox X: ', object.left);
              console.log('textbox Y: ', object.top);

              let adjustedAngle = object.angle;
              if (adjustedAngle > 180) {
                adjustedAngle -= 360;
              } else if (adjustedAngle < -180) {
                adjustedAngle += 360;
              }
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              const scaledWidth = object.getScaledWidth();
              const scaledHeight = object.getScaledHeight();

              let canvasFontSize = (object.fontSize * object.scaleX).toFixed(1);
              setFontSize((canvasFontSize / 1.333).toFixed(1));

              setColor(object.fill);

              setHeight((scaledHeight * scaleX).toFixed(1));
              setWidth((scaledWidth * scaleY).toFixed(1));
              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));
              setRotationAngle(adjustedAngle);

              setIsHeaderVisible(true);

              setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
              setSelectedTool('textBox');
              console.log('fontSize: ', object.fontSize);
            });
          } else if (object.type === 'text') {
            object.on('moving', function () {
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));
              // console.log('moving');

              const scaledWidth = object.getScaledWidth();
              const scaledHeight = object.getScaledHeight();

              setHeight((scaledHeight * scaleX).toFixed(1));
              setWidth((scaledWidth * scaleY).toFixed(1));

              const newFontSize = (object.fontSize * object.scaleX).toFixed(1); // Using scaleX for proportional scaling

              // Set the new font size in the UI, adjusting for the factor
              setFontSize((newFontSize / 1.333).toFixed(1)); // Convert back t

              const textLeft = object.left;
              const textTop = object.top;
              const textWidth = object.width * object.scaleX; // consider scaling
              const textHeight = object.height * object.scaleY; // consider scaling

              // const rectLeft = selectedRect.left;
              // const rectTop = selectedRect.top;
              // const rectRight = selectedRect.left + selectedRect.width;
              // const rectBottom = selectedRect.top + selectedRect.height;

              //Restrict text movement within the rectangle boundaries
              // if (textLeft < rectLeft) {
              //   object.set('left', rectLeft);
              // }
              // if (textTop < rectTop) {
              //   object.set('top', rectTop);
              // }
              // if (textLeft + textWidth > rectRight) {
              //   object.set('left', rectRight - textWidth);
              // }
              // if (textTop + textHeight > rectBottom) {
              //   object.set('top', rectBottom - textHeight);
              // }

              object.setCoords();
              editor.canvas.renderAll();
            });

            object.on('scaling', function () {
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              const scaledWidth = object.getScaledWidth();
              const scaledHeight = object.getScaledHeight();

              const newWidth = object.width * object.scaleX;
              const newHeight = object.height * object.scaleY;

              let newFontSize = (object.fontSize * object.scaleX).toFixed(1); // Using scaleX for proportional scaling

              setFontSize((newFontSize / 1.333).toFixed(1));

              setHeight(newHeight.toFixed(1));
              setWidth(newWidth.toFixed(1));
              setActiveTab('positionSize');
            });

            object.on('mouseup', function () {
              console.log('touched text type');
              let adjustedAngle = object.angle;
              if (adjustedAngle > 180) {
                adjustedAngle -= 360;
              } else if (adjustedAngle < -180) {
                adjustedAngle += 360;
              }
              const scaleX = canvasWidth / displayWidth;
              const scaleY = canvasHeight / displayHeight;

              const scaledWidth = object.getScaledWidth();
              const scaledHeight = object.getScaledHeight();

              let canvasFontSize = (object.fontSize * object.scaleX).toFixed(1);
              setFontSize((canvasFontSize / 1.333).toFixed(1));

              setColor(object.fill);

              setHeight((scaledHeight * scaleX).toFixed(1));
              setWidth((scaledWidth * scaleY).toFixed(1));
              setPositionX((object.left * scaleX).toFixed(1));
              setPositionY((object.top * scaleY).toFixed(1));
              setRotationAngle(adjustedAngle == 0 ? adjustedAngle : adjustedAngle.toFixed(1));

              setIsHeaderVisible(true);

              setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
              setSelectedTool('textBox');
              console.log('fontSize: ', object.fontSize);
            });

            object.on('mousemove', function () {
              setHeight(object.height.toFixed(1));
              setWidth(object.width.toFixed(1));
              setPositionX(object.left.toFixed(1));
              setPositionY(object.top.toFixed(1));
            });
          }
          //console.log('object: ', object);
        });

        editor.canvas.renderAll();
        // console.log('json: ', canvasJson);
      });
    });
  };

  const getLayersByTemplateId = async (templateId, canvasWidth, canvasHeight) => {
    const canvas = await layer_service.getLayersByTemplateId(templateId, canvasWidth, canvasHeight);

    return canvas;
  };

  // useEffect(() => {
  //   if (!editor) return;

  //   // Preload all custom fonts
  //   Promise.all(fonts.map((font) => new FontFaceObserver(font).load()))
  //     .then(() => {
  //       setFontLoaded(true); // Set state to indicate fonts are loaded
  //       console.log('Fonts loaded successfully');
  //     })
  //     .catch((err) => {
  //       console.error('Failed to load fonts:', err);
  //     });

  //   // Add a textbox to the canvas with default font
  // }, [editor]); // Trigge

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

    editor.canvas.renderAll();
  }, []);

  useEffect(() => {
    if (editor) {
      // const textStyle = {
      //   angle: -7.3,
      //   backgroundColor: 'transparent',
      //   boxId: 1696,
      //   boxItemId: 1882,
      //   fill: 'black',
      //   fontFamily: 'Times New Roman',
      //   fontSize: 32,
      //   fontStyle: 'regular',
      //   height: 57,
      //   layerItemId: 1127,
      //   layerType: 2,
      //   left: 48.2,
      //   opacity: 100,
      //   text: "DRINK'S",
      //   textAlign: 'center',
      //   top: 149.3,
      //   type: 'textbox',
      //   width: 404.6
      // };

      // const fabricTextbox = new fabric.Textbox(textStyle.text, {
      //   angle: textStyle.angle,
      //   left: textStyle.left,
      //   top: textStyle.top,
      //   fill: textStyle.fill,
      //   fontFamily: textStyle.fontFamily,
      //   fontSize: textStyle.fontSize,
      //   fontStyle: textStyle.fontStyle === 'regular' ? 'normal' : textStyle.fontStyle, // Handle 'regular'
      //   textAlign: textStyle.textAlign,
      //   width: textStyle.width,
      //   height: textStyle.height,
      //   opacity: textStyle.opacity / 100, // Opacity must be between 0 and 1
      //   backgroundColor: textStyle.backgroundColor
      // });

      // console.log('add fabric textbox', fabricTextbox);

      // // Add the textbox to the canvas
      // editor.canvas.add(fabricTextbox);
      // editor.canvas.renderAll();

      editor.canvas.preserveObjectStacking = true;
      //loadCanvas(420);
      //loadAllText();
    }
  }, [editor]);

  // const addImage = (file) => {
  //   const reader = new FileReader();
  //   const userId = 46;
  //   const formData = new FormData();
  //   //const preset_key = process.env.REACT_APP_PRESET_KEY;
  //   const preset_key = 'xdm798lx';
  //   const folder = `users/${userId}`;
  //   const tags = `${userId}`;
  //   reader.onload = (e) => {
  //     fabric.Image.fromURL(e.target.result, async (img) => {
  //       let myImg = img.set({
  //         left: 100,
  //         top: 100,
  //         selectable: true, // Make sure the image is selectable
  //         evented: true,
  //         scaleX: 0.5,
  //         scaleY: 0.5
  //       });

  //       editor.canvas.add(myImg);
  //       editor.canvas.renderAll();

  //       myImg.on('mouseup', () => {
  //         console.log('clicked to images layer');
  //         setActiveTab('positionSize');
  //         setSelectedTool('text');
  //       });

  //       editor.canvas.on('mouse:down', function (options) {
  //         if (options.target !== rect) {
  //           setActiveTab(null);
  //         }
  //         setSelectedTool(null);
  //       });

  //       let width = myImg.getScaledWidth();
  //       let height = myImg.getScaledHeight();
  //       let positionX = myImg.left;
  //       let positionY = myImg.top;

  //       formData.append('file', file);
  //       formData.append('upload_preset', preset_key);
  //       formData.append('tags', tags);
  //       formData.append('folder', folder);

  //       try {
  //         const response = await fetch('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', {
  //           method: 'POST',
  //           body: formData
  //         });

  //         const result = await response.json();
  //         console.log('result: ', result);

  //         const layerItemValue = result.secure_url;
  //         const { layerId, zIndex } = await createLayer(templateId, 1);
  //         const layerItemId = await createLayerItem(layerId, layerItemValue);

  //         const public_id = result.public_id;

  //         setAssetImage((preImages) => [public_id, ...preImages]);

  //         console.log('Result hihi: ', result);
  //         console.log('layerId: ', layerId);
  //         console.log('zIndex: ', zIndex);

  //         console.log('layerItemId: ', layerItemId);

  //         const boxId = await createBox(layerId, positionX, positionY, width, height, 0);

  //         const { boxItemId, bFontId } = await createBoxItem(
  //           boxId,
  //           5,
  //           positionX,
  //           positionY,
  //           width,
  //           height,
  //           7,
  //           JSON.stringify({
  //             transparency: 100
  //           })
  //         );

  //         myImg.boxId = boxId;
  //         myImg.boxItemId = boxItemId;
  //         myImg.layerId = layerId;

  //         myImg.bFontId = bFontId;

  //         console.log('Response from cloudinary when upload image:', JSON.stringify(layerItemValue));
  //       } catch (error) {
  //         console.log('error upload image: ', error);
  //       }
  //     });
  //   };

  //   reader.readAsDataURL(file);
  // };

  const addImage = (file) => {
    const reader = new FileReader();
    const userId = 46;
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;

    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, async (img) => {
        // Set basic properties for the image
        let myImg = img.set({
          left: 100,
          top: 100,
          selectable: true,
          evented: true,
          scaleX: 0.5,
          scaleY: 0.5
        });

        // Add the image to the canvas
        editor.canvas.add(myImg);

        // Render the canvas right after adding the image
        editor.canvas.renderAll();

        img.originalWidth = img.width;
        img.originalHeight = img.height;

        // Now attach mouse event listeners to the image
        myImg.on('mouseup', () => {
          let adjustedAngle = myImg.angle;
          if (adjustedAngle > 180) {
            adjustedAngle -= 360;
          } else if (adjustedAngle < -180) {
            adjustedAngle += 360;
          }

          const scaleX = canvasWidth / displayWidth;
          const scaleY = canvasHeight / displayHeight;

          const scaledWidth = myImg.getScaledWidth();
          const scaledHeight = myImg.getScaledHeight();

          setHeight((scaledHeight * scaleX).toFixed(1));
          setWidth((scaledWidth * scaleY).toFixed(1));
          setPositionX((myImg.left * scaleX).toFixed(1));
          setPositionY((myImg.top * scaleY).toFixed(1));
          setRotationAngle(adjustedAngle);

          console.log('Image clicked');
          setActiveTab('positionSize');
          setSelectedTool('image');
        });

        myImg.on('moving', function () {
          const scaleX = canvasWidth / displayWidth;
          const scaleY = canvasHeight / displayHeight;
          setActiveTab('positionSize');
          setSelectedTool('rect');
          setPositionX((myImg.left * scaleX).toFixed(1));
          setPositionY((myImg.top * scaleY).toFixed(1));
        });

        myImg.on('scaling', function () {
          const scaleX = canvasWidth / displayWidth;
          const scaleY = canvasHeight / displayHeight;

          const scaledWidth = myImg.getScaledWidth();
          const scaledHeight = myImg.getScaledHeight();

          setActiveTab('positionSize');

          setPositionX((myImg.left * scaleX).toFixed(1));
          setPositionY((myImg.top * scaleY).toFixed(1));

          setHeight((scaledHeight * scaleX).toFixed(1));
          setWidth((scaledWidth * scaleY).toFixed(1));

          setIsHeaderVisible(true);

          setSelectedTool('textBox');
        });

        // Defer canvas-wide mouse:down event listener until after the image is rendered
        editor.canvas.on('mouse:down', function (options) {
          setActiveTab(null);

          setSelectedTool(null);
        });

        // Get the scaled width, height, and position of the image
        const width = myImg.getScaledWidth();
        const height = myImg.getScaledHeight();
        const positionX = myImg.left;
        const positionY = myImg.top;

        // Prepare form data for image upload to Cloudinary
        formData.append('file', file);
        formData.append('upload_preset', preset_key);
        formData.append('tags', tags);
        formData.append('folder', folder);

        try {
          // Upload image to Cloudinary
          const response = await fetch('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', {
            method: 'POST',
            body: formData
          });
          const result = await response.json();

          // Handle the uploaded result
          const layerItemValue = result.secure_url;
          const { layerId, zIndex } = await createLayer(templateId, 1);
          const layerItemId = await createLayerItem(layerId, layerItemValue);

          const public_id = result.public_id;
          setAssetImage((preImages) => [public_id, ...preImages]);

          console.log('Cloudinary upload result: ', result);
          console.log('Layer details - layerId:', layerId, 'zIndex:', zIndex, 'layerItemId:', layerItemId);

          // Associate the image with the box and layer
          const boxId = await createBox(layerId, positionX, positionY, width, height, 0);
          const { boxItemId, bFontId } = await createBoxItem(
            boxId,
            5, // Assuming some default values here
            positionX,
            positionY,
            width,
            height,
            7, // Assuming some default values here
            JSON.stringify({
              transparency: 100
            })
          );

          // Store IDs in the image object for later reference
          myImg.boxId = boxId;
          myImg.boxItemId = boxItemId;
          myImg.layerId = layerId;
          myImg.bFontId = bFontId;

          console.log('Box and font IDs added:', { boxId, boxItemId, bFontId });
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      });
    };

    // Read the file and trigger the onload event
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

  // const changeFontSize = (e) => {
  //   let inputValue = e.target.value; // Get font size from the input
  //   let canvasFontSize = parseFloat(inputValue);

  //   if (isNaN(canvasFontSize) || canvasFontSize <= 0) {
  //     canvasFontSize = 1; // Set to minimum if invalid or negative
  //   } else if (canvasFontSize > 500) {
  //     canvasFontSize = 500; // Limit the font size to a maximum of 500
  //   } // Parse the input as a number

  //   // Set the state for the input value
  //   setFontSize(inputValue);

  //   const activeObject = editor.canvas.getActiveObject();

  //   if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
  //     // Convert canvas font size to Fabric.js font size
  //     let fabricFontSize = canvasFontSize * 1.333;

  //     const originalHeight = activeObject.getScaledHeight();

  //     // Set the converted font size in Fabric.js
  //     activeObject.set('fontSize', fabricFontSize);

  //     // Reset scaleX and scaleY to prevent stretching after changing font size
  //     activeObject.set({
  //       scaleX: 1,
  //       scaleY: 1
  //     });

  //     // Calculate the new width and height based on the text content with the new font size
  //     activeObject.set({
  //       width: activeObject.width * activeObject.scaleX,
  //       height: activeObject.height * activeObject.scaleY
  //       //height: originalHeight
  //     });

  //     // Adjust the object to the new width and height without extra scaling
  //     editor.canvas.renderAll();

  //     // Log the actual font size being set
  //     console.log('Canvas Font Size: ', canvasFontSize);
  //     console.log('FabricJS Font Size (converted): ', fabricFontSize);

  //     // Trigger the 'modified' event to ensure everything is updated
  //     activeObject.fire('modified');
  //   }
  // };

  const changeFontSize = (e) => {
    let inputValue = e.target.value; // Get font size from the input
    // Update state with current input (without applying changes yet)
    setFontSize(inputValue);
    // Handle keydown event to check for Enter key
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        let canvasFontSize = parseFloat(inputValue);

        // Check if the input is invalid (empty or NaN)
        if (isNaN(canvasFontSize) || canvasFontSize <= 0) {
          canvasFontSize = 1; // Set to minimum if invalid or negative
        } else if (canvasFontSize > 500) {
          canvasFontSize = 500;
          setFontSize(500);
          // Limit the font size to a maximum of 500
        } else {
          setFontSize(inputValue);
        }

        const activeObject = editor.canvas.getActiveObject();

        if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
          // Convert canvas font size to Fabric.js font size
          let fabricFontSize = canvasFontSize * 1.333;

          // Set the converted font size in Fabric.js
          activeObject.set('fontSize', fabricFontSize);

          // Reset scaleX and scaleY to prevent stretching after changing font size
          activeObject.set({
            scaleX: 1,
            scaleY: 1
          });

          activeObject.set({
            width: activeObject.width * activeObject.scaleX,
            height: activeObject.height * activeObject.scaleY
            //height: originalHeight
          });

          // Adjust the object to the new width and height without extra scaling
          editor.canvas.renderAll();

          // Log the actual font size being set
          console.log('Canvas Font Size: ', canvasFontSize);
          console.log('FabricJS Font Size (converted): ', fabricFontSize);

          // Trigger the 'modified' event to ensure everything is updated
          activeObject.fire('modified');
        }
      }
    };

    // Add the keydown event listener for the Enter key
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup the keydown event listener when the component is unmounted
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  };

  const handleKeyDown = (e) => {
    if (e.key === '-' || e.key === 'e') {
      e.preventDefault(); // Block '-' and 'e' for non-numeric input
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

  const changeZIndex = (action) => {
    const activeObject = editor.canvas.getActiveObject();
    if (!activeObject || !activeObject.layerId) return; // Ensure the active object is valid

    const elements = editor.canvas.getObjects(); // Get all objects on the canvas
    const currentZIndex = activeObject.zIndex; // Get the current zIndex of the active object
    const maxZIndex = Math.max(...elements.map((el) => el.zIndex)); // Get the highest zIndex among objects
    const minZIndex = Math.min(...elements.map((el) => el.zIndex)); // Get the lowest zIndex among objects
    const background = elements.find((el) => el.isBackground);

    switch (action) {
      case 'sendBackward': {
        // Move active object one step back in canvas and swap zIndex with the element behind
        editor.canvas.sendBackwards(activeObject);
        editor.canvas.sendBackwards(background);

        const elementBehind = elements.find((el) => el.zIndex === currentZIndex - 1);
        if (elementBehind) {
          // Swap zIndex
          elementBehind.zIndex = currentZIndex;
          activeObject.zIndex = currentZIndex - 1;
        }
        break;
      }

      case 'sendToBack': {
        // Move the active object to the back and set its zIndex to the lowest
        editor.canvas.sendToBack(activeObject);

        editor.canvas.sendToBack(background);
        // Adjust zIndex for all other elements
        elements.forEach((el) => {
          if (el !== activeObject && el.zIndex < currentZIndex) {
            el.zIndex += 1; // Shift zIndex upwards
          }
        });
        activeObject.zIndex = minZIndex; // Set active object to the lowest zIndex
        break;
      }

      case 'bringForward': {
        // Move active object one step forward in canvas and swap zIndex with the element ahead
        editor.canvas.bringForward(activeObject);

        const elementAhead = elements.find((el) => el.zIndex === currentZIndex + 1);
        if (elementAhead) {
          // Swap zIndex
          elementAhead.zIndex = currentZIndex;
          activeObject.zIndex = currentZIndex + 1;
        }
        break;
      }

      case 'bringToFront': {
        // Move the active object to the front and set its zIndex to the highest
        editor.canvas.bringToFront(activeObject);

        // Adjust zIndex for all other elements
        elements.forEach((el) => {
          if (el !== activeObject && el.zIndex > currentZIndex) {
            el.zIndex -= 1; // Shift zIndex downwards
          }
        });
        activeObject.zIndex = maxZIndex; // Set active object to the highest zIndex
        break;
      }

      default:
        return;
    }

    editor.canvas.renderAll(); // Re-render the canvas after changing zIndex
  };

  // const handleRotationChange = (e) => {
  //   const inputValue = e.target.value;
  //   const newAngle = parseFloat(inputValue);
  //   const element = editor.canvas.getActiveObject();

  //   // Check if the input is invalid (empty or NaN)
  //   if (inputValue === '' || isNaN(newAngle)) {
  //     Toastify({
  //       text: 'Please enter a valid number. Resetting to 0.',
  //       className: 'info',
  //       gravity: 'top',
  //       position: 'right',
  //       duration: 3000,
  //       style: {
  //         background: 'linear-gradient(to right, #ff0000, #ff6347)'
  //       }
  //     }).showToast();

  //     // Automatically reset to 0
  //     setRotationAngle(0);
  //     if (element) {
  //       element.set('angle', 0);
  //       editor.canvas.renderAll();
  //     }
  //     return;
  //   }

  //   // Check if the new angle is within the allowed range (0-360)
  //   if (newAngle < 0 || newAngle > 360) {
  //     Toastify({
  //       text: 'The angle must be between 0 and 360',
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

  //   // Update the UI input and the element's rotation if valid
  //   setRotationAngle(newAngle);
  //   if (element) {
  //     element.set('angle', newAngle);
  //     editor.canvas.renderAll();
  //   }
  // };

  const handleRotationChange = (e) => {
    // Handle input change event
    const inputValue = e.target.value;
    setRotationAngle(inputValue); // Update state with current input

    // Handle keydown event to check for Enter key
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        const newAngle = parseFloat(inputValue);
        const element = editor.canvas.getActiveObject();

        // Check if the input is invalid (empty or NaN)
        if (inputValue === '' || isNaN(newAngle)) {
          // Reset to 0 and show a Toastify notification

          setRotationAngle(0);
          if (element) {
            element.set('angle', 0);
            editor.canvas.renderAll();
          }
          return;
        }

        // Check if the new angle is within the allowed range (-180 to 180)
        if (newAngle < -180 || newAngle > 180) {
          // Reset to 0 and show a Toastify notification

          setRotationAngle(0);
          if (element) {
            element.set('angle', 0);
            editor.canvas.renderAll();
          }
          return;
        }

        // Update the UI input and the element's rotation if valid
        if (element) {
          setRotationAngle(newAngle);
          element.set('angle', newAngle);
          editor.canvas.renderAll();
        }
      }
    };

    // Add the keydown event listener for Enter key
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  };

  const toggleItalic = () => {
    // let element = editor.canvas.getActiveObject();

    // if (element && (element.type === 'text' || element.type === 'textbox')) {
    //   const currentFontStyle = element.fontStyle;

    //   // Toggle between 'italic' and 'normal'
    //   const newFontStyle = currentFontStyle === 'italic' ? 'normal' : 'italic';
    //   element.set('fontStyle', newFontStyle);

    //   // Re-render the canvas to apply the change
    //   editor.canvas.renderAll();
    // }

    const o = editor.canvas.getActiveObject();
    if (o) {
      setIsItalic((prev) => !prev);
      o.set('fontStyle', !isItalic ? 'italic' : 'normal');
      //o.fire('modified');
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

  const convertFabricFontSizeToCanvasFontSize = (fontSize) => {
    return fontSize / 1.333;
  };

  const swapZIndex = (text, direction) => {
    const elements = editor.canvas.getObjects(); // Get all canvas objects
    const target = editor.canvas.getActiveObject();
    // Sort elements by current zIndex
    const sortedElements = elements.sort((a, b) => a.zIndex - b.zIndex);

    // Get the current zIndex of the text object
    const currentZIndex = target.zIndex;

    let newZIndex;

    if (direction === 'backward') {
      // Send backward: decrease zIndex
      newZIndex = currentZIndex - 1;
      if (newZIndex < 1) {
        console.log('Cannot send backward any further');
        return;
      }

      // Find the element that has the new zIndex
      const elementToSwapWith = sortedElements.find((el) => el.zIndex === newZIndex);
      if (elementToSwapWith) {
        // Swap zIndex with that element
        elementToSwapWith.zIndex = currentZIndex;
        text.zIndex = newZIndex;
      }
    } else if (direction === 'forward') {
      // Send forward: increase zIndex
      newZIndex = currentZIndex + 1;

      // Find the element that has the new zIndex
      const elementToSwapWith = sortedElements.find((el) => el.zIndex === newZIndex);
      if (elementToSwapWith) {
        // Swap zIndex with that element
        elementToSwapWith.zIndex = currentZIndex;
        text.zIndex = newZIndex;
      }
    }

    // Re-render the canvas after updating zIndex
    editor.canvas.renderAll();
  };

  const addText = async (title) => {
    let defaultFontSize;
    let defaultText;

    if (title == 'Heading') {
      defaultFontSize = 50;
      defaultText = 'Heading';
    } else if (title == 'Subheading') {
      defaultFontSize = 40;
      defaultText = 'Subheading';
    } else {
      defaultFontSize = 30;
      defaultText = 'Body Text';
    }

    //setColor(color);
    let text = new fabric.Textbox(`${defaultText}`, {
      top: 300,
      left: 300,
      fill: '#000000',
      // zIndex: 1,
      backgroundColor: 'transparent',
      //fontStyle: isItalic ? 'italic' : 'normal',
      // fontWeight: isBold ? 'bold' : 'normal',
      // textAlign: textAlign,
      //fontFamily: selectedFont,
      fontSize: defaultFontSize,
      fontFamily: 'times new roman',
      editable: true,
      angle: 0,
      bFontId: 14
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

      const newFontSize = (text.fontSize * text.scaleX).toFixed(1); // Using scaleX for proportional scaling

      setFontSize((newFontSize / 1.333).toFixed(1)); // Convert back t

      console.log('Text fontSize after scaled: ', text.fontSize * text.scaleX);

      setPositionX((text.left * scaleX).toFixed(1));
      setPositionY((text.top * scaleY).toFixed(1));

      setHeight((scaledHeight * scaleX).toFixed(1));
      setWidth((scaledWidth * scaleY).toFixed(1));

      setIsHeaderVisible(true);

      setSelectedTool('textBox');
    });

    text.on('moving', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;
      setActiveTab('positionSize');
      setSelectedTool('textBox');

      const newFontSize = (text.fontSize * text.scaleX).toFixed(1); // Using scaleX for proportional scaling

      // Set the new font size in the UI, adjusting for the factor
      setFontSize((newFontSize / 1.333).toFixed(1)); // Convert back t

      setPositionX((text.left * scaleX).toFixed(1));
      setPositionY((text.top * scaleY).toFixed(1));
    });

    editor.canvas.on('mouse:down', function (options) {
      setActiveTab(null);

      setSelectedTool(null);
    });

    text.on('mouseup', function () {
      const fontName = findFontNameById(text.bFontId);

      setSelectedFont(fontName);

      const isBold = text.fontWeight === 'bold' ? true : false;
      const isItalic = text.fontStyle === 'italic' ? true : false;
      const textAlign = text.textAlign;
      console.log('text font style: ', text.fontStyle);

      setOpacity(text.opacity);

      setTextAlign(textAlign);

      setIsBold(isBold);
      setIsItalic(isItalic);

      console.log('italic: ', isItalic);

      const adjustedWidth = text.width * text.scaleX; // Scale back width
      const adjustedHeight = text.height * text.scaleY;

      let adjustedAngle = text.angle;
      if (adjustedAngle > 180) {
        adjustedAngle -= 360;
      } else if (adjustedAngle < -180) {
        adjustedAngle += 360;
      }
      console.log('bfontid: ', text.bFontId);

      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      const scaledWidth = text.getScaledWidth();
      const scaledHeight = text.getScaledHeight();

      let canvasFontSize = (text.fontSize * text.scaleX).toFixed(1);
      setFontSize((canvasFontSize / 1.333).toFixed(1));

      setColor(text.fill);

      // setHeight((scaledHeight * scaleX).toFixed(1));
      // setWidth((scaledWidth * scaleY).toFixed(1));

      setWidth(adjustedWidth.toFixed(1));
      setHeight(adjustedHeight.toFixed(1));
      setPositionX((text.left * scaleX).toFixed(1));
      setPositionY((text.top * scaleY).toFixed(1));
      setRotationAngle(adjustedAngle);

      setIsHeaderVisible(true);

      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('textBox');
      console.log('fontSize: ', text.fontSize);
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
    const { boxItemId, bFontId } = await createBoxItem(boxId, 5, text.left, text.top, text.width, text.height, 0, JSON.stringify(style));

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
      console.log('layerId: ', text.layerId);
      console.log('zIndex: ', text.zIndex);
      console.log('fontsize here: ', ((text.fontSize * text.scaleX) / 1.333).toFixed(1));
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
      opacity: 0.3
    });

    editor.canvas.add(rect);

    rect.id = `rect-${new Date().getTime()}`;

    rect.productCounter = 1;
    rect.imageCounter = 1;
    rect.nameCounter = 1;
    rect.priceCounter = 1;

    rect.linkedText = [];

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

      rect.linkedText.forEach((textBox) => {
        textBox.left += rect.left - rect.prevLeft; // Move text by the same distance as the rectangle
        textBox.top += rect.top - rect.prevTop;
        textBox.setCoords();
      });

      // Store the current position for the next move
      rect.prevLeft = rect.left;
      rect.prevTop = rect.top;

      editor.canvas.renderAll();

      // Move the group (rectangle + text) together
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
      setOpacity(rect.opacity);
      setBackgroundColor(rect.fill);

      setHeight((scaledHeight * scaleX).toFixed(1));
      setWidth((scaledWidth * scaleY).toFixed(1));
      setPositionX((rect.left * scaleX).toFixed(1));
      setPositionY((rect.top * scaleY).toFixed(1));
      // let object = event.target;
      // editor.canvas.sendToBack(rect);
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

  // const addBackgroundImage = (file) => {
  //   const reader = new FileReader();
  //   const userId = user_id;
  //   const formData = new FormData();
  //   const preset_key = 'xdm798lx';
  //   const folder = `users/${userId}`;
  //   const tags = `${userId}`;

  //   const objects = editor.canvas.getObjects();
  //   const backgroundImage = objects.find((obj) => obj.isBackground);

  //   if (backgroundImage) {
  //     editor.canvas.remove(backgroundImage);
  //     const layerItemId = backgroundImage.layerItemId;
  //     console.log('Layer item id: ', layerItemId);
  //     updateLayerItem(layerItemId, 0)
  //     console.log('Previous background image removed.');
  //   }

  //   reader.onload = (e) => {
  //     fabric.Image.fromURL(e.target.result, async (img) => {
  //       // removeBackgroundImage();

  //       // Scale the image to fit the canvas dimensions
  //       img.scaleX = editor.canvas.width / img.width;
  //       img.scaleY = editor.canvas.height / img.height;
  //       // editor.canvas.setBackgroundImage(img);
  //       // editor.canvas.requestRenderAll();
  //       // Set the image properties
  //       img.set({
  //         selectable: true, // Make it selectable
  //         hasControls: true, // Disable controls if you don't want to resize it
  //         evented: true, // Allow interaction
  //         lockMovementX: true, // Lock horizontal movement
  //         lockMovementY: true, // Lock vertical movement
  //         lockScalingX: true, // Lock scaling horizontally
  //         lockScalingY: true, // Lock scaling vertically
  //         lockRotation: true, // Lock rotation
  //         hasBorders: true,
  //         isBackground: true // Hide borders
  //       });

  //       img.layerType = 0;

  //       //Add the image to the canvas
  //       editor.canvas.add(img);

  //       // Ensure the background image is always at the lowest z-index
  //       editor.canvas.sendToBack(img);

  //       // img.on('selected', () => {
  //       //   console.log('Background image selected');
  //       //   console.log('Properties of background image:', img);

  //       //   // Example: log specific properties
  //       //   console.log('Width:', img.width);
  //       //   console.log('Height:', img.height);
  //       //   console.log('ScaleX:', img.scaleX);
  //       //   console.log('ScaleY:', img.scaleY);
  //       // });

  //       // img.on('object:selected', () => {
  //       //   console.log('click to background image');

  //       //   editor.canvas.sendToBack(img); // Send back on selection
  //       // });
  //       // Render the canvas
  //       editor.canvas.renderAll();

  //       // const objects = editor.canvas.getObjects();

  //       // objects.map((obj) => {
  //       //   if (obj instanceof fabric.Image && obj.layerType === 0) {
  //       //     console.log('has image');
  //       //   }
  //       // });

  //       //console.log('objects: ', objects);

  //       formData.append('file', file);
  //       formData.append('upload_preset', preset_key);
  //       formData.append('tags', tags);
  //       formData.append('folder', folder);

  //       try {
  //         const response = await fetch('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', {
  //           method: 'POST',
  //           body: formData
  //         });

  //         const result = await response.json();
  //         const layerItemValue = result.secure_url;

  //         const { layerId, zIndex } = await createLayer(templateId, 0);
  //         const layerItemId = await createLayerItem(layerId, layerItemValue);

  //         img.layerId = layerId;
  //         img.layerItemId = layerItemId;

  //         console.log('layerId: ', layerId);
  //         console.log('layerItemId: ', layerItemId);
  //       } catch (error) {
  //         console.error('Error uploading backgroundimage:', error);
  //       }
  //     });
  //   };

  //   reader.readAsDataURL(file);
  // };

  const addBackgroundImage = (file) => {
    const reader = new FileReader();
    const userId = user_id;
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;

    const objects = editor.canvas.getObjects();
    const backgroundImage = objects.find((obj) => obj.isBackground);

    // Function to set image properties and add to canvas
    const setImageProperties = (img) => {
      img.scaleX = editor.canvas.width / img.width;
      img.scaleY = editor.canvas.height / img.height;

      img.set({
        selectable: true,
        hasControls: true,
        evented: true,
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        hasBorders: true,
        isBackground: true // Mark it as background
      });

      img.layerType = 0;
      editor.canvas.add(img);
      editor.canvas.sendToBack(img); // Ensure it is at the back
      editor.canvas.renderAll();
    };

    // Function to upload image to Cloudinary
    const uploadImageToCloudinary = async (file) => {
      formData.append('file', file);
      formData.append('upload_preset', preset_key);
      formData.append('tags', tags);
      formData.append('folder', folder);

      const response = await fetch('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', {
        method: 'POST',
        body: formData
      });
      return await response.json();
    };

    reader.onload = (e) => {
      // Immediately add image to canvas without waiting for upload
      fabric.Image.fromURL(e.target.result, (img) => {
        // Add image to canvas immediately
        if (backgroundImage) {
          // Remove the existing background image from the canvas
          editor.canvas.remove(backgroundImage);
        }
        setImageProperties(img);

        // Start the upload process but do not wait for it to complete
        uploadImageToCloudinary(file)
          .then(async (result) => {
            const layerItemValue = result.secure_url;

            if (backgroundImage) {
              const existingLayerItemId = backgroundImage.layerItemId;

              // Update the existing layerItemId with new background image URL
              await updateLayerItem(existingLayerItemId, 0, layerItemValue);
              console.log('Background image updated with new URL.');

              // Assign the updated layerItemId to the new image
              img.layerItemId = existingLayerItemId;
            } else {
              const { layerId } = await createLayer(templateId, 0); // Create a new layer
              const layerItemId = await createLayerItem(layerId, layerItemValue); // Create a new layer item

              console.log('New background image uploaded and created.');
              console.log('layerId: ', layerId);
              console.log('layerItemId: ', layerItemId);

              // Set the IDs for future reference
              img.layerId = layerId;
              img.layerItemId = layerItemId;
            }
          })
          .catch((error) => {
            console.error('Error uploading image: ', error);
          });
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

  // const clickToImage = async (photo) => {
  //   try {
  //     const public_id = photo.public_id;
  //     const result = await createLayer(templateId, 1);
  //     const layerItemValue = `https://res.cloudinary.com/dchov8fes/image/upload/v1722891805/${public_id}`;

  //     // Add image to fabric and get the image object
  //     await addImageToFabric(layerItemValue, result.layerId);
  //   } catch (error) {
  //     console.error('Error in clickToImage:', error);
  //   }
  // };

  // const addImageToFabric = async (url, layerId) => {
  //   fabric.Image.fromURL(url, async (img) => {
  //     try {
  //       let myImg = img.set({
  //         left: 100, // You can adjust these values or make them dynamic
  //         top: 100,
  //         angle: 0,
  //         scaleX: 0.5, // Adjust scaling if needed
  //         scaleY: 0.5,
  //         selectable: true // Ensure the image is selectable
  //       });

  //       // Add the image to the canvas
  //       editor.canvas.add(myImg);

  //       // Calculate actual width, height, and position after scaling
  //       let width = myImg.getScaledWidth();
  //       let height = myImg.getScaledHeight();
  //       let positionX = myImg.left;
  //       let positionY = myImg.top;

  //       // Create box and box item
  //       const layerItemId = await createLayerItem(layerId, url);
  //       const boxId = await createBox(layerId, positionX, positionY, width, height, 0);
  //       const { boxItemId, bFontId } = await createBoxItem(
  //         boxId,
  //         5,
  //         positionX,
  //         positionY,
  //         width,
  //         height,
  //         7,
  //         JSON.stringify({ transparency: 100 })
  //       );

  //       // Attach box and boxItem information to the Fabric.js image object
  //       myImg.boxId = boxId;
  //       myImg.boxItemId = boxItemId;
  //       myImg.layerItemId = layerItemId;

  //       console.log('boxItemId:', boxItemId);
  //       console.log('boxId:', boxId);

  //       // Optionally, refresh the UI if needed after adding the image
  //       editor.canvas.renderAll();
  //     } catch (error) {
  //       console.error('Error adding image to fabric:', error);
  //     }
  //   });
  // };

  const updateTemplateImg = (templateId, data) => {
    try {
      axios.put(`https://ec2-3-1-81-96.ap-southeast-1.compute.amazonaws.com/api/Templates/${templateId}/image?TemplateImgPath=${data}`);
    } catch (error) {
      console.log('Failed to upload template image: ' + JSON.stringify(error));
    }
  };

  const clickToImage = async (photo) => {
    try {
      const public_id = photo.public_id;
      const layerItemValue = `https://res.cloudinary.com/dchov8fes/image/upload/v1722891805/${public_id}`;

      // Add the image to Fabric.js first
      fabric.Image.fromURL(layerItemValue, async (img) => {
        try {
          // Set properties for the Fabric.js image object
          let myImg = img.set({
            left: 100, // Adjust as necessary
            top: 100, // Adjust as necessary
            angle: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            selectable: true // Ensure the image is selectable
          });

          // Add image to the canvas
          editor.canvas.add(myImg);
          editor.canvas.renderAll();

          // Calculate width, height, and position
          let width = myImg.getScaledWidth();
          let height = myImg.getScaledHeight();
          let positionX = myImg.left;
          let positionY = myImg.top;

          // API Calls after the image is added to Fabric.js
          const result = await createLayer(templateId, 1); // Call API to create a layer
          const layerItemId = await createLayerItem(result.layerId, layerItemValue); // Create layer item

          // Create box and box item
          const boxId = await createBox(result.layerId, positionX, positionY, width, height, 0);
          const { boxItemId, bFontId } = await createBoxItem(
            boxId,
            5,
            positionX,
            positionY,
            width,
            height,
            7,
            JSON.stringify({ transparency: 100 })
          );

          // Attach box, boxItem, and layerItem info to the image object
          myImg.boxId = boxId;
          myImg.boxItemId = boxItemId;
          myImg.layerItemId = layerItemId;
          myImg.layerId = result.layerId;

          console.log('boxItemId:', boxItemId);
          console.log('boxId:', boxId);
          console.log('layerItemId:', layerItemId);
        } catch (error) {
          console.error('Error during image addition or API calls:', error);
        }
      });
    } catch (error) {
      console.error('Error in clickToImage:', error);
    }
  };

  const clickToBackgroundImage = async (photo) => {
    try {
      const public_id = photo.public_id;
      const layerItemValue = `https://res.cloudinary.com/dchov8fes/image/upload/v1722891805/${public_id}`;

      // Add the image to Fabric.js first
      fabric.Image.fromURL(layerItemValue, async (img) => {
        try {
          img.scaleX = editor.canvas.width / img.width;
          img.scaleY = editor.canvas.height / img.height;
          // Set properties for the Fabric.js image object
          let myImg = img.set({
            selectable: true,
            hasControls: true,
            evented: true,
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            hasBorders: true,
            isBackground: true
          });

          // Add image to the canvas
          editor.canvas.add(myImg);
          editor.canvas.sendToBack(img);
          editor.canvas.renderAll();

          // Calculate width, height, and position
          let width = myImg.getScaledWidth();
          let height = myImg.getScaledHeight();
          let positionX = myImg.left;
          let positionY = myImg.top;

          // API Calls after the image is added to Fabric.js
          const result = await createLayer(templateId, 0); // Call API to create a layer
          const layerItemId = await createLayerItem(result.layerId, layerItemValue); // Create layer item

          // Create box and box item
          const boxId = await createBox(result.layerId, positionX, positionY, width, height, 0);
          const { boxItemId, bFontId } = await createBoxItem(
            boxId,
            5,
            positionX,
            positionY,
            width,
            height,
            7,
            JSON.stringify({ transparency: 100 })
          );

          // Attach box, boxItem, and layerItem info to the image object
          myImg.boxId = boxId;
          myImg.boxItemId = boxItemId;
          myImg.layerItemId = layerItemId;
          myImg.layerId = result.layerId;

          console.log('boxItemId:', boxItemId);
          console.log('boxId:', boxId);
          console.log('layerItemId:', layerItemId);
        } catch (error) {
          console.error('Error during image addition or API calls:', error);
        }
      });
    } catch (error) {
      console.error('Error in clickToImage:', error);
    }
  };

  // const takeScreenShot = () => {
  //   const preset_key = 'xdm798lx';
  //   const formData = new FormData();

  //   html2canvas(document.querySelector('.sample-canvas'), {
  //     allowTaint: true,
  //     useCORS: true
  //   }).then(async (canvas) => {
  //     const base64 = canvas.toDataURL('image/png');
  //     // console.log('URL: ', base64);
  //     // const screenShot = base64Decoder(base64);
  //     // console.log('Screen Shot: ', screenShot);
  //     formData.append('file', base64);
  //     formData.append('upload_preset', preset_key);
  //     // console.log('Result ', canvas.toDataURL('image/png'));
  //     try {
  //       await axios
  //         .post(`https://api.cloudinary.com/v1_1/dchov8fes/image/upload`, formData)
  //         .then(async (result) => {
  //           const templateImg = result.data.url;
  //           updateTemplateImg(templateId, templateImg);
  //           // console.log('Response from cloudinary: ' + JSON.stringify(result.data.url));
  //         })
  //         .catch((error) => {
  //           console.log('Failed to upload to cloundinary: ' + error);
  //         });
  //     } catch (error) {
  //       console.log('Failed to upload to cloundinary: ' + error.toString());
  //     }
  //   });
  // };

  const takeScreenShot = () => {
    const preset_key = 'xdm798lx';
    const formData = new FormData();

    html2canvas(document.querySelector('.sample-canvas'), {
      allowTaint: true,
      useCORS: true
    }).then(async (canvas) => {
      const base64 = canvas.toDataURL('image/png');

      // Converting base64 to Blob (Cloudinary requires file input as Blob, not base64 string)
      const blob = await (await fetch(base64)).blob();

      formData.append('file', blob);
      formData.append('upload_preset', preset_key);

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/dchov8fes/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Failed to upload to Cloudinary: ${response.statusText}`);
        }

        const result = await response.json();
        const templateImg = result.url;
        updateTemplateImg(templateId, templateImg);

        console.log('Response from Cloudinary: ', result.url);
      } catch (error) {
        console.log('Failed to upload to Cloudinary: ', error);
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
              obj.bFontId ? obj.bFontId : 5,
              obj.left * scaleX,
              obj.top * scaleY,
              obj.getScaledWidth() * scaleX,
              obj.getScaledHeight() * scaleY,
              obj.boxItemType,
              JSON.stringify({
                textColor: obj.fill,
                bFontId: obj.bFontId ? obj.bFontId : 5,
                // fontSize: getFontSizeV2(obj),
                fontSize: Number(((obj.fontSize * obj.scaleX) / 1.333).toFixed(1)),
                fontStyle:
                  obj.fontStyle && obj.fontStyle !== 'normal'
                    ? getFontStyleValue(obj.fontStyle)
                    : obj.fontWeight === 'bold' || obj.fontWeight === 'italic'
                      ? getFontStyleValue(obj.fontWeight)
                      : 0,

                alignment: getAlignmentValue(obj.textAlign),
                transparency: obj.opacity * 100,
                uppercase: false,
                rotation: convertAngleToDegree(obj.angle)
              })
            );

            updateLayer(obj.layerId, obj.zIndex);
          } else if (obj.boxItemId) {
            updateBoxItem(
              obj.boxItemId,
              obj.bFontId ? obj.bFontId : 5,
              obj.left * scaleX,
              obj.top * scaleY,
              obj.getScaledWidth() * scaleX,
              obj.getScaledHeight() * scaleY,
              obj.boxItemType,
              JSON.stringify({
                textColor: obj.fill,
                bFontId: obj.bFontId ? obj.bFontId : 5,
                fontSize: Number(((obj.fontSize * obj.scaleX) / 1.333).toFixed(1)),
                fontStyle: getFontStyleValue(obj.fontStyle),
                alignment: getAlignmentValue(obj.textAlign),
                transparency: obj.opacity * 100,
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
                transparency: obj.opacity * 100
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
    let textBox = new fabric.Textbox(`D ${selectedRect.productCounter}`, {
      left: selectedRect.left + 10,
      top: selectedRect.top + 10,
      // fontSize: fontSize,
      fontSize: 15,
      backgroundColor: getRandomColor(),
      borderColor: 'dark',
      width: 50,
      // width: 100,
      // height: 100,
      fill: '#FFFFFF',
      // fontFamily: 'Arial',
      // fontStyle: 'normal',
      // textAlign: 'left',
      opacity: 100,
      productCounter: 1,
      editable: false,
      bFontId: 14
      // selectionBackgroundColor: 'black'
    });

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      // mb: false, // midle bottom
      ml: false // middle left
      // mr: false // middle right
    });

    editor.canvas.add(textBox);

    selectedRect.linkedText.push(textBox);

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

      const newFontSize = (textBox.fontSize * textBox.scaleX).toFixed(1); // Using scaleX for proportional scaling

      // Set the new font size in the UI, adjusting for the factor
      setFontSize((newFontSize / 1.333).toFixed(1)); // Convert back t

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

      textBox.setCoords();
      editor.canvas.renderAll();
    });

    textBox.on('mouseup', function () {
      const fontName = findFontNameById(textBox.bFontId);

      setSelectedFont(fontName);

      const isBold = textBox.fontWeight === 'bold' ? true : false;
      const isItalic = textBox.fontStyle === 'italic' ? true : false;
      const textAlign = textBox.textAlign;

      setTextAlign(textAlign);

      setIsBold(isBold);
      setIsItalic(isItalic);

      let adjustedAngle = textBox.angle;
      if (adjustedAngle > 180) {
        adjustedAngle -= 360;
      } else if (adjustedAngle < -180) {
        adjustedAngle += 360;
      }
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      const scaledWidth = textBox.getScaledWidth();
      const scaledHeight = textBox.getScaledHeight();

      const adjustedWidth = textBox.width * textBox.scaleX; // Scale back width
      const adjustedHeight = textBox.height * textBox.scaleY;

      setWidth(adjustedWidth.toFixed(1));
      setHeight(adjustedHeight.toFixed(1));

      // setHeight((scaledHeight * scaleX).toFixed(1));
      // setWidth((scaledWidth * scaleY).toFixed(1));
      setPositionX((textBox.left * scaleX).toFixed(1));
      setPositionY((textBox.top * scaleY).toFixed(1));
      //setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      let canvasFontSize = (textBox.fontSize * textBox.scaleX).toFixed(1);
      setFontSize((canvasFontSize / 1.333).toFixed(1));
      setColor(textBox.fill);
      setRotationAngle(adjustedAngle);

      setActiveTab('positionSize');
      //setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setIsHeaderVisible(true);
      setSelectedTool('textBox');
      console.log('selectedRect: ', selectedRect);
      console.log('click to product desc');
    });

    textBox.rectId = selectedRect.id;

    selectedRect.productCounter += 1;

    setDescriptionCounter((prevCounter) => prevCounter + 1);

    let height = textBox.height;
    let width = textBox.width;

    let style = {
      // textColor: textBox.fill,
      textColor: '#ffffff',
      bFontId: 5,
      fontSize: textBox.fontSize,
      // fontStyle: getFontStyleValue(textBox.fontStyle),
      // alignment: getAlignmentValue(textBox.textAlign),
      transparency: textBox.opacity,
      uppercase: true
    };

    if (boxId) {
      const { boxItemId, bFontId } = await createBoxItem(
        boxId,
        5,
        textBox.left,
        textBox.top,
        textBox.width,
        textBox.height,
        3,
        JSON.stringify(style)
      );

      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 3;
      // textBox.bFontId = bFontId;
      console.log('boxItemId: ', boxItemId);
    }

    // setTimeout(async () => {
    //   const { boxItemId, bFontId } = await createBoxItem(
    //     boxId,
    //     5,
    //     textBox.left,
    //     textBox.top,
    //     textBox.width,
    //     textBox.height,
    //     3,
    //     JSON.stringify(style)
    //   );

    //   // Assign the returned values to the textBox properties after the delay
    //   textBox.boxItemId = boxItemId;
    //   textBox.boxItemType = 3;
    //   // textBox.bFontId = bFontId; // Uncomment if you need to set this

    //   console.log('boxItemId: ', boxItemId);
    // }, 5000); // Delay of 5000 milliseconds (5 seconds)

    textBox.on('modified', function () {
      // console.log('fontId: ', textBox.bFontId);
      // console.log('color: ', textBox.fill);
    });

    textBox.on('scaling', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      const scaledWidth = textBox.getScaledWidth();
      const scaledHeight = textBox.getScaledHeight();

      const newWidth = textBox.width * textBox.scaleX;
      const newHeight = textBox.height * textBox.scaleY;

      let newFontSize = (textBox.fontSize * textBox.scaleX).toFixed(1); // Using scaleX for proportional scaling

      setFontSize((newFontSize / 1.333).toFixed(1));

      setPositionX((textBox.left * scaleX).toFixed(1));
      setPositionY((textBox.top * scaleY).toFixed(1));

      setHeight(newHeight.toFixed(1));
      setWidth(newWidth.toFixed(1));
      setActiveTab('positionSize');
      setSelectedTool('textBox');
    });

    textBox.on('moving', function () {
      setHeight(textBox.height.toFixed(1));
      setWidth(textBox.width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      // console.log('Move');

      // setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setActiveTab('positionSize');
      setSelectedTool('textBox');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });
  };

  const addProductName = async () => {
    const textBox = new fabric.Textbox(`N ${selectedRect.nameCounter} `, {
      left: selectedRect.left + 15,
      top: selectedRect.top + 15,
      fontSize: 20,
      fill: '#FFFFFF',
      editable: false,
      width: 50,
      bFontId: 14,
      backgroundColor: getRandomColor()
    });

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      // mb: false, // midle bottom
      ml: false // middle left
      // mr: false // middle right
    });

    editor.canvas.add(textBox);

    selectedRect.linkedText.push(textBox);

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

      textBox.setCoords();
      editor.canvas.renderAll();
    });

    textBox.on('mouseup', function () {
      const fontName = findFontNameById(textBox.bFontId);

      setSelectedFont(fontName);

      const isBold = textBox.fontWeight === 'bold' ? true : false;
      const isItalic = textBox.fontStyle === 'italic' ? true : false;
      const textAlign = textBox.textAlign;

      setTextAlign(textAlign);

      setIsBold(isBold);
      setIsItalic(isItalic);

      let adjustedAngle = textBox.angle;
      if (adjustedAngle > 180) {
        adjustedAngle -= 360;
      } else if (adjustedAngle < -180) {
        adjustedAngle += 360;
      }

      setRotationAngle(adjustedAngle);
      setColor(textBox.fill);

      const adjustedWidth = textBox.width * textBox.scaleX; // Scale back width
      const adjustedHeight = textBox.height * textBox.scaleY;

      setWidth(adjustedWidth.toFixed(1));
      setHeight(adjustedHeight.toFixed(1));
      // setHeight(height.toFixed(1));
      // setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize(convertFabricFontSizeToCanvasFontSize(textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setActiveTab('positionSize');
      setSelectedTool('text');
    });

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

    setNameCounter((prevCounter) => prevCounter + 1);

    selectedRect.nameCounter += 1;

    if (boxId) {
      const { boxItemId, bFontId } = await createBoxItem(
        boxId,
        5,
        textBox.left,
        textBox.top,
        textBox.width,
        textBox.height,
        2,
        JSON.stringify(style)
      );
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 2;
      textBox.bFontId = bFontId;
      console.log('boxItemId: ', boxItemId);
    }
    let height = textBox.height;
    let width = textBox.width;

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
      console.log('fontId: ', textBox.bFontId);
    });
  };

  const addProductPrice = async () => {
    const textBox = new fabric.Textbox(`P ${selectedRect.priceCounter} `, {
      left: selectedRect.left + 20,
      top: selectedRect.top + 20,
      fontSize: 20,
      fill: '#FFFFFF',
      borderColor: 'dark',
      width: 50,
      // height: 200,
      backgroundColor: getRandomColor(),
      editable: false,
      bFontId: 14
      // selectionBackgroundColor: 'black'
    });

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      mb: false, // midle bottom
      ml: false, // middle left
      mr: true // middle right
    });

    editor.canvas.add(textBox);

    selectedRect.linkedText.push(textBox);

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

      textBox.setCoords();
      editor.canvas.renderAll();
    });

    textBox.on('mouseup', function () {
      const fontName = findFontNameById(textBox.bFontId);

      setSelectedFont(fontName);
      const isBold = textBox.fontWeight === 'bold' ? true : false;
      const isItalic = textBox.fontStyle === 'italic' ? true : false;
      const textAlign = textBox.textAlign;

      setTextAlign(textAlign);

      setIsBold(isBold);
      setIsItalic(isItalic);

      let adjustedAngle = textBox.angle;
      if (adjustedAngle > 180) {
        adjustedAngle -= 360;
      } else if (adjustedAngle < -180) {
        adjustedAngle += 360;
      }

      setRotationAngle(adjustedAngle);
      setColor(textBox.fill);

      const adjustedWidth = textBox.width * textBox.scaleX; // Scale back width
      const adjustedHeight = textBox.height * textBox.scaleY;

      setWidth(adjustedWidth.toFixed(1));
      setHeight(adjustedHeight.toFixed(1));
      // setHeight(height.toFixed(1));
      // setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize(convertFabricFontSizeToCanvasFontSize(textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setActiveTab('positionSize');
      setSelectedTool('text');
    });

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
      const { boxItemId, bFontId } = await createBoxItem(
        boxId,
        5,
        textBox.left,
        textBox.top,
        textBox.width,
        textBox.height,
        4,
        JSON.stringify(style)
      );
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 4;
      textBox.bFontId = bFontId;
      console.log('boxItemId: ', boxItemId);
    }

    let height = textBox.height;
    let width = textBox.width;

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });

    textBox.on('modified', function () {});

    setPriceCounter((prevCounter) => prevCounter + 1);

    selectedRect.priceCounter += 1;

    textBox.on('modified', function () {
      // updateBoxItem(textBox.boxItemId, rect.left, rect.top, width, height, priceCounter + 1, JSON.stringify(style));
    });
  };

  const addProductImage = async () => {
    const textBox = new fabric.Textbox(`I ${selectedRect.imageCounter} `, {
      left: selectedRect.left + 25,
      top: selectedRect.top + 25,
      fontSize: 20,
      fill: '#FFFFFF',
      borderColor: 'dark',
      width: 50,
      //height: 200,
      backgroundColor: getRandomColor(),
      editable: false

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

    selectedRect.linkedText.push(textBox);

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

      textBox.setCoords();
      editor.canvas.renderAll();
    });

    textBox.on('mouseup', function () {
      let adjustedAngle = textBox.angle;
      if (adjustedAngle > 180) {
        adjustedAngle -= 360;
      } else if (adjustedAngle < -180) {
        adjustedAngle += 360;
      }

      setRotationAngle(adjustedAngle);

      const adjustedWidth = textBox.width * textBox.scaleX; // Scale back width
      const adjustedHeight = textBox.height * textBox.scaleY;

      setWidth(adjustedWidth.toFixed(1));
      setHeight(adjustedHeight.toFixed(1));
      // setHeight(height.toFixed(1));
      // setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize(convertFabricFontSizeToCanvasFontSize(textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setSelectedTool('rect');
      setActiveTab('positionSize');
    });

    let height = textBox.height;
    let width = textBox.width;

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
      const { boxItemId, bFontId } = await createBoxItem(
        boxId,
        5,
        textBox.left,
        textBox.top,
        textBox.width,
        textBox.height,
        5,
        JSON.stringify(style)
      );
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 5;
      textBox.bFontId = bFontId;
      console.log('boxItemId: ', boxItemId);
    }

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
  };

  const addProductIcon = async () => {
    const textBox = new fabric.Text(`Product Icon ${iconCounter} `, {
      left: 100,
      top: 150,
      fontSize: 20,
      fill: '#FFFFFF',
      borderColor: 'dark',
      width: 150,
      height: 100,
      backgroundColor: getRandomColor(),
      editable: false
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
      const { boxItemId, bFontId } = await createBoxItem(
        boxId,
        5,
        textBox.left,
        textBox.top,
        textBox.width,
        textBox.height,
        6,
        JSON.stringify(style)
      );
      textBox.boxItemId = boxItemId;
      textBox.boxItemType = 6;
      textBox.bFontId = bFontId;
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
    const textBox = new fabric.Textbox('Header', {
      left: selectedRect.left + 15,
      top: selectedRect.top + 15,
      fontSize: 20,
      fill: '#FFFFFF',
      fontFamily: 'times new roman',
      fontStyle: 'normal', // fontStyle: 'normal', 'italic', or 'bold'
      textAlign: 'center',
      opacity: 1.0,
      borderColor: 'dark',
      width: 100,
      //height: 200,
      backgroundColor: getRandomColor(),
      editable: false,
      bFontId: 14
      // selectionBackgroundColor: 'black'
    });

    textBox.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      mb: false, // midle bottom
      ml: false, // middle left
      mr: true // middle right
    });

    editor.canvas.add(textBox);

    selectedRect.linkedText.push(textBox);

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

      textBox.setCoords();
      editor.canvas.renderAll();
    });

    textBox.on('mouseup', function () {
      const fontName = findFontNameById(textBox.bFontId);

      setSelectedFont(fontName);

      const isBold = textBox.fontWeight === 'bold' ? true : false;
      const isItalic = textBox.fontStyle === 'italic' ? true : false;
      const textAlign = textBox.textAlign;

      setTextAlign(textAlign);

      setIsBold(isBold);
      setIsItalic(isItalic);

      let adjustedAngle = textBox.angle;
      if (adjustedAngle > 180) {
        adjustedAngle -= 360;
      } else if (adjustedAngle < -180) {
        adjustedAngle += 360;
      }

      setColor(textBox.fill);
      setRotationAngle(adjustedAngle);

      const adjustedWidth = textBox.width * textBox.scaleX; // Scale back width
      const adjustedHeight = textBox.height * textBox.scaleY;

      setWidth(adjustedWidth.toFixed(1));
      setHeight(adjustedHeight.toFixed(1));
      // setHeight(height.toFixed(1));
      // setWidth(width.toFixed(1));
      setPositionX(textBox.left.toFixed(1));
      setPositionY(textBox.top.toFixed(1));
      setFontSize(convertFabricFontSizeToCanvasFontSize(textBox.fontSize * textBox.scaleX).toFixed(1));
      setIsHeaderVisible(true);
      setActiveTab('positionSize');
      setSelectedTool('text');
    });

    textBox.on('mouseup', function () {
      toggleHeaderVisibility();
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
      }
    });

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

    if (selectedRect.boxId) {
      const { boxItemId, bFontId } = await createBoxItem(
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
      textBox.bFontId = bFontId;
      console.log('boxItemId: ', boxItemId);
    }

    let height = textBox.height;
    let width = textBox.width;

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== textBox) {
        setIsHeaderVisible(false);
        setSelectedTool(null);
      }
    });

    textBox.on('modified', function () {
      // updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
    });

    setHeaderCounter((prevCounter) => prevCounter + 1);
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

  const generateFontFaceRule = (fonts) => {
    return fonts
      .map(
        (font) => `
      @font-face {
        font-family: '${font.fontName}';
        src: url('${font.fontPath}');
        font-display: swap;
      }
    `
      )
      .join('');
  };

  useEffect(() => {
    getAllFont();
  }, []);

  useEffect(() => {
    // Apply dynamic font-face rules when fonts are updated
    if (fonts.length > 0) {
      const fontFaceRule = generateFontFaceRule(fonts);
      const styleElement = document.createElement('style');
      document.head.appendChild(styleElement);
      styleElement.textContent = fontFaceRule;

      // Cleanup style element on component unmount
      return () => {
        document.head.removeChild(styleElement);
      };
    }
  }, [fonts]);

  // Load the font dynamically and apply it to the canvas
  const loadAndUseFont = (fontName) => {
    const myFont = new FontFaceObserver(fontName);

    return myFont
      .load()
      .then(() => {
        console.log(`Font loaded successfully: ${fontName}`);
      })
      .catch((e) => {
        console.error(`Font loading failed: ${fontName}`, e);
        alert(`Font loading failed: ${fontName}. Please check the font URL or try again later.`);
      });
  };

  // Handle font change and ensure the font is loaded before applying
  const handleFontChange = async (event) => {
    const selectedFont = event.target.value;
    setSelectedFont(selectedFont);

    const selectedFontData = fonts.find((font) => font.fontName === selectedFont);
    const bFontId = selectedFontData ? selectedFontData.fontId : null;

    console.log('Selected Font:', selectedFont);
    console.log('Selected Font bFontId:', bFontId);

    const activeObject = editor.canvas.getActiveObject();

    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'text')) {
      // First, load the font and wait for it to finish loading
      await loadAndUseFont(selectedFont);

      // Then apply the font to the active object after it has loaded
      activeObject.set({
        fontFamily: selectedFont,
        bFontId: bFontId
      });

      activeObject.fire('modified');
      editor.canvas.requestRenderAll();
    }
  };

  const handlePopState = (event) => {
    const confirmed = window.confirm('Are you sure you want to leave? Any unsaved changes will be lost.');
    if (!confirmed) {
      // Prevents the user from going back
      navigate(currentPath, { replace: true });
    }
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      getAllCanvasProperties();
      setLoading(false);
      Toastify({
        text: 'Save successfully',
        className: 'info',
        gravity: 'top',
        position: 'right',

        duration: 2000,
        style: {
          background: '#4caf50'
        }
      }).showToast();
    }, 3000); // Delay for 3 seconds
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? Any unsaved changes will be lost.';
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, currentPath]);

  return (
    <div className="app">
      <header className="header">
        <div className="left-section">
          <img
            src="https://app-registry-assets.staging.screencloudapp.com/icons/canvas-icon-2.png"
            alt="Icon"
            style={{ width: '40px', height: '40px', marginRight: '10px' }}
          />
          <h2 style={{ margin: '0' }}>SMARTMENU</h2>
        </div>
        <div className="actions">
          {(selectedTool == 'text' || selectedTool == 'textBox') && (
            <div className="text-options">
              {/* <select id="font-family"></select> */}

              {/* <select value={selectedFont} onChange={handleFontChange}>
            {fonts.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select> */}

              <select value={selectedFont} onChange={handleFontChange}>
                {fonts.map((font) => (
                  <option key={font.fontId} value={font.fontName}>
                    {font.fontName}
                  </option>
                ))}
              </select>

              <input
                type="number"
                id="font-size"
                value={fontSize}
                onKeyDown={handleKeyDown}
                onChange={changeFontSize}
                min="1" // Set minimum value if needed
                max="150" // Set maximum value if needed
              />
              <input type="color" id="font-color" onChange={(e) => changeColor(e)} value={color} />
              <button
                onClick={toggleBold}
                style={{
                  color: isBold ? 'white' : 'black',
                  backgroundColor: isBold ? 'black' : 'white', // Change background when bold is active
                  fontWeight: isBold ? 'bold' : 'normal' // Optionally bolden the button text too
                }}
              >
                B
              </button>
              {/* <button
                onClick={toggleItalic}
                style={{
                  color: isItalic ? 'white' : 'black',
                  backgroundColor: isItalic ? 'black' : 'white', // Change background when bold is active
                  fontWeight: isItalic ? 'bold' : 'normal' // Optionally bolden the button text too
                }}
              >
                I
              </button> */}

              <button
                onClick={toggleItalic}
                style={{
                  color: isItalic ? 'white' : 'black',
                  backgroundColor: isItalic ? 'black' : 'white', // Change background when bold is active
                  fontWeight: isItalic ? 'bold' : 'normal' // Optionally bolden the button text too
                }}
              >
                I
              </button>
              <button onClick={cycleTextAlign} className="align-button">
                {getTextAlignIcon()}
              </button>
            </div>
          )}

          {selectedTool == 'rect' && (
            <div className="background-options">
              <label htmlFor="font-color">Background Color:</label>
              <input type="color" id="font-color" onChange={(e) => changeBackgroundColor(e)} value={backgroundColor} />
              {/* <Button onClick={() => handleTabClick('positionSize')} style={{ color: 'white' }}>
        Position & Size
      </Button> */}

              {/* <button onClick={toggleTextCase} className="case-button">
            Toggle Case
          </button> */}
            </div>
          )}

          {(selectedTool == 'rect' || selectedTool == 'textBox' || selectedTool == 'image') && (
            <input type="range" id="opacity" value={opacity} onChange={(e) => changeOpacity(e)} min="0" max="1" step="0.01" />
          )}
          {/* <div className="divider"></div> */}
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>

          {/* <div className="profile">User</div> */}
        </div>
      </header>
      {loading && (
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      )}

      <div className="main">
        <div className="sidebar-container">
          <div className="sidebar">
            <Button onClick={() => handleTabClick('text')} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
              <img src={text} alt="Icon" style={{ width: '30px', height: '30px' }} />
              Text
            </Button>
            <Button onClick={() => handleTabClick('background')} style={{ color: 'white' }}>
              <img src={background} alt="Icon" style={{ width: '30px', height: '30px' }} />
              Background
            </Button>
            <Button onClick={() => handleTabClick('images')} style={{ color: 'white' }}>
              <img src={images} alt="Icon" style={{ width: '30px', height: '30px' }} />
              Image
            </Button>
            <Button onClick={() => handleTabClick('renderLayer')} style={{ color: 'white' }}>
              <img src={uploadCloud} alt="Icon" style={{ width: '30px', height: '30px' }} />
              Render Layer
            </Button>
            {/* <Button onClick={() => handleTabClick('menuCollection')} startIcon={<CloudUploadIcon />} style={{ color: 'white' }}>
            Menu Collection
          </Button> */}
          </div>

          <div className={`tab-container ${activeTab ? 'open' : ''}`}>
            {activeTab === 'positionSize' && (
              <div className="tab">
                <h4>Custom</h4>
                <div className="subtabs">
                  <Button onClick={() => handleSubtabClick('position')}>Position</Button>
                  {selectedTool === 'rect' && <div className="subtab-separator"></div>}
                  {selectedTool === 'rect' && <Button onClick={() => handleSubtabClick('product')}>Product</Button>}
                </div>
                {/* {activeSubtab === 'position' && ( */}
                <div className="subtab-content">
                  {/* {selectedTool == 'rect' && (
                    <> */}
                  <h5 style={{ color: 'white', textAlign: 'left', fontSize: '16px', marginBottom: '10px' }}>Position</h5>
                  <div className="position-options">
                    <div className="dimension-options">
                      <label htmlFor="width" style={{ marginBottom: '5px', color: 'white' }}>
                        Width:
                      </label>
                      <input
                        type="number"
                        id="width"
                        value={width}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => handleDimensionChange(e, 'width')}
                      />
                    </div>
                    <div className="subtab-separator"></div>
                    <div className="dimension-options">
                      <label htmlFor="height" style={{ marginBottom: '5px', color: 'white' }}>
                        Height:
                      </label>
                      <input
                        type="number"
                        id="height"
                        value={height}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => handleDimensionChange(e, 'height')}
                      />
                    </div>
                  </div>
                  {/* </>
                  )} */}
                  {/* {selectedTool !== 'text' && (
                    <> */}
                  <div className="position-options">
                    <div className="dimension-options">
                      <label htmlFor="positionX" style={{ marginBottom: '5px', color: 'white' }}>
                        Position X:
                      </label>
                      <input
                        type="number"
                        id="positionX"
                        value={positionX}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => handleDimensionChange(e, 'positionX')}
                        min={-Infinity}
                      />
                    </div>
                    <div className="subtab-separator"></div>
                    <div className="dimension-options">
                      <label htmlFor="positionY" style={{ marginBottom: '5px', color: 'white' }}>
                        Position Y:
                      </label>
                      <input
                        type="number"
                        id="positionY"
                        value={positionY}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => handleDimensionChange(e, 'positionY')}
                        min={-Infinity}
                      />
                    </div>
                  </div>
                  <h5 style={{ color: 'white', textAlign: 'left', fontSize: '16px', marginBottom: '10px' }}>Arrange</h5>
                  <div className="button-row">
                    <button
                      onClick={() => changeZIndex('sendBackward')}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center', width: '125px' }}
                    >
                      <IconStackBackward size={30} />
                      Send Backwards
                    </button>
                    <button onClick={() => changeZIndex('sendToBack')} style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                      <IconStackBack size={30} />
                      Send to Back
                    </button>
                  </div>
                  <div className="button-row">
                    <button
                      onClick={() => changeZIndex('bringForward')}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}
                    >
                      <IconStackForward size={30} />
                      Bring Forward
                    </button>
                    <button
                      onClick={() => changeZIndex('bringToFront')}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}
                    >
                      <IconStackFront size={30} />
                      Bring to Front
                    </button>
                  </div>
                  <div className="advanced-options">
                    <h5 style={{ color: 'white', textAlign: 'left', fontSize: '16px', marginBottom: '10px' }}>Advance</h5>
                    <label htmlFor="rotationAngle" style={{ marginBottom: '5px' }}>
                      Rotation Angle:
                    </label>
                    <input
                      type="number"
                      value={rotationAngle}
                      placeholder="Enter rotation angle"
                      onChange={handleRotationChange}
                      min="-180"
                      max="180"
                    />
                  </div>
                  {/* </>
                  )} */}
                </div>
                {/* //)} */}

                {activeSubtab === 'product' && selectedTool === 'rect' && (
                  <div className="subtab-content">
                    <h5 style={{ color: 'white', textAlign: 'left', fontSize: '16px', marginBottom: '10px' }}>Add elements</h5>
                    <Button onClick={() => addProductDescription()}>Add Description</Button>
                    <Button onClick={() => addProductImage()}>Add Image</Button>
                    <Button onClick={() => addProductName()}>Add Name</Button>
                    <Button onClick={() => addProductPrice()}>Add Price</Button>
                    {/* <Button onClick={() => addProductIcon()} style={{ color: 'black' }}>
                    Add Icon
                  </Button>*/}
                    <Button onClick={() => addProductHeader()}>Add Header</Button>
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
                <button onClick={() => addText('Heading')}>Heading</button>
                <button onClick={() => addText('Subheading')}>Subheading</button>
                <button onClick={() => addText('Body Text')}>Body Text</button>
              </div>
            )}
            {activeTab === 'background' && (
              <div className="tab">
                <h4 style={{ color: 'white' }}>Background</h4>
                <div className="file-input-wrapper">
                  <input type="file" accept="image/*" onChange={handleBackgroundImageUpload} />
                  <span className="file-input-label">Choose an background...</span>
                </div>

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
                  {backgroundImage.map((photo, idx) => {
                    return (
                      <button
                        onClick={() => clickToBackgroundImage(photo)}
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
            {activeTab === 'images' && (
              <div className="tab narrow-tab">
                <h4 style={{ color: 'white' }}>Image</h4>
                {/* <input type="file" accept="image/*" onChange={handleImageUpload} /> */}
                <div className="file-input-wrapper">
                  <input type="file" accept="image/*" onChange={handleImageUpload} />
                  <span className="file-input-label">Choose an image...</span>
                </div>
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
              // marginLeft: '10%',
              // marginTop: '5px',
              marginBottom: '10px',
              border: '0px solid #dee2e6',
              boxShadow: '6px 6px 12px 12px rgba(0, 0, 0, 0.1)'
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
