import { useState, useEffect } from 'react'
import {
  Box, Grid, Paper, Typography, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line
} from 'recharts'
import Layout from '../components/common/Layout'
import { getDashboardStatsAPI } from '../features/analytics/analyticsAPI'

const COLORS = ['#2e7d32', '#d32f2f', '#1976d2', '#ed6c02']

const StatCard = ({ title, value, color, subtitle }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, borderLeft: `4px solid ${color}` }}>
    <Typography variant="body2" color="text.secondary">{title}</Typography>
    <Typography variant="h4" fontWeight={700} mt={1} color={color}>{value}</Typography>
    {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
  </Paper>
)

const Analytics = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStatsAPI()
        setData(result)
      } catch (err) {
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <Layout>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    </Layout>
  )

  if (error) return (
    <Layout>
      <Alert severity="error">{error}</Alert>
    </Layout>
  )

  const pieData = [
    { name: 'Success', value: data.summary.successCount },
    { name: 'Failed', value: data.summary.failedCount },
    { name: 'Pending', value: data.summary.pendingCount },
    { name: 'Running', value: data.summary.runningCount },
  ].filter(d => d.value > 0)

  return (
    <Layout>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Analytics Dashboard
        </Typography>

        {/* Summary Cards */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Workflows"
              value={data.summary.totalWorkflows}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Executions"
              value={data.summary.totalExecutions}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Success Rate"
              value={`${data.summary.successRate}%`}
              color="#2e7d32"
              subtitle={`${data.summary.successCount} successful`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={data.summary.totalUsers}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={4}>
          {/* Executions Per Day */}
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Executions Last 7 Days
              </Typography>
              {data.executionsPerDay.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No executions in last 7 days
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.executionsPerDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="success" fill="#2e7d32" name="Success" />
                    <Bar dataKey="failed" fill="#d32f2f" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>

          {/* Pie Chart */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Execution Status
              </Typography>
              {pieData.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={4}>
                  No data yet
                </Typography>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Top Workflows */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Top Workflows
              </Typography>
              {data.topWorkflows.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No workflow executions yet
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Workflow</strong></TableCell>
                        <TableCell><strong>Runs</strong></TableCell>
                        <TableCell><strong>Success</strong></TableCell>
                        <TableCell><strong>Failed</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.topWorkflows.map((w) => (
                        <TableRow key={w._id} hover>
                          <TableCell>{w.name}</TableCell>
                          <TableCell>{w.executionCount}</TableCell>
                          <TableCell>
                            <Chip label={w.successCount} color="success" size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={w.failedCount} color="error" size="small" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>

          {/* Recent Executions */}
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Recent Executions
              </Typography>
              {data.recentExecutions.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" py={2}>
                  No recent executions
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Workflow</strong></TableCell>
                        <TableCell><strong>By</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Time</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.recentExecutions.map((e) => (
                        <TableRow key={e._id} hover>
                          <TableCell>{e.workflowId?.name}</TableCell>
                          <TableCell>{e.triggeredBy?.name}</TableCell>
                          <TableCell>
                            <Chip
                              label={e.status}
                              size="small"
                              color={
                                e.status === 'success' ? 'success' :
                                e.status === 'failed' ? 'error' :
                                e.status === 'running' ? 'primary' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {new Date(e.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Layout>
  )
}

export default Analytics
