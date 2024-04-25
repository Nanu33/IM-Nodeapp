const reader = require("xlsx");
const xlsxFile = require("read-excel-file/node");
const path = require("path");
const fs = require("fs");
const solc = require("solc");
const { get } = require("http");
const Web3 = require("web3");
const winlog = require("../log/winstonlog");
const ipfsAPI = require("ipfs-api");
var MongoClient = require("mongodb").MongoClient;
const ipfs = ipfsAPI("20.237.185.191", "9095", { protocol: "http" });
var url =
  "mongodb://root:" +
  encodeURIComponent("oAq2hidBW5hHHudL") +
  "@104.42.155.78:27017/IntainMarkets";
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");
const http = require("http");

var addPoolDocument = {
  addPoolDoc: function (req, res) {
    var final = path.resolve(__dirname + "/../uploads/" + req.file.filename); //var testFile = fs.readFileSync("/home/pavithra/y/pool1/TWO24788.pdf");
    var testFile = fs.readFileSync(final);
    //Creating buffer for ipfs function to add file to the system
    var testBuffer = Buffer.from(testFile);
    //   var testBuffer = new Buffer(testFile);
    ipfs.files.add(testBuffer, function (err, file) {
      if (err) {
        winlog.info(err);
      }

      winlog.info(file[0].hash);
      adddocument(file[0].hash);
    });
    async function adddocument(ipfshash) {
      return new Promise((resolve, reject) => {
        MongoClient.connect(url, function (err, client) {
          if (err) {
            var responseMessage = {
              isSuccess: false,
              statuscode: 500,
              message: "Internal Server Error: Database connection failed.",
            };
            winlog.error(JSON.stringify(responseMessage));
            winlog.error(
              "Database Error while accessing pool_detail database: " +
                JSON.stringify(err)
            );
            return res.status(500).send(responseMessage);
          }
          const db = client.db("IntainMarkets");
          winlog.info("CONNECTED");

          var json = {
            documentid: uuidv4().toString(),
            poolid: req.body.poolid,
            documentname: req.body.documentname,
            description: req.body.description,
            ipfshash: ipfshash,
            issuerId: req.body.issuerid,
            filename: req.file.filename,
          };
          db.collection("pool_document").insertOne(json, (err, result) => {
            if (err) {
              var responseMessage = {
                isSuccess: false,
                statuscode: 500,
                message: "Internal Server Error: Database connection failed.",
              };
              winlog.error(JSON.stringify(responseMessage));
              winlog.error(
                "Database Error while accessing pool_detail database: " +
                  JSON.stringify(err)
              );
              return res.status(500).send(responseMessage);
            }
            winlog.info("saved to database");
            res.send({ success: true, message: "Document Added Successfully" });
            client.close();
          });
        });
      });
    }
  },
  getPoolDocument: function (req, res, next) {
    if (!req.query.poolid || !req.query.issuerid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var poolid = req.query.poolid;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          var responseMessage = {
            isSuccess: false,
            statuscode: 500,
            message: "Internal Server Error: Database connection failed.",
          };
          winlog.error(JSON.stringify(responseMessage));
          winlog.error(
            "Database Error while accessing pool_detail database: " +
              JSON.stringify(err)
          );
          return res.status(500).send(responseMessage);
        }

        const db = client.db("IntainMarkets");
        db.collection("pool_document")
          .find(
            { poolid: poolid, issuerId: req.query.issuerid },
            { projection: { _id: 0 } }
          )
          .toArray(function (err, result) {
            if (err) {
              var responseMessage = {
                isSuccess: false,
                statuscode: 500,
                message: "Internal Server Error: Database connection failed.",
              };
              winlog.error(JSON.stringify(responseMessage));
              winlog.error(
                "Database Error while accessing pool_detail database: " +
                  JSON.stringify(err)
              );
              return res.status(500).send(responseMessage);
            }
            res.send(result);
            client.close();
          });
      });
    }
  },
  updatepooldocuments: function (req, res, next) {
    if (
      !req.body.documentid ||
      !req.body.description | !req.body.documentname
    ) {
      winlog.info("step1");
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      winlog.info("step2");
      MongoClient.connect(url, function (err, client) {
        if (err) {
          var responseMessage = {
            isSuccess: false,
            statuscode: 500,
            message: "Internal Server Error: Database connection failed.",
          };
          winlog.error(JSON.stringify(responseMessage));
          winlog.error(
            "Database Error while accessing pool_detail database: " +
              JSON.stringify(err)
          );
          return res.status(500).send(responseMessage);
        }
        const db = client.db("IntainMarkets");
        winlog.info("CONNECTED");
        const updateValues = {
          description: req.body.description,
          documentname: req.body.documentname,
        };

        db.collection("pool_document").updateMany(
          { documentid: String(req.body.documentid) },
          { $set: updateValues },
          function (err, result) {
            //winlog.info("Lengthof result" + result.length);
            // if (result.length > 0) {
            if (err) {
              var responseMessage = {
                isSuccess: false,
                statuscode: 500,
                message: "Internal Server Error: Database connection failed.",
              };
              winlog.error(JSON.stringify(responseMessage));
              winlog.error(
                "Database Error while accessing pool_detail database: " +
                  JSON.stringify(err)
              );
              return res.status(500).send(responseMessage);
            }
            winlog.info(result);
            res.send({
              isSuccess: true,
              message: " updated sucessfully",
            });
            client.close();
          }
        );
      });
    }
  },

  DownloadPoolDoc: function (req, res) {
    if (!req.query.documentid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var documentid = req.query.documentid;

      MongoClient.connect(url, function (err, client) {
        if (err) {
          var responseMessage = {
            isSuccess: false,
            statuscode: 500,
            message: "Internal Server Error: Database connection failed.",
          };
          winlog.error(JSON.stringify(responseMessage));
          winlog.error(
            "Database Error while accessing pool_detail database: " +
              JSON.stringify(err)
          );
          return res.status(500).send(responseMessage);
        }
        const db = client.db("IntainMarkets");

        db.collection("pool_document").findOne(
          { documentid: documentid },
          function (err, result) {
            if (err) {
              var responseMessage = {
                isSuccess: false,
                statuscode: 500,
                message: "Internal Server Error: Database connection failed.",
              };
              winlog.error(JSON.stringify(responseMessage));
              winlog.error(
                "Database Error while accessing pool_detail database: " +
                  JSON.stringify(err)
              );
              return res.status(500).send(responseMessage);
            } else if (result === null) {
              res.send({});
              client.close();
            } else {
              const validCID = result.ipfshash;

              // http.get(`http://20.237.185.191:8080/ipfs/${validCID}`, (response) => {

              //      const contentType = response.headers['content-type'];
              //      const    fileExtension=  mime.extension(contentType);
              //      winlog.info(fileExtension);
              //      var json ={
              //          "fileURI": "http://20.237.185.191:8080/ipfs/"+validCID,
              //          "type" : fileExtension
              //         };
              //      res.send(json);

              //      });

              const file1 = path.resolve(
                __dirname + "/../uploads/" + result.filename
              );
              var filepath = path.join(
                __dirname + "/../uploads/" + result.filename
              );
              console.log(filepath);
              http.get(
                "http://20.237.185.191:8080/ipfs/" + validCID,
                (response) => {
                  // const path = "downloaded-image.jpg";
                  const writeStream = fs.createWriteStream(file1);

                  response.pipe(writeStream);

                  writeStream.on("finish", () => {
                    writeStream.close();
                    res.download(filepath);
                    client.close();
                    winlog.info("Download file ready!");
                    //  res.send({ "filepath": '/uploads/' + result.filename })
                  });
                }
              );
            }
          }
        );
      });
    }
  },
  DeletePoolDoc: function (req, res, next) {
    if (!req.body.documentid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      var documentid = req.body.documentid;
      MongoClient.connect(url, function (err, client) {
        if (err) {
          var responseMessage = {
            isSuccess: false,
            statuscode: 500,
            message: "Internal Server Error: Database connection failed.",
          };
          winlog.error(JSON.stringify(responseMessage));
          winlog.error(
            "Database Error while accessing pool_detail database: " +
              JSON.stringify(err)
          );
          return res.status(500).send(responseMessage);
        }
        const db = client.db("IntainMarkets");
        winlog.info("CONNECTED");

        db.collection("pool_document").deleteOne(
          { documentid: documentid },
          function (err, result) {
            if (err) {
              var responseMessage = {
                isSuccess: false,
                statuscode: 500,
                message: "Internal Server Error: Database connection failed.",
              };
              winlog.error(JSON.stringify(responseMessage));
              winlog.error(
                "Database Error while accessing pool_detail database: " +
                  JSON.stringify(err)
              );
              return res.status(500).send(responseMessage);
            }
            if (result.deletedCount === 0) {
              res.send({
                isSuccess: false,
                message: " File not found",
              });
              client.close();
            } else {
              winlog.info(result.deletedCount);
              res.send({
                isSuccess: true,
                message: " documentid deleted successfully",
              });
              client.close();
            }
          }
        );
      });
    }
  },
};
module.exports = addPoolDocument;
