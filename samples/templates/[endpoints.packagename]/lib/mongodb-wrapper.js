const { mongodb } = require("./dependency").mongoWrapper();

const dbManagers = {
    dbms: {},

    /**
     * @param {string} databaseName
     * @returns {MongoDBManager}
     */
    get: function(databaseName) {
        if(this.dbms[[dbname]] !== undefined && this.dbms[[dbname]] !== null) {
            return this.dbms[[dbname]];
        }
        else {
            return null;
        }
    },
    /**
     * @param {string} databaseName
     * @param {MongoDBManager} db
     */
    set: function(databaseName, dbManager) {
        this.dbms[[dbname]] = dbManager;
    }
};

class MongoDBManager {
    /**
     * @param {import("mongodb").Db} db
     */
    constructor(db) {
        this.db = db;
    }

    /**
     * @param {string} collectionName
     * @param {Object} docs
     * @returns {Promise<import("mongodb").InsertOneWriteOpResult>} Promise<InserOneWriteOpResult>
     */
    async insert(collectionName, docs) {
        var collection = this.db.collection(collectionName);
        return collection.insertOne(docs);
    }
}

class MongoProvider {
    constructor() {
        /** @type {import("mongodb").MongoClient} */
        this.client = null;
    }

    /**
     * @variation 1
     * @param {string} uri The mongodb uri
     * @param {string} dbName The database name
     * @param {import("mongodb").MongoClientOptions} mongoOptions The database connectivity options
     * @param {import("mongodb").MongoClientCommonOption} dbOptions
     */
    async connect(uri, dbName, mongoOptions = null, dbOptions = null) {
        this.client = await mongodb.connect(uri, mongoOptions);
        var db = dbManagers.get(dbName) || new MongoDBManager(this.client.db(dbName, dbOptions));
        dbManagers.set(dbName, db);
        return db;
    }
}

module.exports = new MongoProvider();