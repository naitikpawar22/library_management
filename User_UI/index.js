document.addEventListener("DOMContentLoaded", loadBooks);

let books = [];

async function loadBooks() {
    try {
        let response = await fetch("http://localhost:3000/books");
        if (!response.ok) throw new Error("Failed to fetch books");

        books = await response.json();
        displayBooks(books);

    } catch (error) {
        console.error("Error loading books:", error);
        document.getElementById("bookList").innerHTML = "<p>Failed to load books. Please try again.</p>";
    }
}

// Function to display books
function displayBooks(bookList) {
    let bookContainer = document.getElementById("bookList");
    bookContainer.innerHTML = "";

    if (bookList.length === 0) {
        bookContainer.innerHTML = "<p>No books available.</p>";
        return;
    }

    bookList.forEach(book => {
        let bookCard = document.createElement("div");
        bookCard.className = "book-card";

        // Front Side (Book Name)
        let front = document.createElement("div");
        front.className = "front";
        front.innerHTML = `<h3>${book.title}</h3>`;

        // Back Side (Details and Issue Button)
        let back = document.createElement("div");
        back.className = "back";
        back.innerHTML = `
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Publication:</strong> ${book.publication}</p>
            <p><strong>Type:</strong> ${book.book_type}</p>
            <button class="issue-btn" data-bookid="${book.id}" data-title="${book.title}">Issue</button>
        `;

        // Append Front and Back to Book Card
        bookCard.appendChild(front);
        bookCard.appendChild(back);

        // Append Book Card to Book List
        bookContainer.appendChild(bookCard);
    });

    // Attach event listener to all Issue buttons
    document.querySelectorAll(".issue-btn").forEach(button => {
        button.addEventListener("click", function () {
            let bookId = this.getAttribute("data-bookid");
            let bookTitle = this.getAttribute("data-title");
            openIssuePopup(bookId, bookTitle);
        });
    });
}

// Search Books
function searchBooks() {
    let query = document.getElementById("searchBook").value.toLowerCase();
    let filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
    );
    displayBooks(filteredBooks);
}

// Open Issue Popup
function openIssuePopup(bookId, bookTitle) {
    const isGuest = localStorage.getItem("isGuest") === "true";

    if (isGuest) {
        document.getElementById("guestRegisterPopup").style.display = "block";
    } else {
        document.getElementById("popupBookTitle").innerText = bookTitle;
        document.getElementById("issuePopup").setAttribute("data-bookid", bookId);
        document.getElementById("issuePopup").style.display = "block";
    }
}

// Redirect to Register Page
function redirectToRegister() {
    window.location.href = "../Login/signup.html";
}

// Close Guest Register Popup
function closeGuestRegisterPopup() {
    document.getElementById("guestRegisterPopup").style.display = "none";
}

// Close Issue Popup
function closeIssuePopup() {
    document.getElementById("issuePopup").style.display = "none";
}

// Issue Book Function
async function issueBook() {
    let bookId = document.getElementById("issuePopup").getAttribute("data-bookid");
    let name = document.getElementById("userName").value;
    let mobile = document.getElementById("mobileNumber").value;
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;

    if (!bookId || !name || !mobile || !startDate || !endDate) {
        alert("All fields are required!");
        return;
    }

    try {
        let response = await fetch("http://localhost:3000/issue-book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookId, name, mobile, startDate, endDate })
        });

        let result = await response.json();
        if (response.ok) {
            alert(result.message);
            closeIssuePopup();
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error issuing book:", error);
        alert("Failed to issue book.");
    }
}
