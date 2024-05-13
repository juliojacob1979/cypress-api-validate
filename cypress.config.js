const { defineConfig } = require("cypress");
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  projectId: 'fa5k4f',
  video: false,
  reporter: 'mochawesome',
  reporterOptions: {
    reportTitle: 'My Custom Title',
    reportDir: 'cypress/report/mochawesome-report',
    overwrite: false,
    html: false,
    json: true,
    timestamp: 'mmddyyyy_HHMMss',
    cdn: true,
    charts: true,
  },
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        listFiles({ path: folderPath, prefix }) {
          const files = fs.readdirSync(folderPath);
          if (prefix) {
            const fileWithPrefix = files.find((file) => file.startsWith(prefix));
            if (fileWithPrefix) {
              return path.join(folderPath, fileWithPrefix);
            }
          } else {
            // Se nenhum prefixo for fornecido, retorna todos os arquivos na pasta
            return files.map((file) => path.join(folderPath, file));
          }
          // Retorna null se nenhum arquivo com o prefixo for encontrado
          return null;
        },
        emptyDirectory: ({ directory, prefix = null }) => {
          fs.readdirSync(directory).forEach((file) => {
            const filePath = `${directory}/${file}`;
            if (!prefix || file.startsWith(prefix)) {
              if (fs.lstatSync(filePath).isDirectory()) {
                fs.rmdirSync(filePath, { recursive: true });
              } else {
                fs.unlinkSync(filePath);
              }
            }
          });
          return null;
        },
        moveFile: ({ source, destination }) => {
          const fileName = path.basename(source);
          const sourcePath = path.resolve(source);
          const destinationPath = path.resolve(destination, fileName);
          fs.renameSync(sourcePath, destinationPath);
          return null;
        },
        writeFile: ({ filePath, fileContent }) => {
          const absolutePath = path.resolve(filePath);
          // Escreve o conteúdo no arquivo
          fs.writeFileSync(absolutePath, fileContent, 'utf-8');
          return null; // Retorna null para indicar que a tarefa foi concluída com sucesso
        },
        replaceTextInLine: ({ filePath, lineIndex, start, end, newValue }) => {
          // Leitura do arquivo
          const fs = require('fs');
          let fileContent = fs.readFileSync(filePath, 'utf-8');
          // Divida o conteúdo em linhas
          const lines = fileContent.split('\n');
          // Verifique se a linha especificada existe
          if (lines.length > lineIndex) {
            // Acesse a linha desejada
            const line = lines[lineIndex];
            // Verifique se o intervalo de caracteres especificado existe na linha
            if (line.length > start && line.length > end) {
              // Substitua o intervalo de caracteres especificado pelo novo valor
              const updatedLine =
                line.substring(0, start) + newValue + line.substring(end + 1);
              // Atualize a linha no array de linhas
              lines[lineIndex] = updatedLine;
              // Recrie o conteúdo do arquivo com as linhas atualizadas
              fileContent = lines.join('\n');
              // Escreva o novo conteúdo de volta no arquivo
              fs.writeFileSync(filePath, fileContent);
              // Retorna uma mensagem indicando que a operação foi concluída com sucesso
              return 'Operação concluída com sucesso';
            } else {
              return 'Intervalo de caracteres especificado não existe na linha';
            }
          } else {
            return 'Linha especificada não existe no arquivo';
          }
        },
        copyAndNameFile: ({ sourceDirectory, prefixToFind, destinationFileName }) => {
          return new Promise((resolve, reject) => {
            fs.readdir(sourceDirectory, (err, files) => {
              if (err) {
                reject(`Erro ao ler o diretório: ${err}`);
                return;
              }

              // Encontrar o arquivo com o prefixo desejado
              const matchingFile = files.find((file) => file.startsWith(prefixToFind));

              if (!matchingFile) {
                resolve(`Nenhum arquivo com o prefixo "${prefixToFind}" encontrado.`);
                return;
              }

              const sourceFilePath = path.join(sourceDirectory, matchingFile);
              const destinationFilePath = path.join(sourceDirectory, destinationFileName);

              // Renomear o arquivo
              fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
                if (err) {
                  reject(`Erro ao copiar o arquivo: ${err}`);
                } else {
                  resolve(`Arquivo copiado com sucesso como ${destinationFileName}`);
                }
              });
            });
          });
        },
      });
    },
    viewportWidth: 1920,
    viewportHeight: 1080,
    baseUrl: null,
    specPattern: 'cypress/e2e/**/*.cy*',
    chromeWebSecurity: false
  },
});
