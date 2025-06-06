import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import ManageTransaction from 'views/dashboard/Transaction';
// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const ManageSubscription = Loadable(lazy(() => import('views/dashboard/Subscription')));
// utilities routing
const UtilsUser = Loadable(lazy(() => import('views/utilities/User')));
const UtilsBrand = Loadable(lazy(() => import('views/utilities/Brand')));
const UtilsStore = Loadable(lazy(() => import('views/utilities/Store')));
const UtilsProduct = Loadable(lazy(() => import('views/utilities/Product')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));
// sample entities routing
const EntityTemplate = Loadable(lazy(() => import('views/entity/Template')));
const EntityMenu = Loadable(lazy(() => import('views/entity/Menu')));
const EntityCollection = Loadable(lazy(() => import('views/entity/Collection')));
const EntityFont = Loadable(lazy(() => import('views/entity/Font')));
// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const StoreDetails = Loadable(lazy(() => import('views/sample-page/StoreDetails')));
const ProductDetails = Loadable(lazy(() => import('views/sample-page/ProductDetails')));
const TemplateDetails = Loadable(lazy(() => import('views/sample-page/TemplateDetails')));
const MenuDetails = Loadable(lazy(() => import('views/sample-page/MenuDetails')));
const CollectionDetails = Loadable(lazy(() => import('views/sample-page/CollectionDetails')));
const BrandStaffDetails = Loadable(lazy(() => import('views/sample-page/BrandStaffDetails')));
const AdminChooseTemplate = Loadable(lazy(() => import('views/sample-page/AdminChooseTemplate')));
const UserProfile = Loadable(lazy(() => import('views/sample-page/UserProfile')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <UtilsUser />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <UtilsUser />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-user',
          element: <UtilsUser />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-brand',
          element: <UtilsBrand />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-transaction',
          element: <ManageTransaction />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-subscription',
          element: <ManageSubscription />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-font',
          element: <EntityFont />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-product',
          element: <UtilsProduct />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'tabler-icons',
          element: <UtilsTablerIcons />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'material-icons',
          element: <UtilsMaterialIcons />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'store-details',
      element: <StoreDetails />
    },
    {
      path: 'product-details',
      element: <ProductDetails />
    },
    {
      path: 'template-details',
      element: <TemplateDetails />
    },
    {
      path: 'menu-details',
      element: <MenuDetails />
    },
    {
      path: 'collection-details',
      element: <CollectionDetails />
    },
    {
      path: 'brandstaff-details',
      element: <BrandStaffDetails />
    },
    {
      path: 'user-profile',
      element: <UserProfile />
    }
  ]
};

export default MainRoutes;
