var xl = require('excel4node');
const winlog = require("../log/winstonlog");
var path = require("path");
var fs = require('fs');

var excels = {
    createexcel: function (req, res) {
        //  var data = req.body.data;


        if (!req.body.data || !req.body.poolname) {
            res.status(400).send({ "message": "Missing Arguments!" });
        }
        else {
            var D = req.body.data;
            var poolname = req.body.poolname;
            winlog.info(JSON.stringify(D));
            // Create a new instance of a Workbook class
            var wb = new xl.Workbook();

            // Add Worksheets to the workbook
            var ws = wb.addWorksheet(poolname + ' Report');
            //  var ws2 = wb.addWorksheet('Sheet 2');

            // Create a reusable style
            var style = wb.createStyle({
                fill: {
                    type: "pattern",
                    patternType: "solid",
                    bgColor: "#33FF35",
                    fgColor: "#33FF35"
                },
                border: {
                    left: {
                        style: 'thin',
                        color: 'black',
                    },
                    right: {
                        style: 'thin',
                        color: 'black',
                    },
                    top: {
                        style: 'thin',
                        color: 'black',
                    },
                    bottom: {
                        style: 'thin',
                        color: 'black',
                    },
                    outline: false,
                }
            });
            var errStyle = wb.createStyle({
                fill: {
                    type: "pattern",
                    patternType: "solid",
                    bgColor: "red",
                    fgColor: "red"
                },
                border: {
                    left: {
                        style: 'thin',
                        color: 'black',
                    },
                    right: {
                        style: 'thin',
                        color: 'black',
                    },
                    top: {
                        style: 'thin',
                        color: 'black',
                    },
                    bottom: {
                        style: 'thin',
                        color: 'black',
                    },
                    outline: false,
                }
            });

            var myStyle = wb.createStyle({
                border: {
                    left: {
                        style: 'thin',
                        color: 'black',
                    },
                    right: {
                        style: 'thin',
                        color: 'black',
                    },
                    top: {
                        style: 'thin',
                        color: 'black',
                    },
                    bottom: {
                        style: 'thin',
                        color: 'black',
                    },
                    outline: false,
                },
                font: { color: "blue", size: 12, bold: true }

            });


            var row = 1;
            var column = 1;
            //  var jsonParsedArray = data;
            //  for (key in jsonParsedArray) {
            var g = 0;
            for (var A = 0; A < D.length; A++) {
                //winlog.info(D.data.length)
                //winlog.info(JSON.stringify(D.data[A]));
                Object.keys(D[A]).forEach(function (kv) {

                    if (g == 0) {

                        Object.keys(D[A]).forEach(function (kv) {
                            ws.cell(row, column)
                                .string(kv)
                                .style(myStyle);
                            column++;

                        });
                        row++;
                        g++;
                        column = 1;
                        if ((kv == 'Exceptions' && D[A][kv] == 'YES') || (kv != 'Exceptions' && D[A][kv] == 'NO')) {
                            ws.cell(row, column)
                                .string(D[A][kv])
                                .style(errStyle);
                        } else {
                            ws.cell(row, column)
                                .string(D[A][kv])
                                .style(style);
                        }
                        column++;
                    } else {
                        //  winlog.info(column + "::" + kb);
                        if ((kv == 'Exceptions' && D[A][kv] == 'YES') || (kv != 'Exceptions' && D[A][kv] == 'NO')) {
                            ws.cell(row, column)
                                .string(D[A][kv])
                                .style(errStyle);
                        } else {
                            ws.cell(row, column)
                                .string(D[A][kv])
                                .style(style);
                        }
                        column++;
                    }

                });
                column = 1;
                row = row + 1;
            } //end of for loop A
            //   } // end of key for loop

            wb.write(poolname + '.xlsx', res);

        }
    },
    downloadExcel : async function(req, res, aPayresponse) {
        
        if (!req.query.dealid || !req.query.month || !req.query.year) {
            res.status(400).send({ "message": "Missing Arguments!" });
        } else {        
            let {
                month,dealid, year
            } = req.query; 
            var poolname = `${dealid}-${month}-${year}`;
            // create a filePath to check the existing file
            let filepath = path.join(__dirname , '..' , `/PayingAgentsDownload/${poolname}.xlsx`);
            if(fs.existsSync(filepath)) {
                winlog.info("filepath in xlsx for download: " + filepath);
                res.download(filepath);
            } else {
                           
                var D = aPayresponse;
                winlog.info(D);
                if(Array.isArray(D) && D.length) {
                    D = D.map(function(payAgent) {
                        // convert the bankdetails string to bankdetails json object
                        payAgent.bankdetails = JSON.parse(payAgent.bankdetails);
                        let {
                            bankdetails : {
                                billingDetails, bankAddress,beneficiaryName,accountNumber,routingNumber,iban
                            }
                        } = payAgent; 
                        
                    
                        payAgent = {
                            ...payAgent,
                            "Beneficiary Name" : beneficiaryName,
                            "Account Number" : accountNumber,
                            "Routing Number": routingNumber,    
                            "IBAN": iban,
                            "Billing Name" : billingDetails.name,
                            "Billing Address Line 1" : billingDetails.line1,
                            "Billing Address Line 2": billingDetails.line2,
                            "Billing City": billingDetails.city,
                            "Billing District": billingDetails.district,
                            "Billing Country Code" : billingDetails.country,
                            "Billing Postalcode" : billingDetails.postalCode,
                            "Bank Name": bankAddress.bankName,
                            "Bank Address Line 1": bankAddress.line1,
                            "Bank Address Line 2": bankAddress.line2,
                            "Bank Address City" : bankAddress.city,
                            "Bank Address District": bankAddress.district,
                            "Bank Address Country Code": bankAddress.country,
                            "Bank Postalcode": bankAddress.postalCode
                        };
                        
                        delete payAgent.bankdetails; // delete the bankdetails object from original payload
                        delete payAgent.investorid; // remove the investor Id
                        return payAgent;
                    }) ;     
                }
                
                let sRootfilepath = path.join(__dirname , '..' , '/PayingAgentsDownload/');              

                winlog.info(JSON.stringify(D))  ;
                // Create a new instance of a Workbook class
                var wb = new xl.Workbook();

                // Add Worksheets to the workbook
                var ws = wb.addWorksheet(poolname + ' Report');
                //  var ws2 = wb.addWorksheet('Sheet 2');

                // Create a reusable style
                var style = wb.createStyle({
                    fill: {
                        type: "pattern",
                        patternType: "solid",
                        bgColor: "#FFFFFF",
                        fgColor: "#FFFFFF"
                    },
                    border: {
                        left: {
                            style: 'thin',
                            color: 'black',
                        },
                        right: {
                            style: 'thin',
                            color: 'black',
                        },
                        top: {
                            style: 'thin',
                            color: 'black',
                        },
                        bottom: {
                            style: 'thin',
                            color: 'black',
                        },
                        outline: false,
                    }
                });
                var errStyle = wb.createStyle({
                    fill: {
                        type: "pattern",
                        patternType: "solid",
                        bgColor: "red",
                        fgColor: "red"
                    },
                    border: {
                        left: {
                            style: 'thin',
                            color: 'black',
                        },
                        right: {
                            style: 'thin',
                            color: 'black',
                        },
                        top: {
                            style: 'thin',
                            color: 'black',
                        },
                        bottom: {
                            style: 'thin',
                            color: 'black',
                        },
                        outline: false,
                    }
                });

                var myStyle = wb.createStyle({
                    border: {
                        left: {
                            style: 'thin',
                            color: 'black',
                        },
                        right: {
                            style: 'thin',
                            color: 'black',
                        },
                        top: {
                            style: 'thin',
                            color: 'black',
                        },
                        bottom: {
                            style: 'thin',
                            color: 'black',
                        },
                        outline: false,
                    },
                    font: { color: "blue", size: 12, bold: true }

                });


                var row = 1;
                var column = 1;
                //  var jsonParsedArray = data;
                //  for (key in jsonParsedArray) {
                var g = 0;
                
                for (var A = 0; A < D.length; A++) {
                    //winlog.info(D.data.length)
                    //winlog.info(JSON.stringify(D.data[A]));
                    Object.keys(D[A]).forEach(function (kv) {

                        if (g == 0) {

                            Object.keys(D[A]).forEach(function (kv) {
                                ws.cell(row, column)
                                    .string(kv)
                                    .style(myStyle);
                                column++;

                            });
                            row++;
                            g++;
                            column = 1;
                            if ((kv == 'Exceptions' && D[A][kv] == 'YES') || (kv != 'Exceptions' && D[A][kv] == 'NO')) {
                                ws.cell(row, column)
                                    .string(D[A][kv])
                                    .style(errStyle);
                            } else {
                                ws.cell(row, column)
                                    .string(D[A][kv])
                                    .style(style);
                            }
                            column++;
                        } else {
                            //  winlog.info(column + "::" + kb);
                            if ((kv == 'Exceptions' && D[A][kv] == 'YES') || (kv != 'Exceptions' && D[A][kv] == 'NO')) {
                                ws.cell(row, column)
                                    .string(D[A][kv])
                                    .style(errStyle);
                            } else {
                                ws.cell(row, column)
                                    .string(D[A][kv])
                                    .style(style);
                            }
                            column++;
                        }

                    });
                    column = 1;
                    row = row + 1;
                } //end of for loop A
                //   } // end of key for loop
                winlog.info("creating excel file in " + filepath);
                wb.write(sRootfilepath + poolname + '.xlsx');
                wb.write(poolname + '.xlsx', res);
            }                
        }
    }
}
module.exports = excels;


