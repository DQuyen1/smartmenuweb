import React, { useEffect } from 'react';
import '../../assets/scss/renderTemplate.scss';
import boxService from 'services/box_service';
import layerService from 'services/layer_service';
import templateService from 'services/template_service';
import boxItemService from 'services/box_item_service';
import storeDeviceService from 'services/store_device_service';
import menuService from 'services/menu_service';
import collectionService from 'services/collection_service';
import displayService from 'services/display_service';

// import layerItemService from 'services/layer_item_service';

// import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { useFabricJSEditor } from 'fabricjs-react';
// import CldImage from 'ui-component/CldImage';
import cloudinaryService from 'services/cloudinary_service';

function GetTemplate() {
  const { editor } = useFabricJSEditor();
  // const [photos, setPhotos] = useState('');
  // const [loading, setLoading] = useState(true);

  const box_service = new boxService();
  const layer_service = new layerService();
  const template_service = new templateService();
  const box_item_service = new boxItemService();
  const store_device_service = new storeDeviceService();
  const menu_service = new menuService();
  const collection_service = new collectionService();
  const display_service = new displayService();
  const cloudinary_service = new cloudinaryService();
  //   const layer_item_service = new layerItemService();

  const getImages = async (tag) => {
    try {
      await cloudinary_service.getAllImages(tag);

      // console.log('Images: ', images);
      return images;
    } catch (error) {
      console.log('Error message: ', error.message);
    }
  };

  // const cloudName = 'dchov8fes';
  // const getData = async (tag) => {
  //   try {
  //     const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`);
  //     const data = await response.json();
  //     setPhotos(data);
  //     setLoading(false);
  //   } catch (error) {
  //     console.log('Error message: ', error.message);
  //   }
  // };

  useEffect(() => {
    getImages('myphotoalbum-react');
  }, []);

  useEffect(() => {
    if (!editor || !fabric) {
      return;
    }
    editor.canvas.setHeight('100%');
    editor.canvas.setWidth('100%');
    editor.canvas.renderAll();
    // createUserTemplate();
  }, []);

  useEffect(() => {
    getTemplate();
    getLayer();
    getBox();
    getBoxItem();
    getStoreDevice();
    getMenu();
    getCollection();
    createDisplay();
  }, []);

  const createDisplay = async () => {
    try {
      const id = await display_service.createDisplay(1, 11, 1, 100, 10);

      // console.log('Collection data: ', JSON.stringify(id));

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const getCollection = async () => {
    try {
      const id = await collection_service.getCollection(1);

      // console.log('Collection data: ', JSON.stringify(id));

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const getMenu = async () => {
    try {
      const id = await menu_service.getMenu(2);

      // console.log('Menu data: ', JSON.stringify(id));

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const getStoreDevice = async () => {
    try {
      const id = await store_device_service.getStoreDevice(1);

      // console.log('Store Device data: ', JSON.stringify(id));

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const getTemplate = async () => {
    try {
      const id = await template_service.getTemplate(12);

      // console.log('Template data: ', id);

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const getLayer = async () => {
    try {
      const id = await layer_service.getLayer(12);

      // console.log('Layer data: ', id);

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  //   const getLayerItem = async () => {
  //     try {
  //       const id = await layer_item_service.getLayerItem();

  //       console.log('layer-item data: ', id);

  //       return id;
  //     } catch (error) {
  //       console.log('Error message: ' + error.message);
  //     }
  //   };

  const getBox = async () => {
    try {
      const id = await box_service.getBox(12);

      // console.log('Box data: ', id);

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  const getBoxItem = async () => {
    try {
      const id = await box_item_service.getBoxItem(30);

      // console.log('box-item data: ', id);

      return id;
    } catch (error) {
      console.log('Error message: ' + error.message);
    }
  };

  // const takeScreenShot = () => {
  //   html2canvas(document.querySelector('#capture')).then((canvas) => {
  //     document.body.appendChild(canvas);
  //     console.log('Result ', canvas.toDataURL('image/png'));
  //   });
  // };

  // const takeScreenShot = () => {
  //   const input = document.getElementById('capture');
  //   html2canvas(input, { logging: true, useCORS: true}).then((canvas) => {

  //   });
  // };

  return (
    <div>
      {/* <div
        style={{
          width: '700px',
          height: '700px',
          background: '#f8f9fa',
          marginTop: '0%',
          border: '2px solid black'
        }}
      >
        <FabricJSCanvas className="sample-canvas" onReady={onReady} />
      </div>
      <div>
        {loading && <p className="font-bold">Loading gallery</p>}
        {!loading && photos.length !== 0 ? (
          <div className="flex flex-wrap -mx-4">
            {photos.resources.map((photo, idx) => {
              return (
                <div className="lg:w-1/3 md:w-1/2 w-full p-4" key={idx}>
                  <CldImage publicId={photo.public_id} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xl p-4">No photos to list. Please make sure that you have uploaded some images using this app.</p>
        )}
      </div>
      <button onClick={takeScreenShot}>Click to screenshot</button>
      <div id="capture" style={{ padding: '10px', background: '#f5da55' }}>
        <h4 style={{ color: 'red' }}>Hello world!</h4>
      </div> */}
    </div>
  );
}

export default GetTemplate;
