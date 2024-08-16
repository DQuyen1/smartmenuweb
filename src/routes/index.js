import { useRoutes } from 'react-router-dom';

// routes
import MainRoutes from './MainRoutes';
import AuthenticationRoutes from './AuthenticationRoutes';
import BrandManagerRoutes from './BrandManagerRoutes';
// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  const userRole = localStorage.getItem('role'); // Get role from localStorage

  // Conditional Rendering of Routes
  return useRoutes(userRole === 'ADMIN' ? [AuthenticationRoutes, MainRoutes] : [AuthenticationRoutes, BrandManagerRoutes]);
}
