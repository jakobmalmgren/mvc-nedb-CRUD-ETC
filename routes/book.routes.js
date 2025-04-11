// routes innehåller bara själva routingen
// tar emout request från klienten
// och derigerar dem till rätt CONTROLLER!

import express from "express";
const router = express.Router();
const app = express();
app.use(express.json());
import {
  getAllBooks,
  getBookByAuthor,
  addBook,
  updatePagesByAuthor,
  searchBookByQuery,
  deleteLessThenPages,
  patchUpdate,
} from "../controllers/bookController.js";

// övn 1 hämtar alla böcker i databasen
router.get("/", getAllBooks);

// Övning 2: Hämta böcker efter författare
// Skapa en GET-route som hämtar och returnerar alla böcker skrivna av en specifik författare.
// Tips: Använd db.find() med rätt query.
router.get("/author/:name", getBookByAuthor);

// Övning 3: Lägg till flera böcker
// Skapa en POST-route som låter användaren lägga till flera böcker samtidigt med hjälp av en array i bodyn.
// Exempel på JSON-body:
// [
//   { "title": "Sagan om Ringen", "author": "J.R.R. Tolkien", "pages": 1200 },
//   { "title": "Cirkeln", "author": "Mats Strandberg & Sara Elfgren", "pages": 520 }
// ]
router.post("/", addBook);

// 🟠 Medelsvåra Övningar
// Övning 4: Uppdatera antal sidor (pages) för alla böcker av en författare
// Skapa en PUT-route som uppdaterar antalet sidor på alla böcker av en viss författare.
// Exempel:
// Uppdatera antal sidor på alla J.K. Rowling böcker till 600:
// Body:
// {
//   "pages": 600
// }
// Tips: Använd {multi: true} i db.update().
router.put("/author/:name", updatePagesByAuthor);

// 🔴 Svåra Övningar
// Övning 5: Sökfunktion med flera kriterier
// Skapa en GET-route där du kan söka efter böcker baserat på flera valfria kriterier samtidigt (t.ex. titel, författare, min/max antal sidor).
// Tips: Använd req.query och skapa dynamiskt en query till db.find().
router.get("/search", searchBookByQuery);

// Övning 6: Ta bort alla böcker med färre än X antal sidor
// Skapa en DELETE-route där användaren kan ange antal sidor, och ta bort alla böcker som har färre än detta antal.
// Exempel:
// DELETE http://localhost:8080/books/pages/300
// (Borde ta bort alla böcker med mindre än 300 sidor.)
// Tips: Använd query { pages: { $lt: req.params.pages } }.
router.delete("/pages/:pages", deleteLessThenPages);

// Övning 7: Implementera delvis uppdatering (PATCH)
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
router.patch("/:id", patchUpdate);

export default router;
