import { BeforeAll, Then } from "@badeball/cypress-cucumber-preprocessor";

import { MapPage } from "@tests/pages/Map.page";

const page = new MapPage()

// BeforeAll(() => {
//   cy.exec('npx prisma db seed')
// });

Then('I click on feature node', function () {
  page.reactFlowNode.click('test-feature-2-node')
})

Then('I click on image node', function () {
  page.reactFlowNode.click('test-image-node-1')
})

Then('I click on eye icon', function () {
  page.reactFlowNode.toolbar.button.click('eye-icon')
})

Then('I click on setting icon', function () {
  page.reactFlowNode.toolbar.button.click('settings-icon')
})

Then('I click on trash icon', function () {
  page.reactFlowNode.toolbar.button.click('trash-icon')
})

Then('I click on update button', function () {
  page.dialog.form.submit()
})

Then('The node update dialog should be closed', function () {
  page.dialog.isDialogNotVisible()
})

Then('I click on hide toggle', function () {
  page.dialog.form.switch.click()
})


Then('the node become a hidden', function () {
  page.reactFlowNode.getNodeCard('test-feature-2-node').then(($node) => {
    cy.wrap($node).verifyCSS('opacity', '0.5');
  });
  cy.stepScreenshot('hide-node');
});

Then('I am enter a new X position', function () {
  const newX = page.dialog.form.input.enterRandomNumber('x', 200, 1000);
  cy.wrap(newX).as('newX')
})

Then('the node X position should be updated', function () {
  cy.get('@newX').then((newX) => {
    page.reactFlowNode.getNode('test-feature-2-node').then(($node) => {
      const transform = $node[0].style.transform;
      const actualX = (transform.match(/translate\(([^,]+),/) || [])[1]?.trim();
      expect(actualX).to.equal(`${Number(newX)}px`);
    });
  });
  cy.stepScreenshot('new-X-position');
});

Then('I am enter a new Y position', function () {
  const newY = page.dialog.form.input.enterRandomNumber('y', 200, 1000);
  cy.wrap(newY).as('newY')
})

Then('the node Y position should be updated', function () {
  cy.get('@newY').then((newY) => {
    page.reactFlowNode.getNode('test-feature-2-node').then(($node) => {
      const transform = $node[0].style.transform;
      const actualY = (transform.match(/translate\([^,]+,\s*([^)]*)\)/) || [])[1]?.trim();
      expect(actualY).to.equal(`${Number(newY)}px`);
    });
  });
  cy.stepScreenshot('new-Y-position');
});

Then('I am enter a new z-index value', function () {
  const newZ = page.dialog.form.input.enterRandomNumber('zIndex', 50, 99);
  cy.wrap(newZ).as('newZ')
})

Then('the node z-index should be updated', function () {
  const defaultZ = 1000;
  cy.get('@newZ').then((newZ) => {
    const expectedZ = defaultZ + Number(newZ);

    page.reactFlowNode.getNode('test-feature-2-node').then(($node) => {
      const zIndex = Number($node[0].style.zIndex);
      expect(zIndex).to.equal(expectedZ);
    });
  });
})

Then('I am enter a new width value', function () {
  const newWidth = page.dialog.form.input.enterRandomNumber('width', 100, 800);
  cy.wrap(newWidth).as('newWidth');
});

Then('the node width should be updated', function () {
  cy.get('@newWidth').then((newWidth) => {
    const expectedWidth = `${Number(newWidth)}px`;
    page.reactFlowNode.getNodeCard('test-feature-2-node').then(($node) => {
      const width = $node[0].style.width;
      expect(width).to.equal(expectedWidth);
    });
  });
  cy.stepScreenshot('new-node-width');
});

Then('I am enter a new height value', function () {
  const newHeight = page.dialog.form.input.enterRandomNumber('height', 100, 800);
  cy.wrap(newHeight).as('newHeight')
})

Then('the node height should be updated', function () {
  cy.get('@newHeight').then((newHeight) => {
    const expectedHeight = `${Number(newHeight)}px`;
    page.reactFlowNode.getNodeCard('test-feature-2-node').then(($node) => {
      const height = $node[0].style.height;
      expect(height).to.equal(expectedHeight);
    });
  });
  cy.stepScreenshot('new-node-height');
});

Then('I am enter a new scale value', function () {
  const newScale = page.dialog.form.input.enterRandomNumber('scale', 1.1, 2);
  cy.wrap(newScale).as('newScale')
})

Then('the node scale should be updated', function () {
  cy.get('@newScale').then((newScale) => {
    page.reactFlowNode.getNodeCard('test-feature-2-node').then(($node) => {
      const scale = $node[0].style.transform;
      const actualRotation = (scale.match(/scale\(([^)]+)\)/) || [])[1]?.trim();
      expect(actualRotation).to.equal(`${Number(newScale)}`);
    });
  });
  cy.stepScreenshot('new-node-scale');
})

Then('I am enter a new rotation value', function () {
  const newRotation = page.dialog.form.input.enterRandomNumber('rotation', 10, 200);
  cy.wrap(newRotation).as('newRotation')
})

Then('the node rotation should be updated', function () {
  cy.get('@newRotation').then((newRotation) => {
    page.reactFlowNode.getNodeCard('test-feature-2-node').then(($node) => {
      const transform = $node[0].style.transform;
      const actualRotation = (transform.match(/rotate\(([^)]+)\)/) || [])[1]?.trim();
      expect(actualRotation).to.equal(`${Number(newRotation)}deg`);
    });
  });
  cy.stepScreenshot('new-node-rotation');
});

Then('the feature node should not be displayed on the map', function () {
  page.reactFlowNode.getNode('test-feature-2-node').should('not.exist')
  cy.stepScreenshot('remove-feature-node');
})

Then('the image node should not be displayed on the map', function () {
  page.reactFlowNode.getNode('image-node-1').should('not.exist')
  cy.stepScreenshot('remove-image-node');
})