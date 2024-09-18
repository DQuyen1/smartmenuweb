// assets
import { IconUsers, IconBuildingStore, IconBrandMedium, IconWindmill, IconPackage } from '@tabler/icons-react';

// constant
const icons = {
  IconUsers,
  IconBuildingStore,
  IconBrandMedium,
  IconWindmill,
  IconPackage
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const brandManagerUtilities = {
  id: 'utilities',
  type: 'group',
  children: [
    {
      id: 'util-staffs',
      title: 'Staffs',
      type: 'item',
      url: '/utils/util-staffs',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'util-mybrand',
      title: 'Brand',
      type: 'item',
      url: '/utils/util-mybrand',
      icon: icons.IconBrandMedium,
      breadcrumbs: false
    },
    {
      id: 'util-mystore',
      title: 'Stores',
      type: 'item',
      url: '/utils/util-mystore',
      icon: icons.IconBuildingStore,
      breadcrumbs: false
    },
    {
      id: 'util-mycategory',
      title: 'Category',
      type: 'item',
      url: '/utils/util-mycategory',
      icon: icons.IconPackage,
      breadcrumbs: false
    },
    {
      id: 'util-mycollection',
      title: 'Collection',
      type: 'item',
      url: '/utils/util-mycollection',
      icon: icons.IconPackage,
      breadcrumbs: false
    },
    {
      id: 'util-mymenu',
      title: 'Menu',
      type: 'item',
      url: '/utils/util-mymenu',
      icon: icons.IconPackage,
      breadcrumbs: false
    },
    {
      id: 'util-mytemplate',
      title: 'Template',
      type: 'item',
      url: '/utils/util-mytemplate',
      icon: icons.IconPackage,
      breadcrumbs: false
    },
    {
      id: 'util-display',
      title: 'Display',
      type: 'item',
      url: 'pages/choose-template',
      icon: icons.IconWindmill,
      breadcrumbs: false
    }
  ]
};

export default brandManagerUtilities;
