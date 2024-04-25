const fs = require('fs');
const path = require('path');

const { v4: uuidv4 } = require('uuid');
var EventEmitter = require("events").EventEmitter;

const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

const contractPath = path.resolve(__dirname, 'contracts', 'UserRole.sol');
//const source = fs.readFileSync(contractPath, 'utf8');
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const winlog = require("../log/winstonlog");
const SUserRole = require('./abi/UserRole')
const SCreatePool = require('./abi/CreatePool')
const SLoanContract = require('./abi/LoanContract')
const SPoolDocument = require('./abi/PoolDocument')

const contractAddress = SUserRole.address // deployed contract address( can be taken from remix or index.js)

// const input = {
//   language: 'Solidity',
//   sources: {
//     'UserRole.sol': {
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
//const contractFile = tempFile.contracts['UserRole.sol']['UserRole'];
//winlog.info(contractFile)

//const bytecode = contractFile.evm.bytecode.object;
const abi = SUserRole.abi;

const incrementer = new web3.eth.Contract(abi, contractAddress);

var UserRole = {


  createUserRole: function (req, res, next) {

    if (!req.body.UserRoleName) {
      res.send({ token: -1 });
    } else {
      var UserRoleID = uuidv4().toString();
      var UserRoleName = req.body.UserRoleName.toString();

      const inputData = [];
      inputData.push(UserRoleID);
      inputData.push(UserRoleName);
      // var a = ["1","2","3","4","5"]
      winlog.info(JSON.stringify(req.body) + " :::::::::::::::::::::::::::");

      winlog.info(JSON.stringify(inputData) + "    ::::::::");
      //passing array of string value
      let errcount = 0;
      const increment = async () => {
        winlog.info(
          `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
        );

        try {
          web3.eth.handleRevert = true
          const encoded = incrementer.methods.createUserRole(inputData).encodeABI(); // update is a function which accepts string array

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
          var r = { "message": "User Role created Successfully", "transactionHash": createReceipt.transactionHash, "status": createReceipt.status }

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
            res.send(r);
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

    } // end of else

  },
  //    GetAllUserRoles

  GetAllUserRoles: function (req, res, next) {

    const get1 = async () => {
      winlog.info(`Making a call to contract at address ${contractAddress}`);
      try {
        const data = await incrementer.methods
          .getAllUserRoles()
          .call({ from: address });
        winlog.info(`The current string is: ${data}`);

        winlog.info("data:: " + JSON.stringify(data));

        var arr1 = JSON.parse(JSON.stringify(data));
        var resData = [];
        for (var i = 0; i < arr1.length; i++) {
          // var resp = arr1[i].split("#");
          var c = {
            "UserRoleID": arr1[i][0],
            "UserRoleName": arr1[i][1]
          };
          resData.push(c);
        }
        res.send(resData);
      } catch (e) {
        winlog.info("Error occured" + e)

        var r = { "message": e.message }
        res.status(500).send(r);
      }
    };

    get1();
  },
  grantrole: function (req, res) {

    return new Promise((resolve, reject) => {

     // const contractAddress = "0x8f364D1Ad6EFE88cC2fBad33d1A6052053E02f6e"
      //const contractAddress = SCreatePool.address;// Contract Call

      // const contractPath = path.join(process.cwd(), '/api/contracts/' + "CreatePool.sol");
      // const contractname = "CreatePool";
      var contractAddress1 ="";
      var abi =""
      if (req.body.contractname === 'createpool') {
        winlog.info("in")
         contractAddress1 = req.body.contractaddress
         abi = SCreatePool.abi;
      } else if(req.body.contractname === 'loancontract') {

        winlog.info("in in")
         contractAddress1 = req.body.contractaddress
         abi = SLoanContract.abi;

      }else if (req.body.contractname === "pooldocument"){
        winlog.info("in in pooldoc")
        contractAddress1 = SPoolDocument.address
        abi = SPoolDocument.abi;
      }
      winlog.info(contractAddress1)
      const incrementer = new web3.eth.Contract(abi, contractAddress1);


      let errcount = 0;
      const increment = async () => {
        winlog.info(
          `Calling the increment by ${"updated value"} function in contract at address ${contractAddress}`
        );
        try {
          web3.eth.handleRevert = true
          const encoded = incrementer.methods.grantRole(req.body.role, req.body.address).encodeABI();
          const createTransaction = await web3.eth.accounts.signTransaction(
            {
              from: address,
              to: contractAddress1,
              data: encoded,
              gasLimit: 6000000,
              chainId: "101122"
            },
            privKey
          ); const createReceipt = await web3.eth.sendSignedTransaction(
            createTransaction.rawTransaction
          );
          winlog.info(`Tx successfull with hash: ${createReceipt.transactionHash}`);
          res.send({ "success": true, "message": "access provided" });
          resolve("pool save success")
          //  IPFS.addfile(req, res);

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
  },

}

module.exports = UserRole;