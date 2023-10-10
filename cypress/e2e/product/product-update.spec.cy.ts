describe('product update test', () => {
  it('visits the product page and updates an product', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'products').click();
    cy.contains('AGNI1234').click();
    cy.get('input[formcontrolname=costprice]').clear();
    cy.get('input[formcontrolname=costprice]').type('1090.98');
    cy.get('button').contains('Save').click();
    cy.contains('updated!');
  });
});
