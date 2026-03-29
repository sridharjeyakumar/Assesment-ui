import { useEffect, useState } from 'react'
import { Box, Grid, Paper, Typography, CircularProgress, Avatar, LinearProgress } from '@mui/material'
import { useSelector } from 'react-redux'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import PeopleIcon from '@mui/icons-material/People'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import Layout from '../components/common/Layout'
import { getDashboardStatsAPI } from '../features/analytics/analyticsAPI'

const StatCard = ({ title, value, icon, color, bg }) => (
  <Paper elevation={0} sx={{
    p: 3, borderRadius: 3,
    background: bg,
    border: '1px solid',
    borderColor: `${color}22`,
    position: 'relative',
    overflow: 'hidden',
  }}>
    <Box sx={{
      position: 'absolute', top: -16, right: -16,
      width: 80, height: 80, borderRadius: '50%',
      background: `${color}14`,
    }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>{title}</Typography>
        <Typography variant="h3" fontWeight={800} color="#0f172a">{value}</Typography>
      </Box>
      <Avatar sx={{ bgcolor: `${color}18`, color, width: 48, height: 48, borderRadius: 2 }}>
        {icon}
      </Avatar>
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

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const successRate = stats?.successRate || 0

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          mb: 4, p: 3, borderRadius: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
          color: 'white',
        }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="white">
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
              {tenant?.name} — {user?.role?.toUpperCase()}
            </Typography>
          </Box>
          <Avatar sx={{
            width: 52, height: 52, fontWeight: 700, fontSize: '18px',
            background: 'linear-gradient(135deg, #e63946, #c1121f)',
            boxShadow: '0 4px 16px rgba(230,57,70,0.4)',
          }}>
            {getInitials(user?.name)}
          </Avatar>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3} mb={4}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Workflows"
                  value={stats?.totalWorkflows || 0}
                  icon={<AccountTreeIcon />}
                  color="#1976d2"
                  bg="linear-gradient(135deg, #eff6ff, #dbeafe)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Successful Runs"
                  value={stats?.successCount || 0}
                  icon={<CheckCircleIcon />}
                  color="#2e7d32"
                  bg="linear-gradient(135deg, #f0fdf4, #dcfce7)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Failed Runs"
                  value={stats?.failedCount || 0}
                  icon={<ErrorIcon />}
                  color="#d32f2f"
                  bg="linear-gradient(135deg, #fff5f5, #fee2e2)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Users"
                  value={stats?.totalUsers || 0}
                  icon={<PeopleIcon />}
                  color="#ed6c02"
                  bg="linear-gradient(135deg, #fffbeb, #fed7aa)"
                />
              </Grid>
            </Grid>

            {/* Quick Stats */}
            <Paper elevation={0} sx={{
              p: 3, borderRadius: 3,
              border: '1px solid #e2e8f0',
              bgcolor: 'white',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingUpIcon sx={{ color: '#1976d2' }} />
                <Typography variant="h6" fontWeight={700} color="#0f172a">
                  Quick Stats
                </Typography>
              </Box>
              <Grid container spacing={4}>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        Success Rate
                      </Typography>
                      <Typography variant="body2" fontWeight={700} color="#2e7d32">
                        {successRate}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={successRate}
                      sx={{
                        height: 8, borderRadius: 4,
                        bgcolor: '#f1f5f9',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #2e7d32, #4caf50)',
                        },
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Total Executions
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#0f172a">
                      {stats?.totalExecutions || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </>
        )}
      </Box>
    </Layout>
  )
}

export default Dashboard
