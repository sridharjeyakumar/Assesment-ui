import { useState, useEffect } from 'react'
import {
  Box, Paper, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Chip, IconButton, Alert, CircularProgress, Avatar, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import Layout from '../components/common/Layout'
import { getUsersAPI, createUserAPI, updateUserAPI, deleteUserAPI } from '../features/auth/userAPI'

const roleColors = {
  admin: 'error',
  manager: 'primary',
  viewer: 'success',
}

const roleAvatarColors = {
  admin: '#d32f2f',
  manager: '#1976d2',
  viewer: '#2e7d32',
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
  })

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getUsersAPI()
      setUsers(data.users)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = async () => {
    try {
      await createUserAPI(form)
      setOpenCreate(false)
      setForm({ name: '', email: '', password: '', role: 'viewer' })
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleEdit = async () => {
    try {
      await updateUserAPI(selectedUser._id, { role: form.role, isActive: true })
      setOpenEdit(false)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await deleteUserAPI(id)
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const openEditDialog = (user) => {
    setSelectedUser(user)
    setForm({ ...form, role: user.role })
    setOpenEdit(true)
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0f172a">User Management</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {users.length} member{users.length !== 1 ? 's' : ''} in your workspace
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreate(true)}
            sx={{
              borderRadius: 2, fontWeight: 600, px: 3,
              background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              boxShadow: '0 4px 12px rgba(26,26,46,0.25)',
              '&:hover': { background: 'linear-gradient(135deg, #16213e, #0d2b52)' },
            }}
          >
            Add User
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ background: 'linear-gradient(135deg, #1a1a2e, #0f3460)' }}>
                    {['Name', 'Email', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, borderBottom: 'none', py: 1.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <PeopleIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                          No users found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={2}>
                          Add your first user to the workspace
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={() => setOpenCreate(true)}
                          sx={{ borderRadius: 2 }}
                        >
                          Add User
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, idx) => (
                      <TableRow
                        key={user._id}
                        hover
                        sx={{
                          bgcolor: idx % 2 === 0 ? 'white' : '#fafafa',
                          '&:hover': { bgcolor: '#eff6ff' },
                          '&:last-child td': { borderBottom: 'none' },
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{
                              width: 36, height: 36, fontSize: '13px', fontWeight: 700,
                              bgcolor: roleAvatarColors[user.role] || '#555',
                              borderRadius: '10px',
                            }}>
                              {getInitials(user.name)}
                            </Avatar>
                            <Typography fontWeight={600} color="#0f172a" fontSize={14}>
                              {user.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role.toUpperCase()}
                            color={roleColors[user.role]}
                            size="small"
                            sx={{ borderRadius: 1, fontWeight: 700, fontSize: '11px' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ borderRadius: 1, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Edit Role">
                              <IconButton
                                size="small"
                                onClick={() => openEditDialog(user)}
                                sx={{ bgcolor: '#eff6ff', color: '#1976d2', borderRadius: 1.5, '&:hover': { bgcolor: '#dbeafe' } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete User">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(user._id)}
                                sx={{ bgcolor: '#fff5f5', color: '#d32f2f', borderRadius: 1.5, '&:hover': { bgcolor: '#fee2e2' } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {/* Create User Dialog */}
        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Add New User</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth label="Name" margin="normal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth label="Email" type="email" margin="normal"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth label="Password" type="password" margin="normal"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate}
              sx={{
                borderRadius: 2, fontWeight: 600,
                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              }}>
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Edit User Role</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Avatar sx={{
                width: 40, height: 40, fontWeight: 700,
                bgcolor: roleAvatarColors[selectedUser?.role] || '#555',
                borderRadius: '10px',
              }}>
                {getInitials(selectedUser?.name)}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={600}>{selectedUser?.name}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedUser?.email}</Typography>
              </Box>
            </Box>
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                value={form.role}
                label="Role"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                sx={{ borderRadius: 2 }}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
                <MenuItem value="viewer">Viewer</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpenEdit(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleEdit}
              sx={{
                borderRadius: 2, fontWeight: 600,
                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              }}>
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}

export default Users
