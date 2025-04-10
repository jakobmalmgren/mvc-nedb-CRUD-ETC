import express from "express";
import dotenv from "dotenv";
import bookRouter from "./routes/book.routes.js";

const app = express();
app.use(express.json()); // varför behövs här o inte bara i routes? för de  där där får req ju...
dotenv.config();

app.use("/api/books", bookRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`serven is running on http://localhost:${PORT}`);
});
