import { Cloudinary } from '@cloudinary/url-gen';
import { thumbnail } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { AdvancedImage, placeholder } from '@cloudinary/react';
import '../assets/scss/template.scss';

const cld = new Cloudinary({
  cloud: {
    cloudName: 'dchov8fes'
  }
});
// eslint-disable-next-line react/prop-types
const CldImage = ({ publicId }) => {
  const myImage = cld
    .image(publicId)
    .resize(thumbnail().height(500).width(700).gravity(autoGravity()))
    .delivery(format('auto'))
    .delivery(quality('auto'));
  return (
    <AdvancedImage
      cldImg={myImage}
      style={{ maxWidth: '90%', borderRadius: '10px' }}
      plugins={[placeholder()]}
      className="rounded-lg shadow-lg zoom-hover"
    />
  );
};
export default CldImage;
