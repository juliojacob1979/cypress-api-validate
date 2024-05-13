/// <reference types="Cypress" />

import { generation_PAYLOAD_COB_BB_240, validateValidadorLayouts } from '../../../support/commands-api'
import { downloadFileFromS3 } from '../../../support/commands-utilities'

describe('Quando realizo um fluxo Banco do Brasil de Remessa Layout 240 - API vs CNAB', function () {

    afterEach(function () {
        cy.caseFailedScenario()
    });

    before(function () {
        cy.task('emptyDirectory', { directory: 'cypress/downloads' }).then(() => {
            cy.log('Limpeza de diretorio feita para preparacao dos testes');
        });
    })

    context("E faço a autenticacao atraves do login na API", function () {
        before(async function () {
            const response = await cy.loginViaAPI();
            this.authorization = `${response.body.access_token}`;
        })
        const bucketName = 'homol-bucket-saida'; // Bucket responsavel pelas entregas dos CNABs

        context("E preparo o payload e gero um Id para Cobranca na API tratando da rota invoice", function () {
            before(function () {
                generation_PAYLOAD_COB_BB_240().then(() => {
                    cy.postInvoice(this.authorization, this.payload_COBRANCA_001_LAY240, true).then(function (response) {
                        this.id_COB_BB_240 = String(response.body.id)
                        cy.log(this.id_COB_BB_240)
                    })
                });
            })

            context("E no Bucket S3 Filenator disponibilizo um arquivo CNAB Cobranca Layout 240 atraves do Id", function () {
                it('Deve disponibilizar um registro CNAB Cobranca Layout 240 com sucesso', function () {

                    const objectKey = this.id_COB_BB_240;
                    const downloadPath = 'cypress/downloads/COB.BB.240.REM.Modelo';

                    downloadFileFromS3(bucketName, objectKey, downloadPath)
                        .then(data => {
                            cy.log(`Arquivo baixado em: ${downloadPath}`);
                        })
                        .catch(err => {
                            // Um erro ocorreu durante o download
                        });
                })

                context("E realizo uma validacao do CNAB remessa pela rota do 'Validador de Layouts'", function () {
                    it('Deve ser validado o arquivo CNAB com sucesso', () => {
                        validateValidadorLayouts('cypress/downloads', 'COB.BB.240.REM.Modelo', "COBRANCA_001_240_REM", "REMESSA", 'cypress/fixtures/COBRANCA/LAY240/CNAB') // (prefix_file, layout_validador, direction, path_destino)
                    })
                })
            })
        });
    })
});

