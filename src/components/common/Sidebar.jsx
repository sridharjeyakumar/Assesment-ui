import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider, Button, Chip
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import LogoutIcon from '@mui/icons-material/Logout'
import { logout } from '../../features/auth/authSlice'

const DRAWER_WIDTH = 240

const Sidebar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, tenant } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['admin', 'manager', 'viewer'] },
    { text: 'Workflows', icon: <AccountTreeIcon />, path: '/workflows', roles: ['admin', 'manager', 'viewer'] },
    { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', roles: ['admin', 'manager', 'viewer'] },
    { text: 'Users', icon: <PeopleIcon />, path: '/users', roles: ['admin'] },
  ]

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role))

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#1a1a2e',
          color: 'white',
        },
      }}
    >
      <Box sx={{ p: 2, mt: 1 }}>
        <Typography variant="h6" fontWeight={700} color="white">
          WorkFlow Pro
        </Typography>
        <Typography variant="caption" color="grey.400">
          {tenant?.name}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: 'grey.700' }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="grey.400">
          {user?.name}
        </Typography>
        <br />
        <Chip
          label={user?.role?.toUpperCase()}
          size="small"
          sx={{
            mt: 0.5,
            bgcolor: user?.role === 'admin' ? '#e63946' : user?.role === 'manager' ? '#457b9d' : '#2d6a4f',
            color: 'white',
            fontSize: '10px'
          }}
        />
      </Box>

      <Divider sx={{ bgcolor: 'grey.700' }} />

      <List sx={{ mt: 1 }}>
        {filteredMenu.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 1,
                '&.Mui-selected': {
                  bgcolor: '#16213e',
                  '&:hover': { bgcolor: '#16213e' },
                },
                '&:hover': { bgcolor: '#16213e' },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? '#e63946' : 'grey.400', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: 14,
                  color: location.pathname === item.path ? 'white' : 'grey.400'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ color: 'grey.400', justifyContent: 'flex-start' }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  )
}

export default Sidebar
