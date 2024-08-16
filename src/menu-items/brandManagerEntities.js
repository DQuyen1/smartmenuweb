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

const brandManagerEntities = {
  id: 'entities',
  title: 'Entities',
  type: 'group',
  children: [
    {
      id: 'util-mycollection',
      title: 'My Collection',
      type: 'item',
      url: '/utils/util-mycollection',
      icon: icons.IconPackage,
      breadcrumbs: false
    },
    {
      id: 'util-mymenu',
      title: 'My Menu',
      type: 'item',
      url: '/utils/util-mymenu',
      icon: icons.IconPackage,
      breadcrumbs: false
    },
    {
      id: 'util-mytemplate',
      title: 'My Template',
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

export default brandManagerEntities;
