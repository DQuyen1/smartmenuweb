import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// material-ui
import { ButtonBase } from '@mui/material';

// project imports
import config from 'config';
// import Logo from 'ui-component/Logo';
import { MENU_OPEN } from 'store/actions';
import Logo from 'assets/images/icons/logosmartmenu.svg';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => {
  const defaultId = useSelector((state) => state.customization.defaultId);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return (
    <ButtonBase
      disableRipple
      onClick={() => dispatch({ type: MENU_OPEN, id: defaultId })}
      component={Link}
      to={config.defaultPath}
      sx={{ width: '100%', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
    >
      {/* <Logo /> */}
      {/* <h1 style={{ color: 'purple', fontSize: '20px' }}>SMART MENU</h1> */}
      <img src={Logo} alt="Smart Menu Logo" style={{ width: '170px', height: '50px' }} />
    </ButtonBase>
  );
};

export default LogoSection;
