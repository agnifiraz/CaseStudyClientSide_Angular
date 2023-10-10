describe('vendor update test', () => {
  it('visits the vendor page and updates an vendor', () => {
    cy.visit('/');
    cy.get('button').click();
    cy.contains('a', 'vendors').click();
    cy.contains('John Doe').click(); // replace Slick with your own name
    cy.get("[type='email']").clear();
    cy.get("[type='email']").type('johndoe@updateddomain.com');
    cy.get('button').contains('Save').click();
    cy.contains('updated!');
  });
});
