describe('product delete test', () => {
  it('visits the employee page and deletes an employee', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'products').click();
    cy.contains('AGNI1234').click();
    cy.get('button').contains('Delete').click();
    cy.contains('deleted!');
  });
});
