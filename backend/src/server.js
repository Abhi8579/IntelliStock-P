const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n  IntelliStock Pro API`);
  console.log(`  ➜  Running at http://localhost:${PORT}`);
  console.log(`  ➜  Health check: http://localhost:${PORT}/api/health\n`);
});
