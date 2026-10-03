import { createApp } from './app.js';

const PORT = process.env.PORT || 5000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Aroom Backend API Server running on port ${PORT}`);
  console.log(`📍 Pilot Campus: UNILAG (University of Lagos)`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base:     http://localhost:${PORT}/api/v1`);
  console.log(`====================================================`);
});
