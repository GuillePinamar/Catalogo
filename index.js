import express from "express";
import db from "./db/connection.js";
import apiRoutes from "./routes/api.routes.js"

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/api", apiRoutes);

db.getConnection((err, connection) => {
  if (err) {
    console.log("Error conectando:", err);
  } else {
    console.log("MySQL conectado 🚀");
    connection.release();
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});


