document.addEventListener("DOMContentLoaded", function () {

    const addProductForm = document.getElementById("addProductForm");
    const parrafoAlerta = document.createElement("P");
    const nombreElement = document.getElementById("nombre");
    const precioElement = document.getElementById("precio");
    const detalleElement = document.getElementById("detalle");
    const imagenElement = document.getElementById("imagen");
    const imagenPreview = document.getElementById("imagenPreview");
    const imagenContainer = document.getElementById("imagenContainer");

    addProductForm.addEventListener("submit", function (e) {
        e.preventDefault();
        const datos = new FormData();
        datos.append("action", "add");
        datos.append("nombre", nombreElement.value);
        datos.append("precio", precioElement.value);
        datos.append("detalle", detalleElement.value);
        datos.append("imagen", imagenElement.files[0]);
        fetch("/appl/productos", {
            method: "POST",
            body: datos
        })
                .then(response => response.json())
                .then(data => {
                    parrafoAlerta.textContent = data.message;
                    addProductForm.appendChild(parrafoAlerta);
                    setTimeout(() => {
                        parrafoAlerta.remove();
                        nombreElement.value = "";
                        precioElement.value = "";
                        detalleElement.value = "";
                        imagenElement.value = "";
                        imagenContainer.classList.add("d-none");
                    }, 3000);
                });
    });

    imagenElement.addEventListener("change", function () {
        const selectedImage = imagenElement.files[0];

        if (selectedImage) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imagenPreview.src = e.target.result;
                imagenContainer.classList.remove("d-none");
            };
            reader.readAsDataURL(selectedImage);
        } else {
            imagenPreview.src = "";
        }
    });
});


