// Fetch and display books from database
async function loadBooks() {
    try {
        let response = await fetch('http://127.0.0.1:3000/books'); // Corrected endpoint
        if (!response.ok) throw new Error("Failed to fetch books!");
        
        let books = await response.json();
        let bookList = document.getElementById("bookList");
        bookList.innerHTML = "";

        books.forEach(book => {
            bookList.innerHTML += `
                <div class="book-card">
                    <h3>${book.title}</h3>
                    <p>Author: ${book.author}</p>
                    <p>Publication: ${book.publication}</p>
                    <p>Type: ${book.book_type}</p>
                    <button onclick="deleteBook(${book.id})">Delete</button>
                </div>
            `;
        });
    } catch (error) {
        console.error("❌ Error loading books:", error.message);
        alert("Failed to load books!");
    }
}

// Add Book to Database
async function addBook() {
    let title = document.getElementById("bookTitle").value.trim();
    let author = document.getElementById("bookAuthor").value.trim();
    let publication = document.getElementById("bookPublication").value.trim();
    let book_type = document.getElementById("bookType").value.trim();

    if (!title || !author || !publication || !book_type) {
        alert("All fields are required!");
        return;
    }

    try {
        let response = await fetch('http://127.0.0.1:3000/add-book', { // Corrected endpoint
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, publication, book_type })
        });

        let data = await response.json();

        if (!response.ok) throw new Error(data.message || "Failed to add book!");

        alert("✅ Book Added Successfully!");
        loadBooks();
    } catch (error) {
        console.error("❌ Error adding book:", error.message);
        alert("Error adding book! " + error.message);
    }
}

// Delete Book from Database
async function deleteBook(id) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
        let response = await fetch(`http://127.0.0.1:3000/delete-book/${id}`, { // Corrected endpoint
            method: 'DELETE'
        });

        let data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to delete book!");

        alert("✅ Book Deleted Successfully!");
        loadBooks();
    } catch (error) {
        console.error("❌ Error deleting book:", error.message);
        alert("Error deleting book! " + error.message);
    }
}

// Load Books on Page Load
window.onload = loadBooks;