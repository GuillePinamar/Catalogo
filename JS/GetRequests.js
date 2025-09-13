document.addEventListener("DOMContentLoaded", function () {

    const productCards = document.getElementById("productsCards");
    const products = [];
    
    function loadProductList() {
        fetch("/appl/productos?action=getAll")
                .then(response => response.json())
                .then(data => {
                    data.forEach(product => {
                        products.push(product);
                        productCards.innerHTML += `
                            <div class="col-md-3 mb-4 ident" data-product-id="${product.idproducto}">
                                <div class="card h-80 animate-hover-card">
                                    <img src="data:image/jpeg;base64,${product.imagenBase64}" class="card-img-top h-75" alt="Imagen Portada de Producto">
                                    <div class="card-body">
                                        <h5 class="card-title text-center">${product.nombre}</h5>
                                        <h6 class="card-text d-flex justify-content-end">$${product.precio}</h6>
                                        <h6 class="card-text">${product.detalle}</h6>
                                    </div>
                                </div>
                            </div>
                        `;
                    });
                });
    }
    function filterProducts(palabra) {
        const productosFiltrados = products.filter(product => {
            return product.nombre.toLowerCase().includes(palabra.toLowerCase());
        });
        productCards.innerHTML = "";
        productosFiltrados.forEach(product => {
            const card = document.createElement("div");
            card.className = "col-md-3 mb-4 ident";
            card.setAttribute("data-product-id", product.idproducto);
            card.innerHTML = `
                <div class="card h-100 animate-hover-card">
                    <img src = "data:image/jpeg;base64,${product.imagenBase64}" class="card-img-top h-75" alt="Imagen de Portada del Producto">
                    <div class="card-body">
                        <h5 class="card-title">${product.nombre}</h5>
                        <h5 class="card-text">${product.precio}</h5>
                        <h5 class="card-text">${product.detalle}</h5>
                    </div>
                </div>
            `;
            productCards.appendChild(card);
        });
    }
    const searchForm = document.querySelector("form[role = 'search']");
    searchForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const searchTerm = searchForm.querySelector("input[type='search']").value;
        filterProducts(searchTerm);
    });

    productCards.addEventListener("click", function (e) {
        const clickedCard = e.target.closest(".ident");
        if (!clickedCard) {
            return;
        }
        const productId = clickedCard.dataset.productId;

        fetch(`/appl/productos?action=getDetails&id=${productId}`)
                .then(response => response.json())
                .then(productDetails => {
                    const queryParams = new URLSearchParams({
                        id: productDetails.idproducto
                    });
                    window.location.href = `/appl/Pages/ProductDetails.html?${queryParams.toString()}`;
                })
                .catch(error => console.error("Error en la solicitud GET:", error));
    });
    loadProductList();
});
