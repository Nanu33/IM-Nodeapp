var xl = require('excel4node');
const winlog = require("../log/winstonlog");

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
    }
}
module.exports = excels;


