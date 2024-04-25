const { create } = require('domain');
var request = require('request');
const URL = "http://20.253.174.32:80/ext"
//const URL = "http://127.0.0.1:9650/ext"
const winlog = require("../log/winstonlog");

var EventEmitter = require("events").EventEmitter;

var user = {
    createuser: function (req, res, next) {

        var CreateAddressEmit = new EventEmitter();
        var PrivateKeyEmit = new EventEmitter();
        var CchainEmit = new EventEmitter();
        var PrivateHexKeyEmit = new EventEmitter();

        if (req.body.address) {
            res.send({
                "account": "Yes",
                "address": req.body.address
            });
        }
        else if (!req.body.username || !req.body.password) {
            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            winlog.info("in")
            var postData = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "keystore.createUser",
                "params": {
                    "username": req.body.username,
                    "password": req.body.password

                }
            };
            request.post({
                uri: URL + '/keystore',
                'headers': {
                    'content-type': 'application/json;'
                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        response = JSON.parse(body);
                        winlog.info(response);
                        CreateAddressEmit.emit("createaddress");
                    } else {
                        winlog.info(response)
                        res.send({ token: -1 });
                    }
                });
        }


        CreateAddressEmit.on('createaddress', function () {
            var postData = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "platform.createAddress",
                "params": {
                    "username": req.body.username,
                    "password": req.body.password
                }
            }
            request.post({
                uri: URL + '/bc/P',
                'headers': {
                    'content-type': 'application/json;'
                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        response = JSON.parse(body);
                        winlog.info("P-chain address::::::::" + response.result.address);
                        PrivateKeyEmit.PchainAddress = response.result.address
                        PrivateKeyEmit.emit('Privatekey')
                    } else {
                        winlog.info(response)
                        res.send({ token: -1 });
                    }
                });

        })

        PrivateKeyEmit.on('Privatekey', function () {
            winlog.info(PrivateKeyEmit.PchainAddress)
            var postData = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "platform.exportKey",
                "params": {
                    "username": req.body.username,
                    "password": req.body.password,
                    "address": PrivateKeyEmit.PchainAddress
                }
            }

            request.post({
                uri: URL + "/P",
                'headers': {
                    'content-type': 'application/json;'
                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        response = JSON.parse(body);
                        winlog.info(response.result.privateKey);
                        CchainEmit.privateKey = response.result.privateKey
                        CchainEmit.emit('Cchain')
                    } else {
                        winlog.info(response)
                        res.send({ token: -1 });
                    }
                });
        })
        CchainEmit.on('Cchain', function () {
            var postData = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "avax.importKey",
                "params": {
                    "username": req.body.username,
                    "password": req.body.password,
                    "privateKey": CchainEmit.privateKey
                }
            }
            request.post({
                uri: URL + "/bc/C/avax",
                'headers': {
                    'content-type': 'application/json;'
                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        response = JSON.parse(body);
                        winlog.info(response);
                        PrivateHexKeyEmit.Cchain = response.result.address;
                        PrivateHexKeyEmit.emit('privatehexkey')
                        // response.result.PchainAddress = PrivateKeyEmit.PchainAddress
                        // res.send(response.result)
                    } else {
                        winlog.info(response)
                        res.send({ token: -1 });
                    }
                });
        })

        PrivateHexKeyEmit.on('privatehexkey', function () {
            var postData = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "avax.exportKey",
                "params": {
                    "username": req.body.username,
                    "password": req.body.password,
                    "address": PrivateHexKeyEmit.Cchain
                }
            }

            request.post({
                uri: URL + "/bc/C/avax",
                'headers': {
                    'content-type': 'application/json;'
                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        response = JSON.parse(body);
                        winlog.info(response);
                        response.result.address = PrivateHexKeyEmit.Cchain
                        var output ={"subnet": response.result,
                       "address":PrivateHexKeyEmit.Cchain,
                       "account":"No"
                        }
                        winlog.info(output)
                        res.send(output)
                    } else {
                        winlog.info(response)
                        res.send({ token: -1 });
                    }
                });
        })

    },

    GetPrivateKey: function (req, res, next) {
        if (!req.body.username || !req.body.password) {
            res.status(400).send({ "message": "Missing Arguments!" });
        } else {
            var postData = {
                "jsonrpc": "2.0",
                "id": 1,
                "method": "avax.exportKey",
                "params": {
                    "username": req.body.username,
                    "password": req.body.password,
                    "address": req.body.cchainaddress
                }
            }

            request.post({
                uri: URL + "/bc/C/avax",
                'headers': {
                    'content-type': 'application/json;'
                },
                body: JSON.stringify(postData)
            },
                function (error, response, body) {

                    if (!error && response.statusCode == 200) {
                        response = JSON.parse(body);
                        winlog.info(response);
                        
                        res.send(response.result)
                    } else {
                        winlog.info(response)
                        res.send({ token: -1 });
                    }
                });
        }
    }

}
module.exports = user