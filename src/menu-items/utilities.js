// assets
import { IconUsers, IconBuildingStore, IconBrandMedium, IconWindmill, IconPackage, IconTemplate } from '@tabler/icons-react';

// constant
const icons = {
  IconUsers,
  IconBuildingStore,
  IconBrandMedium,
  IconWindmill,
  IconPackage,
  IconTemplate
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  type: 'group',
  children: [
    {
      id: 'util-user',
      title: 'Users',
      type: 'item',
      url: '/utils/util-user',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'util-brand',
      title: 'Brands',
      type: 'item',
      url: '/utils/util-brand',
      icon: icons.IconBrandMedium,
      breadcrumbs: false
    }
  ]
};

export default utilities;
