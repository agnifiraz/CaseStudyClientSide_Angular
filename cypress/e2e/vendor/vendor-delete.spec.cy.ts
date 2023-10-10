describe('vendor delete test', () => {
  it('visits the vendor page and deletes an vendor', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'vendors').click();
    cy.contains('John Doe').click();
    cy.get('button').contains('Delete').click();
    cy.contains('deleted!');
  });
});
