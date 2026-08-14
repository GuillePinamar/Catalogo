document.addEventListener('DOMContentLoaded', function () {
    const productCards = document.getElementById('productsCards');
    const searchForm = document.querySelector("form[role='search']");
    const searchInput = searchForm ? searchForm.querySelector("input[type='search']") : null;
    
    // Instancias de Bootstrap para el Modal y el Carrusel
    const modalElement = document.getElementById('productModal');
    const productModal = modalElement ? new bootstrap.Modal(modalElement) : null;
    const carouselElement = document.getElementById('productCarousel');
    
    const modalNombre = document.getElementById('modalNombre');
    const modalPrecio = document.getElementById('modalPrecio');
    const modalDetalle = document.getElementById('modalDetalle');
    const carouselInner = document.getElementById('carouselInner');
    const carouselPrevBtn = document.getElementById('carouselPrevBtn');
    const carouselNextBtn = document.getElementById('carouselNextBtn');

    let products = [];

    // 1. Obtener listado de productos desde la API
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
                if (productCards) {
                    productCards.innerHTML = `
                        <div class="col-12 text-center text-danger py-5">
                            <p class="fw-bold fs-5"><i class="fa-solid fa-triangle-exclamation me-2"></i>No se pudieron cargar los productos.</p>
                        </div>
                    `;
                }
            });
    }

    // 2. Renderizar cards en la grilla principal
    function renderProducts(productList) {
        if (!productCards) return;
        productCards.innerHTML = "";

        if (productList.length === 0) {
            productCards.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <p class="fs-5">No se encontraron productos coincidentes.</p>
                </div>
            `;
            return;
        }

        productList.forEach(product => {
            // Manejar si el producto trae una lista de imágenes o solo una principal
            let mainImg = "https://via.placeholder.com/300x200?text=Sin+Imagen";
            if (Array.isArray(product.imagenes) && product.imagenes.length > 0) {
                mainImg = product.imagenes[0];
            } else if (product.imagen) {
                mainImg = product.imagen;
            }

            const cardCol = document.createElement("div");
            cardCol.className = "col";
            cardCol.innerHTML = `
                <div class="card h-100 shadow-sm border-0" data-product-id="${product.idproducto}">
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

    // 3. Abrir Modal y cargar Carrusel de imágenes
    function openModal(idproducto) {
        const product = products.find(p => p.idproducto === idproducto);
        if (!product) return;

        // Asignar los valores a los elementos del modal
        if (modalNombre) modalNombre.textContent = product.nombre;
        if (modalPrecio) modalPrecio.textContent = `$${parseFloat(product.precio).toFixed(2)}`;
        
        // Soporta tanto si la BD usa 'detalle' como si usa 'descripcion'
        if (modalDetalle) {
            modalDetalle.textContent = product.detalle || product.descripcion || "Sin descripción disponible.";
        }

        // Determinar listado de imágenes para el carrusel
        let imgList = [];
        if (Array.isArray(product.imagenes) && product.imagenes.length > 0) {
            imgList = product.imagenes;
        } else if (product.imagen) {
            imgList = [product.imagen];
        } else {
            imgList = ["https://via.placeholder.com/500x400?text=Sin+Imagen"];
        }

        // Construir slides del carrusel dinámicamente
        if (carouselInner) {
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
        }

        // Mostrar u ocultar controles prev/next si hay más de 1 imagen
        const hasMultiple = imgList.length > 1;
        if (carouselPrevBtn) carouselPrevBtn.style.display = hasMultiple ? "flex" : "none";
        if (carouselNextBtn) carouselNextBtn.style.display = hasMultiple ? "flex" : "none";

        // Reiniciar el carrusel en la primera imagen (Slide 0)
        if (carouselElement) {
            const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselElement);
            bsCarousel.to(0);
        }

        // Mostrar el modal
        if (productModal) {
            productModal.show();
        }
    }

    // 4. Filtrar Productos
    function filterProducts(palabra) {
        const productosFiltrados = products.filter(product =>
            product.nombre.toLowerCase().includes(palabra.toLowerCase())
        );
        renderProducts(productosFiltrados);
    }

    // Escuchar eventos en el buscador si existe
    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            filterProducts(searchInput.value);
        });

        searchInput.addEventListener("input", function () {
            filterProducts(this.value);
        });
    }

    // Cargar la lista al iniciar
    loadProductList();
});



