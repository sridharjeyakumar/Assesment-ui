import { useState, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ReactFlow, {
  MiniMap, Controls, Background,
  addEdge, useNodesState, useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Box, Typography, Button, Alert, CircularProgress,
  Paper, Chip, Divider, TextField, Select, MenuItem,
  FormControl, InputLabel, IconButton
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import CloseIcon from '@mui/icons-material/Close'
import { getWorkflowByIdAPI, updateWorkflowAPI, triggerWorkflowAPI } from '../features/workflow/workflowAPI'

const nodeTypes_config = [
  { type: 'start', label: 'Start', color: '#2e7d32', description: 'Starting point' },
  { type: 'action', label: 'Action', color: '#1976d2', description: 'Perform an action' },
  { type: 'condition', label: 'Condition', color: '#ed6c02', description: 'Branch condition' },
  { type: 'end', label: 'End', color: '#d32f2f', description: 'End point' },
]

const actionTypes = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_notification', label: 'Send Notification' },
  { value: 'update_database', label: 'Update Database' },
  { value: 'call_api', label: 'Call API' },
  { value: 'create_user', label: 'Create User' },
  { value: 'assign_role', label: 'Assign Role' },
]

const conditionTypes = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
]

const getNodeStyle = (type, selected = false) => {
  const colors = {
    start: { background: '#e8f5e9', border: `2px solid #2e7d32`, color: '#2e7d32' },
    action: { background: '#e3f2fd', border: `2px solid #1976d2`, color: '#1976d2' },
    condition: { background: '#fff3e0', border: `2px solid #ed6c02`, color: '#ed6c02' },
    end: { background: '#ffebee', border: `2px solid #d32f2f`, color: '#d32f2f' },
  }
  return {
    ...colors[type],
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    minWidth: 120,
    textAlign: 'center',
    boxShadow: selected ? '0 0 0 3px #1976d2' : 'none',
  }
}

let nodeId = 0
const getId = () => `node_${++nodeId}`

const WorkflowBuilder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [workflow, setWorkflow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Selected node for config panel
  const [selectedNode, setSelectedNode] = useState(null)
  const [nodeConfig, setNodeConfig] = useState({})

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const data = await getWorkflowByIdAPI(id)
        setWorkflow(data.workflow)
        if (data.workflow.nodes?.length > 0) {
          setNodes(data.workflow.nodes.map(n => ({
            ...n,
            style: getNodeStyle(n.type),
          })))
        }
        if (data.workflow.edges?.length > 0) {
          setEdges(data.workflow.edges)
        }
      } catch (err) {
        setError('Failed to load workflow')
      } finally {
        setLoading(false)
      }
    }
    fetchWorkflow()
  }, [id])

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  // Click node to open config panel
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node)
    setNodeConfig(node.data.config || {})

    // Highlight selected node
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: getNodeStyle(n.nodeType || n.type, n.id === node.id),
      }))
    )
  }, [setNodes])

  // Close config panel
  const closeConfigPanel = () => {
    setSelectedNode(null)
    setNodeConfig({})
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        style: getNodeStyle(n.nodeType || n.type, false),
      }))
    )
  }

  // Save node config
  const saveNodeConfig = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                label: nodeConfig.label || n.data.label,
                config: nodeConfig,
              },
              style: getNodeStyle(n.nodeType || n.type, false),
            }
          : n
      )
    )
    setSelectedNode(null)
    setNodeConfig({})
    setSuccess('Node config saved!')
    setTimeout(() => setSuccess(null), 2000)
  }

  const addNode = (type) => {
    const defaultLabels = {
      start: 'Start',
      action: 'New Action',
      condition: 'Check Condition',
      end: 'End',
    }
    const newNode = {
      id: getId(),
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: defaultLabels[type], config: {} },
      style: getNodeStyle(type),
      nodeType: type,
    }
    setNodes((nds) => [...nds, newNode])
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const saveNodes = nodes.map(n => ({
        id: n.id,
        type: n.nodeType || 'action',
        position: n.position,
        data: n.data,
      }))
      await updateWorkflowAPI(id, {
        name: workflow.name,
        description: workflow.description,
        nodes: saveNodes,
        edges: edges,
      })
      setSuccess('Workflow saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to save workflow')
    } finally {
      setSaving(false)
    }
  }

  const handleTrigger = async () => {
    try {
      await triggerWorkflowAPI(id)
      setSuccess('Workflow triggered successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to trigger workflow')
    }
  }

  // Render config panel based on node type
  const renderConfigPanel = () => {
    if (!selectedNode) return null
    const type = selectedNode.nodeType || selectedNode.type

    return (
      <Box sx={{
        width: 280,
        bgcolor: 'white',
        borderLeft: '1px solid #e0e0e0',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Node Config
          </Typography>
          <IconButton size="small" onClick={closeConfigPanel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Chip
          label={type.toUpperCase()}
          size="small"
          sx={{
            mb: 2,
            width: 'fit-content',
            bgcolor: type === 'start' ? '#e8f5e9' : type === 'action' ? '#e3f2fd' : type === 'condition' ? '#fff3e0' : '#ffebee',
            color: type === 'start' ? '#2e7d32' : type === 'action' ? '#1976d2' : type === 'condition' ? '#ed6c02' : '#d32f2f',
          }}
        />

        {/* Label - all nodes */}
        <TextField
          fullWidth
          label="Node Label"
          size="small"
          margin="normal"
          value={nodeConfig.label || selectedNode.data.label}
          onChange={(e) => setNodeConfig({ ...nodeConfig, label: e.target.value })}
        />

        <TextField
          fullWidth
          label="Description"
          size="small"
          margin="normal"
          multiline
          rows={2}
          placeholder="What does this node do?"
          value={nodeConfig.description || ''}
          onChange={(e) => setNodeConfig({ ...nodeConfig, description: e.target.value })}
        />

        <Divider sx={{ my: 2 }} />

        {/* Action Node Config */}
        {type === 'action' && (
          <>
            <Typography variant="caption" color="text.secondary" mb={1}>
              ACTION SETTINGS
            </Typography>
            <FormControl fullWidth size="small" margin="normal">
              <InputLabel>Action Type</InputLabel>
              <Select
                value={nodeConfig.actionType || ''}
                label="Action Type"
                onChange={(e) => setNodeConfig({ ...nodeConfig, actionType: e.target.value })}
              >
                {actionTypes.map((a) => (
                  <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {nodeConfig.actionType === 'send_email' && (
              <>
                <TextField
                  fullWidth size="small" margin="normal"
                  label="To Email"
                  placeholder="user@example.com"
                  value={nodeConfig.toEmail || ''}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, toEmail: e.target.value })}
                />
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Subject"
                  placeholder="Email subject"
                  value={nodeConfig.subject || ''}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, subject: e.target.value })}
                />
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Body"
                  multiline rows={3}
                  placeholder="Email body..."
                  value={nodeConfig.body || ''}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, body: e.target.value })}
                />
              </>
            )}

            {nodeConfig.actionType === 'call_api' && (
              <>
                <TextField
                  fullWidth size="small" margin="normal"
                  label="API URL"
                  placeholder="https://api.example.com/endpoint"
                  value={nodeConfig.apiUrl || ''}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, apiUrl: e.target.value })}
                />
                <FormControl fullWidth size="small" margin="normal">
                  <InputLabel>Method</InputLabel>
                  <Select
                    value={nodeConfig.method || 'GET'}
                    label="Method"
                    onChange={(e) => setNodeConfig({ ...nodeConfig, method: e.target.value })}
                  >
                    <MenuItem value="GET">GET</MenuItem>
                    <MenuItem value="POST">POST</MenuItem>
                    <MenuItem value="PUT">PUT</MenuItem>
                    <MenuItem value="DELETE">DELETE</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}

            {nodeConfig.actionType === 'assign_role' && (
              <FormControl fullWidth size="small" margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={nodeConfig.role || ''}
                  label="Role"
                  onChange={(e) => setNodeConfig({ ...nodeConfig, role: e.target.value })}
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                  <MenuItem value="viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            )}

            {nodeConfig.actionType === 'update_database' && (
              <>
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Collection"
                  placeholder="users"
                  value={nodeConfig.collection || ''}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, collection: e.target.value })}
                />
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Field to Update"
                  placeholder="status"
                  value={nodeConfig.field || ''}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, field: e.target.value })}
                />
                <TextField
                  fullWidth size="small" margin="normal"
                  label="Value"
                  placeholder="active"
                  value={nodeConfig.value || ''}
                  onChange={(e) => setNodeConfig({ ...nodeConfig, value: e.target.value })}
                />
              </>
            )}
          </>
        )}

        {/* Condition Node Config */}
        {type === 'condition' && (
          <>
            <Typography variant="caption" color="text.secondary" mb={1}>
              CONDITION SETTINGS
            </Typography>
            <TextField
              fullWidth size="small" margin="normal"
              label="Field to Check"
              placeholder="user.role"
              value={nodeConfig.field || ''}
              onChange={(e) => setNodeConfig({ ...nodeConfig, field: e.target.value })}
            />
            <FormControl fullWidth size="small" margin="normal">
              <InputLabel>Operator</InputLabel>
              <Select
                value={nodeConfig.operator || ''}
                label="Operator"
                onChange={(e) => setNodeConfig({ ...nodeConfig, operator: e.target.value })}
              >
                {conditionTypes.map((c) => (
                  <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth size="small" margin="normal"
              label="Value"
              placeholder="manager"
              value={nodeConfig.conditionValue || ''}
              onChange={(e) => setNodeConfig({ ...nodeConfig, conditionValue: e.target.value })}
            />
            <TextField
              fullWidth size="small" margin="normal"
              label="True Path Label"
              placeholder="Yes"
              value={nodeConfig.truePath || ''}
              onChange={(e) => setNodeConfig({ ...nodeConfig, truePath: e.target.value })}
            />
            <TextField
              fullWidth size="small" margin="normal"
              label="False Path Label"
              placeholder="No"
              value={nodeConfig.falsePath || ''}
              onChange={(e) => setNodeConfig({ ...nodeConfig, falsePath: e.target.value })}
            />
          </>
        )}

        {/* Start Node Config */}
        {type === 'start' && (
          <>
            <Typography variant="caption" color="text.secondary" mb={1}>
              TRIGGER SETTINGS
            </Typography>
            <FormControl fullWidth size="small" margin="normal">
              <InputLabel>Trigger Type</InputLabel>
              <Select
                value={nodeConfig.triggerType || ''}
                label="Trigger Type"
                onChange={(e) => setNodeConfig({ ...nodeConfig, triggerType: e.target.value })}
              >
                <MenuItem value="manual">Manual</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="event">On Event</MenuItem>
              </Select>
            </FormControl>
            {nodeConfig.triggerType === 'event' && (
              <TextField
                fullWidth size="small" margin="normal"
                label="Event Name"
                placeholder="user.created"
                value={nodeConfig.eventName || ''}
                onChange={(e) => setNodeConfig({ ...nodeConfig, eventName: e.target.value })}
              />
            )}
          </>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={saveNodeConfig}
          sx={{ mt: 2 }}
        >
          Apply Config
        </Button>
      </Box>
    )
  }

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left Panel */}
      <Box sx={{ width: 220, bgcolor: '#1a1a2e', color: 'white', p: 2, display: 'flex', flexDirection: 'column' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/workflows')}
          sx={{ color: 'grey.400', justifyContent: 'flex-start', mb: 2 }}
        >
          Back
        </Button>

        <Typography variant="subtitle2" color="grey.400" mb={1}>WORKFLOW</Typography>
        <Typography variant="body1" fontWeight={700} color="white" mb={1}>
          {workflow?.name}
        </Typography>
        <Chip
          label={`v${workflow?.version}`}
          size="small"
          sx={{ bgcolor: '#16213e', color: 'white', mb: 2, width: 'fit-content' }}
        />

        <Divider sx={{ bgcolor: 'grey.700', mb: 2 }} />

        <Typography variant="subtitle2" color="grey.400" mb={1}>ADD NODES</Typography>
        <Typography variant="caption" color="grey.500" mb={2}>
          Click to add → Click node to configure
        </Typography>

        {nodeTypes_config.map((node) => (
          <Paper
            key={node.type}
            onClick={() => addNode(node.type)}
            sx={{
              p: 1.5, mb: 1, cursor: 'pointer', bgcolor: '#16213e',
              border: `1px solid ${node.color}`,
              borderRadius: 1,
              '&:hover': { bgcolor: '#0f3460' }
            }}
          >
            <Typography variant="body2" fontWeight={600} sx={{ color: node.color }}>
              {node.label}
            </Typography>
            <Typography variant="caption" color="grey.500">
              {node.description}
            </Typography>
          </Paper>
        ))}

        <Box sx={{ mt: 'auto' }}>
          <Button
            fullWidth variant="contained" color="success"
            startIcon={<PlayArrowIcon />}
            onClick={handleTrigger}
            sx={{ mb: 1 }}
          >
            Trigger
          </Button>
          <Button
            fullWidth variant="contained"
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>

      {/* Canvas */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        {error && (
          <Alert severity="error" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {!selectedNode && (
          <Box sx={{
            position: 'absolute', top: 10, left: 10, zIndex: 10,
            bgcolor: 'rgba(0,0,0,0.6)', color: 'white',
            px: 2, py: 1, borderRadius: 1
          }}>
            <Typography variant="caption">
              💡 Click any node to configure it
            </Typography>
          </Box>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </Box>

      {/* Right Config Panel */}
      {renderConfigPanel()}
    </Box>
  )
}

export default WorkflowBuilder
