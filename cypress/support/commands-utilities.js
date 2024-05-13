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

import AWS from 'aws-sdk';
import moment from 'moment-timezone';

export function generationDays_Date_Json(days) {
  // Define o fuso horário para Brasília
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  now.setDate(now.getDate() + days);
  const generationDate = moment(now).format();
  const generationDateFormat = generationDate.substring(0, 10);

  return generationDateFormat;
}

export function generationDays_Date_CNAB(days) {
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  now.setDate(now.getDate() + days);

  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Os meses são zero-indexed, então adicionamos 1.
  const year = now.getFullYear();

  const generatedDate = `${day}${month}${year}`;

  return generatedDate;
}

export function generationDays_CompetenciaMesAno_CNAB(days) {
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  now.setDate(now.getDate() + days);

  const month = String(now.getMonth() + 1).padStart(2, '0'); // Os meses são zero-indexed, então adicionamos 1.
  const year = now.getFullYear();

  const generatedCompetencia = `${month}${year}`;

  return generatedCompetencia;
}

export function generationDays_PeriodoApuracao_CNAB(days) {
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  now.setDate(now.getDate() + days);

  const month = String(now.getMonth() + 1).padStart(2, '0'); // Os meses são zero-indexed, então adicionamos 1.
  const year = now.getFullYear();

  const generatedDate = `01${month}${year}`;

  return generatedDate;
}

export function generationDays_Competencia_Json(days) {
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  now.setDate(now.getDate() + days);
  const generationDate = moment(now).format();
  const generationDateFormat = generationDate.substring(0, 7);

  const generatedCompetencia = `${generationDateFormat}-01`;

  cy.log(generatedCompetencia)

  return generatedCompetencia;
}

export function generationDays_Anobase_CNAB(days) {
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  now.setDate(now.getDate() + days);

  const year = now.getFullYear();

  const generatedAnobase = `${year}`;

  return generatedAnobase;
}

export function generationDays_Anobase_Json(days) {
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  now.setDate(now.getDate() + days);

  const year = now.getFullYear();

  const generatedAnobase = year;

  return generatedAnobase;
}

export function generation_Hora_CNAB() {
  moment.tz.setDefault('America/Sao_Paulo');

  let now = new Date();

  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  const generatedHora = `${hour}${minute}${second}`;

  return generatedHora;
}

export function replaceTextInLine(filePath, lineIndex, start, end, newValue) {
  return cy.task('replaceTextInLine', {
    filePath,
    lineIndex,
    start,
    end,
    newValue,
  }).then((result) => {
    // Verifique o resultado da operação aqui
    if (result === 'Operação concluída com sucesso') {
      cy.log('Operação bem-sucedida');
    } else {
      cy.log(`Erro: ${result}`);
    }
  });
}

export function validatedownloadedFile(prefix) {
  cy.task('listFiles', { path: 'cypress/downloads', prefix: prefix }).then((filePath) => {
    if (filePath) {
      cy.log(`Arquivo encontrado: ${filePath}`, { timeout: 6000 });
      cy.task('emptyDirectory', { directory: 'cypress/downloads', prefix: prefix }).then(() => {
        cy.log('Arquivo removido com sucesso');
      });
    } else {
      cy.log('Arquivo não encontrado');
    }
  });
}

Cypress.Commands.add("validatedownloadedSaveFile", (prefix, path) => {
  cy.task('listFiles', { path: 'cypress/downloads', prefix: prefix }).then((filePath) => {
    if (filePath) {
      cy.task('emptyDirectory', { directory: path, prefix: prefix }).then(() => {
        const sourcePath = filePath;
        const destinationPath = path;
        return cy.task('moveFile', { source: sourcePath, destination: destinationPath }).then(() => {
          cy.log('Arquivo CNAB guardado com sucesso');
        })
      })
    } else {
      cy.log('Arquivo não encontrado');
    }
  });
});


export function saveFileinDirectory(path, prefix, payload) {
  const payload_servives_JSON = JSON.stringify(payload, null, 2);
  cy.task('listFiles', { path: path, prefix: prefix }).then((filePath) => {
    if (filePath) {
      cy.log(`Arquivo encontrado: ${filePath}`, { timeout: 6000 });
      cy.task('emptyDirectory', { directory: path, prefix: prefix }).then(() => {
        cy.log('Arquivo removido com sucesso');
      });
    } else {
      cy.log('Arquivo não encontrado');
    }
    cy.task('writeFile', { filePath: `${path}/${prefix}.json`, fileContent: payload_servives_JSON }).then(() => {
      cy.log(`Arquivo JSON gerado e salvo como ${prefix}.json`);
    });
  });
}

export function copyevidenciaFile(path, prefix, filePath) {
  cy.task('emptyDirectory', { directory: path, prefix: prefix }).then(() => {
    const sourcePath = filePath;
    const destinationPath = path;
    return cy.task('moveFile', { source: sourcePath, destination: destinationPath }).then(() => {
      cy.log('Arquivo CNAB guardado com sucesso');
    })
  })
}

export function limpezaFile(prefix) {
  cy.task('emptyDirectory', { directory: 'cypress/downloads', prefix: prefix }).then(() => {
    cy.log('Arquivo CNAB deletado com sucesso');
  })
}

export async function downloadFileFromS3(bucketName, objectKey, downloadPath) {
  
  const s3 = new AWS.S3({
    accessKeyId: Cypress.env('AWS_ACCESS_KEY_ID'),
    secretAccessKey: Cypress.env('AWS_SECRET_ACCESS_KEY'),
    region: 'sa-east-1'
  });

  const params = {
    Bucket: bucketName,
    Key: objectKey
  }

  try {
    return cy.wrap(new Promise(async (resolve, reject) => {
      let retryCount = 0;

      const tryDownload = async () => {
        try {
          const data = await s3.getObject(params).promise();
          resolve(data);
        } catch (err) {
          if (err.code === 'NoSuchKey' && retryCount < 6) {
            // Se o objeto não existir (404) e o número de tentativas for menor que 3, tenta novamente após um intervalo
            retryCount++;
            setTimeout(tryDownload, 8000); // Espere 5 segundos antes de tentar novamente
          } else {
            reject(err);
          }
        }
      };

      tryDownload();
    }), { timeout: 30000 }) // Ajuste o timeout conforme necessário
      .then(async (data) => {
        await cy.writeFile(downloadPath, data.Body, 'binary', { encoding: 'base64' });
        return data;
      });
  } catch (err) {
    cy.log('[downloadFile] error saving file to S3: ' + err);
    throw err; // Rejeita a Promise com o erro
  }
};

Cypress.env('MSG_COD_BANCARIOS_COB', "\"company.bank_identifier\" must be one of [1, 33, 77, 84, 99, 104, 208, 237, 246, 341, 422, 653, 655, 707, 745, 748, 756]")               
Cypress.env('MSG_COD_BANCARIOS_PAG', "\"company.bank_identifier\" must be one of [1, 33, 104, 208, 237, 341, 422, 748, 756]")
Cypress.env('MSG_COD_TITLE_TYPE_COB_BB', "\"invoices[0].invoice.title_type\" must be one of [1, 2, 3, 4, 5, 6, 7, 8, 9, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 99]")
Cypress.env('MSG_COD_TITLE_TYPE_COB_SANTANDER', "\"invoices[0].invoice.title_type\" must be one of [02, 2, 04, 4, 07, 7, 30, 12, 13, 17, 20, 31, 32, 33, 97, 98]")
Cypress.env('MSG_COD_LATE_PAYMENT_INTEREST_CODE_COB_BB', "\"invoices[0].invoice.late_payment_interest_code\" must be one of [1, 2, 3]")
Cypress.env('MSG_COD_LATE_PAYMENT_INTEREST_CODE_COB_SANTANDER', "\"invoices[0].invoice.late_payment_interest_code\" must be one of [1, 2, 3, 4, 5, 6]")