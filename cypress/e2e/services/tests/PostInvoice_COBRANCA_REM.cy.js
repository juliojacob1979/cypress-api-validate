/// <reference types="Cypress" />

import { generation_PAYLOAD_COB_BB_240, generation_PAYLOAD_COB_SANTANDER_240_FEB, generation_PAYLOAD_COB_SANTANDER_240_H7815 } from '../../../support/commands-api'


describe('Quando valido o método POST para geracao de um CNAB na rota Invoice (cobrança) Open Banking', function () {

    afterEach(function () {
        cy.caseFailedScenario()
    });

    context("E faço a autenticacao atraves do login na API", function () {
        before(async function () {
            const response = await cy.loginViaAPI();
            this.authorization = `${response.body.access_token}`;
        })

        context("E preparo o payload para os fluxos de Remessa Layout 240 - API vs CNAB", function () {
            before(function () {
                generation_PAYLOAD_COB_BB_240()
                generation_PAYLOAD_COB_SANTANDER_240_FEB()
                generation_PAYLOAD_COB_SANTANDER_240_H7815()
            })

            context("E faço uma requisicao estruturada na v1.2 de acordo com cada layout bancario e com abertura existente", function () {
                it('Deve ser registrado com sucesso', function () {

                    // Lista de aliases para os payloads
                    const payloadAliases = [
                        { alias: 'COBRANCA_001_LAY240', payload: this.payload_COBRANCA_001_LAY240 },
                        { alias: 'COBRANCA_033_LAY240_FEB', payload: this.payload_COBRANCA_033_LAY240_FEB },
                        { alias: 'COBRANCA_033_LAY240_H7815', payload: this.payload_COBRANCA_033_LAY240_H7815 },
                        // Adicione mais aliases conforme necessário
                    ];

                    // Loop para gerar cada payload
                    payloadAliases.forEach((payloadObj) => {
                        const payload = JSON.parse(JSON.stringify(payloadObj.payload));

                        cy.log(`Executando teste com o payload: ${payloadObj.alias}`);

                        cy.log(`==>> Criando um id com status 200 <<==`)
                        cy.postInvoice(this.authorization, payload, true).then(function (response) {
                            if (response.status === 200) {
                                expect(response.status).to.eq(200);
                                // Verifica se a resposta contém a chave "id"
                                expect(response.body).to.have.property('id');
                                // Verifica se o valor da chave "id" é uma string no formato correto
                                const idRegex = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
                                expect(response.body.id).to.match(idRegex);
                                // Verifica se o valor da chave "id" não é vazio
                                expect(response.body.id).not.to.be.empty;
                                cy.log(`Id criado com sucesso para payload, body: ${JSON.stringify(response.body)}`);
                            } else if (response.status === 504) {
                                cy.log('Status 504 "gateway timeout" recebido no servidor, algum serviço está fora ou com alguma intermitência');
                            } else {
                                throw new Error(`Status inesperado recebido: ${response.status}`);
                            }
                        })
                    })
                });
            });


            context("E quando executo teste de execeção (valor inesperado) relativo a estrutura payload invoice 1.2", function () {
                context("E verifico o comportamento da API sem os objetos 'company' e 'invoices'", function () {
                    it('Deve retornar mensagem de "error"', function () {

                        // Lista de aliases para os payloads
                        const payloadAliases = [
                            { alias: 'COBRANCA_001_LAY240', payload: this.payload_COBRANCA_001_LAY240 },
                            { alias: 'COBRANCA_033_LAY240_FEB', payload: this.payload_COBRANCA_033_LAY240_FEB },
                            { alias: 'COBRANCA_033_LAY240_H7815', payload: this.payload_COBRANCA_033_LAY240_H7815 },
                            // Adicione mais aliases conforme necessário
                        ];

                        // Loop para excluir 'company' e 'invoices' de cada payload
                        payloadAliases.forEach((payloadObj) => {
                            const payload_INV_COB_SEM_COMPANY_INVOICES = JSON.parse(JSON.stringify(payloadObj.payload));
                            delete payload_INV_COB_SEM_COMPANY_INVOICES.company;
                            delete payload_INV_COB_SEM_COMPANY_INVOICES.invoices;

                            cy.log(`Executando teste com o payload: ${payloadObj.alias}`);

                            cy.postInvoice(this.authorization, payload_INV_COB_SEM_COMPANY_INVOICES).then(function (response) {
                                if (response.status === 400) {
                                    expect(response.status).to.eq(400);
                                    expect(response.body.error[0]).to.eq("\"company\" is required");
                                    if (response.body.error.length > 1) {
                                        const errorMessage = `Esperava apenas uma mensagem de erro em resposta, mas recebi ${response.body.error.length}.Segue retorno da requisição em JSON, body: ${JSON.stringify(response.body)}`;
                                        cy.fail(errorMessage);
                                    }
                                    cy.log(`Retorno da requisição em JSON, body: ${JSON.stringify(response.body)}`);
                                } else if (response.status === 504) {
                                    cy.log('Status 504 "gateway timeout" recebido no servidor, algum serviço está fora ou com alguma intermitência');
                                } else {
                                    throw new Error(`Status inesperado recebido: ${response.status}`);
                                }
                            });
                        });
                    });
                });
            });
        });
    });
});            