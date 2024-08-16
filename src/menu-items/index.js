import dashboard from './dashboard';
// import pages from './pages';
import utilities from './utilities';
import entities from './entities';
import other from './other';
import brandManagerUtilities from './brandManagerUtilities';
import brandManagerEntities from './brandManagerEntities';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, utilities, entities, other], // Initial items for ADMIN
  brandManagerItems: [dashboard, brandManagerUtilities, brandManagerEntities, other]
};

export default menuItems;
