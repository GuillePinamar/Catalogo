document.addEventListener('DOMContentLoaded', function () {
    const productCards = document.getElementById('productsCards');
    const searchForm = document.querySelector("form[role='search']");
    const searchInput = searchForm ? searchForm.querySelector("input[type='search']") : null;
    
    // Instancias de Bootstrap para Modal y Carrusel
    const modalElement = document.getElementById('productModal');
    const productModal = modalElement ? new bootstrap.Modal(modalElement) : null;
    const carouselElement = document.getElementById('productCarousel');
    
    // Elementos del DOM del Modal
    const modalNombre = document.getElementById('modalNombre');
    const modalPrecio = document.getElementById('modalPrecio');
    const modalDetalle = document.getElementById('modalDetalle');
    const carouselInner = document.getElementById('carouselInner');
    const carouselPrevBtn = document.getElementById('carouselPrevBtn');
    const carouselNextBtn = document.getElementById('carouselNextBtn');

    let products = [];

    // Función auxiliar para obtener las imágenes
    function getImagenesArray(product) {
        if (Array.isArray(product.imagenes) && product.imagenes.length > 0) {
            return product.imagenes;
        }
        return ["https://via.placeholder.com/500x400?text=Sin+Imagen"];
    }

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
                if (productCards) {
                    productCards.innerHTML = `
                        <div class="col-12 text-center text-danger py-5">
                            <p class="fw-bold fs-5"><i class="fa-solid fa-triangle-exclamation me-2"></i>No se pudieron cargar los productos.</p>
                        </div>
                    `;
                }
            });
    }

    // 2. Renderizar cards en la grilla
    function renderProducts(productList) {
        if (!productCards) return;
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
            const imagenes = getImagenesArray(product);
            const mainImg = imagenes[0];
            const precioFormatted = Number(product.precio || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

            const cardCol = document.createElement("div");
            cardCol.className = "col";
            cardCol.innerHTML = `
                <div class="card h-100 shadow-sm border-0 animate-hover-card" data-product-id="${product.idproducto}">
                    <div class="ratio ratio-4x3 bg-light overflow-hidden rounded-top">
                        <img src="${mainImg}" class="card-img-top object-fit-cover" alt="${product.nombre}">
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold text-dark text-truncate">${product.nombre}</h5>
                        <p class="card-text text-success fw-bold fs-5 mb-3">$${precioFormatted}</p>
                        <button class="btn btn-outline-dark mt-auto w-100 fw-bold btn-detalle">
                            <i class="fa-solid fa-eye me-2"></i>Ver Detalle
                        </button>
                    </div>
                </div>
            `;

            const btnDetalle = cardCol.querySelector(".btn-detalle");
            btnDetalle.addEventListener("click", () => openModal(product.idproducto));

            productCards.appendChild(cardCol);
        });
    }

    // 3. Abrir Modal y cargar el Carrusel
    function openModal(idproducto) {
        const product = products.find(p => p.idproducto === idproducto);
        if (!product) return;

        const precioFormatted = Number(product.precio || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

        if (modalNombre) modalNombre.textContent = product.nombre;
        if (modalPrecio) modalPrecio.textContent = `$${precioFormatted}`;
        if (modalDetalle) modalDetalle.textContent = product.detalle || "Sin descripción disponible.";

        const imgList = getImagenesArray(product);

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

        const hasMultiple = imgList.length > 1;
        if (carouselPrevBtn) carouselPrevBtn.style.display = hasMultiple ? "flex" : "none";
        if (carouselNextBtn) carouselNextBtn.style.display = hasMultiple ? "flex" : "none";

        if (carouselElement) {
            const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carouselElement);
            bsCarousel.to(0);
        }

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

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", function (e) {
            e.preventDefault();
            filterProducts(searchInput.value);
        });

        searchInput.addEventListener("input", function () {
            filterProducts(this.value);
        });
    }

    loadProductList();
});



