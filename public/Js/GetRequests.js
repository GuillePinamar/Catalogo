document.addEventListener('DOMContentLoaded', function () {
    const productCards = document.getElementById('productsCards');
    const searchForm = document.querySelector("form[role='search']");
    const searchInput = searchForm.querySelector("input[type='search']");
    
    // Instancia del modal de Bootstrap
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const modalNombre = document.getElementById('modalNombre');
    const modalPrecio = document.getElementById('modalPrecio');
    const modalDetalle = document.getElementById('modalDetalle');
    const carouselInner = document.getElementById('carouselInner');
    const carouselPrevBtn = document.getElementById('carouselPrevBtn');
    const carouselNextBtn = document.getElementById('carouselNextBtn');

    let products = [];

    // 1. Obtener listado de productos
    function loadProductList() {
        fetch('/api/productos')
            .then(response => {
                if (!response.ok) throw new Error("Error en la respuesta de la red");
                return response.json();
            })
            .then(data => {
                products = data;
                renderProducts(products);
            })
            .catch(error => {
                console.error('Error al obtener datos:', error);
                productCards.innerHTML = `
                    <div class="col-12 text-center text-danger py-5">
                        <p class="fw-bold fs-5">No se pudieron cargar los productos.</p>
                    </div>
                `;
            });
    }

    // 2. Renderizar cards en la grilla
    function renderProducts(productList) {
        productCards.innerHTML = "";

        if (productList.length === 0) {
            productCards.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <p class="fs-5">No se encontraron productos.</p>
                </div>
            `;
            return;
        }

        productList.forEach(product => {
            // Manejar si el producto trae una lista de imágenes o solo una imagen principal
            let mainImg = "https://via.placeholder.com/300x200?text=Sin+Imagen";
            if (Array.isArray(product.imagenes) && product.imagenes.length > 0) {
                mainImg = product.imagenes[0];
            } else if (product.imagen) {
                mainImg = product.imagen;
            }

            const cardCol = document.createElement("div");
            cardCol.className = "col";
            cardCol.innerHTML = `
                <div class="card h-100 shadow-sm border-0 animate-hover-card" data-product-id="${product.idproducto}">
                    <div class="ratio ratio-4x3 bg-light overflow-hidden rounded-top">
                        <img src="${mainImg}" class="card-img-top object-fit-cover" alt="${product.nombre}">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark text-truncate">${product.nombre}</h5>
                        <p class="card-text text-success fw-bold fs-5 mb-3">$${parseFloat(product.precio).toFixed(2)}</p>
                        <button class="btn btn-outline-dark mt-auto w-100 fw-bold btn-detalle">
                            <i class="fa-solid fa-eye me-2"></i>Ver Detalle
                        </button>
                    </div>
                </div>
            `;

            // Evento para abrir el modal
            const btnDetalle = cardCol.querySelector(".btn-detalle");
            btnDetalle.addEventListener("click", () => openModal(product.idproducto));

            productCards.appendChild(cardCol);
        });
    }

    // 3. Abrir Modal y cargar Carrusel
    function openModal(idproducto) {
        const product = products.find(p => p.idproducto === idproducto);
        if (!product) return;

        modalNombre.textContent = product.nombre;
        modalPrecio.textContent = `$${parseFloat(product.precio).toFixed(2)}`;
        modalDetalle.textContent = product.detalle || "Sin descripción disponible.";

        // Determinar arreglo de imágenes para el carrusel
        let imgList = [];
        if (Array.isArray(product.imagenes) && product.imagenes.length > 0) {
            imgList = product.imagenes;
        } else if (product.imagen) {
            imgList = [product.imagen];
        } else {
            imgList = ["https://via.placeholder.com/500x400?text=Sin+Imagen"];
        }

        // Construir slides del carrusel
        carouselInner.innerHTML = "";
        imgList.forEach((imgSrc, index) => {
            const item = document.createElement("div");
            item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            item.innerHTML = `
                <div class="ratio ratio-4x3">
                    <img src="${imgSrc}" class="d-block w-100 object-fit-cover rounded" alt="${product.nombre}">
                </div>
            `;
            carouselInner.appendChild(item);
        });

        // Mostrar u ocultar botones del carrusel si hay más de 1 imagen
        const hasMultiple = imgList.length > 1;
        carouselPrevBtn.style.display = hasMultiple ? "block" : "none";
        carouselNextBtn.style.display = hasMultiple ? "block" : "none";

        productModal.show();
    }

    // 4. Filtrar Productos
    function filterProducts(palabra) {
        const productosFiltrados = products.filter(product =>
            product.nombre.toLowerCase().includes(palabra.toLowerCase())
        );
        renderProducts(productosFiltrados);
    }

    // Escuchar búsqueda tanto al presionar submit como al escribir
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        filterProducts(searchInput.value);
    });

    searchInput.addEventListener("input", function () {
        filterProducts(this.value);
    });

    loadProductList();
});



