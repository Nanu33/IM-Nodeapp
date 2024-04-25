var express = require('express');
var app = express();
var request1 = require('request');
const { v4: uuidv4 } = require('uuid');
var EventEmitter = require('events').EventEmitter;
var cors = require('cors')
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var path = require("path");
var fs = require('fs');
var multer = require('multer');
var timeout = require('connect-timeout');
const http = require('http')
var https = require('https');
const mime = require('mime-types');
const { promisify } = require('util');
var mv = require('mv');
const NodeRSA = require('node-rsa');
const axios = require('axios');
const SftpClient = require('ssh2-sftp-client');
const cron = require('node-cron');
var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, POST, OPTIONS, PUT, PATCH, DELETE"
}
app.use(cors(corsOptions));
const nosniff = require('dont-sniff-mimetype')
const xl1 = require("xlsx");

app.use(nosniff())
//---------------------------------VAPT-------------------------------------------

const helmet = require('helmet');
app.use(helmet.frameguard({ action: 'SAMEORIGIN' }));
app.use(helmet())


const { expressCspHeader, NONCE } = require('express-csp-header');

app.use(expressCspHeader({
  directives: {
    'script-src': [NONCE]
  }
}));

app.disable('x-powered-by');
app.use(function (req, res, next) {
  // res.removeHeader("x-powered-by");
  res.setHeader("x-powered-by", "My Server");
  // res.setHeader("X-Content-Type-Options", "nosniff");
  // res.header('X-Frame-Options', 'SAMEORIGIN');

  res.removeHeader('server');
  next();
});




//-------------------------------------------------------------------------------
// app.use(function (req, res, next) {
//   winlog.info("in use 1")
// //   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin',  '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   next();
// })


// app.use(function (req, res, next) {

//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', '*');

//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);

//   // Pass to next layer of middleware
//   next();
// });
var winlog = require("./log/winstonlog");

var UA_route1 = require('./api/web3js/index');
var userSiginUp = require('./api/userSignUp');
var userRole = require('./api/userRole')

var UA_route3 = require('./api/useraccounts')
var UA_loans = require('./api/loans')
var UA_pools = require('./api/pools')
var UA_contract = require('./api/web3js/index');
var UA_excel = require('./api/createexcel')

var ERC20_transfer = require('./api/ERC20/MyToken')

var Attribute = require('./api/addAttributes.js');

var IPFSadd = require('./api/IPFS.js');
var BC_getallpools = require('./api/BCpools');

var updatedeal = require('./api/updatedeal');


var dealOnbording = require('./api/dealOnbording.js');
var dealdoc = require('./api/DealDocument')

var TrancheCommit = require('./api/TrancheInvestCommit')

var loantapecols = require('./api/loantapecolumns.js');
var loansave = require('./api/LoanSaveTest.js')

var paymentsettings = require('./api/InvestorWallet')

var lazerzero = require('./api/LayeZero')
var tranche = require('./api/updatetranche')

var GetTransactionDetails = require('./api/GetUserTransactionDetails')
var SaveUserTransactions = require('./api/SaveTransactionDetails')

var SavePaymentSettingsOffchain = require('./api/PaymentSettingsOffChain')
var TransactionOffchain = require('./api/TransactionDetailsOffchain')
var AccountDetailsOffchain = require('./api/AccountDetailsOffChain')

var pooldoc = require('./api/PoolDocument')
// var preclosing = require('./api/PreClosing')
var exceptionreport = require('./api/Exceptionreport')

//var PreDealData = require('./api/PreDealLoans')

//var WIP = require('./api/wip')
var Preview = require('./api/Preview')

var loanagg = require('./api/Iaaggregatesummary');
var Ialoanprocess = require('./api/IALoanprocesstape');

var trustee_route = require('./api/IADealCreation.js')

// Request methods you wish to allow
// res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

// Request headers you wish to allow
//res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

// Set to true if you need the website to include cookies in the requests sent
// to the API (e.g. in case you use sessions)
//res.setHeader('Access-Control-Allow-Credentials', true);

const ipfsAPI = require('ipfs-api');


const ipfs = ipfsAPI('20.237.185.191', '9095', { protocol: 'http' });

var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
// ------------------------- BC connection ---------------------

const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
//const web3 = new Web3("https://api.avax-test.network/ext/bc/C/rpc");
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");

const SUser = require('./api/abi/User')
const contractAddress = SUser.address; // deployed contract address( can be taken from remix or index.js)
// const contractPath = path.resolve(__dirname, 'api', 'contracts', 'User.sol');
// //const source = fs.readFileSync(contractPath, 'utf8');
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replcae
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';



//const tempFile = JSON.parse(solc.compile(JSON.stringify(input)));
//winlog.info(tempFile)
//const contractFile = tempFile.contracts['']['User'];
//winlog.info(contractFile)

//const bytecode = contractFile.evm.bytecode.object;
const abi = SUser.abi;

const incrementer = new web3.eth.Contract(abi, contractAddress);

// ---------------------------------------BC connection end-------
var privateKey = fs.readFileSync('tls.key', 'utf8');
var certificate = fs.readFileSync('tls.crt', 'utf8');
var credentials = { key: privateKey, cert: certificate };

//---------------- circle api connection

const MessageValidator = require('sns-validator');
const { updatetranchestatus } = require('./api/updatetranche');
const attributes = require('./api/addAttributes.js');
const circleArn =
  /^arn:aws:sns:.*:908968368384:(sandbox|prod)_platform-notifications-topic$/

const validator = new MessageValidator()
app.use(function (request, response, next) {
  if (request.url == '/') {

    if (request.method === 'HEAD') {
      response.writeHead(200, {
        'Content-Type': 'text/html',
      })
      response.end(`HEAD request for ${request.url}`)
      winlog.info('Received HEAD request')
      return
    }
    if (request.method === 'POST') {
      let body = ''
      request.on('data', (data) => {
        body += data
      })
      request.on('end', () => {
        winlog.info(`POST request, \nPath: ${request.url}`)
        winlog.info('Headers: ')
        console.dir(request.headers)
        winlog.info(`Body: ${body}`)

        response.writeHead(200, {
          'Content-Type': 'text/html',
        })
        response.end(`POST request for ${request.url}`)
        handleBody(body)
      })
    }
    else {
      winlog.info(request.url)
      const msg = `${request.method} method not supported`
      winlog.info(msg)
      response.writeHead(400, {
        'Content-Type': 'text/html',
      })
      response.end(msg)
      return
    }

    const handleBody = (body) => {
      const envelope = JSON.parse(body)
      validator.validate(envelope, (err) => {
        if (err) {
          console.error(err)
        } else {
          switch (envelope.Type) {
            case 'SubscriptionConfirmation': {
              if (!circleArn.test(envelope.TopicArn)) {
                console.error(
                  `\nUnable to confirm the subscription as the topic arn is not expected ${envelope.TopicArn}. Valid topic arn must match ${circleArn}.`
                )
                break
              }
              request1(envelope.SubscribeURL, (err) => {
                if (err) {
                  console.error('Subscription NOT confirmed.', err)
                } else {
                  winlog.info('Subscription confirmed.')
                }
              })
              break
            }
            case 'Notification': {
              var message = JSON.parse(envelope.Message)
              if (String(message.notificationType) == "payments") {

                winlog.info("Received message for payments: " + JSON.stringify(message))
                winlog.info("message.payment.source.id :  " + message.payment.source.id)
                let resp = paymentsettings.transferUSDCCircle(message, request, response, function (err, body) {
                  if (err)
                    winlog.info(err)
                  winlog.info(body);
                });
              }
              else if (String(message.notificationType) == "transfers" && String(message.transfer.status) == "complete") {

                winlog.info("Received message for transfers: " + JSON.stringify(message))
                winlog.info("USDC minted in investor account successfully")
                return ({
                  "success": true,
                  "message": "USDC minted success"
                })
              }
              else {
                winlog.info("Received message: " + JSON.stringify(message))
                break
              }
            }
            default: {
              console.error(`Message of type ${body.Type} not supported`)
            }
          }
        }
      })
    }
  }
  else {
    winlog.info("Not a circle api !")
    winlog.info("url: " + request.url + "   " + request.method)
    return next();
  }
})


//--------- circle api connection end

var storage2 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'tempfolder');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload2 = multer({ storage: storage2 }).single('filename');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'servicerUploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('filename');
//--------------------  JWT  ---------------------------------------------------------------------

//set secret variable
app.set('secret', 'thisismysecret');

app.use(expressJWT({
  secret: 'thisismysecret', algorithms: ['HS256']
}).unless({
  path: ['/login', '/jwt_token', '/createnewaccount', '/signUp', '/forgotPassword', '/resetPassword', '/upload', '/createUserRole', '/updateTermsOfService', '/GetAllUsersByUserRole', '/getuserbyid']
}));
app.use(bearerToken());

app.use(function (req, res, next) {
  winlog.info(' ------>>>>>> new request for %s', req.originalUrl);
  if (req.originalUrl.indexOf('/login') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/jwt_token') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/createnewaccount') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/signUp') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/forgotPassword') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/resetPassword') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/upload') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/createUserRole') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/updateTermsOfService') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/GetAllUsersByUserRole') >= 0) {
    return next();
  }
  if (req.originalUrl.indexOf('/getuserbyid') >= 0) {
    return next();
  }

  var token = req.token;
  winlog.info(token + "::::token");
  jwt.verify(token, app.get('secret'), function (err, decoded) {
    if (err) {
      res.send({
        success: false,
        message: 'Failed to authenticate token. Make sure to include the ' +
          'token returned from /jwt_token call in the authorization header ' +
          ' as a Bearer token'
      });
      return;
    } else {
      // add the decoded user name and org name to the request object
      // for the downstream code to use
      req.emailid = decoded.emailid;
      req.password = decoded.password;
      //  winlog.info(util.format('Decoded from JWT token: emailid - %s, password - %s', decoded.emailid, decoded.password));
      return next();
    }
  });
});


function getErrorMessage(field) {
  var response = {
    success: false,
    message: field + ' field is missing or Invalid in the request'
  };
  return response;
}

//handled
// Register and enroll user
app.post('/login', jsonParser, async function (req, res) {

  //--------------------------------


  var EmailId = req.body.EmailId;
  var Password = req.body.Password;

  if (!EmailId) {
    res.json(getErrorMessage('\'EmailId\''));
    return;
  }
  if (!Password) {
    res.json(getErrorMessage('\'Password\''));
    return;
  }
  let errcount = 0;
  const get1 = async () => {

    winlog.info(`Making a call to contract at address ${contractAddress}`);
    var status = 'Active'
    try {
      var data = await incrementer.methods
        .getUserByEmailAndStatusAnduserRole(EmailId, status, req.body.Role)
        .call({ from: address });
      winlog.info(`The current string is: ${data}`);
      winlog.info("data:: " + JSON.stringify(data));
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
    var arr1 = JSON.parse(JSON.stringify(data));
    var resData = [];
    //for (var i = 0; i < arr1.length; i++) {
    // var resp = arr1[i].split("#");
    winlog.info(arr1.length);
    if (arr1.length > 0) {

      var c = {
        "UserId": arr1[0][0],
        "EmailAddress": arr1[0][1],
        "UserHash": arr1[0][2],
        "UserSatus": arr1[0][3],
        "UserAccAddress": arr1[0][4],
        "UserRole": arr1[0][5],
        "UserName": arr1[0][6],
        "TermsOfService": arr1[0][13]

      };
      var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),  // 1 hr
        EmailId: EmailId,
        Password: Password
      }, app.get('secret'));
      //  let response =  helper.getRegisteredUser(emailid, password, true);


      ipfs.files.get(arr1[0][2], function (err, files) {
        files.forEach(async (file) => {
          winlog.info(file.path)
          winlog.info(file.content.toString('utf8'))
          var ipfsData = JSON.parse(file.content.toString('utf8'));
          ipfsData.UserId = arr1[0][0];
          // ipfsData.UserSatus = arr1[0][3];
          ipfsData.UserAccAddress = arr1[0][4];

          ipfsData.KycVerifiedStatus = arr1[0][11]
          ipfsData.KycUploadStatus = arr1[0][12]
          ipfsData.TermsOfService = arr1[0][13]
          ipfsData.VAToken = arr1[0][18]

          //ipfsData.logo = arr1[0][18]?"/uploads/" + arr1[0][18]:""
          //ipfsData.logo = ""
          const file1 = path.resolve(__dirname + '/uploads/' + ipfsData.UserId + ".png");
          if (ipfsData.EmailAddress == EmailId && ipfsData.Password == Password) {
            winlog.info("login sucess" + JSON.stringify(ipfsData));
            delete ipfsData["Password"];
            delete ipfsData["confirmPassword"];
            var r = { "message": "User Authentication Successful", "data": ipfsData, "token": token }

            if (ipfsData.logo) {
              console.log("in:::")
              // const response = await axios.get(`http://20.237.185.191:8080/ipfs/${ipfsData.logo}`, { responseType: 'stream' });            // const path = "downloaded-image.jpg";
              http.get("http://20.237.185.191:8080/ipfs/" + ipfsData.logo, (response) => {

                const writeStream = fs.createWriteStream(file1);

                response.pipe(writeStream);

                writeStream.on("finish", () => {
                  writeStream.close();

                  winlog.info("Download file ready!");
                  //res.send({"filepath":'/uploads/'+filename})
                  r.data.logo = '/uploads/' + ipfsData.UserId + ".png"
                  res.send(r);

                })
              })
            } else {
              console.log("out:::")

              r.data.logo = ""
              res.send(r);
            }


          } else {
            console.log("inside else")
            var r = { "message": "Passwor is incorrect" }
            res.status(204).send(r);
          }
          //  res.send(file.content.toString('utf8'));

        })
      })


    } // end of if 
    else {
      var r = { "message": "Username is incorrect" }
      res.status(204).send(r);
    }

  };
  get1();
  //--------------------------

});


app.get('/jwt_token', jsonParser, async function (req, res) {


  var baseData = req.headers.authorization.split(' ');
  let data = baseData[1];
  let buff = Buffer.from(data, 'base64'); //new Buffer(data, 'base64');

  let text = buff.toString('ascii');

  let originalData = text.split(':');
  var EmailId = originalData[0];
  var Password = originalData[1];

  winlog.info(EmailId + " :email");
  winlog.info(Password + " :password");
  if (!EmailId) {
    res.json(getErrorMessage('\'EmailId\''));
    return;
  }
  if (!Password) {
    res.json(getErrorMessage('\'Password\''));
    return;
  }
  let errcount = 0;
  const get1 = async () => {

    winlog.info(`Making a call to contract at address ${contractAddress}`);
    var status = 'Active'
    try {
      var data = await incrementer.methods
        .getUserByEmailAndStatus(EmailId, status)
        .call({ from: address });
      winlog.info(`The current string is: ${data}`);
      winlog.info("data:: " + JSON.stringify(data));
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
    var arr1 = JSON.parse(JSON.stringify(data));
    var resData = [];
    //for (var i = 0; i < arr1.length; i++) {
    // var resp = arr1[i].split("#");
    winlog.info(arr1.length);
    if (arr1.length > 0) {

      var c = {
        "UserId": arr1[0][0],
        "EmailAddress": arr1[0][1],
        "UserHash": arr1[0][2],
        "UserSatus": arr1[0][3],
        "UserAccAddress": arr1[0][4],
        "UserRole": arr1[0][5],
        "UserName": arr1[0][6],
        "TermsOfService": arr1[0][13]

      };
      var token = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),  // 1 hr
        EmailId: EmailId,
        Password: Password
      }, app.get('secret'));
      //  let response =  helper.getRegisteredUser(emailid, password, true);


      ipfs.files.get(arr1[0][2], function (err, files) {
        files.forEach((file) => {
          winlog.info(file.path)
          winlog.info(file.content.toString('utf8'))
          var ipfsData = JSON.parse(file.content.toString('utf8'));
          ipfsData.UserId = arr1[0][0];
          // ipfsData.UserSatus = arr1[0][3];
          ipfsData.UserAccAddress = arr1[0][4];

          if (ipfsData.EmailAddress == EmailId && ipfsData.Password == Password) {
            winlog.info("login sucess");
            delete ipfsData["Password"];
            ipfsData.KycVerifiedStatus = arr1[0][11]
            ipfsData.KycUploadStatus = arr1[0][12]
            ipfsData.TermsOfService = arr1[0][13]
            var r = { "jwt_token": token }
            res.send(r);
          } else {
            var r = { "message": "Passwor is incorrect" }
            res.status(204).send(r);
          }
          //  res.send(file.content.toString('utf8'));

        })
      })


    } // end of if 
    else {
      var r = { "message": "Username is incorrect" }
      res.status(204).send(r);
    }

  };
  get1();
  //--------------------------

});
// ---------------------------------------------------------------------------------------------------

var storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    winlog.info(req.body)
    // winlog.info(req.file.userid)

    //winlog.info(file.userid)
    cb(null, 'uploads/KYC/' + req.body.userid)
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);

  }
});
var upload1 = multer({ storage: storage1 });

//----------------


var storage2 = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'tempfolder');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload2 = multer({ storage: storage2 }).single('filename');

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'servicerUploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('filename');
//--------------------


app.post('/upload', upload1.any(), function (req, res, next) {
  winlog.info(JSON.stringify(req.files));

  let response = userSiginUp.updateuserKYC(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

  // res.send(req.files);
});


var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads');
  },
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).single('filename');


app.post('/createnewaccount', jsonParser, function (req, res) {

  let response = UA_route3.createuser(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/getprivatekey', jsonParser, function (req, res) {

  let response = UA_route3.GetPrivateKey(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//unused
app.post('/deploy', jsonParser, function (req, res) {

  let response = UA_route1.deploycontract(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


// const ipfsAPI = require('ipfs-api');


// const ipfs = ipfsAPI('104.42.155.78', '5001', { protocol: 'http' })

//handled
app.post('/createUserRole', jsonParser, function (req, res) {

  let response = userRole.createUserRole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.get('/GetAllUserRoles', jsonParser, function (req, res) {

  let response = userRole.GetAllUserRoles(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
//Addfile router for adding file a local file to the IPFS network without any local node
app.post('/signUp', jsonParser, function (req, res) {


  let response = userSiginUp.signUp(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

// app.post('/login', jsonParser, function (req, res) {

//   let response = userSiginUp.login(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })

app.get('/forgotPassword', jsonParser, function (req, res) {

  let response = userSiginUp.forgotPassword(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})



//handled
app.post('/resetPassword', jsonParser, function (req, res) {

  let response = userSiginUp.resetPassword(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

//Getting the uploaded file via hash code.
app.get('/getfile', function (req, res) {

  //This hash is returned hash of addFile router.
  const validCID = 'QmTdihZUGi2GwuHdiMHidGehKHd8zaekNBSwjWeCiVkboq'

  ipfs.files.get(validCID, function (err, files) {
    files.forEach((file) => {
      winlog.info(file.path)
      winlog.info(file.content.toString('utf8'))
    })
  })

})

//loans onboard

app.post('/uploadloanlms', function (req, res) {
  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          var filename = req.file.originalname;

          var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          res.send(output);

        } else {
          res.sendStatus(204);
        }

      });
    }
  })
});

app.post('/onboardloans', jsonParser, function (req, res) {

  let response = UA_loans.fetchkeysofonboardedloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})


app.get('/getallloans', jsonParser, function (req, res) {

  let response = UA_loans.getallloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

app.get('/getloansbyarayofloanhashes', jsonParser, function (req, res) {

  let response = UA_loans.getloansbyarayofloanhashes(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})


app.get('/updateLoanStatus', jsonParser, function (req, res) {

  let response = UA_loans.updateLoanStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

app.post('/updatedatas', jsonParser, function (req, res) {

  let response = UA_loans.updatedata(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.post('/exportexcel', jsonParser, function (req, res) {

  let response = UA_excel.createexcel(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.post('/deploycontract', jsonParser, async function (req, res) {

  var contractname = "CreatePool";
  let response = await UA_contract.deploycontract(req, res, contractname, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

//poolcreation
// app.post('/createpool', jsonParser, async function (req, res) {

//    let response1 = UA_pools.createpool(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
//   // }
// });

app.post('/createpool', jsonParser, function (req, res) {

  // fs.access("pooluploads", function (error) {
  //   if (error) {
  //     res.status(404).send('Directory Does Not exist!');
  //     winlog.info("Directory Does Not exist!");
  //   }
  //   else {
  // upload(req, res, function (err) {
  //   if (err) {
  //     return res.end("Error upoolploading file.");
  //   }
  //   winlog.info("__dirname::: " + __dirname);
  //   winlog.info(req.file);

  //   const folderName = __dirname + "/pooluploads/" + req.body.poolname;
  //   winlog.info("folder name::::" + folderName);

  //   try {
  //     if (!fs.existsSync(folderName)) {
  //       fs.mkdirSync(folderName);
  //       winlog.info("pool folder created::::::::::::" + req.body.poolname)
  //     } else {
  //       winlog.info("Folder already exist")
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  //   if (String(req.file) != "undefined") {

  //     var uploadpath = __dirname + '/uploads/' + req.file.filename;
  //     //filenamearr.push(uploadpath);
  //     winlog.info(uploadpath);

  //     var ext = path.extname(req.file.originalname);
  //     winlog.info("extension :::" + ext);
  //     var filename = req.file.originalname;
  //     winlog.info("file uploaded in upload directory:::::::::");

  //     //copy file from upload to pooluploads
  //     fs.copyFileSync(uploadpath, folderName + "/" + req.file.filename);
  //     winlog.info(uploadpath + " " + folderName + "/" + req.file.filename);
  let response1 = UA_pools.createpool(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

  //   } else {

  //     winlog.info("no files uploaded:::::::::::::::::::")
  //     let response1 = UA_pools.createpool(req, res, function (err, body) {
  //       if (err)
  //         res.send(err);
  //       res.send(body);
  //     });

  //   }

  // });
  //}
  //})
});

//not used
app.get('/getallpools', jsonParser, function (req, res) {

  let response = UA_pools.getallpools(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getbypoolid', jsonParser, function (req, res) {

  let response = UA_pools.getbypoolid(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})



app.get('/getallpoolsbyIssuerId', jsonParser, function (req, res) {

  let response = UA_pools.getallpoolsbyIssuerId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getallpoolsbyVAId', jsonParser, function (req, res) {

  let response = UA_pools.getallpoolsbyVAId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.get('/updatePoolStatus', jsonParser, function (req, res) {

  let response = UA_pools.updatePoolStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/updateLoanAndPoolStatus', jsonParser, function (req, res) {

  let response = UA_pools.updateLoanAndPoolStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/GetAllUsersByUserRole', jsonParser, function (req, res) {
  winlog.info("DF")
  let response = userSiginUp.GetAllUserByUserRole(req, res, function (err, body) {
    winlog.info("d")
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/filterloans', jsonParser, function (req, res) {

  let response = UA_loans.filterloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/updateArrayofLoanStatus', jsonParser, function (req, res) {

  let response = UA_loans.updateArrayofLoanStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

app.post('/mappoolstoloans', jsonParser, function (req, res) {

  let response = UA_pools.mappoolstoloans(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

//not used
app.post('/ERC20', jsonParser, function (req, res) {

  let response = ERC20_transfer.transfer(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})
//handled
app.post('/NFTmint', jsonParser, function (req, res) {

  let response = IPFSadd.Poolcreate(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.post('/addAttribute', jsonParser, function (req, res) {

  let response = Attribute.addAttribute(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/getAllAttributes', jsonParser, function (req, res) {

  let response = Attribute.getAllAttributes(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getAttributeDetailsByPoolId', jsonParser, function (req, res) {

  let response = Attribute.getAttributeDetailsByPoolId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.get('/getallpoolsfrombc', jsonParser, function (req, res) {

  let response = BC_getallpools.querygetallpools(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
    //res.send(body);
  });
})
//handled
app.get('/getpoolsfrombcbyissuer', jsonParser, function (req, res) {

  let response = BC_getallpools.getallpoolsbyissuerid(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})
//handled
app.get('/getpoolsfrombcbyunderwriter', jsonParser, function (req, res) {

  let response = BC_getallpools.getallpoolsbyunderwriterid(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})
//handled
app.post('/updatepoolstatusbc', jsonParser, function (req, res) {

  let response = BC_getallpools.updatepoolstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})

//handled
app.post('/createDeal', jsonParser, function (req, res) {

  let response1 = dealOnbording.createDeal(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });


});

//handled
app.post('/updatedealstatus', jsonParser, function (req, res) {

  let response1 = dealOnbording.updatedealstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });


});

//handled
app.post('/updatedeal', jsonParser, function (req, res) {

  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          var filename = req.file.originalname;

          var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          let response1 = updatedeal.updateDeal(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });

        } else {
          res.sendStatus(204);
        }

      });
    }
  });
});

//handled
app.get('/getDealsByUnderwriterId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsByUnderwriterId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})

//handled
app.get('/getDealDetailsByDealId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealDetailsByDealId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

//handled
app.post('/addDealDocuments', jsonParser, function (req, res) {

  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          //var filename = req.file.originalname;

          // var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          let response1 = dealdoc.addDeal(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });

        } else {
          res.sendStatus(204);
        }

      });
    }
  })


});


//handled
app.post('/updateDealDocument', jsonParser, function (req, res) {
  let response1 = dealdoc.updatedeal(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.get('/downloadDealTemplate', (req, res) => {

  var filepath = path.join(__dirname + '/uploads/demo_deal_template.xlsx');

  if (fs.existsSync(filepath)) {
    winlog.info("filepath in xlsx for download: " + filepath);

    res.download(filepath)
  }
  else {
    res.send({ "isSuccess": false, "message": "no file found" });
  }
});

//handled
app.get('/getInvestorDealDetailsByDealId', jsonParser, function (req, res) {

  let response = dealOnbording.getInvestorDealDetailsByDealId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});
//handled
app.get('/getcommitmentdetails', jsonParser, function (req, res) {

  let response = TrancheCommit.GetTrancheCommitment(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

//handled
app.get('/getAllDeals', jsonParser, function (req, res) {

  let response = dealOnbording.getAllDeals(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});
//handled
app.get('/getDealsbyServicerId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsbyServicerId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);

  });
});
//handled
app.get('/getDealsbyPayingagentId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsbyPayingagentId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

//handled
app.post('/InvesmentCommit', jsonParser, function (req, res) {
  let response1 = TrancheCommit.EditCommit(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.post('/EditCommit', jsonParser, function (req, res) {
  let response1 = TrancheCommit.EditCommit(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});
//handled
app.post('/Invest', jsonParser, function (req, res) {
  let response1 = TrancheCommit.Invest(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

// app.get('/getcommitmentdetails', jsonParser, function (req, res) {

//   let response = TrancheCommit.GetTrancheCommitment(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     winlog.info("in")
//     res.send(body);
//   });
// });
//handled
app.get('/DealDetailsRedirect', jsonParser, function (req, res) {

  let response = dealOnbording.getscreendetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});
//handled
app.post('/uploadapproach', jsonParser, function (req, res) {
  let response1 = dealOnbording.uploadapproach(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.get('/datequery', jsonParser, function (req, res) {
  let response1 = dealOnbording.datequery(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.post('/dateanalyse', jsonParser, function (req, res) {
  let response1 = dealOnbording.dateanalyse(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
// app.post('/uploadservicerreport', function (req, res) {

//   fs.access("tempfolder", function (error) {
//     if (error) {
//       res.status(404).send('Directory Does Not exist!');
//       winlog.info("Directory Does Not exist!");
//     }
//     else {
//       upload2(req, res, function (err) {
//         if (err) {
//           return res.end("Error uploading file.");
//         }
//         winlog.info("__dirname::: " + __dirname);
//         winlog.info(req.file);
//         if (String(req.file) != "undefined") {

//           var uploadpath = __dirname + '/tempfolder/' + req.file.filename;
//           //filenamearr.push(uploadpath);
//           winlog.info(uploadpath);

//           var ext = path.extname(req.file.originalname);
//           winlog.info("extension :::" + ext);

//           var filename = req.file.originalname;

//           //rename the file
//           var oldfilename = filename;
//           var month = String(req.body.month).padStart(2, '0')
//           // if (parseInt(req.body.month) < 10) {
//           //   var month = "0" + req.body.month;
//           // }
//           // else {
//           //   var month = req.body.month;
//           // }
//           winlog.info("req.body.dealid: " + req.body.dealid)

//           var docname = req.body.dealid + "-" + month + "-" + req.body.year + ext;
//           winlog.info("docname::: " + docname);
//           winlog.info("oldfilename:: " + oldfilename);
//           fs.rename(__dirname + '/tempfolder/' + oldfilename, __dirname + '/tempfolder/' + docname, function (err) {
//             if (err) winlog.info('ERROR: ' + err);
//           });

//           //copying file from tempfolder to uploads
//           mv(__dirname + '/tempfolder/' + docname, __dirname + '/servicerUploads/' + docname, function (err) {
//             if (err) { throw err; }
//             winlog.info('file moved successfully');
//           });

//           var output = { isSuccess: true, month: req.body.month, year: req.body.year, filename: docname, filetype: ext.toString(), result: "Document uploaded successfully!" };
//           winlog.info("output: " + JSON.stringify(output))
//           if (output.isSuccess) {
//             let response = dealOnbording.datesave(req, res, function (err, body) {
//               if (err)
//                 res.send(err);
//               res.send(body);
//             });
//           }
//           // res.send(output);

//         } else {
//           res.sendStatus(204);
//         }

//       });
//     }
//   })

// });

//handled
// app.get('/showcolumns', upload, function (req, res) {
//   let response = loantapecols.displaycolumns(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// });

// //handled
// app.post('/savemapping', jsonParser, async function (req, res) {
//   let response1 = await loantapecols.savemapping(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });

//   if (response1.success) {

//     setTimeout(function () {
//       winlog.info("inside loantape saving!!!!")
//       // var testFolder = "/home/monisha/Downloads/rsakeystore/";
//       var testFolder = path.join(__dirname + '/uploads/')
//       var count = 0;
//       filenames = fs.readdirSync(testFolder);
//       filenames.forEach(file => {
//         var extension = path.extname(file);
//         var File = path.basename(file, extension);
//         //winlog.info(File+" "+req.body.dealid)
//         if (File == req.body.dealid + "-public-key") {
//           winlog.info("user already exist::::::")
//           count = 1;
//         }
//       });

//       if (count == 0) {
//         winlog.info("Creating new private and public key for the user::::::::::")
//         var key1 = new NodeRSA({ b: 1024 });//1024
//         var public_key = key1.exportKey('public');
//         var private_key = key1.exportKey('private')
//         // var testFolder = "/home/monisha/Downloads/rsakeystore/";
//         var testFolder = path.join(__dirname + '/uploads/')
//         //write private and public key
//         fs.writeFileSync(testFolder + req.body.dealid + "-public-key.txt", public_key);
//         fs.writeFileSync(testFolder + req.body.dealid + "-private-key.txt", private_key);
//         winlog.info("done")
//       }
//       loansave.createDeal(req, res, (err, body) => {
//         if (err)
//           res.send(err)
//         res.send(body)
//       })
//     }, 2000)
//   }
//   else {
//     res.send({ "success": false, "message": "servicer aggregation already saved for this month/year" })
//   }
// });


app.get('/viewservicerdatadb', jsonParser, function (req, res) {
  let response1 = loansave.viewservicerdatadb(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});
//handled
app.post('/saveservicerdata', jsonParser, function (req, res) {
  let response1 = loansave.saveservicerdata(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});
//handled
app.post('/saveDealDetailsbyDealIdPostClosing', jsonParser, function (req, res) {
  let response1 = dealOnbording.saveDealDetailsbyDealIdPostClosing(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

//handled
app.get('/getDealDetailsbyDealIdPostClosing', jsonParser, function (req, res) {
  let response1 = dealOnbording.getDealDetailsbyDealIdPostClosing(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.get('/getPreviousDealDetails', jsonParser, function (req, res) {
  let response1 = dealOnbording.getPreviousDealDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.get('/getDealDetailsbyInvIdPostClosing', jsonParser, function (req, res) {
  let response1 = dealOnbording.getDealDetailsbyInvIdPostClosing(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//hanlded
app.get('/getAllInvestmentsByInvId', jsonParser, function (req, res) {
  let response1 = dealOnbording.getAllInvestmentsByInvId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.post('/SavePaymentSettings', jsonParser, async function (req, res) {
  let response = paymentsettings.AddDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.get('/getwiretransferdetails', jsonParser, async function (req, res) {
  let response = paymentsettings.GetWireTransferDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.post('/transferUSDCtoInvestor', jsonParser, async function (req, res) {
  let response = paymentsettings.transferUSDC(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.post('/layerzerosendmessage', jsonParser, async function (req, res) {
  let response = lazerzero.Sendmessage(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.get('/getDealsByIssuerId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsByIssuerId(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})
//handled
app.post('/updatetranchestatus', jsonParser, async function (req, res) {
  let response = tranche.updatetranchestatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

// app.get('/get', jsonParser, function (req, res) {
//   let response1 = dealOnbording.get(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// });

// app.post('/save', jsonParser, function (req, res) {
//   let response1 = dealOnbording.save(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// });

//handled
app.post('/updateDealreviewstatus', jsonParser, function (req, res) {

  let response1 = dealOnbording.updatereviewdealstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });


});
//handled
app.get('/getservicertransactiondetails', jsonParser, function (req, res) {

  let response1 = GetTransactionDetails.GetServicerTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.post('/transferUSDCtoServicer', jsonParser, function (req, res) {

  let response1 = GetTransactionDetails.USDCMint(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.post('/SaveTransactionDetails', jsonParser, function (req, res) {

  let response1 = SaveUserTransactions.SaveTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

//handled
app.get('/getAllInvestorInvestmentsbyDealID', jsonParser, function (req, res) {

  let response1 = dealOnbording.getAllInvestorInvestmentsByDealID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled
app.get('/getalltransactions', jsonParser, function (req, res) {

  let response1 = SaveUserTransactions.GetAllTransactions(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});
//handled

app.get('/getpayingagenttransactiondetails', jsonParser, function (req, res) {

  let response1 = GetTransactionDetails.GetPayingagentTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/testNFT', jsonParser, function (req, res) {

  let response = IPFSadd.addfile(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


//handled
app.post('/updateUSDCtransferstatus', jsonParser, function (req, res) {

  let response = dealOnbording.updateUSDCtransferstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

//handled
app.get('/servicerRedirect', jsonParser, function (req, res) {

  let response = dealOnbording.servicerRedirect(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

//handled
app.get('/getdealstatusbydealid', jsonParser, function (req, res) {
  winlog.info("in")
  let response = dealOnbording.getdealstatusbydealid(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})


app.get('/getAttributesByPoolName', jsonParser, function (req, res) {

  let response = Attribute.getAttributesByPoolName(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});


app.get('/mapAttributesToPool', jsonParser, function (req, res) {

  let response = Attribute.mapAttributesToPool(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/savebankdetailsoffchain', jsonParser, function (req, res) {

  let response = SavePaymentSettingsOffchain.AddDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getUserOffchainBankDetails', jsonParser, function (req, res) {

  let response = SavePaymentSettingsOffchain.GetOffChainDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/savetransactiondetailsoffchain', jsonParser, function (req, res) {

  let response = TransactionOffchain.SaveTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/updatetransactiondetailsoffchain', jsonParser, function (req, res) {

  let response = TransactionOffchain.UpdateTransactionDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.get('/gettransactiondetailsoffchainbydealid', jsonParser, function (req, res) {

  let response = TransactionOffchain.GetTransactionOffChainDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/addaccountdetailsoffchain', jsonParser, function (req, res) {

  let response = AccountDetailsOffchain.AddAccountOffChain(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/updateaccountsoffchain', jsonParser, function (req, res) {

  let response = AccountDetailsOffchain.UpdateAccountOffChain(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.get('/getaccountdetailsbydealidoffchain', jsonParser, function (req, res) {

  let response = AccountDetailsOffchain.GetAccountOffChainDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

//update on-chain /off-chain and update commit vs invest
app.post('/updatepaymentmode', jsonParser, function (req, res) {

  let response = dealOnbording.updatepaymentmode(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getinvestorsoffchainwiredetails', jsonParser, function (req, res) {

  let response = AccountDetailsOffchain.GetInvestorOffChainWireDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getserviceroffchainwiredetails', jsonParser, function (req, res) {

  let response = AccountDetailsOffchain.GetServicerOffChainWireDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getpayingagentoffchainwiredetails', jsonParser, async function (req, res) {

  let response = await AccountDetailsOffchain.GetPayingAgentOffChainWireDetails(req, res, function (err, body) {
    winlog.info("inside err")

    if (err)
      res.send(err);
    res.send(body);
  });
  res.send(response)
})
app.get('/getAllInvestorCommitmentsbyDealID', jsonParser, function (req, res) {

  let response1 = dealOnbording.getAllInvestorCommitmentsByDealID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/InvestOffchain', jsonParser, function (req, res) {
  let response1 = TrancheCommit.InvestOffChain(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

// app.post('/Modifyaccountbalanceoffchain', jsonParser, function (req, res) {
//   let response1 = AccountDetailsOffchain.Modifyaccountbalanceoffchain(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })




app.post('/testtransaction', jsonParser, function (req, res) {

  let response = TransactionOffchain.testtransaction(req, res, function (err, body) {

    if (err)
      res.send(err);
    res.send(body);
  });
})

//api to update PA and servier off-chain transfer status
app.post('/updatepostclosingscreenstatus', jsonParser, function (req, res) {

  let response = dealOnbording.updatepostclosingscreenstatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

//handled
app.post('/deletetransactiondetailsoffchain', jsonParser, function (req, res) {

  let response = TransactionOffchain.deletetransactiondetailsoffchain(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/deleteaccountsoffchain', jsonParser, function (req, res) {

  let response = AccountDetailsOffchain.DeleteAccountOffChain(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.post('/grantrole', jsonParser, function (req, res) {

  let response = userRole.grantrole(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getaccountdetailsbydealidoffchainpendingtransaction', jsonParser, function (req, res) {

  let response = AccountDetailsOffchain.IncludePendingTransaction(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/updateKYCStatus', jsonParser, function (req, res) {


  let response = userSiginUp.updateKYCVerifiedStatus(req, res, function (err, body) {
    VerifiedStatus(req, res, function (err, body) {
      if (err)
        res.send(err);
      res.send(body);
    });

  })

})

app.get('/getuserbyid', jsonParser, function (req, res) {

  let response = userSiginUp.GetUserbyID(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.post('/approvetranche', jsonParser, function (req, res) {


  let response = tranche.approveTranche(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})

app.post('/approvetranchebywalletfile', function (req, res) {
  fs.access("tempfolder", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload2(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/tempfolder/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          let response = tranche.approveTranche(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });


          // var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          // res.send(output);

        } else {
          res.sendStatus(204);
        }

      });
    }
  })
});

app.post('/deleteloans', jsonParser, function (req, res) {

  winlog.info("deleteloans api started");
  let response = UA_loans.deleteloans(req, res, function (err, body) {

    if (err)
      res.send(err);
    res.send(body);
  });

})

app.get('/DownloadIPFSFile', jsonParser, function (req, res) {

  let response = dealdoc.DownloadDealDoc(req, res, function (err, body) {

    if (err)
      res.send(err);
    res.send(body);
  });

})

app.post('/addPoolDocument', jsonParser, function (req, res) {

  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          //var filename = req.file.originalname;

          // var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
          let response1 = pooldoc.addPoolDoc(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });

        } else {
          res.sendStatus(204);
        }

      });
    }
  })

});

app.get('/getPoolDocument', jsonParser, function (req, res) {

  let response = pooldoc.getPoolDocument(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

})
// app.post('/encrypt',function(){
// var CryptoJS = require("crypto-js");
// function a(){
//   var ciphertext = CryptoJS.AES.encrypt(JSON.stringify("1234"), 'ALtReKQqUH1VTh43vNomog==').toString();
//   winlog.info(ciphertext)
// }
// a()

// })
// Function to download the payAgents details as excel sheet
app.get('/downloadpayagentdetails', jsonParser, async function (req, res) {
  let response = await AccountDetailsOffchain.GetPayingAgentOffChainWireDetails(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);

    //  res.send (response);
  });

  await UA_excel.downloadExcel(req, res, response, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.post('/updatepooldocuments', jsonParser, function (req, res) {

  winlog.info('step1')
  let response = pooldoc.updatepooldocuments(req, res, function (err, body) {
    winlog.info('step2')
    if (err)
      res.send(err);
    winlog.info('step3')
    res.send(body);
  });

})

app.get('/DownloadPoolDoc', jsonParser, function (req, res) {

  let response = pooldoc.DownloadPoolDoc(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getFileListByDealName', jsonParser, function (req, res) {

  let response = UA_loans.getFileListByDealName(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

// app.get('/testupdatepoolname', jsonParser, function (req, res) {

//   let response = UA_pools.test(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// });


app.post('/addlogo', jsonParser, function (req, res) {

  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);

        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);


          let response = userSiginUp.updateLogo(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });
        } else {
          res.sendStatus(204);
        }
      })
    }
  })
  // res.send(req.files);
});

app.post('/DeleteDealDocument', jsonParser, function (req, res) {

  winlog.info('step1')
  let response = dealdoc.DeleteDealDoc(req, res, function (err, body) {
    winlog.info('step2')
    if (err)
      res.send(err);
    winlog.info('step3')
    res.send(body);
  });

})

// app.post('/uploadPreclosingXl', jsonParser, function (req, res) {

//   fs.access("uploads", function (error) {
//     if (error) {
//       res.status(404).send('Directory Does Not exist!');
//       winlog.info("Directory Does Not exist!");
//     }
//     else {
//       upload(req, res, function (err) {
//         if (err) {
//           return res.end("Error uploading file.");
//         }
//         winlog.info("__dirname::: " + __dirname);
//         winlog.info(req.file);
//         if (String(req.file) != "undefined") {

//           var uploadpath = __dirname + '/uploads/' + req.file.filename;
//           //filenamearr.push(uploadpath);
//           winlog.info(uploadpath);

//           var ext = path.extname(req.file.originalname);
//           winlog.info("extension :::" + ext);

//           //var filename = req.file.originalname;

//           // var output = { isSuccess: true, filename: req.file.filename, filetype: ext.toString(), result: "Document uploaded successfully!" };
//           let response1 = preclosing.Preclosing(req, res, function (err, body) {
//             if (err)
//               res.send(err);
//             res.send(body);
//           });

//         } else {
//           res.sendStatus(204);
//         }

//       });
//     }
//   })

// });

// app.post('/DownloadPreclosingTemplate', jsonParser, function (req, res) {

//   winlog.info('step1')
//   let response = preclosing.downloadpresclosingexcel(req, res, function (err, body) {
//     winlog.info('step2')
//     if (err)
//       res.send(err);
//     winlog.info('step3')
//     res.send(body);
//   });

// })

app.post('/deletePoolDocument', jsonParser, function (req, res) {

  winlog.info('step1')
  let response = pooldoc.DeletePoolDoc(req, res, function (err, body) {
    winlog.info('step2')
    if (err)
      res.send(err);
    winlog.info('step3')
    res.send(body);
  });

});

app.get('/getAItrainedPoolNames', jsonParser, function (req, res) {
  winlog.info('step1')
  let response = UA_pools.getbypoolname(req, res, function (err, body) {
    winlog.info('step2')
    if (err)
      res.send(err);
    winlog.info('step3')
    res.send(body);
  });
});

app.post('/aitraunedname', jsonParser, function (req, res) {

  let response = UA_pools.addaitrainednames(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/exceptionReport', jsonParser, function (req, res) {

  let response = exceptionreport.createexcel(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

// app.post('/NFTVerifiedDataSavepreclosing', jsonParser, function (req, res) {

//   let response = preclosing.uploadlmsverfieddata(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// })

//---------------------------------------------------------------------
// app.post('/onboardpredealdata', jsonParser, function (req, res) {

//   let response = PreDealData.onboardloans(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// })

// app.get('/retrievepredealdata', jsonParser, function (req, res) {

//   let response = PreDealData.retrieveloans(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// })

// app.post('/deletepredealdata', jsonParser, function (req, res) {

//   winlog.info("deleteloans api started");
//   let response = PreDealData.deleteloans(req, res, function (err, body) {

//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })



// app.post('/predealdatashare', jsonParser, function (req, res) {

//   winlog.info("predealdatashare api started");
//   let response = PreDealData.shareloan(req, res, function (err, body) {

//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })

// app.get('/predealdataversion', jsonParser, function (req, res) {

//   winlog.info("predealdataversion api started");
//   let response = PreDealData.predealdataversion(req, res, function (err, body) {

//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })

// app.post('/predealdatasendfeedback', jsonParser, function (req, res) {

//   winlog.info("predealdatasendfeedback api started");
//   let response = PreDealData.sendfeedback(req, res, function (err, body) {

//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })

// app.post('/predealdatamovetoDD', jsonParser, function (req, res) {

//   winlog.info("predealdatamovetoDD api started");
//   let response = PreDealData.movetodd(req, res, function (err, body) {

//     if (err)
//       res.send(err);
//     res.send(body);
//   });

// })

//handled
app.post('/wipuploadservicerreport', function (req, res) {

  fs.access("tempfolder", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload2(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);
        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/tempfolder/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);

          var filename = req.file.originalname;

          //rename the file
          var oldfilename = filename;
          winlog.info("req.body.poolid: " + req.body.poolid)

          var docname = req.body.poolid + ext;
          let poolid = req.body.poolid
          winlog.info("docname::: " + docname);
          winlog.info("oldfilename:: " + oldfilename);
          // fs.readdir(__dirname + '/servicerUploads/', function (err, files) {
          //   if (err) {
          //     console.error('Error reading directory:', err);
          //     return;
          //   }

          //   const matchingFiles = files.filter(file => {
          //     console.log(`${file} poolid ${poolid} starts with ${file.startsWith(poolid)}`);
          //     return file.startsWith(poolid);
          //   });
          //   const numberOfFiles = matchingFiles.length;

          //   console.log("Number of files:::::::: " + numberOfFiles)
          //   docname = req.body.poolid + `(${numberOfFiles + 1})${ext}`
          //   console.log(docname)

          console.log("move to temp")

          console.log("doc name" + docname)
          fs.rename(__dirname + '/tempfolder/' + oldfilename, __dirname + '/tempfolder/' + docname, function (err) {
            console.log("rename success " + docname)
            if (err) winlog.info('ERROR: ' + err);
          });

          //copying file from tempfolder to uploads
          mv(__dirname + '/tempfolder/' + docname, __dirname + '/servicerUploads/' + docname, function (err) {
            if (err) { throw err; }
            winlog.info('file moved successfully');
          });

          //  })


          // winlog.info("output: " + JSON.stringify(output))
          res.send({ "success": true, "message": "File upload Success" });

          // res.send(output);

        } else {
          res.sendStatus(204);
        }

      });
    }
  })

});

//handled
app.get('/wipshowcolumns', upload, function (req, res) {
  let response = WIP.wipdisplaycolumns(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/wipgetallpoolsbyIssuerId', jsonParser, function (req, res) {

  let response = WIP.getallpoolsbyIssuerId(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/wipgetallpoolsbyunderwriterId', jsonParser, function (req, res) {

  let response = WIP.getwipunderwriterdata(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})


app.get('/wipgetallpoolsbyinvestorId', jsonParser, function (req, res) {

  let response = WIP.getwipinvestordata(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/wipsavemapping', jsonParser, function (req, res) {
  winlog.info("wipsavemapping api started");

  let response = WIP.wipsavemapping(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/wipretrievemapping', jsonParser, function (req, res) {
  winlog.info("wipsavemapping api started");

  let response = WIP.getmapping(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

//--------------------------------------------------

app.get('/querystandardfieldnames', jsonParser, function (req, res) {
  let response = Preview.querystandardfieldnames(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/previewsavemapping', jsonParser, function (req, res) {
  let response = Preview.processTape(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/downloadpreviewstdloantape', jsonParser, function (req, res) {
  let response = Preview.downloadexcel(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/updatePool', jsonParser, function (req, res) {

  //  const sftpConfig = {
  //             host: 'intainvasa.blob.core.windows.net',
  //             port: 22,
  //             username: 'intainvasa.imuser',
  //             password: 's52f4V4dswc3JZV1+jBa6vA6h47fVawj'
  //           };
  // try{
  // const sftp = new SftpClient();
  // await sftp.connect(sftpConfig);
  // console.log("Connected")
  // const remotePath = '/IntainMarkets/IM_Test';
  // const fileList = await sftp.list(remotePath);
  // console.log(fileList)
  // await sftp.end();
  // }catch(err){
  //   console.log(err)
  // await sftp.end();
  // }
  let response = UA_pools.updatePool(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/previewquerypoolmappingdetails', jsonParser, function (req, res) {
  let response = Preview.querypoolmapping(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/previewdeleteloans', jsonParser, function (req, res) {
  let response = Preview.deleteloans1(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/previewunderwriterpool', jsonParser, function (req, res) {
  let response1 = Preview.previewunderwriterpool(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.post('/previewupdatePoolStatus', jsonParser, function (req, res) {

  let response = Preview.previewupdatePoolStatus(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post('/savefeedback', jsonParser, function (req, res) {
  let response1 = Preview.savefeedback(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.get('/retrievefeedback', jsonParser, function (req, res) {

  let response = Preview.retrievefeedback(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/previewinvestorpool', jsonParser, function (req, res) {
  let response1 = Preview.previewinvestorpool(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.post('/updatepreviewinvestorlist', jsonParser, function (req, res) {

  let response = UA_pools.updatepreviewinvestorlist(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get('/getOriginatorlist', jsonParser, function (req, res) {

  let response = Preview.GetOriginator(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});


app.post('/updateVerificationTemplate', jsonParser, function (req, res) {

  let response = Preview.UpdateVerificationTemplate(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

// app.post('/updateVerificationTemplate', jsonParser, function (req, res) {

//   let response = Preview.UpdateVerificationTemplate(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     winlog.info("in")
//     res.send(body);
//   });
// });

app.get('/getverficationtemplatedetails', jsonParser, function (req, res) {

  let response = attributes.getallAitrainedPoolName(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

//------------------internaluse-------------------
app.post('/editissuerid', jsonParser, function (req, res) {

  let response = Preview.editissuerid(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

app.post('/updateTermsOfService', jsonParser, function (req, res) {

  fs.access("uploads", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {

      upload(req, res, function (err) {
        if (err) {
          return res.end("Error uploading file.");
        }
        winlog.info("__dirname::: " + __dirname);
        winlog.info(req.file);

        if (String(req.file) != "undefined") {

          var uploadpath = __dirname + '/uploads/' + req.file.filename;
          //filenamearr.push(uploadpath);
          winlog.info(uploadpath);

          var ext = path.extname(req.file.originalname);
          winlog.info("extension :::" + ext);


          let response = userSiginUp.updateTermsOfService(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });
        } else {

          let response = userSiginUp.updateTermsOfService(req, res, function (err, body) {
            if (err)
              res.send(err);
            res.send(body);
          });
        }
      })
    }
  })
})

app.get('/getnotificationlist', jsonParser, function (req, res) {

  let response = Preview.notificationlist(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
});

app.post('/updateAttributes', jsonParser, function (req, res) {

  let response = Attribute.updateAttributes(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/updatereadlist', jsonParser, function (req, res) {

  let response = Preview.updaterreadlist(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/MoveVAcontractfiles', jsonParser, function (req, res) {

  let response = UA_pools.MoveVAcontractfiles(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.get("/fetchVAToken", jsonParser, function (req, res) {
  let response = UA_pools.fetchVAToken(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post("/updateVAcertificate", jsonParser, function (req, res) {
  let response = UA_pools.updateVAcertificate(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})

app.post("/downloadVAcertificate", jsonParser, function (req, res) {
  let response = UA_pools.downloadVAcertificate(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
})



app.post('/UploadLoanTape', function (req, res) {

  fs.access("tempfolder", function (error) {
    if (error) {
      res.status(404).send('Directory Does Not exist!');
      winlog.info("Directory Does Not exist!");
    }
    else {
      upload2(req, res, async function (err) {
        if (err) {
          winlog.info(err)
          return res.end("Error uploading file.");
        }
        winlog.info(req.file);
        if (String(req.file) != "undefined") {
          var ext = path.extname(req.file.originalname);
          var oldfilename = req.file.originalname;
          var docname = req.body.DealName + "-" + req.body.Month + "-" + req.body.Year + "-" + req.body.ServicerName + ext;

          fs.rename(__dirname + '/tempfolder/' + oldfilename, __dirname + '/tempfolder/' + docname, function (err) {
            if (err) winlog.info('ERROR: ' + err);
          });

          //copying file from tempfolder to uploads
          mv(__dirname + '/tempfolder/' + docname, __dirname + '/uploads/' + docname, function (err) {
            if (err) { throw err; }
            winlog.info('file moved successfully');
          });
          var output = { isSuccess: true, month: req.body.Month, year: req.body.Year, filename: docname, filetype: ext.toString(), result: "Document uploaded successfully!" };

          await loanagg.updateAggDB(req)
          res.send(output);
        }
        else {
          var output = { isSuccess: false, result: "Format not handled" };
        }
      })
    }
  });
});

app.get('/PreviewLoanTape', async (req, res) => {

  if (!req.headers.authorization) {
    res.status(400).send({ "message": "Missing Argument Token !" })
  }
  else if (!req.query.peer) {
    res.status(400).send({ "message": "Missing Argument Peer !" })
  }
  else {
    var DealName = req.query.DealName;
    var Month = req.query.Month;
    var Year = req.query.Year;
    var ServicerName = req.query.ServicerName;

    var file1 = DealName + "-" + Month + "-" + Year + "-" + ServicerName + ".xlsx";
    var file2 = DealName + "-" + Month + "-" + Year + "-" + ServicerName + ".xls";
    var filepath1 = path.join(__dirname + '/uploads/' + file1);
    var filepath2 = path.join(__dirname + '/uploads/' + file2);
    console.log(filepath1)
    if (fs.existsSync(filepath1)) {
      var file = filepath1
    }
    else if (fs.existsSync(filepath2)) {
      var file = filepath2
    }
    try {
      console.log("in")
      var workbook = xl1.readFile(file, { cellDates: true, dateNF: 'yyyy-mm-dd' });
      var sheet_name_list = workbook.SheetNames;
      var data = await xl1.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], { raw: false, defval: "" });

      winlog.info("date length: " + JSON.stringify(data[0]) + "     " + data.length);

      // if (data.length > 500) {
      //     data = data.slice(0, 500);
      // }
      // else if (data.length == 0) {
      //     // var output = { isSuccess: false, result: "Error, Please upload correct excel file" };
      //     // res.send(output);
      //     data = [];
      // }
      // var output = { isSuccess: true, result: data };
      // res.send(output);
      if (data) {
        var output = { isSuccess: true, result: data };
        res.send(output);
      }
      else {
        var output = { isSuccess: false, result: "Error, Please upload correct excel file" };
        res.send(output);
      }
    }
    catch (err) {
      var output = { isSuccess: false, result: "Please upload the file again" };
      res.send(output);
    }
  }
});


app.post('/iasaveloanprocessdate', jsonParser, function (req, res) {
  let response = loanagg.saveloanprocessdate(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/StdfieldsQuery', jsonParser, function (req, res) {

  let response = loanagg.StdfieldsQuery(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/getMapping', jsonParser, function (req, res) {
  let response = loanagg.getMapping(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/saveMapping', jsonParser, async function (req, res) {
  let response1 = await loanagg.saveMapping(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
  if (response1.Success) {

    setTimeout(async function () {
      var testFolder = path.join(__dirname + '/uploads/key/')
      var count = 0;
      filenames = fs.readdirSync(testFolder);
      filenames.forEach(file => {
        var extension = path.extname(file);
        var File = path.basename(file, extension);
        var docname = req.body.DealName + "-" + req.body.Month + "-" + req.body.Year + "-" + req.body.ServicerName;
        console.log("docname::: " + docname);

        if (File == docname + "-public-key") {
          console.log("user already exist::::::")
          count = 1;
        }
      });
      if (count == 0) {
        console.log("Creating new private and public key for the user::::::::::")
        var key1 = new NodeRSA({ b: 1024 });//1024
        var public_key = key1.exportKey('public');
        var private_key = key1.exportKey('private')
        var testFolder = path.join(__dirname + '/uploads/key/')
        var docname = req.body.DealName + "-" + req.body.Month + "-" + req.body.Year + "-" + req.body.ServicerName;
        console.log("docname::: " + docname);
        //write private and public key
        fs.writeFileSync(testFolder + docname + "-public-key.txt", public_key);
        fs.writeFileSync(testFolder + docname + "-private-key.txt", private_key);
        console.log("done")
      }
      let response = await Ialoanprocess.processTape(req, res, function (err, body) {
        if (err)
          res.send(err);
        res.send(body);
      });
    }, 2000);
  }
  else {
    res.send({ "Success": false, "Result": "Loantape data not saved!" })
  }
});


app.get('/PreviewMappedFields', (req, res) => {

  if (!req.headers.authorization) {
    res.status(400).send({ "message": "Missing Argument Token !" })
  }

  else {
    let response = loanagg.previewMappedFields(req, res, function (err, body) {
      if (err)
        res.send(err);
      res.send(body);
    });
  }
});

app.post('/Summarize', jsonParser, function (req, res) {
  let response = loanagg.prepareAggregateSummary(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.post('/saveaggregatesummarytobc', jsonParser, function (req, res) {
  let response = trustee_route.saveaggregatesummarytobc(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/viewaggregatesummary', jsonParser, function (req, res) {
  let response = trustee_route.viewaggregatesummary(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });
});

app.get('/previewratingagencypool', jsonParser, function (req, res) {
  let response1 = Preview.getallpoolsbyratingagency(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.get('/getallratingagencypool', jsonParser, function (req, res) {
  let response1 = UA_pools.getallpoolsbyratingagency(req, res, function (err, body) {
    if (err)
      res.send(err);
    res.send(body);
  });

});

app.get('/getDealsByRatingagencyId', jsonParser, function (req, res) {

  let response = dealOnbording.getDealsByRatingagency(req, res, function (err, body) {
    if (err)
      res.send(err);
    winlog.info("in")
    res.send(body);
  });
})
cron.schedule('* * * * *', async () => {
  console.log("inside schedular:::::")
  let response = UA_pools.updateVAcertificate();
})

app.post('/downloadlogo', jsonParser, function (req, res) {

  var filepath = path.join(__dirname + '/uploads/' + req.body.userid + '.png');

  if (fs.existsSync(filepath)) {
    winlog.info("filepath in xlsx for download: " + filepath);

    res.download(filepath)
  }
  else {
    res.send({ "isSuccess": false, "message": "LOGO not uploaded" });
  }
});
// app.post('/testaddipfsfileinsidewrapperdirectory', jsonParser, function (req, res) {

//   let ipfsData = {
//     "loanid": "314",
//     "gross_interest_rate": "9.25",
//     "property_city": "CEDAR PARK", "property_state": "TX",
//     "borrower_name": "Kaiya Mcdonald",
//     "current_principal": "545717",
//     "origination_date": "03-01-2023",
//     "URI": "http://20.237.185.191:8080/ipfs/QmQfntiKR3DE8HFsdbMhBx2jcSyaWVjTnws4zfMTvFDdQW"
//   }
//   let testFile = JSON.stringify(ipfsData)
//   //Creating buffer for ipfs function to add file to the system
//   const bufferData = Buffer.from(testFile);
//   const filePath = `/314/${314}.json`; // Example: /dynamic/1631652998645.json
//   console.log(filePath)
//   const file = { path: filePath, content: bufferData };
//   let testBuffer = new Buffer(testFile);


//   ipfs.files.add(file, { wrapWithDirectory: true }, (err, result) => {
//     if (err) {
//       winlog.info(err);
//     }
//     winlog.info("inside ::" + JSON.stringify(result))
//     //BCdata[2] = file[0].hash
//     // UserEmitter.emit('updateUserBC', BCdata);
//   })
// });





// res.send(req.files);


//to add standard fields
// app.post('/addintainstandardmapping', jsonParser, function (req, res) {
//   winlog.info("wipsavemapping api started");

//   let response = WIP.addstdfields(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// })

// //handled
// app.post('/updateclosingdate', jsonParser, function (req, res) {

// let response = BC_getallpools.updateclosingdate(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     winlog.info("in")
//     res.send(body);
//   });
// })
var listen = http.createServer(app).listen(4005, () => winlog.info('Server started on port 4005'));
listen.setTimeout(2000000000);


// let currentdate = new Date();
// let setupdate = new Date("2023-05-12");

// var Difference_In_Time = currentdate.getTime() - setupdate.getTime();
// var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
// console.log("in " + Difference_In_Days)
// if (Difference_In_Days >= 1) {
//   poolData[0]["UnderWriterUserName1"] = finalresponse[i][6]
// } else {
//   poolData[0]["UnderWriterUserName1"] = finalresponse[i][6]
// }


//post api to save xl file

// var index = require('./index');
// app.post('/bdbjson', jsonParser, function (req, res) {

//   let response = index.finaltablejson(req, res, function (err, body) {
//     if (err)
//       res.send(err);
//     res.send(body);
//   });
// })


