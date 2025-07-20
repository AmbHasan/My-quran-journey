export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    message: 'Backend is working!',
    timestamp: new Date().toISOString()
  })
}
