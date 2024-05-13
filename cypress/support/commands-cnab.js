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

/// <reference types="Cypress" />

import {
    replaceTextInLine, generationDays_Date_CNAB, generation_Hora_CNAB, generationDays_Anobase_CNAB, generationDays_CompetenciaMesAno_CNAB, generationDays_PeriodoApuracao_CNAB
} from '../support/commands-utilities'

Cypress.Commands.add("generation_CNAB_COB_BB_240_RET", () => {
    cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q').then(function (COBRANCA_REMESSA_seg_P_Q) {
        this.payload_modelo_COBRANCA = COBRANCA_REMESSA_seg_P_Q.payload_modelo_COBRANCA
        this.payload_INVOICE_COB_BB = COBRANCA_REMESSA_seg_P_Q.payload_INVOICE_COB_BB
        cy.task('listFiles', { path: 'cypress/fixtures/COBRANCA/LAY240/CNAB', prefix: 'COB.BB.240.RET.Modelo' }).then((filePath) => {
            if (filePath) {
                cy.log(`Arquivo encontrado: ${filePath}`, { timeout: 6000 });
                cy.task('emptyDirectory', { directory: 'cypress/fixtures/COBRANCA/LAY240/CNAB', prefix: 'COB.BB.240.RET.Modelo' }).then(() => {
                    cy.log('Arquivo removido com sucesso');
                });
            } else {
                cy.log('Arquivo não encontrado');
            }
            cy.task('copyAndNameFile', {
                sourceDirectory: 'cypress/fixtures/COBRANCA/LAY240/CNAB',
                prefixToFind: 'COB.BB.240.REM.Modelo',
                destinationFileName: 'COB.BB.240.RET.Modelo', // Substitua com o nome desejado
            }).then((result) => {
                cy.log(result);
                const filePath = 'cypress/fixtures/COBRANCA/LAY240/CNAB/COB.BB.240.RET.Modelo';
                // Ajuste Header de Arquivo
                replaceTextInLine(filePath, 0, 142, 142, '2'); //Código Remessa / Retorno
                let DDMMAAAA_GER = generationDays_Date_CNAB(0)
                replaceTextInLine(filePath, 0, 143, 150, DDMMAAAA_GER); //Data de Geração do Arquivo
                let HHMMSS_GER = generation_Hora_CNAB()
                replaceTextInLine(filePath, 0, 151, 156, HHMMSS_GER); //Hora de Geração do Arquivo
                // Ajuste Header de Lote
                replaceTextInLine(filePath, 1, 8, 8, 'T'); // Tipo de Operação
                // Ajuste Segmento T
                replaceTextInLine(filePath, 2, 13, 13, 'T'); //Segmento do Registro Detalhe
                replaceTextInLine(filePath, 2, 15, 16, '02'); //Código de Movimento Retorno
                replaceTextInLine(filePath, 2, 36, 36, '0'); //Dígito Verificador da Ag/Conta
                replaceTextInLine(filePath, 2, 58, 72, '               '); //Número do Documento de Cobrança
                let DDMMAAAA_VENC = generationDays_Date_CNAB(30)
                cy.log(DDMMAAAA_VENC)
                replaceTextInLine(filePath, 2, 73, 80, DDMMAAAA_VENC); //Data do Vencimento do Título
                const value_title_amount = this.payload_modelo_COBRANCA.invoices[0].invoice.title_amount;
                const VL_NOM_TIT = parseFloat(value_title_amount.toString().replace('.', ''));
                replaceTextInLine(filePath, 2, 81, 95, VL_NOM_TIT); //Valor Nominal do Título
                replaceTextInLine(filePath, 2, 96, 98, '000'); //Número do Banco
                const AGENCIA_COB_REC = this.payload_INVOICE_COB_BB.demanding_bank_branch;
                replaceTextInLine(filePath, 2, 99, 103, AGENCIA_COB_REC); // Agência Cobradora/Recebedora
                replaceTextInLine(filePath, 2, 104, 104, '0'); // Dígito Verificador da Agência
                const IDENT_TIT_EMP = this.payload_modelo_COBRANCA.invoices[0].invoice.identifier;
                replaceTextInLine(filePath, 2, 105, 129, IDENT_TIT_EMP); // Identificação do Título na Empresa
                replaceTextInLine(filePath, 2, 130, 131, '00'); // Código da Moeda
                const TIPO_INSCR = this.payload_modelo_COBRANCA.invoices[0].payer.registration_type;
                replaceTextInLine(filePath, 2, 132, 132, TIPO_INSCR); // Tipo de Inscrição
                replaceTextInLine(filePath, 2, 133, 133, '0'); // Complemento Inscricao com zero a esquerda
                const NUMERO_INSCR = this.payload_modelo_COBRANCA.invoices[0].payer.registration_number;
                replaceTextInLine(filePath, 2, 134, 147, NUMERO_INSCR); // Número de Inscrição
                const NAME = this.payload_modelo_COBRANCA.invoices[0].payer.name;
                replaceTextInLine(filePath, 2, 148, 187, NAME); // Nome
                replaceTextInLine(filePath, 2, 188, 197, '0000000000'); // Nº do Contr. da Operação de Crédito
                replaceTextInLine(filePath, 2, 198, 212, '000000000000000'); // Valor da Tarifa / Custas
                replaceTextInLine(filePath, 2, 213, 222, '          '); // Identificação para Rejeições, Tarifas, Custas, Liquidação e Baixas
                replaceTextInLine(filePath, 2, 223, 239, '                 '); // Uso Exclusivo FEBRABAN/CNAB
                // Ajuste Segmento U
                replaceTextInLine(filePath, 3, 13, 13, 'U'); //Segmento do Registro Detalhe
                replaceTextInLine(filePath, 3, 15, 16, '02'); //Código de Movimento Retorno
                replaceTextInLine(filePath, 3, 17, 152, '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
                replaceTextInLine(filePath, 3, 153, 164, '            ');
                replaceTextInLine(filePath, 3, 165, 179, '000000000000000');
                replaceTextInLine(filePath, 3, 180, 209, '                              ');
                replaceTextInLine(filePath, 3, 210, 232, '00000000000000000000000');
                replaceTextInLine(filePath, 3, 233, 239, '       ');
            });
        });
    })
});

Cypress.Commands.add("generation_CNAB_COB_SANTANDER_240_RET_H7815", () => {
    cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q').then(function (COBRANCA_REMESSA_seg_P_Q) {
        this.payload_modelo_COBRANCA = COBRANCA_REMESSA_seg_P_Q.payload_modelo_COBRANCA
        this.payload_ABERTURA_COB_SANTANDER_H7815 = COBRANCA_REMESSA_seg_P_Q.payload_ABERTURA_COB_SANTANDER_H7815
        this.payload_INVOICE_COB_SANTANDER_H7815 = COBRANCA_REMESSA_seg_P_Q.payload_INVOICE_COB_SANTANDER_H7815
        cy.task('listFiles', { path: 'cypress/fixtures/COBRANCA/LAY240/CNAB', prefix: 'COB.SANTANDER.240.RET.H7815.Modelo' }).then((filePath) => {
            if (filePath) {
                cy.log(`Arquivo encontrado: ${filePath}`, { timeout: 6000 });
                cy.task('emptyDirectory', { directory: 'cypress/fixtures/COBRANCA/LAY240/CNAB', prefix: 'COB.SANTANDER.240.RET.H7815.Modelo' }).then(() => {
                    cy.log('Arquivo removido com sucesso');
                });
            } else {
                cy.log('Arquivo não encontrado');
            }
            cy.task('copyAndNameFile', {
                sourceDirectory: 'cypress/fixtures/COBRANCA/LAY240/CNAB',
                prefixToFind: 'COB.SANTANDER.240.REM.H7815.Modelo',
                destinationFileName: 'COB.SANTANDER.240.RET.H7815.Modelo', // Substitua com o nome desejado
            }).then((result) => {
                cy.log(result);
                const filePath = 'cypress/fixtures/COBRANCA/LAY240/CNAB/COB.SANTANDER.240.RET.H7815.Modelo';
                // Ajuste Header de Arquivo
                const value_bank_branch = this.payload_ABERTURA_COB_SANTANDER_H7815.bank_branch
                replaceTextInLine(filePath, 0, 32, 35, value_bank_branch); //Agência do Beneficiário
                const value_bank_branch_identifier = this.payload_ABERTURA_COB_SANTANDER_H7815.bank_branch_identifier
                replaceTextInLine(filePath, 0, 36, 36, value_bank_branch_identifier); //Dígito da Agência do Beneficiário
                replaceTextInLine(filePath, 0, 37, 39, '000'); //Número da conta corrente
                const value_bank_account = this.payload_ABERTURA_COB_SANTANDER_H7815.bank_account
                replaceTextInLine(filePath, 0, 40, 45, value_bank_account); //Número da conta corrente
                const value_bank_account_identifier = this.payload_ABERTURA_COB_SANTANDER_H7815.bank_account_identifier
                replaceTextInLine(filePath, 0, 46, 46, value_bank_account_identifier); //Dígito verificador da conta
                const value_bank_agreement = this.payload_ABERTURA_COB_SANTANDER_H7815.bank_agreement
                replaceTextInLine(filePath, 0, 52, 60, value_bank_agreement); //Código do Beneficiário
                replaceTextInLine(filePath, 0, 142, 142, '2'); //Código Remessa / Retorno
                let DDMMAAAA_GER = generationDays_Date_CNAB(0)
                replaceTextInLine(filePath, 0, 143, 150, DDMMAAAA_GER); //Data de Geração do Arquivo
                // Ajuste Header de Lote
                replaceTextInLine(filePath, 1, 8, 8, 'T'); // Tipo de Operação
                replaceTextInLine(filePath, 1, 13, 15, '040'); // Tipo de Operação
                replaceTextInLine(filePath, 1, 33, 41, value_bank_agreement); //Código do Beneficiário
                replaceTextInLine(filePath, 1, 53, 56, value_bank_branch); //Agência do Beneficiário
                replaceTextInLine(filePath, 1, 57, 57, value_bank_branch_identifier); //Dígito da Agência do Beneficiário
                replaceTextInLine(filePath, 1, 58, 60, '000'); //Número da conta corrente
                replaceTextInLine(filePath, 1, 61, 66, value_bank_account); //Número da conta corrente
                replaceTextInLine(filePath, 1, 67, 67, value_bank_account_identifier); //Dígito verificador da conta
                replaceTextInLine(filePath, 1, 191, 198, DDMMAAAA_GER); //Data da gravação remessa/retorno
                // Ajuste Segmento T
                replaceTextInLine(filePath, 2, 13, 13, 'T'); //Segmento do Registro Detalhe
                replaceTextInLine(filePath, 2, 15, 16, '02'); //Código de Movimento Retorno
                replaceTextInLine(filePath, 2, 32, 39, '        '); //Reservado (uso Banco)
                const value_our_number = this.payload_INVOICE_COB_SANTANDER_H7815.our_number;
                replaceTextInLine(filePath, 2, 40, 52, value_our_number); //Identificação do boleto no Banco
                const value_bank_wallet_type = this.payload_modelo_COBRANCA.invoices[0].invoice.bank_wallet_type;
                replaceTextInLine(filePath, 2, 53, 53, value_bank_wallet_type); //Código da carteira
                const value_billing_document_number = this.payload_INVOICE_COB_SANTANDER_H7815.billing_document_number;
                replaceTextInLine(filePath, 2, 54, 68, value_billing_document_number); //Nº do documento de cobrança
                let DDMMAAAA_VENC = generationDays_Date_CNAB(30)
                cy.log(DDMMAAAA_VENC)
                replaceTextInLine(filePath, 2, 69, 76, DDMMAAAA_VENC); //Data do Vencimento do Título
                const value_title_amount = this.payload_modelo_COBRANCA.invoices[0].invoice.title_amount;
                const VL_NOM_TIT = parseFloat(value_title_amount.toString().replace('.', ''));
                replaceTextInLine(filePath, 2, 77, 91, VL_NOM_TIT); //Valor nominal do boleto
                replaceTextInLine(filePath, 2, 92, 94, '000'); //Nº do Banco Cobrador / Recebedor
                const AGENCIA_COB_REC = this.payload_INVOICE_COB_SANTANDER_H7815.demanding_bank_branch;
                replaceTextInLine(filePath, 2, 95, 98, AGENCIA_COB_REC); // Agência Cobradora/Recebedora
                replaceTextInLine(filePath, 2, 99, 99, '0'); // Dígito da Agência do Beneficiário
                const IDENT_TIT_EMP = this.payload_modelo_COBRANCA.invoices[0].invoice.identifier;
                replaceTextInLine(filePath, 2, 100, 124, IDENT_TIT_EMP); // Identif. do boleto na empresa
                replaceTextInLine(filePath, 2, 125, 126, '00'); // Código da Moeda
                const TIPO_INSCR = this.payload_modelo_COBRANCA.invoices[0].payer.registration_type;
                replaceTextInLine(filePath, 2, 127, 127, TIPO_INSCR); // Tipo de Inscrição
                replaceTextInLine(filePath, 2, 128, 128, '0'); // Complemento Inscricao com zero a esquerda
                const NUMERO_INSCR = this.payload_modelo_COBRANCA.invoices[0].payer.registration_number;
                replaceTextInLine(filePath, 2, 129, 142, NUMERO_INSCR); // Número de Inscrição
                const NAME = this.payload_modelo_COBRANCA.invoices[0].payer.name;
                replaceTextInLine(filePath, 2, 143, 182, NAME); // Nome
                replaceTextInLine(filePath, 2, 183, 192, '0000000000'); // Conta Cobrança
                replaceTextInLine(filePath, 2, 193, 207, '000000000000000'); // Valor da Tarifa / Custas
                replaceTextInLine(filePath, 2, 208, 217, '          '); // Identificação para rejeições, tarifas, custas, liquidações, baixas e PIX.
                replaceTextInLine(filePath, 2, 218, 239, '                      '); // Reservado (uso Banco)
                // // Ajuste Segmento U
                replaceTextInLine(filePath, 3, 13, 13, 'U'); //Segmento do Registro Detalhe
                replaceTextInLine(filePath, 3, 15, 16, '02'); //Código de Movimento Retorno
                replaceTextInLine(filePath, 3, 17, 31, '000000000000000'); //Juros / Multa / Encargos
                replaceTextInLine(filePath, 3, 32, 46, '000000000000000'); //Valor do desconto concedido
                replaceTextInLine(filePath, 3, 47, 61, '000000000000000'); //Valor do Abatimento Concedido/Cancelado
                replaceTextInLine(filePath, 3, 62, 76, '000000000000000'); //Valor do IOF recolhido
                replaceTextInLine(filePath, 3, 77, 91, '000000000000000'); //Valor pago pelo Pagador
                replaceTextInLine(filePath, 3, 92, 106, '000000000000000'); //Valor liquido a ser creditado
                replaceTextInLine(filePath, 3, 107, 121, '000000000000000'); //Valor de outras despesas
                replaceTextInLine(filePath, 3, 122, 136, '000000000000000'); //Valor de outros créditos
                replaceTextInLine(filePath, 3, 137, 144, '00000000'); //Data da ocorrência
                replaceTextInLine(filePath, 3, 145, 152, '00000000'); //Data da efetivação do crédito
                replaceTextInLine(filePath, 3, 153, 156, '0000'); //Código da ocorrência do Pagador
                replaceTextInLine(filePath, 3, 157, 164, '00000000'); //Data da ocorrência do Pagador
                replaceTextInLine(filePath, 3, 165, 179, '000000000000000'); //Valor da ocorrência do Pagador
                replaceTextInLine(filePath, 3, 180, 209, '                              '); //Valor da ocorrência do Pagador
                replaceTextInLine(filePath, 3, 210, 212, '000'); // Código do Banco correspondente compens.
                replaceTextInLine(filePath, 3, 213, 239, '                           '); // Reservado
                // // Ajuste Trailer de Lote
                replaceTextInLine(filePath, 4, 23, 28, '000001'); // Quantidade Boletos cobrança simples
                replaceTextInLine(filePath, 4, 29, 30, '00'); // Quantidade Boletos cobrança simples
                replaceTextInLine(filePath, 4, 31, 45, VL_NOM_TIT); //Valor total dos Boletos cobrança simples
                replaceTextInLine(filePath, 4, 46, 51, '000000'); // Quantidade de Boletos em cobrança vinculada
                replaceTextInLine(filePath, 4, 52, 68, '00000000000000000'); // Valor total dos Boletos em cobrança vinculada
                replaceTextInLine(filePath, 4, 69, 74, '000000'); // Quantidade de Boletos em cobrança caucionada
                replaceTextInLine(filePath, 4, 75, 91, '00000000000000000'); // Valor total dos Boletos em cobrança caucionada
                replaceTextInLine(filePath, 4, 92, 97, '000000'); // Quantidade de Boletos em cobrança descontada
                replaceTextInLine(filePath, 4, 98, 114, '00000000000000000'); // Valor total dos Boletos em cobrança descontada
            });
        });
    })
});

Cypress.Commands.add("generation_CNAB_COB_SANTANDER_240_RET_FEB", () => {
    cy.fixture('COBRANCA/LAY240/API/COBRANCA_REMESSA_seg_P_Q').then(function (COBRANCA_REMESSA_seg_P_Q) {
        this.payload_modelo_COBRANCA = COBRANCA_REMESSA_seg_P_Q.payload_modelo_COBRANCA
        this.payload_ABERTURA_COB_SANTANDER_FEB = COBRANCA_REMESSA_seg_P_Q.payload_ABERTURA_COB_SANTANDER_FEB
        this.payload_INVOICE_COB_SANTANDER_FEB = COBRANCA_REMESSA_seg_P_Q.payload_INVOICE_COB_SANTANDER_FEB
        cy.task('listFiles', { path: 'cypress/fixtures/COBRANCA/LAY240/CNAB', prefix: 'COB.SANTANDER.240.RET.FEB.Modelo' }).then((filePath) => {
            if (filePath) {
                cy.log(`Arquivo encontrado: ${filePath}`, { timeout: 6000 });
                cy.task('emptyDirectory', { directory: 'cypress/fixtures/COBRANCA/LAY240/CNAB', prefix: 'COB.SANTANDER.240.RET.FEB.Modelo' }).then(() => {
                    cy.log('Arquivo removido com sucesso');
                });
            } else {
                cy.log('Arquivo não encontrado');
            }
            cy.task('copyAndNameFile', {
                sourceDirectory: 'cypress/fixtures/COBRANCA/LAY240/CNAB',
                prefixToFind: 'COB.SANTANDER.240.REM.FEB.Modelo',
                destinationFileName: 'COB.SANTANDER.240.RET.FEB.Modelo', // Substitua com o nome desejado
            }).then((result) => {
                cy.log(result);
                const filePath = 'cypress/fixtures/COBRANCA/LAY240/CNAB/COB.SANTANDER.240.RET.FEB.Modelo';
                // Ajuste Header de Arquivo
                replaceTextInLine(filePath, 0, 142, 142, '2'); //Código Remessa / Retorno
                let DDMMAAAA_GER = generationDays_Date_CNAB(0)
                replaceTextInLine(filePath, 0, 143, 150, DDMMAAAA_GER); //Data de Geração do Arquivo
                let HHMMSS_GER = generation_Hora_CNAB()
                replaceTextInLine(filePath, 0, 151, 156, HHMMSS_GER); //Hora de Geração do Arquivo
                // Ajuste Header de Lote
                replaceTextInLine(filePath, 1, 8, 8, 'T'); // Tipo de Operação
                replaceTextInLine(filePath, 1, 191, 198, DDMMAAAA_GER); // Tipo de Operação
                // Ajuste Segmento T
                replaceTextInLine(filePath, 2, 13, 13, 'T'); //Segmento do Registro Detalhe
                replaceTextInLine(filePath, 2, 15, 16, '02'); //Código de Movimento Retorno
                replaceTextInLine(filePath, 2, 36, 36, '0'); //Dígito Verificador da Ag/Conta
                replaceTextInLine(filePath, 2, 37, 43, '1234567'); //Zero a esquerda Nosso Numero
                const NOSSO_NUMERO = this.payload_INVOICE_COB_SANTANDER_FEB.our_number
                replaceTextInLine(filePath, 2, 44, 56, NOSSO_NUMERO); //Zero a esquerda Nosso Numero
                const NUMERO_DOC = this.payload_INVOICE_COB_SANTANDER_FEB.billing_document_number
                replaceTextInLine(filePath, 2, 58, 72, NUMERO_DOC); //Número do Documento de Cobrança
                let DDMMAAAA_VENC = generationDays_Date_CNAB(30)
                cy.log(DDMMAAAA_VENC)
                replaceTextInLine(filePath, 2, 73, 80, DDMMAAAA_VENC); //Data do Vencimento do Título
                const value_title_amount = this.payload_modelo_COBRANCA.invoices[0].invoice.title_amount;
                const VL_NOM_TIT = parseFloat(value_title_amount.toString().replace('.', ''));
                replaceTextInLine(filePath, 2, 81, 95, VL_NOM_TIT); //Valor Nominal do Título
                replaceTextInLine(filePath, 2, 96, 98, '000'); //Número do Banco
                const AGENCIA_COB_REC = this.payload_INVOICE_COB_SANTANDER_FEB.demanding_bank_branch;
                replaceTextInLine(filePath, 2, 99, 103, AGENCIA_COB_REC); // Agência Cobradora/Recebedora
                replaceTextInLine(filePath, 2, 104, 104, '0'); // Dígito Verificador da Agência
                const IDENT_TIT_EMP = this.payload_modelo_COBRANCA.invoices[0].invoice.identifier;
                replaceTextInLine(filePath, 2, 105, 129, IDENT_TIT_EMP); // Identificação do Título na Empresa
                replaceTextInLine(filePath, 2, 130, 131, '00'); // Código da Moeda
                const TIPO_INSCR = this.payload_modelo_COBRANCA.invoices[0].payer.registration_type;
                replaceTextInLine(filePath, 2, 132, 132, TIPO_INSCR); // Tipo de Inscrição
                replaceTextInLine(filePath, 2, 133, 133, '0'); // Complemento Inscricao com zero a esquerda
                const NUMERO_INSCR = this.payload_modelo_COBRANCA.invoices[0].payer.registration_number;
                replaceTextInLine(filePath, 2, 134, 147, NUMERO_INSCR); // Número de Inscrição
                const NAME = this.payload_modelo_COBRANCA.invoices[0].payer.name;
                replaceTextInLine(filePath, 2, 148, 187, NAME); // Nome
                replaceTextInLine(filePath, 2, 188, 197, '0000000000'); // Nº do Contr. da Operação de Crédito
                replaceTextInLine(filePath, 2, 198, 212, '000000000000000'); // Valor da Tarifa / Custas
                replaceTextInLine(filePath, 2, 213, 222, '          '); // Identificação para Rejeições, Tarifas, Custas, Liquidação e Baixas
                replaceTextInLine(filePath, 2, 223, 239, '                 '); // Uso Exclusivo FEBRABAN/CNAB
                // Ajuste Segmento U
                replaceTextInLine(filePath, 3, 13, 13, 'U'); //Segmento do Registro Detalhe
                replaceTextInLine(filePath, 3, 15, 16, '02'); //Código de Movimento Retorno
                replaceTextInLine(filePath, 3, 17, 152, '0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
                replaceTextInLine(filePath, 3, 153, 164, '            ');
                replaceTextInLine(filePath, 3, 165, 179, '000000000000000');
                replaceTextInLine(filePath, 3, 180, 209, '                              ');
                replaceTextInLine(filePath, 3, 210, 232, '00000000000000000000000');
                replaceTextInLine(filePath, 3, 233, 239, '       ');
            });
        });
    })
});
