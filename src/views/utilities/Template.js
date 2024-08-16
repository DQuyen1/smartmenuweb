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

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import html2canvas from 'html2canvas';
import axios from 'axios';
import Toastify from 'toastify-js';
// import { OrbitProgress } from 'react-loading-indicators';

import boxService from 'services/box_service';
import layerService from 'services/layer_service';
//import templateService from 'services/template_service';
import boxItemService from 'services/box_item_service';
import layerItemService from 'services/layer_item_service';
import fontService from 'services/font_service';
import cloudinaryService from 'services/cloudinary_service';
import { useParams } from 'react-router';

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
  const [fonts, setFonts] = useState([]);
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
  const [selectedFont, setSelectedFont] = useState('');

  const [imageCounter, setImageCounter] = useState(0);

  const [iconCounter, setIconCounter] = useState(0);
  const [headerCounter, setHeaderCounter] = useState(0);
  const [renderQuantity, setRenderQuantity] = useState(0);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);

  const box_service = new boxService();
  const layer_service = new layerService();
  //const template_service = new templateService();
  const box_item_service = new boxItemService();
  const layer_item_service = new layerItemService();
  const font_service = new fontService();
  const cloudinary_service = new cloudinaryService();

  // const cloudName = import.meta.env.VITE_CLOUD_NAME;
  // const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

  // const cloudName = 'dchov8fes';
  // const uploadPreset = 'ml_default';
  const templateType = location.state.templateType;
  // const userId = localStorage.getItem('userId');
  const canvasWidth = 794;
  const canvasHeight = 1123;
  const displayWidth = 608;
  const displayHeight = 800;

  const defaultCanvasWidth = 608;
  const defaultCanvasHeight = 1080;
  const defaultDisplayWidth = 608;
  const defaultDisplayHeight = 800;

  const [canvasDimensions, setCanvasDimensions] = useState({
    canvasWidth: defaultCanvasWidth,
    canvasHeight: defaultCanvasHeight,
    displayWidth: defaultDisplayWidth,
    displayHeight: defaultDisplayHeight
  });

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

  const handleDimensionChange = (e, type) => {
    let value = parseFloat(e.target.value);
    let element = editor.canvas.getActiveObject();

    switch (type) {
      case 'width':
        setWidth(value);
        element.set('width', value);
        console.log('height');
        editor.canvas.renderAll();
        break;
      case 'height':
        setHeight(value);
        element.set('height', value);
        editor.canvas.renderAll();
        break;
      case 'positionX':
        setPositionX(value);
        element.set('left', value);
        editor.canvas.renderAll();
        break;
      case 'positionY':
        setPositionY(value);
        element.set('top', value);
        editor.canvas.renderAll();
        break;
      default:
        break;
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  const getAssetImages = async (tag) => {
    try {
      // Fetch asset images
      const assetResult = await cloudinary_service.getAllImages(tag);
      const assetImages = assetResult.resources; // Access the resources property
      console.log('Asset Images: ', assetImages);

      // Fetch user images
      const userResult = await cloudinary_service.getAllImages('469');
      const userImages = userResult.resources; // Access the resources property
      console.log('User Images: ', userImages);

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
      });
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const updateLayerItem = async (layerItemId, layerItemValue) => {
    try {
      const id = await layer_item_service.updateLayerItem(layerItemId, layerItemValue);
      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const createLayer = async (templateId, layerType) => {
    try {
      const id = await layer_service.createLayer(templateId, layerType);
      return id;
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

  const createBox = async (layerId, boxPositionX, boxPositionY, boxWidth, boxHeight, boxType, maxProductItem) => {
    try {
      const id = await box_service.createBox(layerId, boxPositionX, boxPositionY, boxWidth, boxHeight, boxType, maxProductItem);

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

  // const updateLayerItem = async (layerItemId, layerItemValue) => {
  //   try {
  //     const response = await layer_item_service.updateLayerItem(layerItemId, layerItemValue);

  //     console.log('Response: ', JSON.stringify(response));
  //   } catch (error) {
  //     console.log('Error message: ' + error.message);
  //   }
  // };f

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
    // createUserTemplate();
    // window.addEventListener('beforeunload', handleBeforeUnload);
    // console.log('userId: ' + userId);
    // if (templateType === 0) {
    //   setCanvasDimensions({
    //     canvasWidth: 1080,
    //     canvasHeight: 608,
    //     displayWidth: 1080,
    //     displayHeight: 608
    //   });
    // } else if (templateType === 1) {
    //   setCanvasDimensions({
    //     canvasWidth: 608,
    //     canvasHeight: 1080,
    //     displayWidth: 608,
    //     displayHeight: 800
    //   });
    // }

    // console.log('dimension: ', canvasDimensions);

    getLayersByTemplateId(179);

    getAllFont();

    getAssetImages('asset/images');
    getUserImages(`469`);

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
      const activeObject = editor.canvas.getActiveObject().type;

      if (activeObject === 'text') {
        const boxItemId = editor.canvas.getActiveObject().boxItemId;
        if (boxItemId) {
          //console.log('box item');

          editor.canvas.remove(editor.canvas.getActiveObject());
          //console.log('activeObject: ', editor.canvas.getActiveObject());
          deleteProductElement(boxItemId);
        } else {
          const layerId = editor.canvas.getActiveObject().layerId;
          //console.log('layerId: ', layerId);
          //console.log('layer');

          editor.canvas.remove(editor.canvas.getActiveObject());
          deleteText(layerId);
        }
      } else if (activeObject === 'rect') {
        const layerId = editor.canvas.getActiveObject().layerId;
        // console.log('layerId: ', layerId);
        // console.log('activeObject: ', editor.canvas.getActiveObject());
        editor.canvas.remove(editor.canvas.getActiveObject());
        deleteRenderLayer(layerId);
      } else if (activeObject === 'image') {
        const layerId = editor.canvas.getActiveObject().layerId;
        console.log(editor.canvas.getActiveObject());

        // editor.canvas.remove(editor.canvas.getActiveObject());
        deleteImage(layerId);
      }
      console.log('activeObject: ', activeObject);

      // editor.canvas.remove(editor.canvas.getActiveObject());
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

  const getLayersByTemplateId = async (templateId) => {
    const layers = await layer_service.getLayersByTemplateId(templateId);
    console.log('layers: ', layers);
    layers.map((layer) => {
      if (layer.layerId && layer.layerType === 2 ) {
        const textValue = layer.layerItem.layerItemValue;
        const positionX = layer.boxes[0].boxPositionX;
        const positionY = layer.boxes[0].boxPositionY;
        const width = layer.boxes[0].boxWidth;
        const height = layer.boxes[0].boxHeight;
        const layerId = layer.layerId;
        const boxId = layer.boxes[0].boxHeightId;
        const boxItemId = layer.boxes[0].boxItems[0].boxItemId;

        console.log(
          'Object: ' +
            JSON.stringify({
              textValue: textValue,
              positionX: positionX,
              positionY: positionY,
              width: width,
              height: height,
              layerId: layerId,
              boxId: boxId,
              boxItemId: boxItemId
            })
        );

        console.log('add text');
        addTextThroughApi(textValue, positionX, positionY, width, height, layerId, boxId, boxItemId);
      }
    });
  };

  const addTextThroughApi = (textValue, positionX, positionY, width, height, layerId, boxId, boxItemId) => {
    // if (editor && editor.canvas) {
    let text = new fabric.Text(textValue, {
      top: positionY,
      left: positionX,
      fill: color,
      width: width,
      // fontSize: getFontSizeV2(),
      // fontSize: 40,
      height: height,
      layerId: layerId,
      boxId: boxId,
      boxItemId: boxItemId,
      zIndex: 1,
      opacity: 100,
      backgroundColor: 'transparent'
      // fontStyle: isItalic ? 'italic' : 'normal',
      // fontWeight: isBold ? 'bold' : 'normal',
      // textAlign: textAlign
    });

    text.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      mb: false, // midle bottom
      ml: false, // middle left
      mr: false // middle right
    });
    // editor.canvas.add(text);

    text.on('mousemove', function () {
      // setHeight(text.height.toFixed(1));
      // setWidth(text.width.toFixed(1));
      // setPositionX(text.left.toFixed(1));
      // setPositionY(text.top.toFixed(1));

      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('text');
    });

    text.on('mouseup', function () {
      console.log('clicked to text layer');
      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('text');
    });

    // editor.canvas.on('mouse:down', function (options) {
    //   if (options.target !== rect) {
    //     setActiveTab(null);
    //   }
    //   setSelectedTool(null);
    // });
  };

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

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    // editor.canvas.setHeight('100%');
    // editor.canvas.setWidth('100%');
    editor.canvas.preserveObjectStacking = true;
    editor.canvas.setHeight(canvasHeight);
    editor.canvas.setWidth(canvasWidth);
    editor.canvas.renderAll();
    // createUserTemplate();
  }, []);

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

  const addImage = (file, layerId) => {
    const reader = new FileReader();
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

        const boxId = await createBox(layerId, positionX, positionY, width, height, 0, 0);

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

        myImg.on('modified', function () {
          console.log('Left: ' + myImg.left + ' Top: ' + myImg.top);
          console.log('layerId: ', myImg.layerId);

          // console.log('Width: ' + myImg.getScaledWidth() + ' Height: ' + myImg.getScaledHeight());
          // updateBox(boxId, myImg.left, myImg.top, myImg.getScaledWidth(), myImg.getScaledHeight(), 100);
        });

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

  // function bindImageEvents(imageObject) {
  //   imageObject.on('mousedown', function () {
  //     // console.log('width: ', imageObject.width, 'height: ', imageObject.height);
  //     // console.log('left: ', imageObject.left, 'top: ', imageObject.top);
  //   });

  //   imageObject.on('modified', function () {
  //     console.log('Left: ' + imageObject.left + ' Top: ' + imageObject.top);
  //     console.log('Width: ' + imageObject.getScaledWidth() + ' Height: ' + imageObject.getScaledHeight());
  //     updateBox();

  //   });
  // }

  const handleImageUpload = async (event) => {
    const userId = 469;
    const file = event.target.files[0];
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;
    if (file) {
      // const url = URL.createObjectURL(file);
      formData.append('file', file);
      formData.append('upload_preset', preset_key);
      formData.append('tags', tags);
      formData.append('folder', folder);
      axios.post('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', formData).then(async (result) => {
        const layerItemValue = result.data.secure_url;
        const layerId = await createLayer(templateId, 1);
        const layerItemId = await createLayerItem(layerId, layerItemValue);
        addImage(file, layerId);
        // await createBox(layerId, 0).then((boxId) => {
        //   addImage(file, boxId);
        // })

        // setAssetImage((prevImages) => [result.data, ...prevImages]);

        // await createBox(layerId, 0);
        const public_id = result.data.public_id;

        setAssetImage((preImages) => [public_id, ...preImages]);

        console.log('Result hihi: ', result);
        console.log('layerId: ', layerId);
        console.log('layerItemId: ', layerItemId);

        // console.log('Response from cloudinary when upload image:', JSON.stringify(layerItemValue));
      });
      // addImage(file, boxId);
      // uploadWidget();
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
    setColor(e.target.value);
    const o = editor.canvas.getActiveObject();
    o.set('fill', color);
    editor?.setStrokeColor(color);
    o.fire('modified');
    editor.canvas.renderAll();
  };

  // const isBold = () => {
  //   const o = editor.canvas.getActiveObject();
  //   if (o) {
  //     const currentFontWeight = o.get('fontWeight');
  //     o.set('fontWeight', currentFontWeight === 'bold' ? 'normal' : 'bold');
  //     o.fire('modified');
  //     editor.canvas.renderAll();
  //   }
  // };

  const toggleBold = () => {
    const o = editor.canvas.getActiveObject();
    if (o) {
      setIsBold((prev) => !prev);
      o.set('fontWeight', !isBold ? 'bold' : 'normal');
      o.fire('modified');
      editor.canvas.renderAll();
    }
  };

  const toggleItalic = () => {
    const o = editor.canvas.getActiveObject();
    if (o && o.type === 'textbox') {
      setIsItalic((prev) => !prev);
      o.set('fontStyle', !isItalic ? 'italic' : 'normal');
      o.fire('modified');
      editor.canvas.renderAll();
    }
  };

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

  const addText = async () => {
    setColor(color);
    let text = new fabric.Text('Text', {
      top: 300,
      left: 300,
      fill: 'black',
      // width: 100,
      // fontSize: getFontSizeV2(),
      // fontSize: 40,
      // height: 50,
      zIndex: 1,
      opacity: opacity,
      backgroundColor: 'transparent',
      fontStyle: isItalic ? 'italic' : 'normal',
      fontWeight: isBold ? 'bold' : 'normal',
      textAlign: textAlign,
      editable: true
    });
    // addToUndoStack();

    text.setControlsVisibility({
      mtr: false,
      mt: false, // middle top disable
      mb: false, // midle bottom
      ml: false, // middle left
      mr: false // middle right
    });

    // console.log('text fill0: ', text.fill);

    // text.on('mousemove', function () {
    //   // setHeight(text.height.toFixed(1));
    //   // setWidth(text.width.toFixed(1));
    //   // setPositionX(text.left.toFixed(1));
    //   // setPositionY(text.top.toFixed(1));

    //   setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
    //   setSelectedTool('text');
    // });

    // text.on('object:selected', function () {
    //   console.log('clicked to text layer');
    //   setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
    //   setSelectedTool('text');
    // });

    text.on('moving', function () {
      const scaleX = canvasWidth / displayWidth;
      const scaleY = canvasHeight / displayHeight;

      // setHeight(text.getScaledHeight());
      // setWidth(text.getScaledWidth());
      setPositionX((text.left * scaleX).toFixed(1));
      setPositionY((text.top * scaleY).toFixed(1));
    });

    editor.canvas.on('mouse:down', function (options) {
      // if (options.target !== rect) {
      setActiveTab(null);

      setSelectedTool(null);
    });

    // text.on('mouseup', function () {
    //   // toggleHeaderVisibility();
    //   setSelectedTool('text');
    //   setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
    // });

    // editor.canvas.on('mouse:down', function (options) {
    //   if (options.target !== text) {
    //     setIsHeaderVisible(false);
    //   }
    //   setSelectedTool(null);
    // });

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

    const layerId = await createLayer(templateId, 2);
    const layerItemId = await createLayerItem(layerId, 'Text');
    const boxId = await createBox(layerId, text.left, text.top, text.width, text.height, 0, 1);
    const boxItemId = await createBoxItem(boxId, 5, text.left, text.top, text.width, text.height, 0, JSON.stringify(style));

    text.layerId = layerId;
    text.boxItemId = boxItemId;
    text.boxId = boxId;

    // text.fire('modified');

    console.log('Layer id: ', layerId);
    console.log('layer item id: ', layerItemId);
    console.log('Box id: ', boxId);
    console.log('Box item id: ', boxItemId);

    const isTextUppercase = (text) => text === text.toUpperCase();

    // Function to check if text is lowercase
    const isTextLowercase = (text) => text === text.toLowerCase();

    const checkTextCaseUppercase = () => {
      const currentText = text.text;
      return isTextUppercase(currentText);
    };

    // Function to check if text is lowercase
    const checkTextCaseLowercase = () => {
      const currentText = text.text;
      return isTextLowercase(currentText);
    };

    const isUppercase = checkTextCaseUppercase();
    const isLowercase = checkTextCaseLowercase();

    // console.log('font size: ', getFontSize());

    text.on('modified', function () {
      // console.log('scale width: ', text.getScaledWidth(), 'scale height: ', text.getScaledHeight());
      // console.log('width: ', text.width, 'height: ', text.height);
      // console.log('font sizeV2: ', getFontSizeV2());
      // updateStyle(style, text);
      // updateBoxItem(
      //   text.boxItemId,
      //   5,
      //   text.left,
      //   text.top,
      //   text.getScaledWidth() + 30,
      //   text.getScaledHeight() + 30,
      //   JSON.stringify({
      //     textColor: text.fill,
      //     bFontId: 5,
      //     fontSize: getFontSizeV2(),
      //     fontStyle: getFontStyleValue(text.fontStyle),
      //     alignment: getAlignmentValue(text.textAlign),
      //     transparency: text.opacity,
      //     uppercase: false
      //   })
      // );
      // updateBox(text.boxId, text.left, text.top, text.getScaledWidth() + 30, text.getScaledHeight() + 30, 1);
      // updateLayerItem(layerId, text.text);
      console.log('Is text uppercase: ', isUppercase);
      console.log('Is text lowercase: ', isLowercase);
    });

    // text.on('object:selected', function (options) {
    //   options.target.bringToFront();
    // });

    // text.on('selected', function () {
    //   setSelectedTool('text');
    //   setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
    // });

    text.on('editing:exited', function () {
      console.log('Text editing exited, new text: ', text.text);
    });

    // console.log('initial text: ', text.fontSize);

    editor.canvas.renderAll();
  };

  const addRenderLayer = async () => {
    let rect = new fabric.Rect({
      left: 100,
      top: 150,
      fill: backgroundColor,
      borderColor: 'dark',
      width: 200,
      height: 200,
      opacity: 0.3
    });

    console.log('width and height: ', rect.width, rect.height);

    // console.log('canvas width and height: ', editor.canvas.width, editor.canvas.height);

    // rect.on('mouseup', function () {})
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

      setHeight(rect.getScaledHeight());
      setWidth(rect.getScaledWidth());

      setPositionX((rect.left * scaleX).toFixed(1));
      setPositionY((rect.top * scaleY).toFixed(1));
      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('rect');
    });

    rect.on('mouseup', function () {
      setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
      setSelectedTool('rect');
      // setHeight(rect.height.toFixed(1));
      // setWidth(rect.width.toFixed(1));
      // setPositionX(rect.left.toFixed(1));
      // setPositionY(rect.top.toFixed(1));
      // console.log('clicked to render layer');
    });

    editor.canvas.on('mouse:down', function (options) {
      if (options.target !== rect) {
        setActiveTab(null);
      }
      setSelectedTool(null);
    });

    editor.canvas.add(rect);
    setRect(rect);
    setRenderQuantity((prevCounter) => prevCounter + 1);

    const layerId = await createLayer(templateId, 3);
    const boxId = await createBox(layerId, rect.top, rect.left, rect.width, rect.height, 0, 1);
    setBoxId(boxId);
    rect.layerId = layerId;
    rect.boxId = boxId;

    console.log('Layer id: ', layerId);
    console.log('Box id: ', boxId);

    rect.on('modified', function () {
      // const scaleX = canvasWidth / displayWidth;
      // const scaleY = canvasHeight / displayHeight;
      // console.log('Position X: ', rect.left * scaleX);
      // console.log('Position Y: ', rect.top * scaleY);
      // updateBox(boxId, rect.left, rect.top, rect.getScaledWidth(), rect.getScaledHeight(), quantity);
    });

    // rect.on('scaling', function () {
    //   rect.width = rect.width * rect.scaleX;
    //   rect.height = rect.height * rect.scaleY;
    //   const o = editor.canvas.getActiveObject();
    //   console.log('width: ', o.width, 'height: ', o.height);
    //   setHeight(height.toFixed(1));
    //   setWidth(width.toFixed(1));
    // });
    rect.on('scaling', function () {
      const newWidth = rect.width * rect.scaleX;
      const newHeight = rect.height * rect.scaleY;
      rect.set({
        width: newWidth,
        height: newHeight,
        scaleX: 1,
        scaleY: 1
      });
      setHeight(newHeight.toFixed(1));
      setWidth(newWidth.toFixed(1));
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

  const addBackgroundImage = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      fabric.Image.fromURL(e.target.result, (img) => {
        img.scale(0.75);
        img.scaleX = editor.canvas.width / img.width;
        img.scaleY = editor.canvas.height / img.height;
        img.set({
          selectable: false,
          evented: true, // Allows the image to fire events (e.g., selection)
          hasControls: true // Ensure control handles are visible for resizing and moving
          // lockMovementX: true, // Allow movement in X direction
          // lockMovementY: true, // Allow movement in Y direction
          // lockScalingX: true, // Allow scaling in X direction
          // lockScalingY: true, // Allow scaling in Y direction
          // lockRotation: true, // Allow rotation
          // lockSkewingX: true, // Allow skewing in X direction
          // lockSkewingY: true // Allow skewing in Y dire
        });

        editor.canvas.add(img);
        img.setControlsVisibility({
          mtr: false,
          mt: false, // middle top disable
          mb: false, // midle bottom
          ml: false, // middle left
          mr: false // middle right
        });

        editor.canvas.renderAll();
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundImageUpload = async (event) => {
    const userId = 469;
    const file = event.target.files[0];
    const formData = new FormData();
    const preset_key = 'xdm798lx';
    const folder = `users/${userId}`;
    const tags = `${userId}`;
    if (file) {
      formData.append('file', file);
      formData.append('upload_preset', preset_key);
      formData.append('tags', tags);
      formData.append('folder', folder);
      axios.post('https://api.cloudinary.com/v1_1/dchov8fes/image/upload', formData).then(async (result) => {
        const layerItemValue = result.data.secure_url;
        const layerId = await createLayer(templateId, 0);
        const layerItemId = await createLayerItem(layerId, layerItemValue);
        addBackgroundImage(file);
        console.log('layerId: ', layerId);
        console.log('layerItemId: ', layerItemId);
      });
    }
  };

  // const processResults = async (error, result) => {
  //   if (result.event === 'close') {
  //     setIsDisabled(false);
  //   }
  //   if (result && result.event === 'success') {
  //     const layerId = await createLayer(templateId, 'BackGroundImage', 0);
  //     const layerItemId = await createLayerItem(layerId, result.info.secure_url);
  //     const boxId = await createBox(layerId, 200, 200, 300, 300, 0, 100);

  //     console.log('layerId: ', layerId);
  //     console.log('layerItemId: ', layerItemId);
  //     console.log('boxId: ', boxId);
  //     console.log('success');

  //     setIsDisabled(false);
  //   }
  //   if (error) {
  //     setIsDisabled(false);
  //   }
  // };

  // const uploadWidget = () => {
  //   // handleBackgroundImageUpload();
  //   setIsDisabled(true);
  //   window.cloudinary.openUploadWidget(
  //     {
  //       cloudName,
  //       uploadPreset,
  //       sources: ['local', 'url'],
  //       // tags: ['myphotoalbum-react'],
  //       clientAllowedFormats: ['image'],
  //       resourceType: 'image'
  //     },
  //     processResults
  //   );
  // };

  // const hanlderFontChange = (e) => {
  //   const value = e.target.value;

  //   setFonts(value);

  //   console.log(value);
  // };

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

      const boxId = await createBox(layerId, positionX, positionY, width, height, 0, 0);

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

  // const saveTemplate = () => {
  //   takeScreenShot();

  // };

  const getAllCanvasProperties = () => {
    const scaleX = canvasWidth / displayWidth;
    const scaleY = canvasHeight / displayHeight;

    takeScreenShot();

    try {
      // Get all objects on the canvas
      const objects = editor.canvas.getObjects();

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
                fontSize: 12,
                fontStyle: getFontStyleValue(obj.fontStyle),
                alignment: getAlignmentValue(obj.textAlign),
                transparency: 100,
                uppercase: false
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
                uppercase: false
              })
            );
            // return {
            //   color: obj.fill
            // };
          }
        } else if (obj instanceof fabric.Image) {
          console.log('dcmmm');

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

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      // Allows only digits
      setQuantity(value);
      console.log('value: ', value);

      if (rect) {
        updateBox(rect.boxId, rect.top, rect.left, rect.width, rect.height, value);
      }
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
      case 'right':
        return 1;
      case 'center':
        return 2;
      default:
        return -1; // Return a default value or handle the unexpected input
    }
  }

  function getFontStyleValue(fontStyle) {
    switch (fontStyle.toLowerCase()) {
      case 'normal':
        return 0;
      case 'italic':
        return 1;
      case 'bold':
        return 2;
      default:
        return -1; // Return a default value or handle the unexpected input
    }
  }

  const addProductDescription = async () => {
    if (descriptionCounter < quantity) {
      let textBox = new fabric.Text(`Product Description ${descriptionCounter + 1} `, {
        left: 100,
        top: 180,
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
        opacity: 100

        // selectionBackgroundColor: 'black'
      });

      setDescriptionCounter((prevCounter) => prevCounter + 1);

      textBox.setControlsVisibility({
        mtr: false,
        mt: false, // middle top disable
        // mb: false, // midle bottom
        ml: false // middle left
        // mr: false // middle right
      });

      // console.log('width scale: ', textBox.getScaledWidth(), 'height scale: ', textBox.getScaledHeight());
      // console.log('width: ', textBox.width, 'height: ', textBox.height);

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

      // console.log('boxItemId: ', boxItemId);

      textBox.on('modified', function () {
        // console.log('fontsize: ', getFontSizeV2(textBox));
        // console.log('width: ', textBox.width, 'height: ', textBox.height);
        // console.log('boxItemId: ', textBox.boxItemId);
        // console.log('boxItemType: ', textBox.boxItemType);
        // textBox.set('fontSize', getFontSizeV2());
        //updateBoxItem(textBox.boxItemId, 5, textBox.left, textBox.top, textBox.width, textBox.height, JSON.stringify(style));
      });

      textBox.on('scaling', function () {
        setActiveTab('positionSize');

        width = rect.width * rect.scaleX;
        height = rect.height * rect.scaleY;
        const o = editor.canvas.getActiveObject();
        console.log('width: ', o.width, 'height: ', o.height, 'top: ', o.top, 'left: ', o.left);
        setHeight(height.toFixed(1));
        setWidth(width.toFixed(1));
      });

      textBox.on('moving', function () {
        const scaleX = canvasWidth / displayWidth;
        const scaleY = canvasHeight / displayHeight;

        setPositionX((rect.left * scaleX).toFixed(1));
        setPositionY((rect.top * scaleY).toFixed(1));
        // console.log('moving');

        const textLeft = textBox.left;
        const textTop = textBox.top;
        const textWidth = textBox.width * textBox.scaleX; // consider scaling
        const textHeight = textBox.height * textBox.scaleY; // consider scaling

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

      textBox.on('mouseup', function () {
        setHeight(height.toFixed(1));
        setWidth(width.toFixed(1));
        setPositionX(rect.left.toFixed(1));
        setPositionY(rect.top.toFixed(1));
        // setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
        setActiveTab('positionSize');
        setIsHeaderVisible(true);
        setSelectedTool('text');
      });

      textBox.on('mousemove', function () {
        setHeight(textBox.height.toFixed(1));
        setWidth(textBox.width.toFixed(1));
        setPositionX(textBox.left.toFixed(1));
        setPositionY(textBox.top.toFixed(1));
        // console.log('Move');

        // setActiveTab(activeTab === 'positionSize' ? null : 'positionSize');
        setActiveTab('positionSize');
        setSelectedTool('text');
      });

      editor.canvas.on('mouse:down', function (options) {
        if (options.target !== textBox) {
          setIsHeaderVisible(false);
          setSelectedTool(null);
        }
      });
    } else {
      Toastify({
        text: 'Can not add more descriptions',
        className: 'info',
        gravity: 'top',
        position: 'right',

        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();
    }
  };

  const addProductName = async () => {
    if (nameCounter < quantity) {
      const textBox = new fabric.Text(`Product Name ${nameCounter + 1} `, {
        left: 100,
        top: 90,
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

      if (boxId) {
        const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 2, JSON.stringify(style));
        textBox.boxItemId = boxItemId;
        textBox.boxItemType = 2;
        console.log('boxItemId: ', boxItemId);
      }

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
    } else {
      Toastify({
        text: 'Can not add more names',
        className: 'info',
        gravity: 'top',
        position: 'right',

        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();
    }
  };

  const addProductPrice = async () => {
    if (priceCounter < quantity) {
      const textBox = new fabric.Text(`Product Price ${priceCounter + 1} `, {
        left: 100,
        top: 150,
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

      editor.canvas.add(textBox);
      setPriceCounter((prevCounter) => prevCounter + 1);

      textBox.on('modified', function () {
        // updateBoxItem(textBox.boxItemId, rect.left, rect.top, width, height, priceCounter + 1, JSON.stringify(style));
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
    } else {
      Toastify({
        text: 'Can not add more prices',
        className: 'info',
        gravity: 'top',
        position: 'right',

        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();
    }
  };

  const addProductImage = async () => {
    if (imageCounter < quantity) {
      const textBox = new fabric.Text(`Product Image ${imageCounter + 1} `, {
        left: 100,
        top: 150,
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

      if (boxId) {
        const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 5, JSON.stringify(style));
        textBox.boxItemId = boxItemId;
        textBox.boxItemType = 5;
        console.log('boxItemId: ', boxItemId);
      }
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

      editor.canvas.add(textBox);
      setImageCounter((prevCounter) => prevCounter + 1);

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
    } else {
      Toastify({
        text: 'Can not add more images',
        className: 'info',
        gravity: 'top',
        position: 'right',

        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();
    }
  };

  const addProductIcon = async () => {
    if (iconCounter < quantity) {
      const textBox = new fabric.Text(`Product Icon ${iconCounter + 1} `, {
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

      editor.canvas.add(textBox);
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
    } else {
      Toastify({
        text: 'Can not add more images',
        className: 'info',
        gravity: 'top',
        position: 'right',

        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();
    }
  };

  const addProductHeader = async () => {
    if (headerCounter < renderQuantity) {
      const textBox = new fabric.Text('Header', {
        left: 100,
        top: 150,
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

      if (boxId) {
        const boxItemId = await createBoxItem(boxId, 5, textBox.left, textBox.top, textBox.width, textBox.height, 1, JSON.stringify(style));
        textBox.boxItemId = boxItemId;
        textBox.boxItemType = 1;
        console.log('boxItemId: ', boxItemId);
      }

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

      editor.canvas.add(textBox);
      setHeaderCounter((prevCounter) => prevCounter + 1);

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

      textBox.on('mouseup', function () {
        toggleHeaderVisibility();
      });

      editor.canvas.on('mouse:down', function (options) {
        if (options.target !== textBox) {
          setIsHeaderVisible(false);
        }
      });
    } else {
      Toastify({
        text: 'You can only add header once for each render',
        className: 'info',
        gravity: 'top',
        position: 'right',

        duration: 3000,
        style: {
          background: 'linear-gradient(to right, #ff0000, #ff6347)'
        }
      }).showToast();
    }
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

  const handleFontChange = (e) => {
    setSelectedFont(e.target.value);
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

  return (
    <div className="app">
      <header className="header">
        {selectedTool == 'text' && (
          <>
            <select value={selectedFont} onChange={handleFontChange}>
              {fonts.map((font) => (
                <option key={font.bFontId} value={font.fontName}>
                  {font.fontName}
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
            <input type="color" id="font-color" onChange={(e) => changeColor(e)} />
            <button onClick={toggleBold}>B</button>
            <button onClick={toggleItalic}>I</button>
          </>
        )}

        {selectedTool == 'rect' && (
          <>
            <label htmlFor="font-color">Background Color:</label>
            <input type="color" id="font-color" onChange={(e) => changeBackgroundColor(e)} />
            {/* <Button onClick={() => handleTabClick('positionSize')} style={{ color: 'white' }}>
          Position & Size
        </Button> */}
            <input type="range" id="opacity" value={opacity} onChange={(e) => changeOpacity(e)} min="0" max="1" step="0.01" />
            <button onClick={cycleTextAlign} className="align-button">
              {getTextAlignIcon()}
            </button>
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
                    </Button>
                    <Button onClick={() => addProductHeader()} style={{ color: 'black' }}>
                      Add Header
                    </Button> */}
                    <label htmlFor="product-quantity" style={{ color: 'white' }}>
                      Quantity:
                    </label>
                    <input type="number" id="product-quantity" value={quantity} onChange={handleQuantityChange} />
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
                {/* <button
                  disabled={isDisabled}
                  className={`btn btn-primary ${isDisabled ? 'btn-disabled' : ''}`}
                  type="button"
                  onClick={uploadWidget}
                >
                  {isDisabled ? 'Opening Widget' : 'Upload Image'}
                </button> */}
              </div>
            )}
            {activeTab === 'images' && (
              <div className="tab narrow-tab" style={{ width: '100%' }}>
                <h4 style={{ color: 'white' }}>Image</h4>
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                {/* <button
                  disabled={isDisabled}
                  className={`btn btn-primary ${isDisabled ? 'btn-disabled' : ''}`}
                  type="button"
                  onClick={uploadWidget}
                >
                  {isDisabled ? 'Đang mở ' : 'Tải ảnh lên'}
                </button> */}
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
