import db from "../db/connection.js";

export const getProductos = (req, res) => {
  // Consulta adaptada exactamente a tus dos tablas SQL
  const query = `
    SELECT 
      p.idproductos,
      p.nombre,
      p.precio,
      p.detalle,
      p.imagen AS imagen_principal,
      img.imagen AS imagen_galeria
    FROM productos p
    LEFT JOIN imagenes_producto img ON p.idproductos = img.idproducto
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("--- ERROR EN MYSQL ---", err);
      return res.status(500).json({ 
        error: "Error en la consulta SQL", 
        detalleSQL: err.sqlMessage || err.toString() 
      });
    }

    try {
      const productosMap = {};

      results.forEach(row => {
        const id = row.idproductos;

        // Si es la primera vez que procesamos este producto
        if (!productosMap[id]) {
          productosMap[id] = {
            idproducto: id,
            nombre: row.nombre,
            precio: row.precio,
            detalle: row.detalle || "",
            imagenes: []
          };

          // Agregar la imagen principal de la tabla 'productos' si existe
          if (row.imagen_principal) {
            const base64Main = Buffer.isBuffer(row.imagen_principal)
              ? `data:image/jpeg;base64,${row.imagen_principal.toString("base64")}`
              : row.imagen_principal;
            productosMap[id].imagenes.push(base64Main);
          }
        }

        // Agregar las imágenes secundarias de la tabla 'imagenes_producto'
        if (row.imagen_galeria) {
          const base64Gallery = Buffer.isBuffer(row.imagen_galeria)
            ? `data:image/jpeg;base64,${row.imagen_galeria.toString("base64")}`
            : row.imagen_galeria;
          
          // Evitar duplicados
          if (!productosMap[id].imagenes.includes(base64Gallery)) {
            productosMap[id].imagenes.push(base64Gallery);
          }
        }
      });

      res.json(Object.values(productosMap));
    } catch (e) {
      console.error("Error al procesar las imágenes:", e);
      res.status(500).json({ error: "Error al procesar las imágenes" });
    }
  });
};