const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = async (callback) => {
  try {
    const client = await MongoClient.connect(
      "mongodb+srv://quangquoc1542002:Yu8hW5AZ3NVvjcV5@cluster0.wu5wxo1.mongodb.net/shop"
    );
    _db = client.db();
    callback();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
