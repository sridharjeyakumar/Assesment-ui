import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Button, TextField, Typography,
  Paper, CircularProgress, Alert
} from '@mui/material'
import { loginStart, loginSuccess, loginFail } from '../../features/auth/authSlice'
import { registerAPI } from '../../features/auth/authAPI'

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useSelector((state) => state.auth)

  const [form, setForm] = useState({
    tenantName: '',
    domain: '',
    adminName: '',
    email: '',
    password: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(loginStart())
    try {
      const data = await registerAPI(form)
      dispatch(loginSuccess(data))
      navigate('/dashboard')
    } catch (err) {
      dispatch(loginFail(err.response?.data?.message || 'Registration failed'))
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 2 }}>
        <Typography variant="h5" fontWeight={700} mb={1} textAlign="center">
          Create Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
          Register your organization
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Organization Name"
            name="tenantName"
            value={form.tenantName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Domain"
            name="domain"
            value={form.domain}
            onChange={handleChange}
            margin="normal"
            required
            placeholder="e.g. mycompany"
          />
          <TextField
            fullWidth
            label="Your Name"
            name="adminName"
            value={form.adminName}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>
        </form>

        <Typography variant="body2" textAlign="center">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#1976d2' }}>
            Login here
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}

export default Register
