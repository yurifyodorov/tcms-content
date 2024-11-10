const { execSync } = require('child_process');
const generateReport = require('./generate-report');

function runTestsInChrome() {
  const browser = 'chrome';
  console.log(`Running tests in Google Chrome...`);

  execSync(`cypress run --browser ${browser} --spec 'tests/e2e/**' --env browserName=${browser}`, { stdio: 'inherit' });
  console.log(`Tests have been executed successfully in Google Chrome`);

  generateReport(browser);
}

runTestsInChrome();