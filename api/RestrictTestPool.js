const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { get } = require('http');
const Web3 = require('web3');
const days360 = require('days360');
const { v4: uuidv4 } = require('uuid');
const { resolve } = require('dns');
const { resetPassword } = require('./userSignUp');
const address = '0xC60B683D1835B72A1f3CdAE3ac29b49607F0176D';
const web3 = new Web3("http://20.253.174.32:80/ext/bc/2ALtzRYgRpRWnTgjdrMArkMvU6RTpcjs7VWmupqYaPrHDrHLSd/rpc");
const privKey = '476645f88bc9ef81a40a45ef84972b8e71944f1bd7080cf2b0d6efdc60ee43e6';  //replace
// var url = "mongodb://127.0.0.1:27017/";
var url = "mongodb://root:" + encodeURIComponent("oAq2hidBW5hHHudL") + "@104.42.155.78:27017/IntainMarkets";
var request = require('request');
const winlog = require("../log/winstonlog");

var Restrict = {

    Getfinalpool: function (finalresponse,mailid,type) {
            var arr = [];
           // var finalresponse = req.body.finalresponse
            if (mailid.search(/Test/i) != -1) {
                var DealFilter = /Test/i; //include only test deal
                winlog.info("test")
            }
            else {
                winlog.info("not test")
                //  var DealFilter = /^((?!(Test)).)*$/i //include except test deal
                var DealFilter = /^((?!(Test|Sample|demo)).)*$/i
            }
            for (var i = 0; i < finalresponse.length; ++i) {
               
                if(type==="pool"){
                    var position = finalresponse[i]['poolname'].search(DealFilter);
                }else{
                var position = finalresponse[i][2].search(DealFilter);
                }
                if (position != -1) {
                    arr.push(finalresponse[i]);
                } else {
                    //winlog.info(" Test Deal name:: " + finalresponse[i])
                }
            }
            return arr;
    }
}
module.exports = Restrict;