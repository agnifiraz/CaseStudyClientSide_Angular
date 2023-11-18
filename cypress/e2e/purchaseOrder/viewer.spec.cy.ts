describe('generate expense purchaseOrder test', () => {
  it('visits the viewer page and selects an vendor and purchaseOrder', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'viewer').click();
    cy.wait(500); // http call
    cy.get('mat-select[formcontrolname="vendorid"]').click();
    cy.contains('Agnita Paul').click();
    cy.wait(500); // http call
    cy.get('mat-select[formcontrolname="purchaseOrderid"]').click({
      force: true,
    });
    cy.contains('11/17/23').click({ force: true });

    cy.contains('Created on');
  });
});
