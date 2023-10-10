describe('product add test', () => {
  it('visits the vendor page and adds an vendor', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'products').click();
    cy.contains('control_point').click();
    cy.get('input[formcontrolname=id').click({ force: true }).type('AGNI1234');
    cy.get('mat-select[formcontrolname="vendorid"]').click();
    cy.get('mat-option').contains('Agnita Paul').click();
    cy.get('input[formcontrolname=name]').clear();
    cy.get('input[formcontrolname=name').type('Dell Laptop 13');
    cy.get('input[formcontrolname=costprice]').clear();
    cy.get('input[formcontrolname=costprice').type('1200.90');
    cy.get('input[formcontrolname=msrp]').clear();
    cy.get('input[formcontrolname=msrp').type('1599.99');
    cy.get('.mat-expansion-indicator').eq(0).click();
    cy.get('.mat-expansion-indicator').eq(1).click();

    cy.get('input[formcontrolname=rop]').clear();
    cy.get('input[formcontrolname=rop').type('9');
    cy.get('input[formcontrolname=eoq]').clear();
    cy.get('input[formcontrolname=eoq').type('13');
    cy.get('input[formcontrolname=qoh]').clear();
    cy.get('input[formcontrolname=qoh').type('25');
    cy.get('input[formcontrolname=qoo]').clear();
    cy.get('input[formcontrolname=qoo').type('6');

    cy.get('button').contains('Save').click();
    cy.contains('added!');
  });
});
