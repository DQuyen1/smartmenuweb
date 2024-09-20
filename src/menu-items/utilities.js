// assets
import { IconUsers, IconHistory, IconBrandMedium, IconWindmill, IconPackage, IconTemplate, IconFile } from '@tabler/icons-react';

// constant
const icons = {
  IconUsers,
  IconHistory,
  IconBrandMedium,
  IconWindmill,
  IconPackage,
  IconTemplate,
  IconFile
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'utilities',
  title: 'Management',
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
    },
    {
      id: 'util-font',
      title: 'Fonts',
      type: 'item',
      url: '/utils/util-font',
      icon: icons.IconFile,
      breadcrumbs: false
    },
    {
      id: 'util-transaction',
      title: 'Transactions',
      type: 'item',
      url: '/utils/util-transaction',
      icon: icons.IconHistory,
      breadcrumbs: false
    },
    {
      id: 'util-subscription',
      title: 'Subscriptions',
      type: 'item',
      url: '/utils/util-subscription',
      icon: icons.IconPackage,
      breadcrumbs: false
    }
  ]
};

export default utilities;
