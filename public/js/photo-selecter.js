// quando es usado selectorALL usar foreach
var imagen = document.querySelectorAll(".photo img")
const inputHidden = document.getElementById("photoSelected");
var button = document.querySelector("#guardar-btn")

button.disabled = true;

imagen.forEach(img => {
    img.addEventListener('click' , () => {

        // algoritmo para dejasr olamente una imagen "seleccionada"
        imagen.forEach(i => {
           i.classList.remove("selected") 
        });

        img.classList.add("selected")

        inputHidden.value = img.dataset.name

        button.disabled = false;
        
    })

})
