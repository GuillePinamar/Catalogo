import db from "../db/connection.js";

export const getProductos = (req, res) => {
  // Probamos la consulta
  const query = `
    SELECT 
      p.*, 
      img.imagen AS blob_imagen, 
      img.url_imagen AS url_imagen 
    FROM productos p
    LEFT JOIN imagenes_producto img ON p.idproducto = img.idproducto
  `;

  db.query(query, (err, results) => {
    if (err) {
      // ESTO MOSTRARÁ EL ERROR REAL EN TU TERMINAL
      console.error("--- ERROR EN MYSQL ---");
      console.error(err);
      
      return res.status(500).json({ 
        error: "Error en el servidor", 
        detalleSQL: err.sqlMessage || err.toString() 
      });
    }

    try {
      const productosMap = {};

      results.forEach(row => {
        const id = row.idproducto || row.idproductos || row.id;

        if (!productosMap[id]) {
          productosMap[id] = {
            idproducto: id,
            nombre: row.nombre,
            precio: row.precio,
            detalle: row.detalle || row.descripcion || "",
            imagenes: []
          };
        }

        let imagenFormateada = null;

        if (row.blob_imagen) {
          imagenFormateada = Buffer.isBuffer(row.blob_imagen)
            ? `data:image/jpeg;base64,${row.blob_imagen.toString("base64")}`
            : row.blob_imagen;
        } else if (row.url_imagen) {
          imagenFormateada = row.url_imagen;
        } else if (row.imagen) {
          imagenFormateada = Buffer.isBuffer(row.imagen)
            ? `data:image/jpeg;base64,${row.imagen.toString("base64")}`
            : row.imagen;
        }

        if (imagenFormateada) {
          productosMap[id].imagenes.push(imagenFormateada);
        }
      });

      res.json(Object.values(productosMap));
    } catch (e) {
      console.error("Error procesando datos:", e);
      res.status(500).json({ error: "Error al procesar imagenes" });
    }
  });
};