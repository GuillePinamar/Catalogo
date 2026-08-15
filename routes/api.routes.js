import { Router } from "express";
import { getProductos } from "../controllers/api.controller.js";

const router = Router();

// Ahora la ruta completa será GET /api/productos
router.get("/productos", getProductos);

export default router;





