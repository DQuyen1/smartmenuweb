import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
// utilities routing
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));

const UtilsStaffs = Loadable(lazy(() => import('views/brandmanagerutilities/Staffs')));
const UtilsMyBrand = Loadable(lazy(() => import('views/brandmanagerutilities/MyBrand')));
const UtilsMyProduct = Loadable(lazy(() => import('views/brandmanagerutilities/MyProduct')));
const UtilsMyCategory = Loadable(lazy(() => import('views/brandmanagerutilities/MyCategory')));
const UtilsMyCollection = Loadable(lazy(() => import('views/brandmanagerentities/MyCollection')));
const UtilsMyMenu = Loadable(lazy(() => import('views/brandmanagerentities/MyMenu')));
const UtilsMyTemplate = Loadable(lazy(() => import('views/brandmanagerentities/MyTemplate')));
const UtilsMyStore = Loadable(lazy(() => import('views/brandmanagerutilities/MyStore')));
// sample entities routing
const EntityTemplate = Loadable(lazy(() => import('views/entity/Template')));
const EntityMenu = Loadable(lazy(() => import('views/entity/Menu')));
// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));
const MyStoreDetails = Loadable(lazy(() => import('views/sample-page/MyStoreDetails')));
const MyTemplateDetails = Loadable(lazy(() => import('views/sample-page/MyTemplateDetails')));
const ManageTransaction = Loadable(lazy(() => import('views/dashboard/Transaction')));
const MyMenuDetails = Loadable(lazy(() => import('views/sample-page/MyMenuDetails')));
const MyProductDetails = Loadable(lazy(() => import('views/sample-page/MyProductDetails')));
const MyCollectionDetails = Loadable(lazy(() => import('views/sample-page/MyCollectionDetails')));
const StaffDetails = Loadable(lazy(() => import('views/sample-page/StaffDetails')));
const UserProfile = Loadable(lazy(() => import('views/sample-page/UserProfile')));

const BrandManagerRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <UtilsMyBrand />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-staffs',
          element: <UtilsStaffs />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-mybrand',
          element: <UtilsMyBrand />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-myproduct',
          element: <UtilsMyProduct />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-mycategory',
          element: <UtilsMyCategory />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-mycollection',
          element: <UtilsMyCollection />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-mymenu',
          element: <UtilsMyMenu />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-mytemplate',
          element: <UtilsMyTemplate />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-mystore',
          element: <UtilsMyStore />
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
      path: 'entities',
      children: [
        {
          path: 'entity-template',
          element: <EntityTemplate />
        },
        {
          path: 'entity-menu',
          element: <EntityMenu />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'my-store-details',
      element: <MyStoreDetails />
    },
    {
      path: 'my-template-details',
      element: <MyTemplateDetails />
    },
    {
      path: 'my-menu-details',
      element: <MyMenuDetails />
    },
    {
      path: 'my-product-details',
      element: <MyProductDetails />
    },
    {
      path: 'my-collection-details',
      element: <MyCollectionDetails />
    },
    {
      path: 'staff-details',
      element: <StaffDetails />
    },
    {
      path: 'user-profile',
      element: <UserProfile />
    }
  ]
};

export default BrandManagerRoutes;
