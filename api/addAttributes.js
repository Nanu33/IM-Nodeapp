const ShortUniqueId = require("short-unique-id");
var MongoClient = require("mongodb").MongoClient;
var EventEmitter = require("events").EventEmitter;
const winlog = require("../log/winstonlog");

var url =
  "mongodb://root:" +
  encodeURIComponent("oAq2hidBW5hHHudL") +
  "@104.42.155.78:27017/IntainMarkets";
//var url = "mongodb://localhost:27017/IntainMarkets";

//Instantiate
const uid = new ShortUniqueId({ length: 10 });

var attributes = {
  addAttribute: function (req, res, next) {
    try{
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
      var AttrID = uid();
      //var loansarr = req.body.loans.length;
      var arr = [];

      winlog.info(AttrID);

      var resjson = {
        isSuccess: true,
        message: "Attribute created successfully",
      };

      var json = {
        attributeId: AttrID,
        attributeName: req.body.attributeName,
        attributeStandardName: req.body.attributeStandardName,
        attributeCategory: req.body.attributeCategory,
        attributeDescription: req.body.attributeDescription,
        attributePoolName: req.body.attributePoolName,
        aitrainedpoolname: req.body.attributePoolName,
      };

      arr.push(json);

      db.collection("Attribute_details").insertMany(arr, (err, result) => {
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
        res.send(resjson);
        client.close();

      });
    });
  }catch(err){
  console.log(err)
  }
  },
  getAllAttributes: function (req, res, next) {
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
      var noofprocessor;

      db.collection("Attribute_details")
        .find()
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
          winlog.info("Lengthof result" + result.length);

          res.send(result);
          client.close();

        });
    });
   },

  getAttributeDetailsByPoolId: function (req, res, next) {
    var findAttributes = new EventEmitter();
    var finalArr = [];
    var b = 0;
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

      db.collection("pool_detail")
        .find({ poolid: req.query.poolid })
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

          winlog.info("Lengthof result" + result.length);
          if (result.length > 0) {
            var attList = result[0].attributes.split("#");
            // res.send(result);

            if (attList.length < 2) {
              var json = {
                isSuccess: false,
                message: "No Fields found for the poolid " + req.query.poolid,
              };

              res.send(json);
              client.close();

            } else {
              for (var c = 0; c < attList.length; c++) {
                findAttributes.emit(
                  "getAttributes",
                  attList[c],
                  attList.length
                );
              }
            }
          } else {
            var json = {
              isSuccess: false,
              message: "No Pool with poolid " + req.query.poolid,
            };

            res.send(json);
            client.close();

          }
        }); // end of get pool details

      findAttributes.on("getAttributes", function (id, size) {
        winlog.info(id + ":::");
        db.collection("Attribute_details").findOne(
          { attributeId: id },
          function (err, result) {
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
            winlog.info(JSON.stringify(result));

            winlog.info(
              Object.keys(result).length +
              "::::::::::::::::::::::::::::::::::::::::::"
            );
            if (Object.keys(result).length > 0) {
              finalArr.push(result);
              winlog.info(JSON.stringify(finalArr) + "::b");
            }
            b++;
            if (b == size) {
              res.send(finalArr);
              client.close();

            }
          }
        );
      }); //end of find attributes emit
    }); // end of mongo connection
 
  },

  getAttributesByPoolName: function (req, res, next) {
    if (!req.query.aitrainedpoolname) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      
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
        var noofprocessor;

        db.collection("Attribute_details")
          .find({ aitrainedpoolname: req.query.aitrainedpoolname })
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
            winlog.info("Lengthof result" + result.length);

            res.send(result);
            client.close();

          });
      });
   
    }
  },

  mapAttributesToPool: function (req, res, next) {
    if (!req.query.aitrainedpoolname || !req.query.poolid) {
      res.status(400).send({ message: "Missing Arguments!" });
    } else {
      
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
        var attrString = "";
        var poolUpdateEmit = new EventEmitter();

        db.collection("Attribute_details")
          .find({ aitrainedpoolname: req.query.aitrainedpoolname })
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
            winlog.info("Lengthof result" + result.length);

            var data = [];
            for (var i in result) {
              data.push(result[i].attributeId);
            }
            winlog.info(data.join("#"));
            winlog.info(data);

            attrString = data.join("#");

            poolUpdateEmit.emit("update");
            // res.send(result);
          });
        poolUpdateEmit.on("update", function () {
          db.collection("pool_detail").updateOne(
            { poolID: req.query.poolid },
            { $set: { attributes: attrString } },
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

              // poolData = result;
              res.send({
                isSuccess: true,
                message: "Pool Attributes are updated sucessfully",
              });
              client.close();

            }
          );
        }); // end of emit
      });
   
    }
  },

  getallAitrainedPoolName: function (req, res, next) {
    var findAttributes = new EventEmitter();
    var finalArr = [];
    var b = 0;

    MongoClient.connect(url, async function (err, client) {
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

      const pipeline = [
        {
          $group: {
            _id: '$aitrainedpoolname',
            attributePoolName: { $first: '$attributePoolName' },
            attributeStandardName: { $push: '$attributeStandardName' }
          }
        },
        {
          $project: {
            _id: 0,
            aitrainedpoolname: '$_id',
            attributeStandardName: 1,
            poolname: '$attributePoolName'
          }
        }
      ];
      

      const result = await db.collection("Attribute_details").aggregate(pipeline).toArray();

      console.log(result);
      // Create an object to store the result
      const output = {};
      output["VerificationTemplate"] = {}
      console.log(result)

      result.forEach((item) => {

        output[item.aitrainedpoolname] = item.attributeStandardName;
       output.VerificationTemplate[item.aitrainedpoolname]  =[item.poolname] 
       
      });

      console.log(output);
      res.send(output)
      client.close();

      // Close the MongoDB connection

     
    
      
      
  })

},

updateAttributes:function(req,res){
  
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
    var AttrID = uid();
    //var loansarr = req.body.loans.length;
    var arr = [];

    winlog.info(AttrID);

    var resjson = {
      isSuccess: true,
      message: "Attribute created successfully",
    };

   

    db.collection("Attribute_details").updateOne({"attributeId":req.body.id},{ $set: { "attributeName":req.body.attributename }},function (err, result)  {
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
      winlog.info(result.modifiedCount);
      res.send(resjson);
      client.close();

    });
  }); 
}
};

module.exports = attributes;
