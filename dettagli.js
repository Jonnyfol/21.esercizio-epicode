document.addEventListener("DOMContentLoaded", function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const asin = urlParams.get('id');

    let urlArticle = `https://striveschool-api.herokuapp.com/books/${asin}`;
    console.log(asin);

    fetch(urlArticle)
        .then(response => {
            if (!response.ok) {
                throw new Error('Errore nella richiesta.');
            }
            return response.json();
        })
        .then(data => {
            // Aggiorna i dettagli del libro nella pagina HTML
            const bookImageElement = document.getElementById("book-image");
            const bookTitleElement = document.getElementById("book-title");
            const bookPriceElement = document.getElementById("book-price");
            const bookCategoryElement = document.getElementById("book-category");

            bookImageElement.src = data.img;
            bookTitleElement.textContent = data.title;
            bookPriceElement.textContent = `Prezzo: ${data.price} €`;
            bookCategoryElement.textContent = `Categoria: ${data.category}`;
        })
        .catch(error => {
            console.error('Si è verificato un errore:', error);
        });
});


