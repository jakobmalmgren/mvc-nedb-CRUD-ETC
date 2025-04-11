//controllers innehåller logiken

import db from "../models/bookModels.js";
const getAllBooks = (req, res) => {
  db.find({}, (err, docs) => {
    if (err) {
      return res.status(500).json({ error: err }); // varför return på error
    }
    res
      .status(200)
      .json({ message: "din data hämtades utan problem", data: docs });
  });
};

const getBookByAuthor = (req, res) => {
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
};

const addBook = (req, res) => {
  console.log(req.body);

  db.insert(req.body, (err, newDoc) => {
    if (err) {
      return res.status(500).json({ error: err }); // varför return på error
    }
    res
      .status(201)
      .json({ message: "ny data tillagd succesfully", data: newDoc });
  });
};

const updatePagesByAuthor = (req, res) => {
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
};

const searchBookByQuery = (req, res) => {
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
};
const deleteLessThenPages = (req, res) => {
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
};

const patchUpdate = (req, res) => {
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
};

export {
  patchUpdate,
  searchBookByQuery,
  updatePagesByAuthor,
  addBook,
  getAllBooks,
  getBookByAuthor,
  deleteLessThenPages,
};
