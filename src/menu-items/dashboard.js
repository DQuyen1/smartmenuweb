// assets
import { IconDashboard, IconReceipt, IconCreditCard } from '@tabler/icons-react';

// constant
const icons = { IconDashboard, IconReceipt, IconCreditCard };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const dashboard = {
  id: 'dashboard',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.IconDashboard,
      breadcrumbs: false
    },
    {
      id: 'subscription',
      title: 'Subscription',
      type: 'item',
      url: '/dashboard/subscription',
      icon: icons.IconCreditCard,
      breadcrumbs: false
    },
    {
      id: 'transaction',
      title: 'Transaction',
      type: 'item',
      url: '/dashboard/transaction',
      icon: icons.IconReceipt,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
