// Get the modal
var modal = document.getElementById("modal");

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    console.log(modal.style.display);
    if (modal.style.display == "block") {
        console.log("click");
        modal.style.display = "none";
        const canvas = document.getElementById('boids');
        // Input the same click on the canvas
        canvas.dispatchEvent(new MouseEvent('click', event));
    }
}