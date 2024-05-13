// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add("loginViaFrontProduto", () => {
  cy.visit(Cypress.env('URL_PRODUTO'))
  let title
  cy.title().then((pageTitle) => {
    title = pageTitle;
    if (title === 'Produto') {
      cy.get('input[name="username"]')
        .type(Cypress.env('FRONTEND_PRODUTO_USERNAME'))
      cy.get('input[name="password"]')
        .type(Cypress.env('FRONTEND_PRODUTO_PASSWORD'), { log: false })
      cy.get('input[type="submit"]')
        .click()
      cy.get('span[id=select2-dir-container]')
        .should('be.visible')
    } else {
      throw new Error("503 Service Temporarily Unavailable")
    }
  })
});

Cypress.Commands.add("logoffViaFrontProduto", () => {
  cy.get('a[href="/?ctr=home&mt=logout"]')
    .should('be.visible')
    .click()
});

Cypress.Commands.add('produtoFiltro', (caixapostal, diretorio, nome_arq) => {
  cy.get('input[name="name"]').type(`${caixapostal}`) //buscando o diretorio BCOBRASILBSB3
  cy.get('button[type="submit"]').click() //clicando na lupa
  cy.get('.name > a').click() //clicando no diretorio BCOBRASILBSB3
  cy.get(`[meta-location="/${caixapostal}/ENTRADA"] > .name > a`).click() //clicando no diretorio entrada
  cy.document().then((doc) => {
    const elemento = doc.querySelectorAll(`input[value="/${caixapostal}/ENTRADA/${nome_arq}"]`)
    if (elemento.length > 0) {
      cy.get(`input[value="/${caixapostal}/ENTRADA/${nome_arq}"]`).click();
      cy.get('button[id="delete"]').click();
      cy.contains('h3.popover-title', 'Deseja apagar?').should('exist');
      cy.get('div.popover.fade.right.in[id^="popover"]')
        .find('button.btn.btn-warning.delete-yes')
        .click();
      cy.get(`input[value="/${caixapostal}/ENTRADA/${nome_arq}"]`, { timeout: 5000 }).should('not.exist');
    }
  });
  cy.get('#upload').click() //clicando no icone upload de arquivo
  cy.get('#btn-file').click() //clicando no botao upload
  // Obtenha o caminho completo do arquivo a ser enviado
  const filePath = `${diretorio}/${nome_arq}`;
  // Anexando o arquivo ao elemento de input oculto
  cy.get('input[type="file"]').attachFile(filePath);
  cy.get('#send-file').click() //clicando no botao salvar
  cy.get(`input[value="/${caixapostal}/ENTRADA/${nome_arq}"]`).click() //selecionando arquivo a ser processado
  cy.get(`[meta-location="/${caixapostal}/ENTRADA/${nome_arq}"] > .workbench > ul > [data-original-title="Processar"] > .process > .glyphicon`).click() //clicando no icone processar
  cy.get('#process-formato', { timeout: 6000 }).click() //escolhendo o formato na tela Processar arquivo
  cy.get('#send-process-formato', { timeout: 6000 }).click().then(() => {
    cy.get('.ui-pnotify-title', { timeout: 10000 } ).should('not.be.visible')
  });
  cy.get('#process-modal > .modal-dialog > .modal-content > .modal-header > .close', { timeout: 10000 }).should('be.visible').click(); //fechando tela Processar arquivo
});

