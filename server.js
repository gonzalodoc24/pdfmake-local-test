const express = require('express');
const bodyParser = require('body-parser');
const pdfMake = require('pdfmake');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/pdf/createpdf', (req, res) => {
  
    let dd = null;
    let status = 400;
    let msg = '';

    try {
        const { pdfdefinition } = req.body.form_params;

        if (!pdfdefinition) {

            console.log("\x1b[31mPDF definition not provided\x1b[0m");

            return res.status(status).send('PDF definition not provided');
        }

        // Log the base64 encoded PDF definition
        // console.log('Base64 encoded PDF definition:', pdfdefinition);

        // Decode the base64 string to see the actual document definition
        var decodedDefinition = Buffer.from(pdfdefinition, 'base64').toString('utf8');

        console.log("\n..........\n");
        // console.log(decodedDefinition);
        console.log("\n..........\n");
        
        // Create function to return the JS object
        let createObject = new Function('return ' + decodedDefinition);
        dd = createObject();

        const printer = new pdfMake({
            Roboto: {
              normal: 'fonts/Roboto-Regular.ttf',
              bold: 'fonts/Roboto-Medium.ttf',
              italics: 'fonts/Roboto-Italic.ttf',
              bolditalics: 'fonts/Roboto-MediumItalic.ttf'
            }
        });

        // Should print "object", not "string"
        console.log("\x1b[36mDocument Definition data type: " + typeof dd + "\x1b[0m");

        const pdfDoc = printer.createPdfKitDocument(dd);

        let chunks = [];
        pdfDoc.on('data', (chunk) => {
            chunks.push(chunk);
        });

        pdfDoc.on('end', () => {
            const result = Buffer.concat(chunks);
            res.send(result.toString('base64'));
        });

        pdfDoc.end();

        console.log("\n\x1b[32mDone!\x1b[32m\n");
        status = 200;
        msg = 'OK';

    } catch (error) {

        console.log("\n\x1b[31mOops!\x1b[0m\n\n", error ,"\n\n");

        status = 500;
        msg = 'FAIL';
        
    } finally{
        console.log("\n\x1b[36m----end----\x1b[0m\n");
        
        return res.status(status).send(msg);
    }

});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
