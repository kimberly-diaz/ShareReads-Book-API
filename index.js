// Gets the search input field & button
let bookContainer = document.querySelector(".search");
let searchBooks = document.getElementById("search-box");

// Gets books by fetching the result from the JSON file
const getBooks = async (book) => {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${book}+subject:juvenile_fiction&maxResults=40`
  );
  const data = await response.json();
  return data;
};

// Gets the thumbnail
const extractThumbnail = ({ imageLinks }) => {
  const DEFAULT_THUMBNAIL = "icons/logo.svg";
  if (!imageLinks || !imageLinks.thumbnail) {
    return DEFAULT_THUMBNAIL;
  }
  return imageLinks.thumbnail.replace("http://", "https://");
};

// Outputs the list of books
const drawListBook = async () => {
  if (searchBooks.value != "") {
    bookContainer.innerHTML = `<div class='prompt'><div class="loader"></div></div>`;
    const data = await getBooks(`${searchBooks.value}`);
    if (data.error) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
    } else if (data.totalItems == 0) {
      bookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
    } else if (data.totalItems == undefined) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Network problem!</div>`;
    } else {
      bookContainer.innerHTML = data.items
        .map(
          ({ volumeInfo }) =>
            `<div class='book'>
              <div class="book-img">
                <a href='${volumeInfo.previewLink}' target='_blank'><img class='thumbnail' src='` + extractThumbnail(volumeInfo) + `' alt='cover'></a>
              </div>

              <div class='book-info'>
                <h3 class='book-title fw-bold m-0'><a class="text-dark" href='${volumeInfo.previewLink}' target='_blank'>${volumeInfo.title}</a></h3>

                <div class='book-authors'>by ${volumeInfo.authors[0]}` +
                  (volumeInfo.authors[1] === undefined
                    ? " "
                    : ', ' + volumeInfo.authors[1]) +
                  `` +
                  (volumeInfo.authors[2] === undefined
                    ? " "
                    : ', ' + volumeInfo.authors[2]) +
                  `</div>

                <p class='book-desc'>` +
                (volumeInfo.description === undefined
                  ? "No description"
                  : volumeInfo.description) +
                `</p>

                <p class='book-categ text-light bg-primary'>` +
                (volumeInfo.categories === undefined
                  ? "Unknown"
                  : volumeInfo.categories) +
                `</p>
                </div>
            </div>`
        )
        .join("");
    }
  } else {
    bookContainer.style.display = "none";
  }
};

// Lowers debounce time to get faster results
const debounce = (fn, time, to = 0) => {
  to ? clearTimeout(to) : (to = setTimeout(drawListBook, time));
};
searchBooks.addEventListener("input", () => debounce(drawListBook, 1000));