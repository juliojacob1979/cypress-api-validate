// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commandsconst sego39Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 43 - SEGO'].find((obj) => obj.code === 'SEGO9');
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

/// <reference types="Cypress" />

import {
  generationDays_Date_Json, copyevidenciaFile, limpezaFile, saveFileinDirectory, generationDays_Date_CNAB, generationDays_CompetenciaMesAno_CNAB,
  generationDays_PeriodoApuracao_CNAB, generationDays_Anobase_CNAB, generationDays_Anobase_Json, generationDays_Competencia_Json,
} from '../support/commands-utilities'

Cypress.Commands.add("loginViaAPI", () => {
  cy.request({
    method: "POST",
    url: Cypress.env('API_SERVER') + "/login",
    headers: {
      'Content-Type': 'application/json'
    },
    failOnStatusCode: true,
    body: {
      "username": Cypress.env('API_USERNAME'),
      "password": Cypress.env('API_PASSWORD')
    },
    timeout: 30000
  })
    .then((response) => {
      return response;
    })
    .its('status')
    .should('eq', 200);
});

Cypress.Commands.add("postSchema", (base64, layout, direction, status = false) => {
  cy.request({
    method: "POST",
    url: Cypress.env('API_LAYOUTS') + "/schema",
    headers: {
      accept: "application/json",
    },
    body: {
      "base64": base64,
      "layout": layout,
      "direction": direction
    },
    failOnStatusCode: status
  })
})

Cypress.Commands.add("postUpload", (base64, layout, direction, status = false) => {
  cy.request({
    method: "POST",
    url: Cypress.env('API_LAYOUTS') + "/upload",
    headers: {
      accept: "application/json",
    },
    body: {
      "base64": base64,
      "layout": layout,
      "direction": direction
    },
    failOnStatusCode: status
  })
});

Cypress.Commands.add('validateJSON', (responseBody, referenceBody) => {
  const responseLines = JSON.stringify(responseBody, null, 2).split('\n');
  const referenceLines = JSON.stringify(referenceBody, null, 2).split('\n');

  const maxLength = Math.max(responseLines.length, referenceLines.length);

  const errorMessages = [];

  for (let i = 0; i < maxLength; i++) {
    const responseLine = responseLines[i];
    const referenceLine = referenceLines[i];

    if (responseLine !== referenceLine) {
      const errorMessage = `Diferença encontrada na linha ${i + 1}:\n\n` +
        `Response: ${responseLine}\n` +
        `Reference: ${referenceLine}\n`;

      errorMessages.push(errorMessage);
    }
  }
  if (errorMessages.length > 0) {
    const allErrorMessages = errorMessages.join('\n');
    const finalErrorMessage = `Diferenças encontradas nos arquivos JSON:\n\n${allErrorMessages}`;
    Cypress.log({ message: finalErrorMessage });
    throw new Error(finalErrorMessage);
  } else {
    expect(JSON.stringify(responseBody)).to.eq(JSON.stringify(referenceBody));
  }
});

Cypress.Commands.add("postInvoice", (authorization, payload, status = false) => {
  cy.request({
    method: "POST",
    url: Cypress.env('API_SERVER') + "/invoice",
    headers: {
      accept: "application/json",
      authorization,
    },
    body: payload,
    failOnStatusCode: status,
    timeout: 30000
  })
});

Cypress.Commands.add("getInvoice", (authorization, JMS_correlation_ID) => {
  const makeRequest = () => {
    return cy.request({
      method: "GET",
      url: Cypress.env('API_SERVER') + "/invoice/" + JMS_correlation_ID,
      headers: {
        authorization
      },
      failOnStatusCode: false
    })
  };

  const processResponse = (response) => {
    // Log do código de resposta
    cy.log(`Código de resposta: ${response.status}`);

    // Verifique se o código da resposta é 200
    if (response.status === 200) {
      return cy.wrap(response);
    } else if (response.status === 404) {
      // Se o código da resposta for 304, espere um tempo e faça a requisição novamente
      cy.log('Recebido código 404. Aguardando e fazendo outra tentativa...');
      return cy.wait(5000).then(() => makeRequest().then(processResponse));
    } else {
      cy.log(`Código de resposta inesperado: ${response.status}`);
      return null;
    }
  };
  // Inicie a requisição
  return makeRequest().then(processResponse);
})

Cypress.Commands.add('CapturaID', (nomeArquivo) => {
  const makeRequest = () => {
    const dataAtual = new Date();
    const dataArquivo = dataAtual.toISOString().split('T')[0]; // Formata para o formato 'YYYY-MM-DD'
    const tokenFixo = Cypress.env('TOKEN_WEBHOOK'); // Substitua pelo seu token fixo

    return cy.request({
      method: 'GET',
      url: Cypress.env('URL_WEBHOOK'),
      headers: {
        'x-access-token': tokenFixo,
      },
      qs: {
        filename: nomeArquivo,
        filedate: dataArquivo,
      },
      failOnStatusCode: false,
    });
  };

  const processResponse = (response) => {
    // Log do código de resposta
    cy.log(`Código de resposta: ${response.status}`);

    // Log do corpo da resposta
    cy.log('Corpo da resposta:', response.body);

    // Verifique se o código da resposta é 200
    if (response.status === 200) {
      if (response.body.tracking && response.body.tracking.length > 0) {
        const trackingList = response.body.tracking;
        const ultimoCorrelationId = trackingList[trackingList.length - 1].correlation_id;
        const ultimoStatus = trackingList[trackingList.length - 1].status;

        if (ultimoCorrelationId && ultimoStatus === "Disponível para retirada") {
          cy.log('Último Correlation ID:', ultimoCorrelationId);
          return cy.wrap(ultimoCorrelationId);
        } else {
          if (!ultimoCorrelationId) {
            cy.log('Último Correlation ID inválido.');
          }
          if (ultimoStatus === "Aguardando Tratativa") {
            throw new Error(`Status inesperado recebido: "Aguardando Tratativa"`);
          }
          if (ultimoStatus !== "Disponível para retirada") {
            cy.log(`Último status não é "Disponível para retirada". Atualmente status => '${ultimoStatus}' <= , realizando uma nova consulta...`);
            return cy.wait(5000).then(() => makeRequest().then(processResponse));
          }
          return null;
        }
      } else {
        cy.log('A resposta não contém o formato esperado. Aguardando e fazendo outra tentativa...');
        return cy.wait(15000).then(() => makeRequest().then(processResponse));
      }
    } else if (response.status === 304) {
      // Se o código da resposta for 304, espere um tempo e faça a requisição novamente
      cy.log('Recebido código 304. Aguardando e fazendo outra tentativa...');
      return cy.wait(5000).then(() => makeRequest().then(processResponse));
    } else {
      cy.log(`Código de resposta inesperado: ${response.status}`);
      return null;
    }
  };

  // Inicie a requisição
  return makeRequest().then(processResponse);
});

Cypress.Commands.add('deletarWebhooks', () => {
  // Realiza uma requisição para obter a lista de webhooks
  cy.request({
    method: 'GET',
    url: Cypress.env('URL_WEBHOOK'),
  }).then((response) => {
    // Verifica se a resposta é 200 OK
    expect(response.status).to.eq(200);

    // Obtém a lista de webhooks do corpo da resposta
    const webhooks = response.body;

    // Itera sobre cada webhook e realiza a requisição DELETE
    cy.wrap(webhooks).each((webhook) => {
      const url = Cypress.env('URL_WEBHOOK')+`${webhook.id}`;

      // Realiza a requisição DELETE
      cy.request({
        method: 'DELETE',
        url: url,
      }).then((deleteResponse) => {
        // Verifica se a resposta é 200 OK
        expect(deleteResponse.status).to.eq(200);

        cy.log(`Webhook com ID ${webhook.id} deletado com sucesso.`);

        cy.wait(1000); // 1000 milissegundos (1 segundo), ajuste conforme necessário
      });
    });
  });
});


Cypress.Commands.add("sendWebhookNotification", (scenarioName) => {
  const data = { text: `Cenário quebrado: ${scenarioName}` };
  cy.request({
    method: "POST",
    url: Cypress.env('URL_WEBHOOK_CHAT'),
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
    failOnStatusCode: true,
    body: JSON.stringify(data),
  })
    .then((response) => {
      return response;
    })
    .its('status')
    .should('eq', 200);
});

Cypress.Commands.add('caseFailedScenario', () => {
  if (Cypress.mocha.getRunner().suite.ctx.currentTest.state === 'failed') {
    const currentTest = Cypress.mocha.getRunner().suite.ctx.currentTest;
    const scenarioName = currentTest.title;
    const failedContexts = getFailedContexts(currentTest);
    const scenarioInfo = `${failedContexts.reverse().join('\n')} \n ${scenarioName}`;
    cy.log(scenarioInfo);
    cy.sendWebhookNotification(scenarioInfo);
  }
});

function getFailedContexts(currentTest, contexts = []) {
  if (currentTest.parent) {
    contexts.push(currentTest.parent.title);
    return getFailedContexts(currentTest.parent, contexts);
  }
  return contexts;
}

export function generation_PAYLOAD_COB_BB_240() {
  return cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q').then(function (COBRANCA_REMESSA_seg_P_Q) {
    this.payload_modelo_COBRANCA = COBRANCA_REMESSA_seg_P_Q.payload_modelo_COBRANCA
    this.payload_ABERTURA_COB_BB = COBRANCA_REMESSA_seg_P_Q.payload_ABERTURA_COB_BB
    this.payload_INVOICE_COB_BB = COBRANCA_REMESSA_seg_P_Q.payload_INVOICE_COB_BB
    let result = generationDays_Date_Json(30)
    let result2 = generationDays_Date_Json(0)
    this.payload_COBRANCA_001_LAY240 = JSON.parse(JSON.stringify(this.payload_modelo_COBRANCA));
    this.payload_COBRANCA_001_LAY240.invoices[0].invoice.title_due_date = JSON.parse(JSON.stringify(result));
    this.payload_COBRANCA_001_LAY240.invoices[0].invoice.title_issue_date = JSON.parse(JSON.stringify(result2));
    this.payload_COBRANCA_001_LAY240.company = JSON.parse(JSON.stringify(this.payload_ABERTURA_COB_BB));
    this.payload_COBRANCA_001_LAY240.invoices[0].invoice.bank_slip_emission_id = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_BB.bank_slip_emission_id));
    this.payload_COBRANCA_001_LAY240.invoices[0].invoice.demanding_bank_branch = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_BB.demanding_bank_branch));
    saveFileinDirectory('cypress/fixtures/COBRANCA/LAY240/PAYLOAD', 'COB_BB_240', this.payload_COBRANCA_001_LAY240)
  });
}

export function generation_PAYLOAD_COB_SANTANDER_240_H7815() {
  return cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q').then(function (COBRANCA_REMESSA_seg_P_Q) {
    this.payload_modelo_COBRANCA = COBRANCA_REMESSA_seg_P_Q.payload_modelo_COBRANCA
    this.payload_ABERTURA_COB_SANTANDER_H7815 = COBRANCA_REMESSA_seg_P_Q.payload_ABERTURA_COB_SANTANDER_H7815
    this.payload_INVOICE_COB_SANTANDER_H7815 = COBRANCA_REMESSA_seg_P_Q.payload_INVOICE_COB_SANTANDER_H7815
    let result = generationDays_Date_Json(30)
    let result2 = generationDays_Date_Json(0)
    this.payload_COBRANCA_033_LAY240_H7815 = JSON.parse(JSON.stringify(this.payload_modelo_COBRANCA));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.title_due_date = JSON.parse(JSON.stringify(result));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.title_issue_date = JSON.parse(JSON.stringify(result2));
    this.payload_COBRANCA_033_LAY240_H7815.company = JSON.parse(JSON.stringify(this.payload_ABERTURA_COB_SANTANDER_H7815));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.our_number = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_H7815.our_number));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.demanding_bank_branch = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_H7815.demanding_bank_branch));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.billing_document_number = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_H7815.billing_document_number));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.title_form_of_registration = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_H7815.title_form_of_registration));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.document_type = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_H7815.document_type));
    this.payload_COBRANCA_033_LAY240_H7815.invoices[0].invoice.close_code = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_H7815.close_code));
    saveFileinDirectory('cypress/fixtures/COBRANCA/LAY240/PAYLOAD', 'COB_SANTANDER_240_H7815', this.payload_COBRANCA_033_LAY240_H7815)
  })
}

export function generation_PAYLOAD_COB_SANTANDER_240_FEB() {
  return cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q').then(function (COBRANCA_REMESSA_seg_P_Q) {
    this.payload_modelo_COBRANCA = COBRANCA_REMESSA_seg_P_Q.payload_modelo_COBRANCA
    this.payload_ABERTURA_COB_SANTANDER_FEB = COBRANCA_REMESSA_seg_P_Q.payload_ABERTURA_COB_SANTANDER_FEB
    this.payload_INVOICE_COB_SANTANDER_FEB = COBRANCA_REMESSA_seg_P_Q.payload_INVOICE_COB_SANTANDER_FEB
    let result = generationDays_Date_Json(30)
    let result2 = generationDays_Date_Json(0)
    this.payload_COBRANCA_033_LAY240_FEB = JSON.parse(JSON.stringify(this.payload_modelo_COBRANCA));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.title_due_date = JSON.parse(JSON.stringify(result));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.title_issue_date = JSON.parse(JSON.stringify(result2));
    this.payload_COBRANCA_033_LAY240_FEB.company = JSON.parse(JSON.stringify(this.payload_ABERTURA_COB_SANTANDER_FEB));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.our_number = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_FEB.our_number));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.demanding_bank_branch = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_FEB.demanding_bank_branch));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.billing_document_number = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_FEB.billing_document_number));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.title_form_of_registration = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_FEB.title_form_of_registration));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.document_type = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_FEB.document_type));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.close_code = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_FEB.close_code));
    this.payload_COBRANCA_033_LAY240_FEB.invoices[0].invoice.bank_slip_emission_id = JSON.parse(JSON.stringify(this.payload_INVOICE_COB_SANTANDER_FEB.bank_slip_emission_id));
    saveFileinDirectory('cypress/fixtures/COBRANCA/LAY240/PAYLOAD', 'COB_SANTANDER_240_FEB', this.payload_COBRANCA_033_LAY240_FEB)
  })
}

export function validateValidadorLayouts(path, prefix, layout_vl, direction_vl, path_destino = false) {
  cy.task('listFiles', { path: path, prefix: prefix }).then((filePath) => {
    cy.readFile(filePath, 'utf8')
      .then((fileContent) => {
        const base64Content = btoa(fileContent);
        const layout = layout_vl
        const direction = direction_vl
        const base64 = `"${base64Content}"`
        cy.log(base64);

        cy.postUpload(base64, layout, direction, true).then(function (response) {
          expect(response.status).to.eq(200)
          if (response.body.error === "Arquivo sem erros encontrado.") {
            expect(response.body.error).to.eq("Arquivo sem erros encontrado.")
          } else {
            throw new Error(`Error inesperado recebido: ${JSON.stringify(response.body)}`)
          }
        })

        cy.postSchema(base64, layout, direction, true).then(function (response) {
          expect(response.status).to.eq(200)

          cy.wrap(null).then(() => {
            if (layout === "COBRANCA_001_240_REM") {

              return cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q_resultsVLayouts').then(function (COBRANCA_REMESSA_seg_P_Q_resultsVLayouts) {
                this.results_CNAB_COB_BB_240_REM_VLayouts = COBRANCA_REMESSA_seg_P_Q_resultsVLayouts.results_CNAB_COB_BB_240_REM_VLayouts
                const harq21Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ21').value // busca o valor de HARQ21 response
                if (harq21Value !== '000000') {
                  const results_CNAB_COB_BB_240_REM_VLayouts = JSON.parse(JSON.stringify(this.results_CNAB_COB_BB_240_REM_VLayouts));
                  const harq20Obj = results_CNAB_COB_BB_240_REM_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ20');
                  const harq21Obj = results_CNAB_COB_BB_240_REM_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ21');
                  const segp19Obj = results_CNAB_COB_BB_240_REM_VLayouts['Line: 3 - SEGP'].find((obj) => obj.code === 'SEGP19');
                  const segp25Obj = results_CNAB_COB_BB_240_REM_VLayouts['Line: 3 - SEGP'].find((obj) => obj.code === 'SEGP25');
                  let result = generationDays_Date_CNAB(0)
                  let result2 = generationDays_Date_CNAB(30)
                  harq20Obj.value = result; // Atualiza o valor de HARQ20 results
                  harq21Obj.value = harq21Value; // Atualiza o valor de HARQ21 results
                  segp19Obj.value = result2; // Atualiza o valor de SEGP19 results
                  segp25Obj.value = result; // Atualiza o valor de SEGP25 results
                  const referenceBody = results_CNAB_COB_BB_240_REM_VLayouts;
                  cy.wrap(referenceBody).as('referenceBody');
                } else {
                  throw new Error('Campo posicional "HARQ21" relacionado a Hora de geração = 000000!')
                }
              })

            } else if (layout === "PAGAMENTO_001_240_REM") {

              return cy.fixture('PAGAMENTO/LAY240/API/PAGAMENTO_REMESSA_seg_A_J_O_N_resultsVLayouts').then(function (PAGAMENTO_REMESSA_seg_A_J_O_N_resultsVLayouts) {
                this.results_CNAB_PAG_BB_240_REM = PAGAMENTO_REMESSA_seg_A_J_O_N_resultsVLayouts.results_CNAB_PAG_BB_240_REM
                const harq20Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ20').value // busca o valor de HARQ20 response
                if (harq20Value !== '000000') {
                  const results_CNAB_PAG_BB_240_REM_VLayouts = JSON.parse(JSON.stringify(this.results_CNAB_PAG_BB_240_REM));
                  const harq19Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ19');
                  const harq20Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ20');
                  const sega116Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 3 - SEGA'].find((obj) => obj.code === 'SEGA16');
                  const sega216Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 7 - SEGA'].find((obj) => obj.code === 'SEGA16');
                  const sega316Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 11 - SEGA'].find((obj) => obj.code === 'SEGA16');
                  const sega416Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 15 - SEGA'].find((obj) => obj.code === 'SEGA16');
                  const sega516Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 19 - SEGA'].find((obj) => obj.code === 'SEGA16');
                  // BOLETO
                  const segj9Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 23 - SEGJ'].find((obj) => obj.code === 'SEGJ9');
                  const segj13Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 23 - SEGJ'].find((obj) => obj.code === 'SEGJ13');
                  // CODIGO BARRAS
                  const sego110Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 27 - SEGO'].find((obj) => obj.code === 'SEGO10');
                  // GRU
                  const segwgru8Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 30 - GRU'].find((obj) => obj.code === 'GRU8'); //competencia
                  const sego210Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 31 - SEGO'].find((obj) => obj.code === 'SEGO10');
                  // DARF
                  const segndarf10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 34 - DARF'].find((obj) => obj.code === 'DARF10');
                  const segndarf16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 34 - DARF'].find((obj) => obj.code === 'DARF16');
                  const segndarf21Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 34 - DARF'].find((obj) => obj.code === 'DARF21');
                  // DARFS
                  const segndarfs10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 37 - DARFS'].find((obj) => obj.code === 'DARFS10');
                  const segndarfs16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 37 - DARFS'].find((obj) => obj.code === 'DARFS16');
                  // GPS
                  const segngps10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 40 - GPS'].find((obj) => obj.code === 'GPS10');
                  const segngps16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 40 - GPS'].find((obj) => obj.code === 'GPS16'); //competencia
                  // FGTS
                  const sego39Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 44 - SEGO'].find((obj) => obj.code === 'SEGO9');
                  const sego410Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 44 - SEGO'].find((obj) => obj.code === 'SEGO10');
                  // DARJ
                  const segndarj10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 47 - DARJ'].find((obj) => obj.code === 'DARJ10');
                  const segndarj21Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 47 - DARJ'].find((obj) => obj.code === 'DARJ21');
                  const segndarj22Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 47 - DARJ'].find((obj) => obj.code === 'DARJ22'); //competencia
                  // IPVA
                  const segnipva10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 50 - IPVA'].find((obj) => obj.code === 'IPVA10');
                  const segnipva16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 50 - IPVA'].find((obj) => obj.code === 'IPVA16'); //ano base
                  // DPVAT
                  const segndpvat10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 53 - DPVAT'].find((obj) => obj.code === 'DPVAT10');
                  const segndpvat16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 53 - DPVAT'].find((obj) => obj.code === 'DPVAT16'); //ano base
                  // LIC
                  const segnlic10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 56 - LIC'].find((obj) => obj.code === 'LIC10');
                  const segnlic16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 56 - LIC'].find((obj) => obj.code === 'LIC16'); //ano base
                  // GARE_ICMS
                  const segngare_icms10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 59 - GARE_ICMS'].find((obj) => obj.code === 'GARE_ICMS10');
                  const segngare_icms16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 59 - GARE_ICMS'].find((obj) => obj.code === 'GARE_ICMS16');
                  const segngare_icms19Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 59 - GARE_ICMS'].find((obj) => obj.code === 'GARE_ICMS19'); //competencia
                  // GARE_ITCMD
                  const segngare_itcmd10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 62 - GARE_ITCMD'].find((obj) => obj.code === 'GARE_ITCMD10');
                  const segngare_itcmd16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 62 - GARE_ITCMD'].find((obj) => obj.code === 'GARE_ITCMD16');
                  const segngare_itcmd19Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 62 - GARE_ITCMD'].find((obj) => obj.code === 'GARE_ITCMD19'); //competencia
                  // GARE_DR
                  const segngare_dr10Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 65 - GARE_DR'].find((obj) => obj.code === 'GARE_DR10');
                  const segngare_dr16Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 65 - GARE_DR'].find((obj) => obj.code === 'GARE_DR16');
                  const segngare_dr19Obj = results_CNAB_PAG_BB_240_REM_VLayouts['Line: 65 - GARE_DR'].find((obj) => obj.code === 'GARE_DR19'); //competencia

                  let result = generationDays_Date_CNAB(0)
                  let result2 = generationDays_Date_CNAB(30)
                  let result3 = generationDays_CompetenciaMesAno_CNAB(0)
                  let result4 = generationDays_PeriodoApuracao_CNAB(0)
                  let result5 = generationDays_Anobase_CNAB(0)

                  harq19Obj.value = result; // Atualiza o valor de HARQ19 results
                  harq20Obj.value = harq20Value; // Atualiza o valor de HARQ20 results
                  sega116Obj.value = result; // Atualiza o valor de SEGA16 results
                  sega216Obj.value = result; // Atualiza o valor de SEGA16 results
                  sega316Obj.value = result; // Atualiza o valor de SEGA16 results
                  sega416Obj.value = result; // Atualiza o valor de SEGA16 results
                  sega516Obj.value = result; // Atualiza o valor de SEGA16 results
                  // BOLETO
                  segj9Obj.value = result2; // Atualiza o valor de SEGJ9 results
                  segj13Obj.value = result; // Atualiza o valor de SEGJ13 results
                  // CODIGO BARRAS
                  sego110Obj.value = result; // Atualiza o valor de SEGO10 results
                  // GRU
                  sego210Obj.value = result; // Atualiza o valor de SEGO10 results
                  segwgru8Obj.value = result3; // Atualiza o valor de GRU8 results (competencia)
                  // DARF
                  segndarf10Obj.value = result; // Atualiza o valor de DARF10 results
                  segndarf16Obj.value = result4; // Atualiza o valor de DARF16 results
                  segndarf21Obj.value = result2; // Atualiza o valor de DARF21 results
                  // DARFS
                  segndarfs10Obj.value = result; // Atualiza o valor de DARFS10 results
                  segndarfs16Obj.value = result4; // Atualiza o valor de DARFS16 results
                  // GPS
                  segngps10Obj.value = result; // Atualiza o valor de GPS10 results
                  segngps16Obj.value = result3; //Atualiza o valor de GPS16 results competencia
                  // FGTS
                  sego39Obj.value = result2; // Atualiza o valor de SEGO9 results
                  sego410Obj.value = result; // Atualiza o valor de SEGO10 results
                  // DARJ
                  segndarj10Obj.value = result; // Atualiza o valor de DARJ10 results
                  segndarj21Obj.value = result2; // Atualiza o valor de DARJ21 results
                  segndarj22Obj.value = result3; //Atualiza o valor de DARJ22 results competencia
                  // IPVA
                  segnipva10Obj.value = result; // Atualiza o valor de IPVA10 results
                  segnipva16Obj.value = result5 //Atualiza o valor de IPVA16 results ano base
                  // DPVAT
                  segndpvat10Obj.value = result; // Atualiza o valor de DPVAT10 results
                  segndpvat16Obj.value = result5 //Atualiza o valor de DPVAT16 results ano base
                  // LIC
                  segnlic10Obj.value = result; // Atualiza o valor de LIC10 results
                  segnlic16Obj.value = result5 //Atualiza o valor de LIC16 results ano base
                  // GARE_ICMS
                  segngare_icms10Obj.value = result; // Atualiza o valor de GARE_ICMS10 results
                  segngare_icms16Obj.value = result2; // Atualiza o valor de GARE_ICMS16 results
                  segngare_icms19Obj.value = result3; //Atualiza o valor de GARE_ICMS19 results competencia
                  // GARE_ITCMD
                  segngare_itcmd10Obj.value = result; // Atualiza o valor de GARE_ITCMD10 results
                  segngare_itcmd16Obj.value = result2; // Atualiza o valor de GARE_ITCMD16 results
                  segngare_itcmd19Obj.value = result3; //Atualiza o valor de GARE_ITCMD19 results competencia
                  // GARE_DR
                  segngare_dr10Obj.value = result; // Atualiza o valor de GARE_DR0 results
                  segngare_dr16Obj.value = result2; // Atualiza o valor de GARE_DR16 results
                  segngare_dr19Obj.value = result3; //Atualiza o valor de GARE_DR19 results competencia
                  const referenceBody = results_CNAB_PAG_BB_240_REM_VLayouts
                  cy.wrap(referenceBody).as('referenceBody');
                } else {
                  throw new Error('Campo posicional "HARQ20" relacionado a Hora de geração = 000000!')
                }
              })
            } else if (layout === "COBRANCA_001_240_RET") {

              return cy.fixture('COBRANCA/LAY240/API/COBRANCA_RETORNO_seg_T_U_resultsVLayouts').then(function (COBRANCA_RETORNO_seg_T_U_resultsVLayouts) {
                this.results_CNAB_COB_BB_240_RET_VLayouts = COBRANCA_RETORNO_seg_T_U_resultsVLayouts.results_CNAB_COB_BB_240_RET_VLayouts
                const harq21Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ21').value // busca o valor de HARQ21 response
                if (harq21Value !== '000000') {
                  const results_CNAB_COB_BB_240_RET_VLayouts = JSON.parse(JSON.stringify(this.results_CNAB_COB_BB_240_RET_VLayouts));
                  const harq20Obj = results_CNAB_COB_BB_240_RET_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ20');
                  const harq21Obj = results_CNAB_COB_BB_240_RET_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ21');
                  const segt15Obj = results_CNAB_COB_BB_240_RET_VLayouts['Line: 3 - SEGT'].find((obj) => obj.code === 'SEGT15');
                  let result = generationDays_Date_CNAB(0)
                  let result2 = generationDays_Date_CNAB(30)
                  harq20Obj.value = result; // Atualiza o valor de HARQ20 results
                  harq21Obj.value = harq21Value; // Atualiza o valor de HARQ21 results
                  segt15Obj.value = result2; // Atualiza o valor de SEGT15 results
                  const referenceBody = results_CNAB_COB_BB_240_RET_VLayouts
                  cy.wrap(referenceBody).as('referenceBody');
                } else {
                  throw new Error('Campo posicional "HARQ21" relacionado a Hora de geração = 000000!')
                }
              })
            } else if (layout === "COBRANCA_033_240_REM_H7815") {

              return cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q_resultsVLayouts').then(function (COBRANCA_REMESSA_seg_P_Q_resultsVLayouts) {
                this.results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts = COBRANCA_REMESSA_seg_P_Q_resultsVLayouts.results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts
                const harq14Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ14').value // busca o valor de HARQ14 response
                const results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts = JSON.parse(JSON.stringify(this.results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts));
                const harq12Obj = results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ12');
                const harq14Obj = results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ14');
                const hlot17Obj = results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts['Line: 2 - HLOT'].find((obj) => obj.code === 'HLOT17');
                const segp21Obj = results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts['Line: 3 - SEGP'].find((obj) => obj.code === 'SEGP21');
                const segp28Obj = results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts['Line: 3 - SEGP'].find((obj) => obj.code === 'SEGP28');
                let result = generationDays_Date_CNAB(0)
                let result2 = generationDays_Date_CNAB(30)
                harq12Obj.value = result; // Atualiza o valor de HARQ12 results
                harq14Obj.value = harq14Value; // Atualiza o valor de HARQ14 results
                hlot17Obj.value = result; // Atualiza o valor de HLOT17 results
                segp21Obj.value = result2; // Atualiza o valor de SEGP21 results
                segp28Obj.value = result; // Atualiza o valor de SEGP28 results
                const referenceBody = results_CNAB_COB_SANTANDER_240_REM_H7815_VLayouts
                cy.wrap(referenceBody).as('referenceBody');
              })

            } else if (layout === "COBRANCA_033_240_RET_H7815") {

              return cy.fixture('COBRANCA/LAY240/API/COBRANCA_RETORNO_seg_T_U_resultsVLayouts').then(function (COBRANCA_RETORNO_seg_T_U_resultsVLayouts) {
                this.results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts = COBRANCA_RETORNO_seg_T_U_resultsVLayouts.results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts
                const harq19Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ19').value // busca o valor de HARQ19 response
                const results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts = JSON.parse(JSON.stringify(this.results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts));
                const harq17Obj = results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ17');
                const harq19Obj = results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ19');
                const segt15Obj = results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts['Line: 3 - SEGT'].find((obj) => obj.code === 'SEGT15');
                let result = generationDays_Date_CNAB(0)
                let result2 = generationDays_Date_CNAB(30)
                harq17Obj.value = result; // Atualiza o valor de HARQ20 results
                harq19Obj.value = harq19Value;
                segt15Obj.value = result2; // Atualiza o valor de SEGT15 results
                const referenceBody = results_CNAB_COB_SANTANDER_240_RET_H7815_VLayouts
                cy.wrap(referenceBody).as('referenceBody');
              })

            } else if (layout === "COBRANCA_033_240_REM_FEB") {

              return cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q_resultsVLayouts').then(function (COBRANCA_REMESSA_seg_P_Q_resultsVLayouts) {
                this.results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts = COBRANCA_REMESSA_seg_P_Q_resultsVLayouts.results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts
                const harq17Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ17').value // busca o valor de HARQ17 response
                const harq18Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ18').value // busca o valor de HARQ18 response
                if (harq17Value !== '000000') {
                  const results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts = JSON.parse(JSON.stringify(this.results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts));
                  const harq16Obj = results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ16');
                  const harq17Obj = results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ17');
                  const harq18Obj = results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ18');
                  const segp19Obj = results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts['Line: 3 - SEGP'].find((obj) => obj.code === 'SEGP19');
                  const segp25Obj = results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts['Line: 3 - SEGP'].find((obj) => obj.code === 'SEGP25');
                  let result = generationDays_Date_CNAB(0)
                  let result2 = generationDays_Date_CNAB(30)
                  harq16Obj.value = result; // Atualiza o valor de HARQ16 results
                  harq17Obj.value = harq17Value; // Atualiza o valor de HARQ17 results
                  harq18Obj.value = harq18Value; // Atualiza o valor de HARQ18 results
                  segp19Obj.value = result2; // Atualiza o valor de SEGP19 results
                  segp25Obj.value = result; // Atualiza o valor de SEGP25 results
                  const referenceBody = results_CNAB_COB_SANTANDER_240_REM_FEB_VLayouts
                  cy.wrap(referenceBody).as('referenceBody');
                } else {
                  throw new Error('Campo posicional "HARQ17" relacionado a Hora de geração = 000000!')
                }
              })

            } else if (layout === "COBRANCA_033_240_RET_FEB") {

              return cy.fixture('COBRANCA/LAY240/API/COBRANCA_RETORNO_seg_T_U_resultsVLayouts').then(function (COBRANCA_RETORNO_seg_T_U_resultsVLayouts) {
                this.results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts = COBRANCA_RETORNO_seg_T_U_resultsVLayouts.results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts
                const harq17Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ17').value // busca o valor de HARQ17 response
                const harq18Value = response.body['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ18').value // busca o valor de HARQ18 response
                if (harq17Value !== '000000') {
                  const results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts = JSON.parse(JSON.stringify(this.results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts));
                  const harq16Obj = results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ16');
                  const harq17Obj = results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ17');
                  const harq18Obj = results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts['Line: 1 - HARQ'].find((obj) => obj.code === 'HARQ18');
                  const hlote20Obj = results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts['Line: 2 - HLOTE'].find((obj) => obj.code === 'HLOTE20');
                  const segt15Obj = results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts['Line: 3 - SEGT'].find((obj) => obj.code === 'SEGT15');
                  let result = generationDays_Date_CNAB(0)
                  let result2 = generationDays_Date_CNAB(30)
                  harq16Obj.value = result; // Atualiza o valor de HARQ16 results
                  harq17Obj.value = harq17Value; // Atualiza o valor de HARQ17 results
                  harq18Obj.value = harq18Value; // Atualiza o valor de HARQ18 results
                  hlote20Obj.value = result; // Atualiza o valor de HLOTE20 results
                  segt15Obj.value = result2; // Atualiza o valor de SEGT15 results
                  const referenceBody = results_CNAB_COB_SANTANDER_240_RET_FEB_VLayouts
                  cy.wrap(referenceBody).as('referenceBody');
                } else {
                  throw new Error('Campo posicional "HARQ17" relacionado a Hora de geração = 000000!')
                }
              })
            }
          }).then(() => {
            cy.get('@referenceBody').then((referenceBody) => {
              const responseBody = response.body
              cy.validateJSON(responseBody, referenceBody);
            });
          });
        })
      })
      .then(() => {
        if (direction_vl == "REMESSA") {
          copyevidenciaFile(path_destino, prefix, filePath)
        } else {
          limpezaFile(prefix)
        }
      })
  });
}

export function validate_ResultsWebhook_COB_240(response, ID_CNAB_COB_240_RET_Webhook, codigo) {
  return cy.fixture('COBRANCA/LAY240/API/COBRANCA_RETORNO_seg_T_U_resultsWebhook').then(function (COBRANCA_RETORNO_seg_T_U_resultsWebhook) {
    this.results_CNAB_COB_240_RET_Webhook = COBRANCA_RETORNO_seg_T_U_resultsWebhook.results_CNAB_COB_240_RET_Webhook
    this.results_ABERTURA_COB_BB = COBRANCA_RETORNO_seg_T_U_resultsWebhook.results_ABERTURA_COB_BB
    this.results_INVOICE_COB_BB = COBRANCA_RETORNO_seg_T_U_resultsWebhook.results_INVOICE_COB_BB
    this.results_ABERTURA_COB_SANTANDER_H7815 = COBRANCA_RETORNO_seg_T_U_resultsWebhook.results_ABERTURA_COB_SANTANDER_H7815
    this.results_INVOICE_COB_SANTANDER_H7815 = COBRANCA_RETORNO_seg_T_U_resultsWebhook.results_INVOICE_COB_SANTANDER_H7815
    this.results_ABERTURA_COB_SANTANDER_FEB = COBRANCA_RETORNO_seg_T_U_resultsWebhook.results_ABERTURA_COB_SANTANDER_FEB
    this.results_INVOICE_COB_SANTANDER_FEB = COBRANCA_RETORNO_seg_T_U_resultsWebhook.results_INVOICE_COB_SANTANDER_FEB

    let referenceBody;
    const results_CNAB_COB_240_RET_Webhook = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook));
    results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice = JSON.parse(JSON.stringify(response.body.results[0].invoices[0].invoice));
    let result = generationDays_Date_Json(30)

    if (codigo == "BB") {

      results_CNAB_COB_240_RET_Webhook.results[0].company = JSON.parse(JSON.stringify(this.results_ABERTURA_COB_BB));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_due_date = result;
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.bank_wallet_type = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.bank_wallet_type));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_amount = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_amount));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.demanding_bank_branch = JSON.parse(JSON.stringify(this.results_INVOICE_COB_BB.demanding_bank_branch));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.identifier = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.identifier));

    } else if (codigo == "SANTANDER_H7815") {
      results_CNAB_COB_240_RET_Webhook.results[0].company = JSON.parse(JSON.stringify(this.results_ABERTURA_COB_SANTANDER_H7815));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_due_date = result;
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.identifier = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.identifier));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.bank_wallet_type = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.bank_wallet_type));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.billing_document_number = JSON.parse(JSON.stringify(this.results_INVOICE_COB_SANTANDER_H7815.billing_document_number));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_amount = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_amount));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.demanding_bank_branch = JSON.parse(JSON.stringify(this.results_INVOICE_COB_SANTANDER_H7815.demanding_bank_branch));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.our_number = JSON.parse(JSON.stringify(this.results_INVOICE_COB_SANTANDER_H7815.our_number));

    } else if (codigo == "SANTANDER_FEB") {
      results_CNAB_COB_240_RET_Webhook.results[0].company = JSON.parse(JSON.stringify(this.results_ABERTURA_COB_SANTANDER_FEB));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_due_date = result;
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.identifier = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.identifier));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.bank_wallet_type = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.bank_wallet_type));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.billing_document_number = JSON.parse(JSON.stringify(this.results_INVOICE_COB_SANTANDER_FEB.billing_document_number));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_amount = JSON.parse(JSON.stringify(this.results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.title_amount));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.demanding_bank_branch = JSON.parse(JSON.stringify(this.results_INVOICE_COB_SANTANDER_FEB.demanding_bank_branch));
      results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.our_number = JSON.parse(JSON.stringify(this.results_INVOICE_COB_SANTANDER_FEB.our_number));

    } else {
      throw new Error('Nao existe nenhum layout inserido na regra atualmente, favor inserir a regra!')
    }
    results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.status.code = "02";
    results_CNAB_COB_240_RET_Webhook.results[0].invoices[0].invoice.status.description = "Entrada Confirmada";
    results_CNAB_COB_240_RET_Webhook.id = `${ID_CNAB_COB_240_RET_Webhook}`;
    const linkhref = Cypress.env('API_SERVER') + "/invoice/" + `${ID_CNAB_COB_240_RET_Webhook}` + "/?_offset=0&_limit=1000";
    results_CNAB_COB_240_RET_Webhook.links[0].href = (`${linkhref}`)
    referenceBody = results_CNAB_COB_240_RET_Webhook
    const responseBody = response.body
    cy.validateJSON(responseBody, referenceBody);
    saveFileinDirectory('cypress/fixtures/COBRANCA/LAY240/PAYLOAD', `COB_240_${codigo}_WEBHOOK`, referenceBody)

  })
}







