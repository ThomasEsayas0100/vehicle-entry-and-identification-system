require('dotenv').config();
const { exec } = require('child_process');
const vision = require('@google-cloud/vision');
var fs = require('fs');
const compare = require('./database-handler.js')
const admin = require('firebase-admin');

var takeStill = function () {

    var child = exec('raspistill -n -o images/realtime.jpg -w 700 -h 500 -br 75');

    child.stdout.on('data', function (data) {
        console.log('child process exited with ' +
            `code ${data}`);
    });

    child.on('exit', function (code, signal) {
        async function setEndpoint() {
            // Specifies the location of the api endpoint
            const clientOptions = {
                //apiEndpoint: 'eu-vision.googleapis.com' 
                projectId: "licenseplatereader-381023",
                credentials: process.env.VISION_CREDENTIALS
               };;

            // Creates a client
            const client = new vision.ImageAnnotatorClient(clientOptions);

            // Performs text detection on the image file
            const [result] = await client.textDetection('./images/realtime.jpg');
            const labels = result.textAnnotations;

            var license_number = null;

            labels.forEach(function (a, b) {

                if (b == 0) {
                    license_number = a.description;
                }

            });

            if (license_number == null) {
                license_number = "None Detected"
            } else {
                license_number = license_number.split(/\n|\r|\t/g);
                for (var i = 0; i < license_number.length; i++) {
                    alphanum = (license_number || '').toString().replace(/[^a-zA-Z0-9]/g, '');
                    compare(alphanum);
                }
            }

            takeStill();

        }
        setEndpoint();

    });
}

takeStill();



