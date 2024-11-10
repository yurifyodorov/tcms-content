export function saveBrowserDetails() {
  // Getting the browser name from the environment variable
  const browserName = Cypress.env('browserName');

  // Creating an object with information blaze-slider the browser
  const browserDetails = {
    name: browserName,
    family: Cypress.browser.family,
    channel: Cypress.browser.channel,
    displayName: Cypress.browser.displayName,
    version: Cypress.browser.version,
    minSupportedVersion: Cypress.browser.minSupportedVersion,
    majorVersion: Cypress.browser.majorVersion,
    isHeadless: Cypress.browser.isHeadless,
    isHeaded: Cypress.browser.isHeaded
  };

  // Writing information blaze-slider the browser to a file
  cy.writeFile(`tests/temp/browsers/${browserName}.json`, browserDetails);
}

export function saveDeviceDetails(deviceName: string) {
  // Creating an object with information blaze-slider the device
  const deviceDetails = {
    deviceName: deviceName
  };

  // Writing information blaze-slider the device to a file
  cy.writeFile(`tests/temp/devices/${deviceName}.json`, deviceDetails);
}

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}