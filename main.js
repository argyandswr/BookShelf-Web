const books = [];
const RENDER_EVENT = "render_book";
const SAVED_EVENT = "saved_book";
const STORAGE_KEY = "book";

// make sure all Elements is loaded
document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENT, (event) => {
  const cardToDisplay = event.detail ? event.detail : books;

  const incompledteBooks = document.getElementById("incompleteBookList");
  incompledteBooks.innerHTML = "";

  const completedBooks = document.getElementById("completeBookList");
  completedBooks.innerHTML = "";

  for (const book of cardToDisplay) {
    const bookCardElement = makeCard(book);
    if (!book.isComplete) {
      incompledteBooks.append(bookCardElement);
    } else {
      completedBooks.append(bookCardElement);
    }
  }
});

function generateId() {
  return +new Date();
}

function generateBook(id, author, title, year, isComplete) {
  return {
    id,
    author,
    title,
    year,
    isComplete,
  };
}

function makeCard(booksObject) {
  const cardTemplate = document.getElementById("bookCard");
  const card = cardTemplate.content.cloneNode(true);

  // buttons
  const completeBtn = card.querySelector(".completedBtn");
  const removeBtn = card.querySelector(".removeBtn");
  const editBtn = card.querySelector(".editBtn");

  const editForm = card.querySelector(".edit-form");

  card.querySelector(".title").innerText = booksObject.title;
  card.querySelector(".author").innerText = booksObject.author;
  card.querySelector(".year").innerText = booksObject.year;

  card.querySelector(".list-item").setAttribute("data-bookid", booksObject.id);

  const container = document.createElement("div");
  container.classList.add("item");
  container.setAttribute("id", `books-${booksObject.id}`);

  if (booksObject.isComplete) {
    completeBtn.innerText = "Belum selesai dibaca";

    completeBtn.addEventListener("click", () => {
      undoBookFromCompleted(booksObject.id);
    });

    removeBtn.addEventListener("click", () => {
      removeBook(booksObject.id);
    });

    editBtn.addEventListener("click", () => {
      editForm.removeAttribute("hidden");
      editBook(booksObject.id);
    });
  } else {
    completeBtn.innerText = "Selesai dibaca";

    completeBtn.addEventListener("click", () => {
      addBookToCompleted(booksObject.id);
    });

    removeBtn.addEventListener("click", () => {
      removeBook(booksObject.id);
    });

    editBtn.addEventListener("click", () => {
      editForm.removeAttribute("hidden");
      editBook(booksObject.id);
    });
  }
  container.appendChild(card);
  return container;
}

function addBook() {
  const titleData = document.getElementById("bookFormTitle").value;
  const authorData = document.getElementById("bookFormAuthor").value;
  const yearData = Number(document.getElementById("bookFormYear").value);
  const isCompleteCheck = document.getElementById("bookFormIsComplete").checked;

  const generateID = generateId();
  const bookObject = generateBook(
    generateID,
    authorData,
    titleData,
    yearData,
    isCompleteCheck,
  );

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookObjectId) {
  for (const book of books) {
    if (book.id === bookObjectId) {
      return book;
    }
  }
  return null;
}

function addBookToCompleted(bookObjectId) {
  const target = findBook(bookObjectId);

  if (target == null) return;

  console.log(target);
  target.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookObjectId) {
  const target = findBookIndex(bookObjectId);

  if (target === -1) return;

  books.splice(target, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoBookFromCompleted(bookObjectId) {
  const target = findBook(bookObjectId);

  if (target === null) return;

  target.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookObjectId) {
  const target = findBook(bookObjectId);

  if (target === null) return;

  document.getElementById("bookEditFormTitle").value = target.title;
  document.getElementById("bookEditFormAuthor").value = target.author;
  document.getElementById("bookEditFormYear").value = target.year;

  const editForm = document.getElementById("editForm");

  editForm.addEventListener("submit", (event) => {
    event.preventDefault();

    target.title = document.getElementById("bookEditFormTitle").value;
    target.author = document.getElementById("bookEditFormAuthor").value;
    target.year = Number(document.getElementById("bookEditFormYear").value);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    editForm.setAttribute("hidden", "");
  });
}

function searchBook() {
  const keyword = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  const result = books.filter((book) => {
    return book.title.toLowerCase().includes(keyword);
  });

  document.dispatchEvent(new CustomEvent(RENDER_EVENT, { detail: result }));
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser tidak mendukung web storage");
    return false;
  }

  return true;
}

document.addEventListener(SAVED_EVENT, () => {
  alert("data berhasil disimpan");
});

function saveData() {
  if (isStorageExist()) {
    const parsedData = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsedData);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  const data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBookIndex(BookObjectId) {
  for (const index in books) {
    if (books[index].id === BookObjectId) {
      return index;
    }
  }

  return -1;
}
