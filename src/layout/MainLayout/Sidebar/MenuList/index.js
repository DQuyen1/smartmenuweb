// material-ui
import { Typography } from '@mui/material';

import { useEffect, useState } from 'react';

// project imports
import NavGroup from './NavGroup';
import menuItem from 'menu-items';

// ==============================|| SIDEBAR MENU LIST ||============================== //

const MenuList = () => {
  const [itemsToRender, setItemsToRender] = useState(menuItem.items); // Default to menuItem.items

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setItemsToRender(userRole === 'BRAND_MANAGER' ? menuItem.brandManagerItems : menuItem.items);
  }, []);

  const navItems = itemsToRender.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <>{navItems}</>;
};

export default MenuList;
