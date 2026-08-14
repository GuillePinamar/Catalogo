import db from "../db/connection.js";

export const getProductos = (req, res) => {
  const query = "SELECT * FROM productos";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    const datos = results.map(row => {
      // Maneja si en tu tabla la columna es 'row.imagen' o si tienes múltiples imágenes formateadas
      let imagenFormateada = null;
      if (row.imagen) {
        imagenFormateada = Buffer.isBuffer(row.imagen)
          ? `data:image/jpeg;base64,${row.imagen.toString("base64")}`
          : row.imagen;
      }

      return {
        idproducto: row.idproductos || row.idproducto,
        nombre: row.nombre,
        precio: row.precio,
        detalle: row.detalle,
        imagen: imagenFormateada
      };
    });

    res.json(datos);
  });
};