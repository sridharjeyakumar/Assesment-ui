import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Button, TextField, Typography,
  Paper, CircularProgress, Alert, Divider
} from '@mui/material'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import { loginStart, loginSuccess, loginFail } from '../../features/auth/authSlice'
import { loginAPI } from '../../features/auth/authAPI'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    email: '',
    password: '',
    domain: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(loginStart())
    try {
      const data = await loginAPI(form)
      dispatch(loginSuccess(data))
      navigate('/dashboard')
    } catch (err) {
      dispatch(loginFail(err.response?.data?.message || 'Login failed'))
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Branding Panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          width: '45%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          color: 'white',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, left: -60,
          width: 240, height: 240, borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }} />

        <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: '16px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            mb: 3, boxShadow: '0 8px 32px rgba(230,57,70,0.4)',
          }}>
            <AccountTreeIcon sx={{ fontSize: 36, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight={800} mb={1}>WorkFlow Pro</Typography>
          <Typography variant="body1" sx={{ opacity: 0.7, mb: 4, lineHeight: 1.6 }}>
            Automate your business processes with powerful visual workflow builder
          </Typography>
          <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', mb: 4 }} />
          {['Multi-tenant workspace support', 'Role-based access control', 'Real-time analytics'].map((feat) => (
            <Box key={feat} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, textAlign: 'left' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#e63946', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ opacity: 0.8 }}>{feat}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Right Form Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f8fafc',
          p: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, borderRadius: '10px',
              background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
            }}>
              <AccountTreeIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
            <Typography variant="h6" fontWeight={700} color="#1a1a2e">WorkFlow Pro</Typography>
          </Box>

          <Box sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: '12px',
            bgcolor: '#1a1a2e', mb: 3,
          }}>
            <LockOutlinedIcon sx={{ color: 'white', fontSize: 22 }} />
          </Box>

          <Typography variant="h4" fontWeight={800} mb={0.5} color="#0f172a">
            Welcome back
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Sign in to your workspace
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Typography variant="caption" fontWeight={600} color="#374151" sx={{ mb: 0.5, display: 'block' }}>
              DOMAIN
            </Typography>
            <TextField
              fullWidth
              name="domain"
              value={form.domain}
              onChange={handleChange}
              margin="none"
              required
              placeholder="e.g. mycompany"
              sx={{ mb: 2.5 }}
              InputProps={{ sx: { borderRadius: 2, bgcolor: 'white' } }}
            />

            <Typography variant="caption" fontWeight={600} color="#374151" sx={{ mb: 0.5, display: 'block' }}>
              EMAIL
            </Typography>
            <TextField
              fullWidth
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              margin="none"
              required
              placeholder="you@company.com"
              sx={{ mb: 2.5 }}
              InputProps={{ sx: { borderRadius: 2, bgcolor: 'white' } }}
            />

            <Typography variant="caption" fontWeight={600} color="#374151" sx={{ mb: 0.5, display: 'block' }}>
              PASSWORD
            </Typography>
            <TextField
              fullWidth
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              margin="none"
              required
              placeholder="••••••••"
              sx={{ mb: 3 }}
              InputProps={{ sx: { borderRadius: 2, bgcolor: 'white' } }}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{
                py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '1rem',
                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                boxShadow: '0 4px 16px rgba(26,26,46,0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #16213e, #0d2b52)' },
              }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>

          <Divider sx={{ my: 3 }}>
            <Typography variant="caption" color="text.secondary">OR</Typography>
          </Divider>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#1976d2', fontWeight: 600, textDecoration: 'none' }}>
              Create workspace
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Login
