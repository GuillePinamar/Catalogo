import db from "../db/connection.js";

export const getProductos = (req, res) => {
  // Realizamos un LEFT JOIN para traer todos los datos del producto y sus imágenes asociadas
  const query = `
    SELECT 
      p.idproductos,
      p.nombre,
      p.precio,
      p.detalle,
      img.imagen AS blob_imagen,
      img.url_imagen AS url_imagen
    FROM productos p
    LEFT JOIN imagenes_producto img ON p.idproductos = img.idproducto
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error al obtener datos:", err);
      return res.status(500).json({ error: "Error en el servidor" });
    }

    // Como un producto puede tener varias filas por cada imagen en el JOIN, los agrupamos
    const productosMap = {};

    results.forEach(row => {
      const id = row.idproducto || row.idproductos;

      // Si el producto aún no está en el mapa, lo creamos
      if (!productosMap[id]) {
        productosMap[id] = {
          idproducto: id,
          nombre: row.nombre,
          precio: row.precio,
          detalle: row.detalle,
          imagenes: []
        };
      }

      // Procesamos la imagen de la fila actual (si existe)
      let imagenFormateada = null;

      if (row.blob_imagen) {
        // Si está guardada como BLOB / Buffer en la DB
        imagenFormateada = Buffer.isBuffer(row.blob_imagen)
          ? `data:image/jpeg;base64,${row.blob_imagen.toString("base64")}`
          : row.blob_imagen;
      } else if (row.url_imagen) {
        // Si guardas la ruta o URL en formato texto
        imagenFormateada = row.url_imagen;
      }

      // Si se obtuvo una imagen válida, se agrega al arreglo de imágenes del producto
      if (imagenFormateada) {
        productosMap[id].imagenes.push(imagenFormateada);
      }
    });

    // Convertimos el objeto en un Array de productos
    const datos = Object.values(productosMap);

    res.json(datos);
  });
};