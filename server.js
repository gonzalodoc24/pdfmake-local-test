const express = require('express');
const bodyParser = require('body-parser');
const pdfMake = require('pdfmake');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/pdf/createpdf', (req, res) => {
  
    let documentDefinition = null;
    try {
        const { pdfdefinition } = req.body.form_params;

        if (!pdfdefinition) {

            return res.status(400).send('PDF definition not provided');
        }

        // Log the base64 encoded PDF definition
        // console.log('Base64 encoded PDF definition:', pdfdefinition);

        // Decode the base64 string to see the actual document definition
        const decodedDefinition = Buffer.from(pdfdefinition, 'base64').toString('utf8');
        console.log('Decoded PDF definition:', decodedDefinition);
        documentDefinition = JSON.parse(decodedDefinition);

        const printer = new pdfMake({
            Roboto: {
              normal: 'fonts/Roboto-Regular.ttf',
              bold: 'fonts/Roboto-Medium.ttf',
              italics: 'fonts/Roboto-Italic.ttf',
              bolditalics: 'fonts/Roboto-MediumItalic.ttf'
            }
        });

        const pdfDoc = printer.createPdfKitDocument(documentDefinition);

        let chunks = [];
        pdfDoc.on('data', (chunk) => {
            chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
            const result = Buffer.concat(chunks);
            res.send(result.toString('base64'));
        });

        pdfDoc.end();
    } catch (error) {

        console.log("\n", documentDefinition ,"\n");

        console.log("\n", error ,"\n");
    }

  console.log("\n----end----\n");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});