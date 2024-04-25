//Required modules
const ipfsAPI = require('ipfs-api');

const fs = require('fs');
const path = require('path');
let nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
var EventEmitter = require("events").EventEmitter;
const winlog = require("../log/winstonlog");
const SCreatePool = require('./abi/CreatePool')
//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });
const ipfsurl = 'http://20.237.185.191:8080/ipfs/';//9095 
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const { arrayIntersectSafe } = require('excel4node/distribution/lib/utils');
const { stringify } = require('querystring');
const { resolveObjectURL } = require('buffer');
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = 'ccd1a9d8a8fa89fb020c027abc62088f9dca7734f945dc6a0577d06b6d502077';  //replcae
const address = '0x1F592d5CD2c0B0C5709f4e2a0cFa4849c7935d6a';
const SUser = require('./abi/User')
const SLoanContract = require('./abi/LoanContract')
const SNFT = require('./abi/NFT')
var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://localhost:27017/IntainMarkets";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
// var Preclosing = require('./PreClosing')
const AdmZip = require('adm-zip');

var IPFS = {

    addfile: function (req, res) {
        if (!req.body.poolid) {
            res.status(400).send({ "message": "Missing Arguments!" })
        } else {
            winlog.info("new address::::::::")
            var s = new Date();
            winlog.info("date ::::::::" + s)
            winlog.info("NFT started at ::::: " + s.getHours() + " " + s.getMinutes() + " " + s.getSeconds());

            var IpfsEmitter = new EventEmitter();
            var poolEmitter = new EventEmitter();
            var finalloancontractarr = [];
            var loancontractlength = 0;
            var count = 0;
            var loanmap = {};

            MongoClient.connect(url, async function (err, client) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                }
                const db = client.db("IntainMarkets");
                let loandetails = await db.collection("previewstdloantape").find({ poolid: req.body.poolid }).toArray();
                db.collection('pool_detail').findOne({ poolID: req.body.poolid }, function (err, result) {
                    if (err) {
                        var responseMessage = {
                            "isSuccess": false,
                            "statuscode": 500,
                            "message": "Internal Server Error: Database connection failed."
                        };
                        winlog.error(JSON.stringify(responseMessage));
                        winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                        return res.status(500).send(responseMessage);
                    }
                    //  winlog.info("res:: " + JSON.stringify(result));
                    loancontractlength = loandetails.length;
                    //  winlog.info(JSON.stringify(result))
                    console.log(result)
                    for (let key in result.contractpath) {
                        console.log(key)
                        const zipFilePath = path.resolve(__dirname + '/../uploads/uploads/' + key + "/" + result.contractpath[key]);
                        const extractDir = path.resolve(__dirname + '/../uploads/');

                        fs.mkdirSync(extractDir, { recursive: true });

                        // Extract the zip file directly into the target directory
                        console.log(zipFilePath)
                        const zip = new AdmZip(zipFilePath);
                        zip.extractAllTo(extractDir, true);

                        fs.mkdirSync(extractDir, { recursive: true });
                        zip.extractAllTo(extractDir, true);

                    }
                    for (var i = 0; i < loandetails.length; i++) {
                        // winlog.info(result[i])
                        //  winlog.info(result[i].loandocpath)
                        // winlog.info("loan contract number::::::" + result[i].contract_number);
                        // IpfsEmitter.emit('IPFSsaveloancontract', result[i].contract_number, result[i])
                        winlog.info(i + "::::::::::::: " + loandetails[i].Verificationtemplate)
                        const fileNameWithoutExtension = path.parse(result.contractpath[loandetails[i].Verificationtemplate]).name;
                        let loandocpath = path.resolve(__dirname + '/../uploads/' + fileNameWithoutExtension + "/" + loandetails[i]["Loan ID"] + ".pdf");

                        console.log("Path :::::::" + loandocpath)
                        // IpfsEmitter.emit('extractattributes', result[i].loandocpath, result[i])
                        let loanmetadata = { "loanid": loandetails[i]["Loan ID"] }
                        IpfsEmitter.emit('IPFSsaveloancontract', loandocpath, loanmetadata)
                    }
                    client.close();

                });

            });


            // IpfsEmitter.on('extractattributes', (loandocpath, loancontract) => {
            //     var finalmetadata = {}

            //     loancontract.extracted_attributes.forEach(values => {
            //         var key = values[0];
            //         //  winlog.info(key+":::::::::::::: "+loancontract[key])
            //         finalmetadata[key] = loancontract[key]
            //     })
            //     winlog.info(finalmetadata)
            //   //  IpfsEmitter.emit('IPFSsaveloancontract', loandocpath, finalmetadata)

            // })

            IpfsEmitter.on('IPFSsaveloancontract', (loandocpath, loancontract) => {
                winlog.info("After extractattribute")
                // var testFile = fs.readFileSync("/home/pavithara/Downloads/test_LMS.xlsx");

                //  var final = path.resolve(__dirname + '/../uploads/' + loandocpath);
                //var testFile = fs.readFileSync("/home/pavithara/Documents/demo_deal(5).xlsm");
                var testFile = fs.readFileSync(loandocpath);

                //Creating buffer for ipfs function to add file to the system
                // var testBuffer = new Buffer(testFile);
                // var testFile = fs.readFileSync("PATH_OF_FILE");
                //Creating buffer for ipfs function to add file to the system
                var testBuffer = new Buffer(testFile);
                ipfs.files.add(testBuffer, function (err, file) {
                    if (err) {
                        winlog.info(err);
                    }
                    winlog.info(file)
                    loancontract.URI = ipfsurl + file[0].hash;
                    // winlog.info("final loan contract:::::::: " + JSON.stringify(loancontract));
                    finalloancontractarr.push(loancontract)
                    count++;
                    if (count == loancontractlength) {
                        winlog.info("final loan contract metadata:::: " + JSON.stringify(finalloancontractarr));;
                        count = 0;
                        IpfsEmitter.emit('IPFSsavemetadata', finalloancontractarr)

                    }
                })
            })


            IpfsEmitter.on('IPFSsavemetadata', () => {
                winlog.info("\n inside save metadata emitter::::::::::" + JSON.stringify(finalloancontractarr));

                finalloancontractarr.forEach(loan => {
                    let testBuffer = new Buffer(JSON.stringify(loan));
                    ipfs.files.add(testBuffer, function (err, file) {
                        if (err) {
                            winlog.info(err);
                        }
                        count++;
                        // inputEmit.emit('NFTmint', file[0].hash,id);
                        loan.hash = file[0].hash;
                        winlog.info("file hash " + file[0].hash)

                        loanmap[loan.loanid] = file[0].hash
                        winlog.info("final hash::::" + JSON.stringify(loanmap))
                        if (count == finalloancontractarr.length) {
                            winlog.info("loan hash::::::" + JSON.stringify(loanmap))
                            deployNFT(loanmap, finalloancontractarr);
                        }
                    })
                });
            })

            async function deployNFT(loanmap, finalloancontractarr) {

                MongoClient.connect(url, function (err, client) {
                    if (err) {
                        var responseMessage = {
                            "isSuccess": false,
                            "statuscode": 500,
                            "message": "Internal Server Error: Database connection failed."
                        };
                        winlog.error(JSON.stringify(responseMessage));
                        winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                        return res.status(500).send(responseMessage);
                    }
                    const db = client.db("IntainMarkets");
                    db.collection('previewstdloantape').find({ poolid: req.body.poolid }).toArray(function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        }
                        winlog.info("res:: " + result.length);
                        if (result.length > 0) {
                            winlog.info("lms data:::" + JSON.stringify(result))
                            //getlmsdata(result,loanmap)
                            NFTandMint(finalloancontractarr, loanmap, result)
                            winlog.info("done");
                        }
                        client.close();

                    });

                    winlog.info("Done final : ")
                })

            }


            async function NFTandMint(result, loanmap, lms) {
                winlog.info("inside nft mint")
                winlog.info(loanmap)
                winlog.info(result)
                const NFTowner = await getissueraccountaddress(lms[0].issuerId);
                winlog.info("owner address fetch completed::::::")
                for (var i = 0; i < result.length; i++) {

                    console.log(result)
                    winlog.info(result[i].loanid + " " + req.body.poolid + " " + ipfsurl + "\n\n no of loans iterated ::::::" + i)
                    winlog.info(loanmap[result[i].loanid] + "\n\n safemibt ::::::" + i)

                    //  deploy NFT contract
                    const deployedaddress = await deploycontract(result[i].loanid, "USD", ipfsurl);

                    //get issuer address

                    //safe mint in NFT
                    var mint = await safemint(deployedaddress, "/" + loanmap[result[i].loanid], NFTowner);
                    finalloancontractarr.contractaddress = deployedaddress;

                    winlog.info("after await::::: deploy and safemint\n")
                    //  winlog.info(mint)

                    // Transfer owership in NFT
                    const transferowner = await TransferOwnerShip(deployedaddress, NFTowner);


                    //save loan contract data in bc along with NFT deployed address
                    var save = await loancontractsave(deployedaddress, result[i])
                    winlog.info(save)
                }
                winlog.info("final::::")
                IpfsEmitter.emit('statuschange')
            }

            //NFT contract deploy
            async function deploycontract(loanid, poolid, ipfsurl) {

                return new Promise((resolve, reject) => {
                    const bytecode = SNFT.bytecode
                    const abi = SNFT.abi
                    // const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
                    let errcount = 0;
                    const deploy = async () => {
                        winlog.info('Attempting to deploy from account:' + address);
                        winlog.info(loanid, poolid, ipfsurl);
                        // const accounts = await web3.eth.getAccounts();
                        // winlog.info(accounts)
                        //0x5323d470086D811fF6d6153bf9f35AF354C92Fde
                        const incrementer = new web3.eth.Contract(abi, address);
                        console.log(loanid, poolid, ipfsurl)
                        console.log("final data::::")
                        console.log(loanid, poolid, ipfsurl)

                        try {
                            const incrementerTx = incrementer.deploy({
                                data: bytecode,
                                arguments: [loanid, poolid, ipfsurl],
                            })

                            const createTransaction = await web3.eth.accounts.signTransaction({
                                from: address,
                                data: incrementerTx.encodeABI(),
                                gas: 8000000,
                                chainId: "101122"
                            },
                                privKey
                            )
                            const createReceipt = new web3.eth.sendSignedTransaction(createTransaction.rawTransaction).then((res) => {
                                winlog.info('Contract deployed at address', res.contractAddress);

                                resolve(res.contractAddress);

                            });
                        } catch (e) {
                            errcount++;
                            if (errcount <= 3) {
                                winlog.info("error occ" + e);
                                deploy();
                            } else {
                                var r = { "message": e.message }
                                res.status(500).send(r);
                            }
                        }

                    };

                    deploy()

                });
            }

            async function getissueraccountaddress(issuerId) {
                return new Promise((resolve, reject) => {
                    //const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
                    const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
                    winlog.info("contractpath:: " + contractPath);
                    const contractname = "User"
                    var contractAddress = SUser.address
                    // const contractPath = path.join('/home/somiya/Documents/IntainMarkets/IM Node app/api/contracts/CreatePool.sol');
                    //const source = fs.readFileSync(contractPath, 'utf8');
                    //const bytecode = contractFile.evm.bytecode.object;
                    const abi = SUser.abi;

                    const incrementer = new web3.eth.Contract(abi, contractAddress);
                    let errcount = 0;
                    const get1 = async () => {
                        winlog.info(`Making a call to contract at address ${contractAddress}`);
                        try {
                            const data = await incrementer.methods
                                .getUserById(issuerId)
                                .call({ from: address });
                            //  winlog.info("data:: " + JSON.stringify(data));
                            // winlog.info(`The current string is: ` + data);
                            // var response ={ "result":JSON.stringify(data)}
                            // winlog.info(response)
                            var response = { "result": JSON.stringify(data) }
                            var finalresponse = JSON.parse(response.result)
                            winlog.info(finalresponse)
                            winlog.info("account address::::: " + finalresponse[4])
                            resolve(finalresponse[4])
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

                    };

                    get1();
                });
            }

            async function TransferOwnerShip(deployedaddress, issueraddress) {
                return new Promise((resolve, reject) => {
                    const contractAddress = deployedaddress;// Contract Call
                    winlog.info("\nownership details::: deployed address " + deployedaddress + "  issuer acc address" + issueraddress)
                    const abi = SNFT.abi
                    const incrementer = new web3.eth.Contract(abi, contractAddress);

                    let errcount = 0;
                    const increment = async () => {
                        winlog.info(
                            `Calling the function in contract at address ${contractAddress}`
                        );
                        try {
                            const encoded = incrementer.methods.renounceOwnership().encodeABI();
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
                            winlog.info(`transfer owership successfull with hash: ${createReceipt.transactionHash} for the contractaddress ${contractAddress}\n`);
                            resolve("transfer owner ship success")
                        } catch (e) {
                            errcount++;
                            if (errcount <= 3) {
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

            async function safemint(contractaddress, uri, NFTowner) {

                return new Promise((resolve, reject) => {
                    const contractAddress = contractaddress;// Contract Call
                    winlog.info("\n" + contractaddress + " " + uri)
                    const abi = SNFT.abi
                    const incrementer = new web3.eth.Contract(abi, contractAddress);

                    let errcount = 0;
                    const increment = async () => {
                        winlog.info(
                            `Calling the function in contract at address ${contractAddress}`
                        );
                        try {
                            console.log("safe mint URI " + uri)
                            const encoded = incrementer.methods.safeMint(NFTowner, 1, uri).encodeABI();
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
                            winlog.info(`safemint successfull with hash: ${createReceipt.transactionHash} for the contractaddress ${contractaddress}\n`);
                            resolve("success")
                        } catch (e) {
                            errcount++;
                            if (errcount <= 3) {
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

            async function loancontractsave(deployedaddress, result) {

                return new Promise((resolve, reject) => {
                    const contractAddress = SLoanContract.address;// Contract Call
                    var loansave = JSON.stringify(result)
                    winlog.info("inputdata::::: " + loansave);
                    var finalloanarr = []
                    finalloanarr.push([deployedaddress, result.loanid, req.body.poolid, loansave])
                    const contractPath = path.join(process.cwd(), '/api/contracts/' + "LoanContract.sol");
                    const contractname = "LoanContract";
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
                    const abi = SLoanContract.abi;
                    const incrementer = new web3.eth.Contract(abi, contractAddress);
                    winlog.info("final loan array:::::::::::::::" + finalloanarr)
                    winlog.info("DF")
                    let errcount = 0;
                    const increment = async () => {
                        winlog.info(
                            `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                        );
                        try {
                            web3.eth.handleRevert = true
                            const encoded = incrementer.methods.createLoansArray(finalloanarr).encodeABI();

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
                                resolve("loan save success")
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

            IpfsEmitter.on('statuschange', () => {
                MongoClient.connect(url, function (err, client) {
                    if (err) {
                        var responseMessage = {
                            "isSuccess": false,
                            "statuscode": 500,
                            "message": "Internal Server Error: Database connection failed."
                        };
                        winlog.error(JSON.stringify(responseMessage));
                        winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                        return res.status(500).send(responseMessage);
                    }
                    const db = client.db("IntainMarkets");
                    db.collection("previewstdloantape").updateMany({ poolid: req.body.poolid }, { $set: { LMSStatus: "Reviewed" } }, function (err, result) {
                        if (err) {
                            var responseMessage = {
                                "isSuccess": false,
                                "statuscode": 500,
                                "message": "Internal Server Error: Database connection failed."
                            };
                            winlog.error(JSON.stringify(responseMessage));
                            winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                            return res.status(500).send(responseMessage);
                        }
                        var s1 = new Date();
                        winlog.info("date ::::::::" + s1)
                        winlog.info("NFT MINT Completed at ::::: " + s1.getHours() + " " + s1.getMinutes() + " " + s.getSeconds());
                        winlog.info("lms status change done and nft mint complete")
                        console.log("inside bdb LMS verified data to BDB::::::::::::::::")
                        //Preclosing.uploadlmsverfieddata(req, res);
                        // poolEmitter.emit('fetchpooldetails')
                        // res.send({ "success": true, "message": "NFT minted" });
                        //   IpfsEmitter.emit('contractstatuschange')
                        client.close();

                    });
                })



            })

            // poolEmitter.on('fetchpooldetails', () => {
            //     winlog.info("inside fetch pool details");
            //     MongoClient.connect(url, function (err, client) {
            //         const db = client.db("IntainMarkets");
            //         db.collection('pool_detail').find({ poolID: req.body.poolid }).toArray(function (err, result) {
            //             winlog.info("res:: " + result.length);
            //             if (result.length > 0) {
            //                 winlog.info("pool data:::" + JSON.stringify(result))
            //                 //getlmsdata(result,loanmap)

            //                 var pooldetails = [[result[0].uniqueID, result[0].poolID, result[0].poolname, result[0].issuerId, result[0].assetclass, result[0].assignverification, result[0].assignservicer, result[0].assignunderwriter, result[0].numberofloans, result[0].setupdate, result[0].originalbalance, "Verified", result[0].loanids, result[0].typename, result[0].filepath, result[0].typepurpose, result[0].attributes, result[0].issuerName,result[0].assignpayingagent]];
            //                 winlog.info(pooldetails);
            //                 poolcreate(pooldetails)
            //                 winlog.info("done");
            //             }
            //         });

            //     })
            // })
            // async function poolcreate(pooldetails) {

            //     return new Promise((resolve, reject) => {
            //         const contractAddress = SCreatePool.address;// Contract Call

            //         const contractPath = path.join(process.cwd(), '/api/contracts/' + "CreatePool.sol");
            //         const contractname = "CreatePool";
            //         //const source = fs.readFileSync(contractPath, 'utf8');

            //         const input = {
            //             language: 'Solidity',
            //             sources: {
            //                 [contractname + ".sol"]: {
            //                     content: source,
            //                 },
            //             },
            //             settings: {
            //                 outputSelection: {
            //                     '*': {
            //                         '*': ['*'],
            //                     },
            //                 },
            //             },
            //         };

            //         //const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
            //         //winlog.info(tempFile)
            //         //const contractFile = tempFile.contracts[contractname + ".sol"][contractname];
            //         //winlog.info(contractFile)
            //         ////const bytecode = contractFile.evm.bytecode.object;
            //         const abi = contractFile.abi;
            //         const incrementer = new web3.eth.Contract(abi, contractAddress);

            //         const encoded = incrementer.methods.createPool(pooldetails).encodeABI();
            //         const increment = async () => {
            //             winlog.info(
            //                 `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
            //             );
            //             const createTransaction = await web3.eth.accounts.signTransaction(
            //                 {
            //                     from: address,
            //                     to: contractAddress,
            //                     data: encoded,
            //                     gasLimit: 6000000,
            //                     chainId: "101122"
            //                 },
            //                 privKey
            //             ); const createReceipt = await web3.eth.sendSignedTransaction(
            //                 createTransaction.rawTransaction
            //             );
            //             winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
            //             res.send({ "success": true, "message": "Pool and NFT created" });

            //             resolve("pool save success")
            //         }; increment();
            //     });
            // }


            // IpfsEmitter.on('contractstatuschange', () => {

            //     MongoClient.connect(url, function (err, client) {
            //         const db = client.db("IntainMarkets");
            //         db.collection("loancontract").updateMany({ poolid: req.body.poolid }, { $set: { contractstatus: "reviewed" } }, function (err, result) {
            //             if (err) throw err;
            //             winlog.info("contract status change done")
            //             res.send({ "success": true, "message": "NFT minted" });
            //         });
            //     })

            // })

        }
    },
    Poolcreate: function (req, res) {
        winlog.info("inside fetch pool details");
        MongoClient.connect(url, function (err, client) {
            if (err) {
                var responseMessage = {
                    "isSuccess": false,
                    "statuscode": 500,
                    "message": "Internal Server Error: Database connection failed."
                };
                winlog.error(JSON.stringify(responseMessage));
                winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                return res.status(500).send(responseMessage);
            }
            const db = client.db("IntainMarkets");
            db.collection('pool_detail').find({ poolID: req.body.poolid }).toArray(function (err, result) {
                if (err) {
                    var responseMessage = {
                        "isSuccess": false,
                        "statuscode": 500,
                        "message": "Internal Server Error: Database connection failed."
                    };
                    winlog.error(JSON.stringify(responseMessage));
                    winlog.error("Database Error while accessing pool_detail database: " + JSON.stringify(err));
                    return res.status(500).send(responseMessage);
                }
                winlog.info("res:: " + result.length);
                if (result.length > 0) {
                    winlog.info("pool data:::" + JSON.stringify(result))
                    //getlmsdata(result,loanmap)

                    console.log([result[0].uniqueID, req.body.poolid, result[0].poolname, result[0].issuerId, result[0].assetclass, result[0].assignverification, result[0].assignservicer, result[0].assignunderwriter, result[0].numberofloans, result[0].setupdate, result[0].originalbalance, "Verified", result[0].loanids, result[0].typename, result[0].filepath, result[0].typepurpose, result[0].attributes, result[0].issuerName, result[0].assignpayingagent])
                    var pooldetails = [[result[0].uniqueID, req.body.poolid, result[0].poolname, result[0].issuerId, result[0].assetclass, result[0].assignverification, result[0].assignservicer, result[0].assignunderwriter, result[0].numberofloans, result[0].setupdate, result[0].originalbalance, "Verified", result[0].loanids, result[0].typename, result[0].filepath, result[0].typepurpose, result[0].attributes, result[0].issuerName, result[0].assignpayingagent,result[0].ratingagency]];
                    winlog.info(pooldetails);
                    poolcreate(pooldetails)
                    winlog.info("done");
                }
            });
        })
        async function poolcreate(pooldetails) {

            return new Promise((resolve, reject) => {
                const contractAddress = SCreatePool.address;// Contract Call

                const contractPath = path.join(process.cwd(), '/api/contracts/' + "CreatePool.sol");
                const contractname = "CreatePool";
                //const source = fs.readFileSync(contractPath, 'utf8');


                const abi = SCreatePool.abi;
                const incrementer = new web3.eth.Contract(abi, contractAddress);


                let errcount = 0;
                const increment = async () => {
                    winlog.info(
                        `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
                    );
                    try {
                        web3.eth.handleRevert = true
                        const encoded = incrementer.methods.createPool(pooldetails).encodeABI();
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
                            res.send({ "success": true, "message": "Pool and NFT created" });
                            resolve("pool save success")
                            IPFS.addfile(req, res);


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

    }
}
module.exports = IPFS