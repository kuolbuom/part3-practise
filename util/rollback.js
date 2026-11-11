// which will allow the npm script to execute the specified migration rollback function

const { rollbackMigration } = require("./db");

rollbackMigration();
