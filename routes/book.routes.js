import express, { json } from "express";
import Datastore from "nedb";
const router = express.Router();
const app = express();
app.use(express.json());

const db = new Datastore({ filename: "books.db", autoload: true });

// hämtar alla böcker i databasen

router.get("/", (req, res) => {
  db.find({}, (err, docs) => {
    if (err) {
      return res.status(500).json({ error: err }); // varför return på error
    }
    res
      .status(200)
      .json({ message: "din data hämtades utan problem", data: docs });
  });
});

// Övning 2: Hämta böcker efter författare

// Skapa en GET-route som hämtar och returnerar alla böcker skrivna av en specifik författare.

// Tips: Använd db.find() med rätt query.

router.get("/author/:name", (req, res) => {
  const authorName = req.params.name;
  console.log(authorName);

  db.find({ author: authorName }, (err, docs) => {
    if (err) {
      return res.status(500).json({ error: err }); // varför return på error
    }
    if (docs.length === 0) {
      return res
        .status(404)
        .json({ message: "de finns inga böcker me den queryn" });
    }
    res
      .status(200)
      .json({ message: "din data hämtades utan problem", data: docs });
  });
});

// Övning 1: Lägg till flera böcker

// Skapa en POST-route som låter användaren lägga till flera böcker samtidigt med hjälp av en array i bodyn.

// Exempel på JSON-body:
// [
//   { "title": "Sagan om Ringen", "author": "J.R.R. Tolkien", "pages": 1200 },
//   { "title": "Cirkeln", "author": "Mats Strandberg & Sara Elfgren", "pages": 520 }
// ]

router.post("/", (req, res) => {
  console.log(req.body);

  db.insert(req.body, (err, newDoc) => {
    if (err) {
      return res.status(500).json({ error: err }); // varför return på error
    }
    res
      .status(201)
      .json({ message: "ny data tillagd succesfully", data: newDoc });
  });
});

// 🟠 Medelsvåra Övningar

// Övning 1: Uppdatera antal sidor (pages) för alla böcker av en författare

// Skapa en PUT-route som uppdaterar antalet sidor på alla böcker av en viss författare.

// Exempel:
// Uppdatera antal sidor på alla J.K. Rowling böcker till 600:

// Body:
// {
//   "pages": 600
// }

// Tips: Använd {multi: true} i db.update().

router.put("/author/:name", (req, res) => {
  const authorName = req.params.name;
  const pages = req.body.pages;
  console.log("pages:", pages.pages);

  db.update(
    { author: authorName },
    { $set: { pages: pages } },
    { multi: true }, // gör så alla med authorname
    // i req.params blir uppdaterad me de som finns
    //  i req.body, finnd d INTE med.uppdateras bara
    //  första item med req.params.name
    (err, numberRemoved) => {
      if (err) {
        return res.status(500).json({ error: err }); // varför return på error
      }
      res.status(200).json({
        message: `författaren: ${authorName} uppdaterad`,
        numberOfItemsUpdated: numberRemoved,
      }); //datta kmr bli 1 för de kommer visaa antal doc som uppdaerats, intte själva dokumentet som uppdateras
    }
  );
});

// 🔴 Svåra Övningar

// Övning 1: Sökfunktion med flera kriterier

// Skapa en GET-route där du kan söka efter böcker baserat på flera valfria kriterier samtidigt (t.ex. titel, författare, min/max antal sidor).

// Tips: Använd req.query och skapa dynamiskt en query till db.find().

router.get("/search", (req, res) => {
  const query = {};
  const { title, author } = req.query;
  if (title) {
    query.title = new RegExp(title, "i");
  }
  if (author) {
    query.author = new RegExp(author, "i");
  }
  db.find(query, (err, doc) => {
    if (err) {
      console.log("databasfel", err);

      return res.status(500).json({ error: "databas error", details: err });
    }
    if (doc.length === 0) {
      return res
        .status(404)
        .json({ message: "ingen böcker me de kriterierna hittades" });
    }
    return res.status(200).json({ message: "queryn gick bra", antaldocs: doc });
  });
});

// Övning 2: Ta bort alla böcker med färre än X antal sidor

// Skapa en DELETE-route där användaren kan ange antal sidor, och ta bort alla böcker som har färre än detta antal.

// Exempel:
// DELETE http://localhost:8080/books/pages/300
// (Borde ta bort alla böcker med mindre än 300 sidor.)

// Tips: Använd query { pages: { $lt: req.params.pages } }.

router.delete("/pages/:pages", (req, res) => {
  const pages = parseInt(req.params.pages);
  if (isNaN(pages)) {
    return res.status(400).json({
      message: "de är inget nummer du angav",
    });
  }
  const query = { pages: { $lt: pages } };
  // den queryn sätt in i remove o hittar pages:
  // sen: { $lt: pages } gör pages : mindre än pages( alltså de pages som är params)
  //ska filtreras ut..så de blir såhär:
  // pages: mindre än 300 ska filtreras ut om ja satt 300 i req.params...
  // $lt är en operator i NeDB som betyder "mindre än".less then .
  //   $gt: Greater than (större än)

  // $lte: Less than or equal to (mindre än eller lika med)

  // $gte: Greater than or equal to (större än eller lika med)

  db.remove(query, (err, doc) => {
    if (err) {
      return res.status(500).json({
        message: "db error",
        error: err,
      });
    }
    if (doc.length === 0) {
      return res.json({ message: "ingen bok matchar din parameter" });
    }
    res;
    return res
      .status(200)
      .json({ message: "din queryparameter är lyckad", data: doc });
  });
});

// Övning 2: Implementera delvis uppdatering (PATCH)

// Skapa en PATCH-route där användaren kan uppdatera en valfri kombination av fält i en specifik bok.

// Exempel på body:
// {
//   "author": "J.R.R Tolkien",
//   "pages": 1400
// }

// Exempel-URL:
// PATCH http://localhost:8080/books/{_id}

// Tips:
// Du måste skapa en flexibel route som använder $set för att bara ändra de fält användaren skickar med.

router.patch("/:id", (req, res) => {
  const updatedData = req.body;
  const id = req.params.id;
  console.log("idddd", updatedData);
  if (updatedData === undefined) {
    res.status(400).json({ message: "ingen body har satts in" });
  }
  // db.update({ _id: id }, updatedData, (err, doc) => { // om ja har de så uppdateras o kör de över allt ja har in i bodyn, ex om ja bara har title så kommer bara title finnas kvar men:
  // om jag har :
  db.update({ _id: id }, { $set: updatedData }, (err, doc) => {
    // så kommer ja ex bara ändra title så kommer bara title ändras men de andra finna kvar!!
    if (err) {
      return res.status(500).json({ message: "server error", error: err });
    }
    if (doc.length === 0) {
      return res.status(404).json({ message: "boken med id:t hittades inte" });
    }
    return res.status(200).json({
      message: `id: ${id} har ändrats`,
      data: doc,
      updatedData: updatedData,
    });
  });
});

export default router;
