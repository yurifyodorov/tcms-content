const { generate } = require('multiple-cucumber-html-reporter');
const fs = require('fs');

function generateReport(browser) {
  const browserDetails = getBrowserDetails(browser);

  if (!browserDetails) {
    console.error('Browser details not found. Exiting...');
    process.exit(1);
  }

// Get current date
  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, '0');
  const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  const year = currentDate.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const generateConfig = {
    reportName: `NextJS in ${browser.charAt(0).toUpperCase() + browser.slice(1)}`,
    jsonDir: "tests/reports/",
    reportPath: `tests/reports/${formattedDate}/${browser}`,
    pageTitle: `NextJS in ${browser.charAt(0).toUpperCase() + browser.slice(1)}`,
    pageFooter: "<div style='padding: 30px; font-size: 30px'>NextJS Starter template</div>",
    displayDuration: true,
    displayReportTime: true,
    openReportInBrowser: false,
    metadata: {
      browser: {
        name: browserDetails.name,
        version: browserDetails.version
      },
      device: "localhost",
      platform: {
        name: "ubuntu",
        version: "22.04"
      }
    },
    customData: {
      title: 'Run info',
      data: [
        {
          label: 'Project',
          value: 'NextJS Starter'
        },
        {
          label: 'Release',
          value: '#00000'
        },
        {
          label: 'Cycle',
          value: 'B11221.34321'
        },
        {
          label: 'Execution Start Time',
          value: new Date().toLocaleString()
        },
        {
          label: 'Execution End Time',
          value: new Date().toLocaleString()
        }
      ]
    }
  };

  // Generating a report
  generate(generateConfig);
  console.log(`Report generated successfully in: ${generateConfig.reportPath}`);
}

function getBrowserDetails(browser) {
  let browserDetailsFileName = '';

  // Determining the file name depending on the browser
  if (browser === 'chrome') {
    browserDetailsFileName = 'chrome.json';
  } else if (browser === 'firefox') {
    browserDetailsFileName = 'firefox.json';
  } else if (browser === 'edge') {
    browserDetailsFileName = 'edge.json';
  }

  // Checking file availability
  if (fs.existsSync(`tests/temp/browsers/${browserDetailsFileName}`)) {
    const stringifyData = fs.readFileSync(`tests/temp/browsers/${browserDetailsFileName}`, 'utf-8');
    return JSON.parse(stringifyData);
  } else {
    console.error(`Browser details file not found for ${browser}`);
    return null;
  }
}

module.exports = generateReport;