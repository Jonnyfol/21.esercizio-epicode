const books = [];
fetch("https://striveschool-api.herokuapp.com/books")
    .then(resp => {
        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }
        return resp.json();
    })
    .then(data => {
        books.push(...data); // Aggiungi gli elementi dell'array data a books
        console.log(books);
    })
    .catch(err => console.error("Problem:", err));

const booksContainer = document.getElementById("Bookcards");

fetch("https://striveschool-api.herokuapp.com/books")
    .then(resp => {
        if (!resp.ok) {
            throw new Error('Network response was not ok');
        }
        return resp.json();
    })
    .then(data => {
        // Crea una riga per ogni gruppo di 4 card
        for (let i = 0; i < data.length; i += 4) {
            const row = document.createElement("div");
            row.classList.add("row", "mb-4");

            // Per ogni gruppo di 4 libri, crea una card Bootstrap e aggiungila alla riga
            for (let j = i; j < i + 4 && j < data.length; j++) {
                const book = data[j];
                const card = document.createElement("div");
                card.classList.add("col-md-3", "mb-4");

                card.innerHTML = `
                    <div class="card h-100" >
                        <img src="${book.img}" class="card-img-top" alt="${book.title}" style="max-width: 350px; max-height: 300px;">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text">Price: ${book.price}</p>
                            <button class="btn btn-primary add-to-cart">Aggiungi al carrello</button>
                            <button class="btn btn-secondary">Salta</button>
                        </div>
                    </div>
                `;

                row.appendChild(card);
            }

            // Aggiungi la riga al container delle card
            booksContainer.appendChild(row);
        }
    })
    .catch(err => console.error("Problem:", err));

// Funzione per aggiungere un libro al carrello
function addToCart(book) {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");

    // Verifica se il libro è già nel carrello
    const items = cartItems.querySelectorAll("li");
    for (let i = 0; i < items.length; i++) {
        const itemTitle = items[i].querySelector(".item-title").textContent;
        if (itemTitle === book.title) {
            return; // Se il libro è già nel carrello, esce dalla funzione
        }
    }

    // Aggiungi l'elemento al carrello
    const cartItem = document.createElement("li");
    cartItem.classList.add("list-group-item");
    cartItem.innerHTML = `
        <span class="item-title">${book.title}</span> - <span class="item-price">${book.price} €</span>
        <button class="btn btn-sm btn-danger remove-from-cart">X</button>
    `;
    cartItems.appendChild(cartItem);

    // Aggiorna il totale
    cartTotal.textContent = (parseFloat(cartTotal.textContent) + parseFloat(book.price)).toFixed(2);

    // Applica opacità alla card
    const card = document.querySelector(`.card[data-title="${book.title}"]`);
    if (card) {
        card.style.opacity = "0.5";
    }
}

// Funzione per rimuovere un libro dal carrello
function removeFromCart(event) {
    const listItem = event.target.closest("li");
    const title = listItem.querySelector(".item-title").textContent;
    const price = parseFloat(listItem.querySelector(".item-price").textContent);

    // Rimuovi l'elemento dal carrello
    listItem.remove();

    // Ripristina l'opacità della card
    const card = document.querySelector(`.card[data-title="${title}"]`);
    if (card) {
        card.style.opacity = "1";
    }

    // Aggiorna il totale
    const cartTotal = document.getElementById("cart-total");
    cartTotal.textContent = (parseFloat(cartTotal.textContent) - price).toFixed(2);

    // Riattiva il pulsante "Aggiungi al carrello"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        if (button.dataset.title === title) {
            button.disabled = false;
        }
    });
}

// Aggiungi event listener ai pulsanti "Salta" (X)
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-from-cart")) {
        removeFromCart(event);
    }

    // Svuota carrello quando viene cliccato il pulsante "Svuota carrello"
    if (event.target.id === "clear-cart") {
        const cartItems = document.getElementById("cart-items");
        const cartTotal = document.getElementById("cart-total");

        // Rimuovi tutti gli elementi dal carrello
        cartItems.innerHTML = "";

        // Ripristina l'opacità di tutte le card
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.opacity = "1";
        });

        // Riattiva tutti i pulsanti "Aggiungi al carrello"
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        addToCartButtons.forEach(button => {
            button.disabled = false;
        });

        // Ripristina il totale
        cartTotal.textContent = "0.00";
    }
});

// Aggiungi event listener ai pulsanti "Aggiungi al carrello"
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("add-to-cart")) {
        const cardBody = event.target.closest(".card-body");
        const title = cardBody.querySelector(".card-title").textContent;
        const price = parseFloat(cardBody.querySelector(".card-text").textContent.split(":")[1].trim());
        const book = { title, price };
        addToCart(book);
        // Opacità per indicare che il libro è nel carrello
        cardBody.closest(".card").style.opacity = "0.5";
        // Disabilita il pulsante "Aggiungi al carrello"
        event.target.disabled = true;
        // Aggiungi il titolo del libro come attributo al pulsante "Aggiungi al carrello"
        event.target.dataset.title = title;
    }
});

// Funzione per aggiornare il totale del carrello
function updateCartTotal() {
    const cartTotal = document.getElementById("cart-total");
    const cartItems = document.querySelectorAll("#cart-items .list-group-item");

    let total = 0;
    cartItems.forEach(item => {
        const price = parseFloat(item.querySelector(".item-price").textContent);
        total += price;
    });

    cartTotal.textContent = total.toFixed(2);
}

// Aggiorna il totale del carrello quando viene eseguita una ricerca
document.querySelector("form").addEventListener("input", function(event) {
    const searchValue = event.target.value.trim().toLowerCase();

    // Filtra i libri in base al titolo
    const filteredBooks = books.filter(book => {
        return book.title.toLowerCase().includes(searchValue);
    });

    // Visualizza i libri filtrati
    renderBooks(filteredBooks);
    
    // Disattiva i pulsanti "Aggiungi al carrello" per i libri già presenti nel carrello
    const cartItems = document.querySelectorAll("#cart-items .list-group-item");
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        const title = button.closest(".card").querySelector(".card-title").textContent;
        const isInCart = Array.from(cartItems).some(item => {
            return item.querySelector(".item-title").textContent === title;
        });
        button.disabled = isInCart;
    });

    // Aggiorna il totale del carrello
    updateCartTotal();
});

// Funzione per renderizzare i libri
function renderBooks(books) {
    const booksContainer = document.getElementById("Bookcards");
    booksContainer.innerHTML = ""; // Pulisci il contenitore prima di renderizzare nuovi libri

    // Creazione della riga al di fuori del ciclo for
    const row = document.createElement("div");
    row.classList.add("row", "py-4");

    // Crea una card per ogni libro e aggiungila alla riga
    books.forEach((book, index) => {
        const card = document.createElement("div");
        card.classList.add("col-md-3", "mb-4");

        card.innerHTML = `
            <div class="card h-100" data-title="${book.title}">
                <img src="${book.img}" class="card-img-top" alt="${book.title}" style="max-width: 350px; max-height: 300px;">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">Price: ${book.price}</p>
                    <button class="btn btn-primary add-to-cart">Aggiungi al carrello</button>
                    <button class="btn btn-secondary">Salta</button>
                </div>
            </div>
        `;

        row.appendChild(card);

        // Se la riga contiene già 4 card oppure è l'ultima card, aggiungi la riga al container delle card
        if ((index + 1) % 4 === 0 || index === books.length - 1) {
            booksContainer.appendChild(row);
            // Crea una nuova riga per i prossimi libri
            if (index !== books.length - 1) {
                const newRow = document.createElement("div");
                newRow.classList.add("row", "py-4");
                row = newRow;
            }
        }
    });
}
