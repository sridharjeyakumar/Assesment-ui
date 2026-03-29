import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Box, Paper, Typography, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import VisibilityIcon from '@mui/icons-material/Visibility'
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

  return (
    <Layout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700}>Workflows</Typography>
          {!isViewer && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
              New Workflow
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Version</strong></TableCell>
                  <TableCell><strong>Executions</strong></TableCell>
                  <TableCell><strong>Created By</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workflows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography color="text.secondary" py={3}>
                        No workflows yet!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  workflows.map((workflow) => (
                    <TableRow key={workflow._id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{workflow.name}</Typography>
                      </TableCell>
                      <TableCell>{workflow.description || '-'}</TableCell>
                      <TableCell>
                        <Chip label={`v${workflow.version}`} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>{workflow.executionCount}</TableCell>
                      <TableCell>{workflow.createdBy?.name}</TableCell>
                      <TableCell>
                        {isViewer ? (
                          <IconButton size="small" color="primary" onClick={() => navigate(`/workflows/${workflow._id}`)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        ) : (
                          <>
                            <IconButton size="small" color="success" onClick={() => handleTrigger(workflow._id)}>
                              <PlayArrowIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="primary" onClick={() => navigate(`/workflows/${workflow._id}`)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {isAdmin && (
                              <IconButton size="small" color="error" onClick={() => handleDelete(workflow._id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Workflow</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth label="Workflow Name" margin="normal"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              fullWidth label="Description" margin="normal" multiline rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate}>Create & Edit</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}

export default Workflows
