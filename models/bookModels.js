//models innehåller databasen

import Datastore from "nedb";
const db = new Datastore({ filename: "db/books.db", autoload: true });
export default db;

// sen om man gör projektet större skapar
// man databas kanske för user och så vidare..så lägger
// man allt här...
