import { useEffect, useState } from 'react'
import { Box, Grid, Paper, Typography, CircularProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import PeopleIcon from '@mui/icons-material/People'
import Layout from '../components/common/Layout'
import { getDashboardStatsAPI } from '../features/analytics/analyticsAPI'

const StatCard = ({ title, value, icon, color }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 2, borderLeft: `4px solid ${color}` }}>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h4" fontWeight={700} mt={1}>{value}</Typography>
      </Box>
      <Box sx={{ color, fontSize: 40 }}>{icon}</Box>
    </Box>
  </Paper>
)

const Dashboard = () => {
  const { user, tenant } = useSelector((state) => state.auth)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStatsAPI()
        setStats(data.summary)
      } catch (err) {
        console.error('Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <Layout>
      <Box>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {tenant?.name} — {user?.role?.toUpperCase()}
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Workflows"
                value={stats?.totalWorkflows || 0}
                icon={<AccountTreeIcon fontSize="inherit" />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Successful Runs"
                value={stats?.successCount || 0}
                icon={<CheckCircleIcon fontSize="inherit" />}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Failed Runs"
                value={stats?.failedCount || 0}
                icon={<ErrorIcon fontSize="inherit" />}
                color="#d32f2f"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Users"
                value={stats?.totalUsers || 0}
                icon={<PeopleIcon fontSize="inherit" />}
                color="#ed6c02"
              />
            </Grid>
          </Grid>
        )}

        <Paper elevation={2} sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={600} mb={1}>
            Quick Stats
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Success Rate: {stats?.successRate || 0}% —
            Total Executions: {stats?.totalExecutions || 0}
          </Typography>
        </Paper>
      </Box>
    </Layout>
  )
}

export default Dashboard
