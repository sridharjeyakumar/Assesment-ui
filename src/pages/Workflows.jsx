import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Paper, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  Avatar, Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import Layout from '../components/common/Layout'
import {
  getWorkflowsAPI,
  createWorkflowAPI,
  deleteWorkflowAPI,
  triggerWorkflowAPI,
} from '../features/workflow/workflowAPI'

const Workflows = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const isViewer = user?.role === 'viewer'
  const isAdmin = user?.role === 'admin'

  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const data = await getWorkflowsAPI()
      setWorkflows(data.workflows)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWorkflows() }, [])

  const handleCreate = async () => {
    try {
      const data = await createWorkflowAPI(form)
      setOpenCreate(false)
      setForm({ name: '', description: '' })
      navigate(`/workflows/${data.workflow._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create workflow')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this workflow?')) return
    try {
      await deleteWorkflowAPI(id)
      fetchWorkflows()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete workflow')
    }
  }

  const handleTrigger = async (id) => {
    try {
      await triggerWorkflowAPI(id)
      setSuccess('Workflow triggered successfully!')
      setTimeout(() => setSuccess(null), 3000)
      fetchWorkflows()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to trigger workflow')
    }
  }

  const getWorkflowInitials = (name) => {
    if (!name) return 'W'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const avatarColors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#e63946']
  const getAvatarColor = (name) => avatarColors[(name?.charCodeAt(0) || 0) % avatarColors.length]

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0f172a">Workflows</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} in your workspace
            </Typography>
          </Box>
          {!isViewer && (
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
              New Workflow
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{
                    background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
                  }}>
                    {['Name', 'Description', 'Version', 'Executions', 'Created By', 'Actions'].map((h) => (
                      <TableCell key={h} sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, borderBottom: 'none', py: 1.5 }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workflows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <AccountTreeIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1.5 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight={600}>
                          No workflows yet
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={2}>
                          Create your first workflow to get started
                        </Typography>
                        {!isViewer && (
                          <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenCreate(true)}
                            sx={{ borderRadius: 2 }}
                          >
                            Create Workflow
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    workflows.map((workflow, idx) => (
                      <TableRow
                        key={workflow._id}
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
                              width: 34, height: 34, fontSize: '12px', fontWeight: 700,
                              bgcolor: getAvatarColor(workflow.name),
                              borderRadius: '8px',
                            }}>
                              {getWorkflowInitials(workflow.name)}
                            </Avatar>
                            <Typography fontWeight={600} color="#0f172a" fontSize={14}>
                              {workflow.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                            {workflow.description || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`v${workflow.version}`} size="small" color="primary" variant="outlined"
                            sx={{ borderRadius: 1, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0f172a">
                            {workflow.executionCount}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {workflow.createdBy?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            {isViewer ? (
                              <Tooltip title="View">
                                <IconButton size="small" onClick={() => navigate(`/workflows/${workflow._id}`)}
                                  sx={{ bgcolor: '#eff6ff', color: '#1976d2', borderRadius: 1.5, '&:hover': { bgcolor: '#dbeafe' } }}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            ) : (
                              <>
                                <Tooltip title="Run">
                                  <IconButton size="small" onClick={() => handleTrigger(workflow._id)}
                                    sx={{ bgcolor: '#f0fdf4', color: '#2e7d32', borderRadius: 1.5, '&:hover': { bgcolor: '#dcfce7' } }}>
                                    <PlayArrowIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit">
                                  <IconButton size="small" onClick={() => navigate(`/workflows/${workflow._id}`)}
                                    sx={{ bgcolor: '#eff6ff', color: '#1976d2', borderRadius: 1.5, '&:hover': { bgcolor: '#dbeafe' } }}>
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {isAdmin && (
                                  <Tooltip title="Delete">
                                    <IconButton size="small" onClick={() => handleDelete(workflow._id)}
                                      sx={{ bgcolor: '#fff5f5', color: '#d32f2f', borderRadius: 1.5, '&:hover': { bgcolor: '#fee2e2' } }}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </>
                            )}
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

        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Create New Workflow</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth label="Workflow Name" margin="normal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
            <TextField
              fullWidth label="Description" margin="normal" multiline rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={() => setOpenCreate(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate}
              sx={{
                borderRadius: 2, fontWeight: 600,
                background: 'linear-gradient(135deg, #1a1a2e, #0f3460)',
              }}>
              Create & Edit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}

export default Workflows
