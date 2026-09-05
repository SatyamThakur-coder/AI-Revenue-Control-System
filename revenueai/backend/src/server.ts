import app from './app';
import { config } from './config/env';

app.listen(config.port, () => {
  console.log(`🚀 RevenueAI Express Backend running on http://localhost:${config.port}`);
});
