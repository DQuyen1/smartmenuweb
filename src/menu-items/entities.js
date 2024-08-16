// assets
import { IconTemplate, IconToolsKitchen2, IconCooker, IconFile } from '@tabler/icons-react';

// constant
const icons = {
  IconTemplate,
  IconToolsKitchen2,
  IconCooker,
  IconFile
};

// ==============================|| ENTITIES MENU ITEMS ||============================== //

const entities = {
  id: 'entities',
  title: 'Entities',
  type: 'group',
  children: [
    {
      id: 'entity-template',
      title: 'Template',
      type: 'item',
      url: '/entities/entity-template',
      icon: icons.IconTemplate,
      breadcrumbs: false
    },
    {
      id: 'entity-menu',
      title: 'Menu',
      type: 'item',
      url: '/entities/entity-menu',
      icon: icons.IconToolsKitchen2,
      breadcrumbs: false
    },
    {
      id: 'entity-collection',
      title: 'Collection',
      type: 'item',
      url: '/entities/entity-collection',
      icon: icons.IconCooker,
      breadcrumbs: false
    },
    {
      id: 'entity-font',
      title: 'Font',
      type: 'item',
      url: '/entities/entity-font',
      icon: icons.IconFile,
      breadcrumbs: false
    }
  ]
};

export default entities;
