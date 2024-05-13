/// <reference types="Cypress" />

import 'cypress-file-upload'
import {
    generation_PAYLOAD_COB_BB_240, validateValidadorLayouts, validate_ResultsWebhook_COB_240
} from '../../../support/commands-api'
import { downloadFileFromS3 } from '../../../support/commands-utilities'

describe('Quando realizo um fluxo Banco do Brasil de Retorno Layout 240 - CNAB vs API', function () {

    afterEach(function () {
        cy.caseFailedScenario()
    });

    before(function () {
        cy.task('emptyDirectory', { directory: 'cypress/downloads' }).then(() => {
            cy.log('Limpeza de diretorio feita para preparacao dos testes');
        });
        cy.deletarWebhooks().then(() => {
            cy.log('Limpeza de requisicoes feita pelo Webhook para preparacao dos testes');
        });
    })

    context("E faço a autenticacao atraves do login na API", function () {
        before(async function () {
            const response = await cy.loginViaAPI();
            this.authorization = `${response.body.access_token}`;
        })
        const bucketName = 'homol-bucket-saida'; // Bucket responsavel pelas entregas dos CNABs

        context("E trata-se de um arquivo CNAB Cobranca", function () {
            let ID_CNAB_COB_BB_240_RET_Webhook

            context("E preparo o payload e gero um Id para Cobranca na API tratando da rota invoice", function () {
                before(function () {
                    generation_PAYLOAD_COB_BB_240().then(() => {
                        cy.postInvoice(this.authorization, this.payload_COBRANCA_001_LAY240, true).then(function (response) {
                            this.id_COB_BB_240 = String(response.body.id)
                            cy.log(this.id_COB_BB_240)
                        })
                    });
                })

                context("E no Bucket S3 Filenator disponibilizo um arquivo CNAB Remessa de Cobranca Layout 240 atraves do Id", function () {
                    it('Deve disponibilizar um registro CNAB Remessa de Cobranca Layout 240 com sucesso', function () {

                        const objectKey = this.id_COB_BB_240;
                        const downloadPath = 'cypress/downloads/COB.BB.240.REM.Modelo';

                        downloadFileFromS3(bucketName, objectKey, downloadPath)
                            .then(data => {
                                cy.log(`Arquivo baixado em: ${downloadPath}`);
                            })
                            .catch(err => {
                                // Um erro ocorreu durante o download
                            });

                        cy.validatedownloadedSaveFile('COB.BB.240.REM.Modelo', 'cypress/fixtures/COBRANCA/LAY240/CNAB');
                    })
                })
            });

            context("E através do Portal Produto especifico a 'caixa postal' do banco para processamento e assim retorno ao cliente", function () {
                context("E preparo o arquivo CNAB Retorno Layout 240 Cobranca e realizo uma validacao pela rota do 'Validador de Layouts'", function () {
                    it('Deve verificar se o arquivo foi processado com sucesso', function () {
                        cy.generation_CNAB_COB_BB_240_RET().then(function () {
                            validateValidadorLayouts('cypress/fixtures/COBRANCA/LAY240/CNAB', 'COB.BB.240.RET.Modelo', "COBRANCA_001_240_RET", "RETORNO") // (prefix_file, layout_validador, direction)
                        })
                        cy.loginViaFrontProduto()
                        cy.produtoFiltro('BCOBRASILBSB3', 'COBRANCA/LAY240/CNAB', 'COB.BB.240.RET.Modelo')
                    })
                })
            })

            context("Extração de Correlation da Requisição", function () {
                it('Pegar a requisição com base no "id" e recuperar a "correlation"', function () {
                    cy.CapturaID('COB.BB.240.RET.Modelo').then((JMS_correlation_ID) => { //pegar o "JMS_correlation_ID" do retorno para usar na rota GET do invoice
                        cy.log(JMS_correlation_ID)
                        ID_CNAB_COB_BB_240_RET_Webhook = JMS_correlation_ID;
                    })
                })
            })

            context("E atraves do 'JMS correlation ID' monto a rota invoice do retorno para o cliente", function () {
                it('Deve ser retornado o results do Webhook com sucesso', function () {
                    cy.getInvoice(this.authorization, ID_CNAB_COB_BB_240_RET_Webhook).then(function (response) {
                        expect(response.status).to.eq(200)
                        validate_ResultsWebhook_COB_240(response, ID_CNAB_COB_BB_240_RET_Webhook, "BB").then(function () {
                        })
                    })
                })
            })
        })
    })
})
