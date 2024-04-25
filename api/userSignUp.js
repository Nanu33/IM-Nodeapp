//Required modules
const ipfsAPI = require('ipfs-api');

const fs = require('fs');
const path = require('path');
let nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
var EventEmitter = require("events").EventEmitter;
var request = require('request');

//Connceting to the ipfs network via infura gateway
const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });

const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
//const web3 = new Web3("http://20.253.174.32:9650/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

const SUser = require('./abi/User')

const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
const contractPath = path.resolve(__dirname, 'contracts', 'User.sol');
//const source = fs.readFileSync(contractPath, 'utf8');
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const winlog = require("../log/winstonlog");

// const input = {
//   language: 'Solidity',
//   sources: {
//     'User.sol': {
//       content: source,
//     },
//   },
//   settings: {
//     outputSelection: {
//       '*': {
//         '*': ['*'],
//       },
//     },
//   },
// };

//const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
//winlog.info(tempFile)
//const contractFile = tempFile.contracts['User.sol']['User'];
//winlog.info(contractFile)

//const bytecode = contractFile.evm.bytecode.object;
const abi = SUser.abi;

const incrementer = new web3.eth.Contract(abi, contractAddress);

var userSignUp = {


  signUp: function (req, res, next) {

    if (!req.body.EmailAddress || !req.body.UserRole || !req.body.FirstName) {
      res.send({ token: -1 });
    } else {

      var inputEmit = new EventEmitter();
      var userId = uuidv4();
      // var accAddress = req.body.UserAccAddress;
      var accAddress = "";
      var emailid = req.body.EmailAddress;
      var fileHash = '';
      var UserSatus = "Active";
      var UserRole = req.body.UserRole
      var UserName = req.body.FirstName + " " + req.body.lastname
      var inputData = [];
      // const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
      const incrementer = new web3.eth.Contract(abi, contractAddress);
      // var s = ["1", "dee@g.com", "sds22", "ok", "0X123"]  //passing array of string value

      //Reading file from computer
      let testFile = JSON.stringify(req.body)
      //Creating buffer for ipfs function to add file to the system
      let testBuffer = new Buffer(testFile);

      winlog.info(testBuffer + ":::");
      ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
          winlog.info(err);
        }
        winlog.info(file)
        fileHash = file[0].hash;
        inputData.push(userId);
        inputData.push(emailid);
        inputData.push(fileHash);
        inputData.push(UserSatus);
        inputData.push(accAddress);
        inputData.push(UserRole);
        inputData.push(UserName)
        inputData.push("")//QIdate
        inputData.push("")//QIBAutorizedofficer
        inputData.push("")//compliancedate
        inputData.push("")//compliancetitle
        inputData.push("Pending")//kycverifiedstatus
        inputData.push("No")//kycuploadstatus
        inputData.push("")//termsofservice
        inputData.push("");//Investortype
        inputData.push("")//accredidatedinvestor
        inputData.push("")//AttestationAutorizedofficer
        inputData.push("")//UserType Self or ALL deals
        inputData.push("")//VAToken
        winlog.info(inputData);

        inputEmit.emit('save');
      })

      inputEmit.on('save', function () {
        //   const address = accAddress;

        //passing array of string value
        let errcount = 0;
        const increment = async () => {
          winlog.info(
            `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
          );
          try {
            web3.eth.handleRevert = true
            const encoded = incrementer.methods.saveUser(inputData).encodeABI(); // update is a function which accepts string array

            const createTransaction = await web3.eth.accounts.signTransaction(
              {
                from: address,
                to: contractAddress,
                data: encoded,
                gasLimit: 1883750,
                chainId: "101122"
              },
              privKey
            );
            const createReceipt = await web3.eth.sendSignedTransaction(
              createTransaction.rawTransaction
            );
            winlog.info(`Tx Successfull with hash: ${createReceipt.transactionHash}`);
            // winlog.info(createReceipt);
            var r = { "message": "User Registred Successfully", "transactionHash": createReceipt.transactionHash, "status": createReceipt.status, "UserId": inputData[0] }
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
              winlog.info("after")
            } else {
              winlog.info("inside else")
              res.send(r);
              if (req.body.UserRole === "Issuer" || req.body.UserRole === "Verification") {
                console.log("inside registering into va")
                let VAregisterArr = {
                  "userid":userId,
                  "username": req.body.FirstName,
                  "userLastName": req.body.lastname,
                  "password": req.body.Password,
                  "emailid": req.body.EmailAddress,
                  "phoneno": "-",
                  "userrole": req.body.UserRole === "Issuer" ? "Admin" : "Processor",
                  "platform": "IntainMarkets"
                }
                console.log(VAregisterArr)
                const requestOptions = {
                  "method": 'Post',
                  "headers": { "content-type": "application/json" },
                  "url": "https://gva.intainva.intainabs.com/v1/register",
                  "body": JSON.stringify(VAregisterArr)
                }
                request(requestOptions, async function (error, response, body) {
                  if (error) {
                    // Handle error
                   
                    console.error('Error:', error);
                  } else {
                    // Print response body
                    body = JSON.parse(body);
                    console.log('Response:', body);
                    if(body.usertoken){
                    inputData[18] = body.usertoken
                    const encoded = incrementer.methods.updateUser(inputData).encodeABI(); // update is a function which accepts string array
                    const createTransaction = await web3.eth.accounts.signTransaction(
                      {
                        from: address,
                        to: contractAddress,
                        data: encoded,
                        gasLimit: 1883750,
                        chainId: "101122"
                      },
                      privKey
                    );
                    const createReceipt = await web3.eth.sendSignedTransaction(
                      createTransaction.rawTransaction
                    );
                    winlog.info(`Tx Successfull with hash: ${createReceipt.transactionHash}`);
                    }else{
                      console.log("user already exist")
                    }
                  }
                })
              }
            }
          } catch (e) {
            errcount++;
            if (e.reason && e.reason.includes("Caller is not an invoker")) {
              winlog.info(e.reason)
              res.status(500).send(e.reason);
            }
            else if (errcount <= 3) {
              winlog.info("error occ" + e); increment();
            } else {
              var r = { "message": e.message }
              res.status(500).send(r);
            }
          }
        }; increment();

      }); // end of emit





    } // end of else

  },

  resetPassword: function (req, res, next) {


    var EmailId = req.body.EmailId;
    var Password = req.body.Password;
    var ipfsData = '';
    var inputData = [];
    var update = new EventEmitter();
    var updateHash = new EventEmitter();
    var userHash = '';
    var userData = '';
    let errcount = 0;
    const get1 = async () => {
      winlog.info(`Making a call to contract at address 11111111 ${contractAddress}`);
      var status = 'Active'
      try {
        const data = await incrementer.methods
          .getUserByEmailAndStatusAnduserRole(EmailId, status, req.body.Role)
          .call({ from: address });
        winlog.info(`The current string is 22222222: ${data}`);
        winlog.info("data:: 3333" + JSON.stringify(data));

        var arr1 = JSON.parse(JSON.stringify(data));
      } catch (e) {
        errcount++;
        if (errcount <= 3) {
          winlog.info("error occ" + e); get1();
        } else {
          var r = { "message": e.message }
          res.status(500).send(r);
        }
      }
      var resData = [];
      //for (var i = 0; i < arr1.length; i++) {
      // var resp = arr1[i].split("#");
      winlog.info(arr1.length + "444");
      if (arr1.length > 0) {
        userHash = arr1[0][2];
        userData = {
          "UserId": arr1[0][0],
          "EmailAddress": arr1[0][1],
          "UserHash": arr1[0][2],
          "UserSatus": arr1[0][3],
          "UserAccAddress": arr1[0][4],
          "UserRole": arr1[0][5],
          "UserName": arr1[0][6],
        };

        ipfs.files.get(arr1[0][2], function (err, files) {
          files.forEach((file) => {
            winlog.info(file.path + "555")
            winlog.info(file.content.toString('utf8') + "666")
            ipfsData = JSON.parse(file.content.toString('utf8'));

            ipfsData.Password = req.body.Password;
            update.emit('save', arr1);

            //  res.send(file.content.toString('utf8'));

          })
        })
        update.on('save', function (arr1) {

          winlog.info(ipfsData.Password + ":::7777");

          let testBuffer = new Buffer(JSON.stringify(ipfsData));


          ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
              winlog.info(err);
            } else {
              winlog.info(file)
              if (userHash == file[0].hash) {
                var r = { "message": "User password is updated sucessfully " }
                res.send(r);
              } else {

                // inputData.push(userData.UserId);
                // inputData.push(userData.EmailAddress);
                // inputData.push(file[0].hash);
                // inputData.push(userData.UserSatus);
                // inputData.push(userData.UserAccAddress);
                // inputData.push(userData.UserRole);
                // inputData.push(userData.UserName);

                arr1[0][2] = file[0].hash
                console.log(arr1)
                let errcount = 0;
                const increment = async () => {
                  winlog.info(
                    `Calling the increment by ${"updated value"} functions in contract at address ${contractAddress}`
                  );
                  try {
                    web3.eth.handleRevert = true
                    const encoded = incrementer.methods.updateUser(arr1[0]).encodeABI(); // update is a function which accepts string array
                    const createTransaction = await web3.eth.accounts.signTransaction(
                      {
                        from: address,
                        to: contractAddress,
                        data: encoded,
                        gasLimit: 1883750,
                        chainId: "101122"
                      },
                      privKey
                    ); const createReceipt = await web3.eth.sendSignedTransaction(
                      createTransaction.rawTransaction
                    );
                    winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
                    // winlog.info(createReceipt);
                    var r = { "message": "User password is updated sucessfully " }
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
                        "message": "ID Doesnot exist"
                      })
                    } else {
                      res.send(r);
                    }
                  } catch (e) {
                    errcount++;

                    if (e.reason && e.reason.includes("Caller is not an invoker")) {
                      winlog.info(e.reason)
                      res.status(500).send(e.reason);
                    }
                    else if (errcount <= 3) {
                      winlog.info("error occ" + e); increment();
                    } else {
                      var r = { "message": e.message }
                      res.status(500).send(r);
                    }
                  }
                }; increment();

              }
            }
          });
        }); // end of emit

      } // end of if 
      else {
        var r = { "message": "Username is incorrect" }
        res.status(204).send(r);
      }

    };

    get1();

  },

  forgotPassword: function (req, res, next) {


    if (!req.query.EmailAddress) {
      res.send({ token: -1 });
    } else {
      var mailString = "You have requested to change the password. In order to change your password please click on the link : https://imtest.intainmarkets.us/resetPassword?EmailAddress=" + req.query.EmailAddress + " &Role =" + req.query.Role;
      var URL = "https://imtest.intainmarkets.us/resetPassword?EmailAddress=" + req.query.EmailAddress + "&Role=" + req.query.Role;
      var finalurl = encodeURI(URL)
      var mailString = "You have requested to change the password. In order to change your password please click on the link " + finalurl

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "demo_emulya@intainft.com",
          pass: "Intain@1234"
        }
      });
      // winlog.info("Value----"+JSON.stringify(obj.EmailID[i].EmailID));
      winlog.info("---------------------");
      winlog.info("Running Email Job");
      let mailOptions = {

        from: "demo_emulya@intainft.com",
        to: req.query.EmailAddress,
        subject: `Reset Password`,
        html: mailString
      };
      winlog.info("mailOptions::" + JSON.stringify(mailOptions));

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          // throw error;
          winlog.info(error + "Email : " + req.query.EmailAddress);
          res.send(error + "Email : " + req.query.EmailAddress);

        } else {
          winlog.info("Email successfully sent!");
          res.send({ "message": "Email successfully sent!" });

        }
      });

    }
  },
  // login: function (req, res, next) {



  //   var EmailId = req.body.EmailId;
  //   var Password = req.body.Password;


  //   const get1 = async () => {
  //     winlog.info(`Making a call to contract at address ${contractAddress}`);
  //     var status = 'Active'

  //     const data = await incrementer.methods
  //       .getUserByEmailAndStatus(EmailId, status)
  //       .call({ from: address });
  //     winlog.info(`The current string is: ${data}`);
  //     winlog.info("data:: " + JSON.stringify(data));

  //     var arr1 = JSON.parse(JSON.stringify(data));
  //     var resData = [];
  //     //for (var i = 0; i < arr1.length; i++) {
  //     // var resp = arr1[i].split("#");
  //     winlog.info(arr1.length);
  //     if (arr1.length > 0) {

  //       var c = {
  //         "UserId": arr1[0][0],
  //         "EmailAddress": arr1[0][1],
  //         "UserHash": arr1[0][2],
  //         "UserSatus": arr1[0][3],
  //         "UserAccAddress": arr1[0][4],
  //         "UserRole": arr1[0][5],
  //         "UserName": arr1[0][6]

  //       };

  //       ipfs.files.get(arr1[0][2], function (err, files) {
  //         files.forEach((file) => {
  //           winlog.info(file.path)
  //           winlog.info(file.content.toString('utf8'))
  //           var ipfsData = JSON.parse(file.content.toString('utf8'));
  //           ipfsData.UserId = arr1[0][0];
  //           // ipfsData.UserSatus = arr1[0][3];
  //           ipfsData.UserAccAddress = arr1[0][4];

  //           if (ipfsData.EmailAddress == EmailId && ipfsData.Password == Password) {
  //             winlog.info("login sucess");
  //             delete ipfsData["Password"];
  //             ipfsData.KycUploadStatus = arr1[0][12]
  //             ipfsData.KycVerifiedStatus =arr1[0][13]
  //             winlog.info( arr1[0][12])
  //             var r = { "message": "User Authentication Successful", "data": ipfsData }
  //             res.send(r);
  //           } else {
  //             var r = { "message": "Passwor is incorrect" }
  //             res.status(204).send(r);
  //           }
  //           //  res.send(file.content.toString('utf8'));

  //         })
  //       })


  //     } // end of if 
  //     else {
  //       var r = { "message": "Username is incorrect" }
  //       res.status(204).send(r);
  //     }

  //   };

  //   get1();
  // },
  GetAllUserByUserRole: function (req, res, next) {

    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      try {
        const data = await incrementer.methods
          .getAllUsers()
          .call({ from: address });
        winlog.info(`The current string is: ${data}`);

        winlog.info("data:: " + JSON.stringify(data));

        var arr1 = JSON.parse(JSON.stringify(data));
        var resData = [];
        var objectWithGroupByName = {};
        for (var i = 0; i < arr1.length; i++) {
          // var resp = arr1[i].split("#");
          var c = {
            "UserRole": arr1[i][5],
            "UserName": arr1[i][6],
            "UserId": arr1[i][0],
            "EmailAddress": arr1[i][1],
            "UserType": arr1[i][17] ? arr1[i][17] : ""
          };
          if (!objectWithGroupByName[arr1[i][5]]) {
            objectWithGroupByName[arr1[i][5]] = [];
          }
          objectWithGroupByName[arr1[i][5]].push(c);
          if (i + 1 == arr1.length) {
            res.send(objectWithGroupByName);
          }

        }
        winlog.info(objectWithGroupByName)
      } catch (e) {
        winlog.info("Error Occured" + e)

        var r = { "message": e.message }
        res.status(500).send(r);
      }
    };
    get1();
  },

  updateuserKYC: function (req, res) {

    var UserEmitter = new EventEmitter();
    var UserID = req.body.userid;
    const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
    const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
    winlog.info("contractpath:: " + contractPath);
    const contractname = "User";

    const abi = SUser.abi;

    const incrementer = new web3.eth.Contract(abi, contractAddress);
    let errcount = 0;
    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      try {
        const data = await incrementer.methods
          .getUserById(UserID)
          .call({ from: address });
        winlog.info(`The current string is: ${data}`);
        winlog.info("data:: " + JSON.stringify(data));

        var arr1 = JSON.parse(JSON.stringify(data));
        winlog.info(arr1)
        var resData = [];
        //for (var i = 0; i < arr1.length; i++) {
        // var resp = arr1[i].split("#");
        winlog.info(arr1.length);
        if (arr1.length > 0) {
          var c = {
            "UserId": arr1[0],
            "EmailAddress": arr1[1],
            "UserHash": arr1[2],
            "UserSatus": arr1[3],
            "UserAccAddress": arr1[4],
            "UserRole": arr1[5],
            "UserName": arr1[6],
            "QIBdate": arr1[7],
            "QIBAutorizedofficer": arr1[8],
            "Compilancedate": arr1[9],
            "Compilancetitle": arr1[10],
            "KycVerifiedStatus": arr1[11],
            "KycUploadStatus": arr1[12],
            "TermsOfService": arr1[13],
            "Investortype": arr1[14],
            "AccreditedInvestor": arr1[15],
            "AttestationAutorizedofficer": arr1[16],
            "UserType":arr1[17],
            "VAtoken":arr1[18]?arr1[18]:""
          };

          winlog.info("user details before account save:: " + JSON.stringify(c));

          ipfs.files.get(arr1[2], function (err, files) {
            files.forEach((file) => {
              winlog.info(file.path)
              winlog.info(file.content.toString('utf8'))
              var ipfsData = JSON.parse(file.content.toString('utf8'));
              winlog.info(ipfsData);
              if (req.body.QIBdate) {
                winlog.info("inside QIB")
                arr1[7] = req.body.QIBdate
                arr1[8] = req.body.QIBAutorizedofficer
                arr1[14] = req.body.investortype
                arr1[12] = "yes"

                winlog.info(arr1)
                ipfsData.QIBdate = req.body.QIBdate
                ipfsData.QIBAutorizedofficer = req.body.QIBAutorizedofficer
                ipfsData.organizationname = req.body.organizationname
                UserEmitter.emit('updateUserIPFS', ipfsData, arr1)
              }
              else if (req.body.Compilancetitle) {
                winlog.info("inside compilance")
                arr1[9] = req.body.Compilancedate
                arr1[10] = req.body.Compilancetitle
                arr1[16] = req.body.AttestationAutorizedofficer
                if (arr1[5] != "Investor")
                  arr1[12] = "yes"

                ipfsData.Compilancedate = req.body.Compilancedate
                ipfsData.Compilancetitle = req.body.Compilancetitle
                ipfsData.AttestationAutorizedofficer = req.body.AttestationAutorizedofficer
                UserEmitter.emit('updateUserIPFS', ipfsData, arr1)
              } else if (req.body.AccreditedInvestorCertification) {
                arr1[15] = req.body.AccreditedInvestorCertification
                arr1[14] = req.body.investortype
                arr1[12] = "yes"

                ipfsData.InvestorType = req.body.investortype
                ipfsData.AccreditedInvestorCertification = req.body.AccreditedInvestorCertification
                UserEmitter.emit('updateUserIPFS', ipfsData, arr1)
              }
              else {
                winlog.info("Final json with address to IPFS" + JSON.stringify(ipfsData))
                var r = { "success": true, "message": "User Update  Success", "file": req.files }
                res.send(r)
              }
            })
          })

        } // end of if 
        else {
          var r = { "message": "user id not found" }
          res.status(204).send(r);
        }
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

    UserEmitter.on('updateUserIPFS', (ipfsData, BCdata) => {
      let testFile = JSON.stringify(ipfsData)
      //Creating buffer for ipfs function to add file to the system
      let testBuffer = new Buffer(testFile);

      winlog.info(testBuffer + ":::");
      ipfs.files.add(testBuffer, function (err, file) {
        if (err) {
          winlog.info(err);
        }
        winlog.info(file)
        BCdata[2] = file[0].hash
        UserEmitter.emit('updateUserBC', BCdata);
      })
    })


    UserEmitter.on('updateUserBC', (Bcdata) => {
      const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");

      const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)

      const abi = SUser.abi;

      const incrementer = new web3.eth.Contract(abi, contractAddress);
      //passing array of string value
      winlog.info(Bcdata)
      let errcount = 0;
      const increment = async () => {
        winlog.info(
          `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
        );
        try {
          web3.eth.handleRevert = true
          const encoded = incrementer.methods.updateUser(Bcdata).encodeABI(); // update is a function which accepts string array
          const createTransaction = await web3.eth.accounts.signTransaction(
            {
              from: address,
              to: contractAddress,
              data: encoded,
              gasLimit: 1883750,
              chainId: "101122"
            },
            privKey
          ); const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
          );
          winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
          // winlog.info(createReceipt);
          var r = { "success": true, "message": "User Update Success", "file": req.files }
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
              "message": "ID Doesnot exist"
            })
          } else {
            res.send(r);
          }
        } catch (e) {
          errcount++;
          if (e.reason && e.reason.includes("Caller is not an invoker")) {
            winlog.info(e.reason)
            res.status(500).send(e.reason);
          }
          else if (errcount <= 3) {
            winlog.info("error occ" + e); increment();
          } else {
            var r = { "message": e.message }
            res.status(500).send(r);
          }
        }
      }; increment();

    })

  },

  updateKYCVerifiedStatus: function (req, res) {

    var UserEmitter = new EventEmitter();
    var UserID = req.body.userid;
    const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
    const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
    winlog.info("contractpath:: " + contractPath);
    const contractname = "User";

    const abi = SUser.abi;

    const incrementer = new web3.eth.Contract(abi, contractAddress);
    let errcount = 0;
    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      try {
        const data = await incrementer.methods
          .getUserById(UserID)
          .call({ from: address });
        winlog.info(`The current string is: ${data}`);
        winlog.info("data:: " + JSON.stringify(data));
        console.log(data)

        var arr1 = JSON.parse(JSON.stringify(data));
        winlog.info(arr1)
        var resData = [];
        //for (var i = 0; i < arr1.length; i++) {
        // var resp = arr1[i].split("#");
        winlog.info(arr1.length);
        if (arr1.length > 0) {
          var c = {
            "UserId": arr1[0],
            "EmailAddress": arr1[1],
            "UserHash": arr1[2],
            "UserSatus": arr1[3],
            "UserAccAddress": arr1[4],
            "UserRole": arr1[5],
            "UserName": arr1[6],
            "QIBdate": arr1[7],
            "QIBAutorizedofficer": arr1[8],
            "Compilancedate": arr1[9],
            "Compilancetitle": arr1[10],
            "KycVerifiedStatus": arr1[11],
            "KycUploadStatus": arr1[12],
            "TermsOfService": arr1[13],
            "Investortype": arr1[14],
            "AccreditedInvestor": arr1[15],
            "AttestationAutorizedofficer": arr1[16],
            "UserType": "",
            "VAToken":arr1[18]?arr1[18]:""
          };

          winlog.info("user details before account save:: " + JSON.stringify(c));

          arr1[11] = req.body.KYCStatus
        

          if (req.body.UserType) {

            arr1[17] = req.body.UserType
          } else {
            arr1[17] = ""
          }

          //arr1[18] = "SXNzdWVyQGludGFpbmZ0LmNvbTpJbnRAMSNNQEsmVCQ6QWRtaW46SW50YWluTWFya2V0cw=="
          
          UserEmitter.emit('updateUserBC', arr1);

        } // end of if 
        else {
          var r = { "message": "user id not found" }
          res.status(204).send(r);
        }
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



    UserEmitter.on('updateUserBC', (Bcdata) => {
      const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");

      const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)

      const abi = SUser.abi;

      const incrementer = new web3.eth.Contract(abi, contractAddress);
      //passing array of string value
      console.log(Bcdata)
      let errcount = 0;
      const increment = async () => {
        winlog.info(
          `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
        );
        try {
          web3.eth.handleRevert = true
          const encoded = incrementer.methods.updateUser(Bcdata).encodeABI(); // update is a function which accepts string array
          const createTransaction = await web3.eth.accounts.signTransaction(
            {
              from: address,
              to: contractAddress,
              data: encoded,
              gasLimit: 1883750,
              chainId: "101122"
            },
            privKey
          ); const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
          );
          winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
          // winlog.info(createReceipt);
          var r = { "success": true, "message": "User Update Success", "file": req.files }
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
              "message": "ID Doesnot exist"
            })
          } else {
            res.send(r);
            //UserEmitter.emit('sendmail', Bcdata[1])
          }
        } catch (e) {
          errcount++;
          if (e.reason && e.reason.includes("Caller is not an invoker")) {
            winlog.info(e.reason)
            res.status(500).send(e.reason);
          }
          else if (errcount <= 3) {
            winlog.info("error occ" + e); increment();
          } else {
            var r = { "message": e.message }
            res.status(500).send(r);
          }
        }
      }; increment();

    })

    UserEmitter.on('sendmail', (mailid) => {

      winlog.info(mailid)
      if (req.body.KYCStatus == 'Verified') {
        var mailString = "KYC process Completed, you can access the platform using https://imtest.intainmarkets.us/";
      } else {
        var mailString = "Your KYC is " + req.body.KYCStatus
      }
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "demo_emulya@intainft.com",
          pass: "Intain@1234"
        }
      });
      // winlog.info("Value----"+JSON.stringify(obj.EmailID[i].EmailID));

      winlog.info("---------------------");
      winlog.info("Running Email Job");
      let mailOptions = {

        from: "demo_emulya@intainft.com",
        to: mailid,
        subject: `Intain Markets KYC Verification Status`,
        html: mailString
      };
      winlog.info("mailOptions::" + JSON.stringify(mailOptions));

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          // throw error;
          winlog.info(error + "Email :     " + req.query.EmailAddress);
          // res.send(error + "Email : " + req.query.EmailAddress);

        } else {
          winlog.info("Email successfully sent!");
          //res.send({ "message": "Email successfully sent!" });

        }
      });


    })
  },

  updateTermsOfService: function (req, res) {

    var UserEmitter = new EventEmitter();
    var UserID = req.body.userid;
    const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
    const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
    winlog.info("contractpath:: " + contractPath);
    const contractname = "User";

    const abi = SUser.abi;

    const incrementer = new web3.eth.Contract(abi, contractAddress);
    let errcount = 0;
    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      try {
        const data = await incrementer.methods
          .getUserById(UserID)
          .call({ from: address });
        winlog.info(`The current string is: ${data}`);
        winlog.info("data:: " + JSON.stringify(data));

        var arr1 = JSON.parse(JSON.stringify(data));
        winlog.info(arr1)
        var resData = [];
        //for (var i = 0; i < arr1.length; i++) {
        // var resp = arr1[i].split("#");
        winlog.info(arr1.length);
        if (arr1.length > 0) {
          var c = {
            "UserId": arr1[0],
            "EmailAddress": arr1[1],
            "UserHash": arr1[2],
            "UserSatus": arr1[3],
            "UserAccAddress": arr1[4],
            "UserRole": arr1[5],
            "UserName": arr1[6],
            "QIBdate": arr1[7],
            "QIBAutorizedofficer": arr1[8],
            "Compilancedate": arr1[9],
            "Compilancetitle": arr1[10],
            "KycVerifiedStatus": arr1[11],
            "KycUploadStatus": arr1[12],
            "TermsOfService": arr1[13],
            "Investortype": arr1[14],
            "AccreditedInvestor": arr1[15],
            "AttestationAutorizedofficer": arr1[16]
          };

          winlog.info("user details before account save:: " + JSON.stringify(c));

          if (req.file) {
            arr1[13] = "Agree"

            var final = path.resolve(__dirname + '/../uploads/' + req.file.filename);            //var testFile = fs.readFileSync("/home/pavithra/y/pool1/TWO24788.pdf");
            var testFile = fs.readFileSync(final);
            //Creating buffer for ipfs function to add file to the system
            var testBuffer = Buffer.from(testFile);
            //   var testBuffer = new Buffer(testFile);

            ipfs.files.add(testBuffer, function (err, file) {
              if (err) {
                winlog.info(err);
              }
              winlog.info(file[0].hash)
              // arr1[17] = file[0].hash
              // arr1[18] = req.file.filename
              UserEmitter.emit('updatetermsofservicedoc', file[0].hash, arr1);
            })
          } else {
            arr1[13] = req.body.termsofservice
            UserEmitter.emit('updateUserBC', arr1);
          }

        } // end of if 
        else {
          var r = { "message": "user id not found" }
          res.status(204).send(r);
        }
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

    UserEmitter.on("updatetermsofservicedoc", (CID, arr1) => {
      ipfs.files.get(arr1[2], function (err, files) {
        files.forEach((file) => {
          winlog.info(file.path + "555")
          winlog.info(file.content.toString('utf8') + "666")
          ipfsData = JSON.parse(file.content.toString('utf8'));

          ipfsData.termsofservicedocumet = CID;

          let testBuffer = new Buffer(JSON.stringify(ipfsData));
          ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
              winlog.info(err);
            }

            winlog.info(file[0].hash)
            arr1[2] = file[0].hash
            UserEmitter.emit('updateUserBC', arr1);

          })

          //  res.send(file.content.toString('utf8'));

        })
      })
    })

    UserEmitter.on('updateUserBC', (Bcdata) => {
      const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");

      const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)

      const abi = SUser.abi;

      const incrementer = new web3.eth.Contract(abi, contractAddress);
      //passing array of string value
      winlog.info(Bcdata)
      let errcount = 0;
      const increment = async () => {
        winlog.info(
          `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
        );
        try {
          web3.eth.handleRevert = true
          const encoded = incrementer.methods.updateUser(Bcdata).encodeABI(); // update is a function which accepts string array
          const createTransaction = await web3.eth.accounts.signTransaction(
            {
              from: address,
              to: contractAddress,
              data: encoded,
              gasLimit: 1883750,
              chainId: "101122"
            },
            privKey
          ); const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
          );
          winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
          // winlog.info(createReceipt);
          var r = { "success": true, "message": "User Update Success", "file": req.files }
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
              "message": "ID Doesnot exist"
            })
          } else {
            if (req.body.termsofservice === 'Disagree') {
              res.send(r);
            }
            else {

              ipfs.files.get(Bcdata[2], function (err, files) {
                files.forEach((file) => {
                  let ipfsData = JSON.parse(file.content.toString('utf8'));
                  winlog.info(ipfsData)
                  winlog.info(ipfsData.FirstName)
                  UserEmitter.emit('sendmail', Bcdata[1], Bcdata[5], Bcdata[6], ipfsData.FirstName)

                })
              })
            }
          }
        } catch (e) {
          errcount++;
          if (e.reason && e.reason.includes("Caller is not an invoker")) {
            winlog.info(e.reason)
            res.status(500).send(e.reason);
          }
          else if (errcount <= 3) {
            winlog.info("error occ" + e); increment();
          } else {
            var r = { "message": e.message }
            res.status(500).send(r);
          }
        }
      }; increment();

    })

    UserEmitter.on('sendmail', (mailid, userrole, username, FirstName) => {

      winlog.info(mailid)
      var URL = "https://imtest.intainmarkets.us/confirmemail?userid=" + UserID + "&userrole=" + userrole + "&username=" + username + "&organizationname=" + req.body.organizationname;
      var finalurl = encodeURI(URL)
      //var mailString = "Hi,\n Please click on the link to update Attestation details "+finalurl;

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "demo_emulya@intainft.com",
          pass: "Intain@1234"
        }
      });
      // winlog.info("Value----"+JSON.stringify(obj.EmailID[i].EmailID));

      winlog.info("---------------------");
      winlog.info("Running Email Job");
      let mailOptions = {

        from: "Do Not Reply<demo_emulya@intainft.com>",
        to: mailid,
        subject: `Verify your email address to complete your registration`,
        html: `
        <p>Hello ${FirstName},<br><br>Thank you for your interest in Intain Markets! To complete your registration, we need to verify your email address.</p>
        <a href=${finalurl}> <br> <button class="button">Verify Email</button> </a>
        <p><br>Alternatively, please copy and paste the below link:<br>${finalurl}<br><br>Once your email is verified, you will be able to begin your onboarding process.</p>
        
        <p><br>Thank you for your time,</p>
        <p>The Intain Markets Team</p>

        </div>`,
      };
      winlog.info("mailOptions::" + JSON.stringify(mailOptions));

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          // throw error;
          winlog.info(error + "Email :     " + req.query.EmailAddress);
          // res.send(error + "Email : " + req.query.EmailAddress);

        } else {
          winlog.info("Email successfully sent!");
          var r = { "success": true, "message": "User Update Success", "file": req.files }
          res.send(r)
          //res.send({ "message": "Email successfully sent!" });

        }
      });


    })
  },

  GetUserbyID: function (req, res, next) {

    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      try {
        const data = await incrementer.methods
          .getUserById(req.query.userid)
          .call({ from: address });
        winlog.info(`The current string is: ${data}`);

        winlog.info("data:: " + JSON.stringify(data));

        var arr1 = JSON.parse(JSON.stringify(data));
        var resData = [];
        var objectWithGroupByName = {};
        winlog.info(arr1);
        // var resp = arr1[i].split("#");
        var c = {
          "UserId": arr1[0],
          "EmailAddress": arr1[1],
          "UserHash": arr1[2],
          "UserSatus": arr1[3],
          "UserAccAddress": arr1[4],
          "UserRole": arr1[5],
          "UserName": arr1[6],
          "QIBdate": arr1[7],
          "QIBAutorizedofficer": arr1[8],
          "Compilancedate": arr1[9],
          "Compilancetitle": arr1[10],
          "KycVerifiedStatus": arr1[11],
          "KycUploadStatus": arr1[12],
          "TermsOfService": arr1[13],
          "Investortype": arr1[14],
          "AccreditedInvestor": arr1[15],
          "AttestationAutorizedofficer": arr1[16]
        }
        res.send(c)
      } catch (e) {
        winlog.info("Error Occured" + e)

        var r = { "message": e.message }
        res.status(500).send(r);
      }
    };
    get1();
  },

  updateLogo: function (req, res) {

    var UserEmitter = new EventEmitter();
    var UserID = req.body.userid;
    const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
    const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");
    winlog.info("contractpath:: " + contractPath);
    const contractname = "User";

    const abi = SUser.abi;

    const incrementer = new web3.eth.Contract(abi, contractAddress);
    let errcount = 0;
    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      try {
        const data = await incrementer.methods
          .getUserById(UserID)
          .call({ from: address });
        winlog.info(`The current string is: ${data}`);
        winlog.info("data:: " + JSON.stringify(data));

        var arr1 = JSON.parse(JSON.stringify(data));
        winlog.info(arr1)
        var resData = [];
        //for (var i = 0; i < arr1.length; i++) {
        // var resp = arr1[i].split("#");
        winlog.info(arr1.length);
        if (arr1.length > 0) {
          var c = {
            "UserId": arr1[0],
            "EmailAddress": arr1[1],
            "UserHash": arr1[2],
            "UserSatus": arr1[3],
            "UserAccAddress": arr1[4],
            "UserRole": arr1[5],
            "UserName": arr1[6],
            "QIBdate": arr1[7],
            "QIBAutorizedofficer": arr1[8],
            "Compilancedate": arr1[9],
            "Compilancetitle": arr1[10],
            "KycVerifiedStatus": arr1[11],
            "KycUploadStatus": arr1[12],
            "TermsOfService": arr1[13],
            "Investortype": arr1[14],
            "AccreditedInvestor": arr1[15],
            "AttestationAutorizedofficer": arr1[16],

          };

          winlog.info("user details before account save:: " + JSON.stringify(c));

          var final = path.resolve(__dirname + '/../uploads/' + req.file.filename);            //var testFile = fs.readFileSync("/home/pavithra/y/pool1/TWO24788.pdf");
          var testFile = fs.readFileSync(final);
          //Creating buffer for ipfs function to add file to the system
          var testBuffer = Buffer.from(testFile);
          //   var testBuffer = new Buffer(testFile);

          ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
              winlog.info(err);
            }
            winlog.info(file[0].hash)
            // arr1[17] = file[0].hash
            // arr1[18] = req.file.filename
            UserEmitter.emit('updatelogo', file[0].hash, arr1);

          })
          //  res.send(file.content.toString('utf8'));
        } // end of if 
        else {
          var r = { "message": "user id not found" }
          res.status(204).send(r);
        }
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


    UserEmitter.on("updatelogo", (CID, arr1) => {
      ipfs.files.get(arr1[2], function (err, files) {
        files.forEach((file) => {
          winlog.info(file.path + "555")
          winlog.info(file.content.toString('utf8') + "666")
          ipfsData = JSON.parse(file.content.toString('utf8'));

          ipfsData.logo = CID;

          let testBuffer = new Buffer(JSON.stringify(ipfsData));
          ipfs.files.add(testBuffer, function (err, file) {
            if (err) {
              winlog.info(err);
            }

            winlog.info(file[0].hash)
            arr1[2] = file[0].hash
            UserEmitter.emit('updateUserBC', arr1);

          })

          //  res.send(file.content.toString('utf8'));

        })
      })
    })
    UserEmitter.on('updateUserBC', (Bcdata) => {
      const contractPath = path.join(process.cwd() + "/api/contracts/User.sol");

      const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)

      const abi = SUser.abi;

      const incrementer = new web3.eth.Contract(abi, contractAddress);
      //passing array of string value
      winlog.info(Bcdata)
      let errcount = 0;
      const increment = async () => {
        winlog.info(
          `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
        );
        try {
          web3.eth.handleRevert = true
          const encoded = incrementer.methods.updateUser(Bcdata).encodeABI(); // update is a function which accepts string array
          const createTransaction = await web3.eth.accounts.signTransaction(
            {
              from: address,
              to: contractAddress,
              data: encoded,
              gasLimit: 1883750,
              chainId: "101122"
            },
            privKey
          ); const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
          );
          winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
          // winlog.info(createReceipt);
          var r = { "success": true, "message": "User Update Success", "file": req.files }
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
              "message": "ID Doesnot exist"
            })
          } else {
            res.send(r);
          }
        } catch (e) {
          errcount++;
          if (e.reason && e.reason.includes("Caller is not an invoker")) {
            winlog.info(e.reason)
            res.status(500).send(e.reason);
          }
          else if (errcount <= 3) {
            winlog.info("error occ" + e); increment();
          } else {
            var r = { "message": e.message }
            res.status(500).send(r);
          }
        }
      }; increment();

    })

  },
}

module.exports = userSignUp;