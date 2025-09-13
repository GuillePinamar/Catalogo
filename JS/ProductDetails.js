document.addEventListener("DOMContentLoaded", function () {

    const queryParams = new URLSearchParams(window.location.search);
    const productDetailId = {
        id: queryParams.get("id")
    };
    const productDetailsContainer = document.getElementById("productDetails");
    const btnEliminarElement = document.getElementById("btnEliminar");
    const btnModificarElement = document.getElementById("btnModificar");
    const btnGuardarElement = document.getElementById("btnGuardar");
    const btnContainerElement = document.getElementById("btnContainer");
    let objetoProducto = {
        id: 0,
        nombre: "",
        precio: 0,
        detalle: "",
        imagen: ""
    };
    function loadProduct() {
        fetch(`/appl/productos?action=getById&id=${productDetailId.id}`)
                .then(response => response.json())
                .then(data => {
                    productDetailsContainer.innerHTML += `
                        <div class="col-md-6 text-center">
                            <div class="clearfix">
                                <img src="data:image/jpeg;base64,${data.imagenBase64}" class="my-4" style="width: 75%" alt="Imagen de Producto"/>
                            </div>
                        </div>
                        <div class="card-body col-md-6">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item">
                                    <h2 class="card-title">${data.nombre}</h2>
                                </li>
                                <li class="list-group-item">
                                    <h5>Precio: $${data.precio}</h5>
                                </li>
                                <li class="list-group-item">
                                    <h5>Detalle: ${data.detalle}</h5>
                                </li>
                            </ul>
                        </div>
                       `;
                    objetoProducto.id = data.id;
                    objetoProducto.nombre = data.nombre;
                    objetoProducto.precio = data.precio;
                    objetoProducto.detalle = data.detalle;
                    objetoProducto.imagen = data.imagen;
                });
    }

    btnEliminarElement.addEventListener('click', function () {
        fetch(`/appl/productos?action=delete&id=${productDetailId.id}`, {
            method: "DELETE"
        })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        window.location.href = `/appl/index.html`;
                    }
                });
    });

    btnModificarElement.addEventListener('click', function () {
        btnModificarElement.classList.add("d-none");
        btnEliminarElement.classList.add("d-none");
        btnGuardarElement.classList.remove("d-none");

        productDetailsContainer.innerHTML = `
            <div class="col-md-6 text-center">
                <div class="clearfix">
                    <img src="data:image/jpeg;base64,${objetoProducto.imagen}" class="my-4" style="width: 75%" alt="Imagen de Pelicula"/>
                </div>
            </div>
            <div class="card-body col-md-6">
                <form class="mb-4" id="updateProductForm" enctype="multipart/form-data">
                    <div class="card-body">
                        <div class="row">
                            <div class="form-floating my-3">
                                <input type="text" class="form-control" name="nombre" id="nombre" placeholder="Escriba aqui el Titulo"required/>
                                <label for="nombre">Titulo</label>
                            </div>                    
                             <div class="form-floating my-3">
                                <input type="number" class="form-control" name="precio" id="precio" placeholder="Escriba aqui el Precio" required/>
                                <label for="precio">Precio</label>
                             </div>
                             <div class="form-floating my-3">
                                <textarea class="form-control" placeholder="Escriba aqui el Detalle" name="detalle" id="detalle"></textarea>
                                <label for="detalle">Detalle</label>
                             </div>
                        </div>
                    </div>
                </form>
            </div>
        `;
    });

    btnGuardarElement.addEventListener('click', function (e) {
        e.preventDefault();
        const formulario = new FormData();

        formulario.append("action", "update");
        formulario.append("id", productDetailId.id);
        formulario.append("nombre", document.getElementById("nombre").value);
        formulario.append("precio", document.getElementById("precio").value);
        formulario.append("detalle", document.getElementById("detalle").value);
        formulario.append("imagen", objetoProducto.imagen);

        fetch(`/appl/productos`, {
            method: "POST",
            body: formulario
        })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error en la solicitud: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success == "true") {
                        window.location.href = `/appl/index.html`;
                    } else {
                        console.error("La solicitud fue exitosa, pero la respuesta indica un error: " + data.message);
                    }
                });
    });
    loadProduct();
});


