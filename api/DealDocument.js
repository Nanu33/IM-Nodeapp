const reader = require('xlsx')
const xlsxFile = require('read-excel-file/node');
const path = require('path');
const fs = require('fs');
const solc = require('solc');
const http = require('http')
const Web3 = require('web3');
const { EventEmitter } = require('stream');
const { UUID } = require('bson');
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const winlog = require("../log/winstonlog");
const SDealDocuments = require('./abi/DealDocuments')
const mime = require('mime-types');
const contractAddress = SDealDocuments.address; // deployed contract address( can be taken from remix or index.js)

const { v4: uuidv4 } = require('uuid');

const ipfsAPI = require('ipfs-api');

const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });


var Document = {
    addDeal: function (req, res) {
        var dealEmitter = new EventEmitter();
        var final = path.resolve(__dirname + '/../uploads/' + req.file.filename);            //var testFile = fs.readFileSync("/home/pavithra/y/pool1/TWO24788.pdf");
        var testFile = fs.readFileSync(final);
        //Creating buffer for ipfs function to add file to the system
        var testBuffer = new Buffer(testFile);
        // var testFile = fs.readFileSync("PATH_OF_FILE");
        //Creating buffer for ipfs function to add file to the system
        var testBuffer = new Buffer(testFile);
        ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
                winlog.info(err);
            }
            winlog.info(file[0].hash)
            adddocument(file[0].hash)
            // loancontract.URI = "http://104.42.155.78:8080/ipfs/" + file[0].hash;


        })
        async function adddocument(docpath) {

            return new Promise((resolve, reject) => {
                winlog.info("add document::::::::::::")
                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealDocuments.sol");
                //const source = fs.readFileSync(contractPath, 'utf8');
                const contractname = "DealDocuments";

                // const input = {
                //     language: 'Solidity',
                //     sources: {
                //         [contractname + ".sol"]: {
                //             content: source,
                //         },
                //     },
                //     settings: {
                //         outputSelection: {
                //             '*': {
                //                 '*': ['*'],
                //             },
                //         },
                //     },
                // };

                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SDealDocuments.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                var documentarray = [[uuidv4(), req.body.dealid, req.body.docname, req.body.description, req.body.privacymode, docpath, req.body.underwriterid, req.file.filename]]
                winlog.info(documentarray)
                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.addDocuments(documentarray).encodeABI();
                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: contractAddress,
                                data: encoded,
                                gasLimit: 6000000,
                                chainId: "101122"
                            },
                            privKey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );
                        winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                        var eventarr = web3.eth.abi.decodeParameters([{
                            type: 'string[]',
                            name: 'id'
                        }], createReceipt.logs[0].data)
                        var finaleventarr = eventarr.id
                        winlog.info(finaleventarr)
                        var emittercount = 0;
                        for (var i = 0; i < finaleventarr.length; i++) {
                            if (finaleventarr[i] != '') {
                                emittercount++;
                            }
                        }
                        if (emittercount > 0) {
                            winlog.info(finaleventarr)
                            res.send({
                                "success": false,
                                "message": "Data already exist"
                            })
                        } else {
                            res.send({ "success": true, "message": "deal upload Update Success" });
                        }
                        try {
                            fs.unlinkSync(final)
                            winlog.info("local file removed:::::::::")
                        } catch (err) {
                            console.error(err)
                        }
                        resolve("upload  success")
                    } catch (e) {
                        errcount++;
                        if (e.reason && e.reason.includes("Caller is not an invoker")) {
                            winlog.info(e.reason)
                            res.status(500).send(e.reason);
                        }
                        else if (errcount <= 3) {
                            winlog.info("error occ" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            });
        }
    },

    updatedeal: function (req, res) {
        const contractPath = path.join(process.cwd() + "/api/contracts/DealDocuments.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "DealDocuments"
        // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
        //const source = fs.readFileSync(contractPath, 'utf8');

        // const input = {
        //     language: 'Solidity',
        //     sources: {
        //         [contractname + ".sol"]: {
        //             content: source,
        //         },
        //     },
        //     settings: {
        //         outputSelection: {
        //             '*': {
        //                 '*': ['*'],
        //             },
        //         },
        //     },
        // };

        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)

        //const bytecode = contractFile.evm.bytecode.object;
        const abi = SDealDocuments.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;
        const get1 = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getDocumentByDocumentId(req.body.documentid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info("final updated array::::::::::::::")
                winlog.info(finalresponse)
                var key = ["documentid", "dealId", "dealname", "description", "privacymode", "documentpath", "underwriterid", "filename"];

                finalresponse[2] = req.body.docname;
                finalresponse[3] = req.body.description;
                finalresponse[4] = req.body.privacymode;
                winlog.info([finalresponse])
                updatedealdocument([finalresponse]);
            } catch (e) {
                errcount++;
                if (errcount <= 3) {
                    winlog.info("error occ" + e);
                    get1();
                } else {
                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            }
        }; get1();

        function updatedealdocument(finalresponse) {

            return new Promise((resolve, reject) => {

                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealDocuments.sol");
                const contractname = "DealDocuments";
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {
                //     language: 'Solidity',
                //     sources: {
                //         [contractname + ".sol"]: {
                //             content: source,
                //         },
                //     },
                //     settings: {
                //         outputSelection: {
                //             '*': {
                //                 '*': ['*'],
                //             },
                //         },
                //     },
                // };

                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SDealDocuments.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateDocument(finalresponse).encodeABI();

                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: contractAddress,
                                data: encoded,
                                gasLimit: 6000000,
                                chainId: "101122"
                            },
                            privKey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );
                        winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                        var eventarr = web3.eth.abi.decodeParameters([{
                            type: 'string[]',
                            name: 'id'
                        }], createReceipt.logs[0].data)
                        var finaleventarr = eventarr.id
                        winlog.info(finaleventarr)
                        var emittercount = 0;
                        for (var i = 0; i < finaleventarr.length; i++) {
                            if (finaleventarr[i] != '') {
                                emittercount++;
                            }
                        }
                        if (emittercount > 0) {
                            winlog.info(finaleventarr)
                            res.send({
                                "success": false,
                                "message": "ID doesnot exist"
                            })
                        } else {
                            res.send({ "success": true, "message": "deal document Update Success" });
                            resolve(" update  success")

                        }
                    } catch (e) {
                        errcount++;
                        if (e.reason && e.reason.includes("Caller is not an invoker")) {
                            winlog.info(e.reason)
                            res.status(500).send(e.reason);
                        }
                        else if (errcount <= 3) {
                            winlog.info("error occ" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            });
        }
    },

    DownloadDealDoc: function (req, res) {

        if (!req.query.documentid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            var DocumentEmitter = new EventEmitter();
            const contractPath = path.join(process.cwd() + "/api/contracts/DealDocuments.sol");
            winlog.info("contractpath:: " + contractPath);
            const contractname = "DealDocuments"

            const abi = SDealDocuments.abi;

            const incrementer = new web3.eth.Contract(abi, contractAddress);
            let errcount = 0;
            const get1 = async () => {
                winlog.info(`Making a call to contract at address ${contractAddress}`);
                try {
                    const data = await incrementer.methods
                        .getDocumentByDocumentId(req.query.documentid)
                        .call({ from: address });

                    var response = { "result": JSON.stringify(data) }
                    var finalresponse = JSON.parse(response.result)
                    winlog.info("final updated array::::::::::::::")
                    winlog.info(finalresponse)
                    var key = ["documentid", "dealId", "dealname", "description", "privacymode", "documentpath", "underwriterid"];


                    // finalresponse[2] = req.body.docname;

                    DocumentEmitter.emit('downloaddoc', finalresponse[5], finalresponse[7]);
                } catch (e) {
                    winlog.info("Error Occured" + e)

                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            }; get1();

            DocumentEmitter.on('downloaddoc', (validCID, filename) => {
                winlog.info("in " + validCID)
                http.get(`http://20.237.185.191:8080/ipfs/${validCID}`, (response) => {

                    const contentType = response.headers['content-type'];
                    const fileExtension = mime.extension(contentType);
                    winlog.info(fileExtension);
                    // var json = {
                    //     "fileURI": "http://20.237.185.191:8080/ipfs/" + validCID,
                    //     "type": fileExtension
                    // };
                    // res.send(json);

                });
                const file1 = path.resolve(__dirname + '/../uploads/'+filename );  
                var filepath = path.join(__dirname + '/../uploads/'+filename ); 
                console.log(filepath)
                http.get("http://20.237.185.191:8080/ipfs/"+validCID, (response) => {
                   // const path = "downloaded-image.jpg";
                    const writeStream = fs.createWriteStream(file1);

                    response.pipe(writeStream);

                    writeStream.on("finish", () => {
                       writeStream.close();
                       res.download(filepath)
                       winlog.info("Download file ready!");
                       //res.send({"filepath":'/uploads/'+filename})
                      
                    })
                })

                //download file from different server
                // const file = fs.createWriteStream("file.jpg");
                // const request = http.get("http://20.237.185.191:8080/ipfs/"+validCID, function(response) {
                //   response.pipe(file);
                // });
                // res.download(file)
                // res.download("http://" + validCID)  
           // });
                
            })

        }

    },

    DeleteDealDoc: function (req, res) {
        const contractPath = path.join(process.cwd() + "/api/contracts/DealDocuments.sol");
        winlog.info("contractpath:: " + contractPath);
        const contractname = "DealDocuments"
        // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
        //const source = fs.readFileSync(contractPath, 'utf8');

        // const input = {
        //     language: 'Solidity',
        //     sources: {
        //         [contractname + ".sol"]: {
        //             content: source,
        //         },
        //     },
        //     settings: {
        //         outputSelection: {
        //             '*': {
        //                 '*': ['*'],
        //             },
        //         },
        //     },
        // };

        //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
        //winlog.info(tempFile)
        //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
        //winlog.info(contractFile)

        //const bytecode = contractFile.evm.bytecode.object;
        const abi = SDealDocuments.abi;

        const incrementer = new web3.eth.Contract(abi, contractAddress);
        let errcount = 0;
        const get1 = async () => {
            winlog.info(`Making a call to contract at address ${contractAddress}`);
            try {
                const data = await incrementer.methods
                    .getDocumentByDocumentId(req.body.documentid)
                    .call({ from: address });
                //  winlog.info("data:: " + JSON.stringify(data));
                // winlog.info(`The current string is: ` + data);
                // var response ={ "result":JSON.stringify(data)}
                // winlog.info(response)
                var response = { "result": JSON.stringify(data) }
                var finalresponse = JSON.parse(response.result)
                winlog.info("final updated array::::::::::::::")
                winlog.info(finalresponse)
                var key = ["documentid", "dealId", "dealname", "description", "privacymode", "documentpath", "underwriterid", "filename"];

                finalresponse[1] = "-"
                // finalresponse[2] = req.body.docname;
                // finalresponse[3] = req.body.description;
                // finalresponse[4] = req.body.privacymode;
                winlog.info([finalresponse])
                updatedealdocument([finalresponse]);
            } catch (e) {
                errcount++;
                if (errcount <= 3) {
                    winlog.info("error occ" + e);
                    get1();
                } else {
                    var r = { "message": e.message }
                    res.status(500).send(r);
                }
            }
        }; get1();

        function updatedealdocument(finalresponse) {

            return new Promise((resolve, reject) => {

                const contractPath = path.join(process.cwd(), '/api/contracts/' + "DealDocuments.sol");
                const contractname = "DealDocuments";
                //const source = fs.readFileSync(contractPath, 'utf8');

                // const input = {
                //     language: 'Solidity',
                //     sources: {
                //         [contractname + ".sol"]: {
                //             content: source,
                //         },
                //     },
                //     settings: {
                //         outputSelection: {
                //             '*': {
                //                 '*': ['*'],
                //             },
                //         },
                //     },
                // };

                //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
                //winlog.info(tempFile)
                //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
                //winlog.info(contractFile)
                ////const bytecode = contractFile.evm.bytecode.object;
                const abi = SDealDocuments.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);

                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.updateDocument(finalresponse).encodeABI();

                        const createTransaction = await web3.eth.accounts.signTransaction(
                            {
                                from: address,
                                to: contractAddress,
                                data: encoded,
                                gasLimit: 6000000,
                                chainId: "101122"
                            },
                            privKey
                        ); const createReceipt = await web3.eth.sendSignedTransaction(
                            createTransaction.rawTransaction
                        );
                        winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                        var eventarr = web3.eth.abi.decodeParameters([{
                            type: 'string[]',
                            name: 'id'
                        }], createReceipt.logs[0].data)
                        var finaleventarr = eventarr.id
                        winlog.info(finaleventarr)
                        var emittercount = 0;
                        for (var i = 0; i < finaleventarr.length; i++) {
                            if (finaleventarr[i] != '') {
                                emittercount++;
                            }
                        }
                        if (emittercount > 0) {
                            winlog.info(finaleventarr)
                            res.send({
                                "success": false,
                                "message": "ID doesnot exist"
                            })
                        } else {
                            res.send({ "success": true, "message": "deal document Delete Success" });
                            resolve(" update  success")

                        }
                    } catch (e) {
                        errcount++;
                        if (e.reason && e.reason.includes("Caller is not an invoker")) {
                            winlog.info(e.reason)
                            res.status(500).send(e.reason);
                        }
                        else if (errcount <= 3) {
                            winlog.info("error occ" + e);
                            increment();
                        } else {
                            var r = { "message": e.message }
                            res.status(500).send(r);
                        }
                    }
                }; increment();
            });
        }
    },

}

module.exports = Document;