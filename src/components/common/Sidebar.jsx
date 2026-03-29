import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Drawer, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Typography, Divider,
  Button, Chip, Paper, Avatar
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import BarChartIcon from '@mui/icons-material/BarChart'
import PeopleIcon from '@mui/icons-material/People'
import LogoutIcon from '@mui/icons-material/Logout'
import ShieldIcon from '@mui/icons-material/Shield'
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

  const filteredMenu = menuItems.filter(item =>
    item.roles.includes(user?.role)
  )

  const roleColor = {
    admin: '#e63946',
    manager: '#457b9d',
    viewer: '#2d6a4f',
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

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
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        },
      }}
    >
      {/* Logo / Brand */}
      <Box sx={{
        p: 2.5,
        background: 'linear-gradient(135deg, #16213e 0%, #0f3460 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(230,57,70,0.4)',
          }}>
            <AccountTreeIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="white" lineHeight={1.2}>
              WorkFlow Pro
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>
              {tenant?.name}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{
          width: 38, height: 38, fontSize: '14px', fontWeight: 700,
          bgcolor: roleColor[user?.role] || '#555',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}>
          {getInitials(user?.name)}
        </Avatar>
        <Box sx={{ overflow: 'hidden' }}>
          <Typography variant="body2" color="white" fontWeight={600} noWrap>
            {user?.name}
          </Typography>
          <Chip
            label={user?.role?.toUpperCase()}
            size="small"
            sx={{
              height: 18, fontSize: '9px', fontWeight: 700,
              bgcolor: roleColor[user?.role],
              color: 'white',
              borderRadius: '4px',
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mx: 2 }} />

      {/* Navigation */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant="caption" sx={{
          color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700,
          letterSpacing: '0.08em', px: 1.5, display: 'block', mb: 0.5,
        }}>
          NAVIGATION
        </Typography>
        <List disablePadding>
          {filteredMenu.map((item) => {
            const active = isActive(item.path)
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: '10px',
                    py: 1,
                    pl: 1.5,
                    position: 'relative',
                    bgcolor: active ? 'rgba(230,57,70,0.15)' : 'transparent',
                    '&:hover': { bgcolor: active ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.06)' },
                    '&::before': active ? {
                      content: '""',
                      position: 'absolute',
                      left: 0, top: '25%', bottom: '25%',
                      width: 3, borderRadius: '0 3px 3px 0',
                      bgcolor: '#e63946',
                    } : {},
                  }}
                >
                  <ListItemIcon sx={{
                    color: active ? '#e63946' : 'rgba(255,255,255,0.45)',
                    minWidth: 36,
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{
                      primary: {
                        fontSize: 14,
                        fontWeight: active ? 600 : 400,
                        color: active ? 'white' : 'rgba(255,255,255,0.6)',
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Box>

      {/* Bottom: Permissions + Logout */}
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Box sx={{
          p: 1.5, mb: 2, borderRadius: '10px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <ShieldIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
            <Typography variant="caption" color="rgba(255,255,255,0.4)" fontWeight={600} sx={{ fontSize: '10px', letterSpacing: '0.06em' }}>
              PERMISSIONS
            </Typography>
          </Box>
          {user?.role === 'admin' && (
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              ✅ Full Access
            </Typography>
          )}
          {user?.role === 'manager' && (
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              ✅ Create & Edit Workflows
            </Typography>
          )}
          {user?.role === 'viewer' && (
            <Typography variant="caption" color="rgba(255,255,255,0.7)">
              👁 View Only
            </Typography>
          )}
        </Box>

        <Button
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: 'rgba(255,255,255,0.5)',
            justifyContent: 'flex-start',
            borderRadius: '10px',
            py: 1,
            '&:hover': {
              bgcolor: 'rgba(230,57,70,0.1)',
              color: '#e63946',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  )
}

export default Sidebar
