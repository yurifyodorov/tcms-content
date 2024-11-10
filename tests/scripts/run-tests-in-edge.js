const { execSync } = require('child_process');
const generateReport = require("./generate-report");

function runTestsInEdge() {
  const browser = 'edge';
  console.log(`Running tests in Microsoft Edge...`);

  execSync(`cypress run --browser ${browser} --spec 'tests/e2e/**' --env browserName=${browser}`, { stdio: 'inherit' });
  console.log(`Tests have been executed successfully in Microsoft Edge`);

  generateReport(browser);
}

runTestsInEdge();