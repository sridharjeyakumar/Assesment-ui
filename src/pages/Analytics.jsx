import { useState, useEffect } from 'react'
import {
  Box, Grid, Paper, Typography, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Avatar, Divider
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import BarChartIcon from '@mui/icons-material/BarChart'
import DonutLargeIcon from '@mui/icons-material/DonutLarge'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PeopleIcon from '@mui/icons-material/People'
import Layout from '../components/common/Layout'
import { getDashboardStatsAPI } from '../features/analytics/analyticsAPI'

const COLORS = ['#2e7d32', '#d32f2f', '#1976d2', '#ed6c02']

const StatCard = ({ title, value, color, subtitle, icon }) => (
  <Paper elevation={0} sx={{
    p: 3, borderRadius: 3, bgcolor: 'white', border: '1px solid #e2e8f0',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
      <Box sx={{
        width: 36, height: 36, borderRadius: 2, bgcolor: `${color}18`, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </Box>
    </Box>
    <Typography variant="h4" fontWeight={800} color="#0f172a">{value}</Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary" mt={0.5} display="block">{subtitle}</Typography>
    )}
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    </Layout>
  )

  if (error) return (
    <Layout>
      <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* Page Header */}
        <Box sx={{
          p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
          display: 'flex', alignItems: 'center', gap: 2,
        }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.1)', width: 48, height: 48, borderRadius: 2 }}>
            <BarChartIcon sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={800} color="white">Analytics Dashboard</Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              Monitor your workflow performance and execution trends
            </Typography>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3 }}>
          <StatCard
            title="Total Workflows"
            value={data.summary.totalWorkflows}
            color="#1976d2"
            icon={<AccountTreeIcon fontSize="small" />}
          />
          <StatCard
            title="Total Executions"
            value={data.summary.totalExecutions}
            color="#ed6c02"
            icon={<TrendingUpIcon fontSize="small" />}
          />
          <StatCard
            title="Success Rate"
            value={`${data.summary.successRate}%`}
            color="#2e7d32"
            subtitle={`${data.summary.successCount} successful`}
            icon={<CheckCircleIcon fontSize="small" />}
          />
          <StatCard
            title="Total Users"
            value={data.summary.totalUsers}
            color="#9c27b0"
            icon={<PeopleIcon fontSize="small" />}
          />
        </Box>

        {/* Charts Row — side by side, fixed heights, no stretching */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 3 }}>

          {/* Bar Chart */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <BarChartIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700} color="#0f172a">Executions Last 7 Days</Typography>
            </Box>
            {data.executionsPerDay.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, gap: 1 }}>
                <BarChartIcon sx={{ fontSize: 48, color: '#e2e8f0' }} />
                <Typography variant="body2" color="text.disabled">No executions in the last 7 days</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.executionsPerDay} barSize={18} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="success" fill="#2e7d32" name="Success" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="failed" fill="#d32f2f" name="Failed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>

          {/* Pie Chart */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <DonutLargeIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700} color="#0f172a">Execution Status</Typography>
            </Box>
            {pieData.length === 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, gap: 1 }}>
                <DonutLargeIcon sx={{ fontSize: 48, color: '#e2e8f0' }} />
                <Typography variant="body2" color="text.disabled">No data yet</Typography>
              </Box>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="white"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {pieData.map((entry, index) => (
                    <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                        <Typography variant="body2" color="text.secondary">{entry.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700} color="#0f172a">{entry.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Paper>

        </Box>

        {/* Tables Row — clearly separated below */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>

          {/* Top Workflows */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
            <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTreeIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700} color="#0f172a">Top Workflows</Typography>
            </Box>
            <Divider />
            {data.topWorkflows.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body2" color="text.disabled">No workflow executions yet</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {['Workflow', 'Runs', 'Success', 'Failed'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: '#64748b', fontSize: 12, py: 1.5 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.topWorkflows.map((w) => (
                      <TableRow key={w._id} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0f172a">{w.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="#0f172a">{w.executionCount}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={w.successCount} color="success" size="small"
                            sx={{ borderRadius: 1, fontWeight: 700, height: 22, minWidth: 32 }} />
                        </TableCell>
                        <TableCell>
                          <Chip label={w.failedCount} color="error" size="small"
                            sx={{ borderRadius: 1, fontWeight: 700, height: 22, minWidth: 32 }} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Recent Executions */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', overflow: 'hidden', bgcolor: 'white' }}>
            <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 20 }} />
              <Typography variant="h6" fontWeight={700} color="#0f172a">Recent Executions</Typography>
            </Box>
            <Divider />
            {data.recentExecutions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="body2" color="text.disabled">No recent executions</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                      {['Workflow', 'By', 'Status', 'Time'].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, color: '#64748b', fontSize: 12, py: 1.5 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentExecutions.map((e) => (
                      <TableRow key={e._id} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="#0f172a" noWrap sx={{ maxWidth: 120 }}>
                            {e.workflowId?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 100 }}>
                            {e.triggeredBy?.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={e.status}
                            size="small"
                            sx={{ borderRadius: 1, fontWeight: 600, fontSize: '11px', height: 22 }}
                            color={
                              e.status === 'success' ? 'success' :
                              e.status === 'failed' ? 'error' :
                              e.status === 'running' ? 'primary' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(e.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

        </Box>
      </Box>
    </Layout>
  )
}

export default Analytics
