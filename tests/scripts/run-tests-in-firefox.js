const { execSync } = require('child_process');
const generateReport = require("./generate-report");

function runTestsInFirefox() {
  const browser = 'firefox';
  console.log(`Running tests in Mozilla Firefox...`);

  execSync(`cypress run --browser ${browser} --spec 'tests/e2e/**' --env browserName=${browser}`, { stdio: 'inherit' });
  console.log(`Tests have been executed successfully in Mozilla Firefox`);

  generateReport(browser);
}

runTestsInFirefox();