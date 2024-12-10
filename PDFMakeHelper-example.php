<?php

namespace Doc24SharedCore\Helpers;

use GuzzleHttp\Exception\ServerException;
use Slim\Slim;
use LogHelper;

class PDFMakeHelper
{

    /**
     * @param $documentDefinition
     * @return bool|string
     *
     * given the document definition, it generates a PDF and returns its base64
     *
     */
    public static function getBase64PDF($documentDefinition){
        $app = Slim::getInstance();
        if(!$documentDefinition){
            return false;
        }

        $ip ="";
        $port = '';

        $nodeServer = $app->settings['settings']['node_url'] . "/pdf/getB64";
        $nodeServer = "http://$ip:$port/pdf/getB64";
        //$nodeServer = "http://192.168.1.12:3000/pdf/getB64"; // Example

        //Limpio el documento de espacios en blanco que romperian el server
        $documentDefinition = $app->commonController->removerWhiteSpaces($documentDefinition);

        $documentDefinition = json_encode(base64_encode($documentDefinition));
        $body = ['form_params' => [
                                'pdfdefinition' => $documentDefinition
                                ]];

        try {
            // Use cURL to send the request
        $ch = curl_init($nodeServer);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        $response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        } catch (\Throwable $e){
            $serverError =  $e->getTraceAsString() . " " . $e->getMessage();
            LogHelper::logException($e, " core_node exception " . __FUNCTION__ . " " . __FILE__ . " - Document definition $documentDefinition - Response from node server: $serverError");
            throw $e;
        }

        if ($code == 200) {
            // Decodifico la respuesta JSON
            $responseArray = json_decode($response, true);
    
            // Verifico si contiene 'pdfBase64' y devuelvo el valor
            if (isset($responseArray['pdfBase64'])) {
                return $responseArray['pdfBase64'];
            } else {
                // Si no se encuentra 'pdfBase64', logueo el error
                LogHelper::logMessage("getBase64PDF: 'pdfBase64' not found in response. Response: $response", LogHelper::LOG_TYPE_ERROR);
                return false;
            }
        }

        LogHelper::logMessage("getBase64PDF : Error de Node Server codigo $code  - Document definition $documentDefinition", LogHelper::LOG_TYPE_ERROR);
        return false;
    }

}