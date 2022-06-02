// Gets the search input field & button
let bookContainer = document.querySelector(".search"); // Output
let bookContainerNew = document.querySelector(".search-new"); // Output
let bookContainerDaily = document.querySelector(".search-daily"); // Output
let searchBooks = document.getElementById("search-box"); // Input

// Gets the books for the 'book title' search engine
const getBooks = async (book) => {
  // Fetches a response from the Google API's database using a query
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${book}+subject:juvenile_fiction&maxResults=40`
  );
  
  const data = await response.json(); // Returns the data and reads it in completion
  return data; // Returns the response
};

// Gets new books by ordering the list to newest
const getNew = async () => {
  // Fetches a response from the Google API's database using a query
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:juvenile_fiction&maxResults=3&orderBy=newest&langRestrict=en&startIndex=21`
  );

  const data = await response.json(); // Returns the data and reads it in completion
  return data; // Returns the response
};

// Gets a list of daily reads
const getDaily = async () => {
  // Fetches a response from the Google API's database using a query
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=subject:juvenile_fiction&maxResults=3&orderBy=newest&langRestrict=en&startIndex=24`
  );

  const data = await response.json(); // Returns the data and reads it in completion
  return data; // Returns the response
};

// Gets the thumbnail and replaces the default image
const extractThumbnail = ({ imageLinks }) => {
  const DEFAULT_THUMBNAIL = "icons/logo.svg";
  if (!imageLinks || !imageLinks.thumbnail) {
    return DEFAULT_THUMBNAIL;
  }
  return imageLinks.thumbnail.replace("http://", "https://"); // Returns the link to the actual thumbnail
};

// Outputs the list of books for the search bar
const drawListBook = async () => {
  // Checks if the input is not empty
  if (searchBooks.value != "") {
    const data = await getBooks(`${searchBooks.value}`); //If so, runs the getBooks function with the user's input
    
    // Error checks
    if (data.error) {
      console.log(data.error);
      bookContainer.innerHTML = `<div class='prompt'>ツ Limit exceeded! Try after some time</div>`;
    } else if (data.totalItems == 0) {
      bookContainer.innerHTML = `<div class='prompt'>ツ No results, try a different term!</div>`;
    } else if (data.totalItems == undefined) {
      bookContainer.innerHTML = `<div class='prompt'>ツ Network problem!</div>`;
    } else {
      // Else, if there were no errors, maps each item in a new array
      bookContainer.innerHTML = data.items
        .map(
          ({ volumeInfo }) =>
            // Creates the HTML structure with the data
            `<div class='book'>
              <div class="book-img">
                <a href='liveblocks-api/static/index.html?isbn=` +
                volumeInfo.industryIdentifiers[0].identifier +
                `' target='_blank'><img class='thumbnail' src='` +
            extractThumbnail(volumeInfo) +
            `' alt='cover'></a>
              </div>
              <div class='book-info'>
                <h3 class='book-title fw-bold m-0'><a class="text-dark" href='liveblocks-api/static/index.html?isbn=` +
                volumeInfo.industryIdentifiers[0].identifier +
                `' target='_blank'>${volumeInfo.title}</a></h3>

                <div class='book-authors'>by ${volumeInfo.authors[0]}` +
            (volumeInfo.authors[1] === undefined
              ? " "
              : ", " + volumeInfo.authors[1]) +
            `` +
            (volumeInfo.authors[2] === undefined
              ? " "
              : ", " + volumeInfo.authors[2]) +
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
        .join(""); // Joins it to the container
    }
  } else {
    bookContainer.style.display = "none"; // Else, if there was no input, the container will not be displayed
  }
};

// Outputs the list of books for the new items
const drawListNew = async () => {
  const data = await getNew(); // Runs the getNew function with the user's input
  bookContainerNew.innerHTML = data.items // Maps each item in a new array
    .map(
      ({ volumeInfo }) =>
        // Creates the HTML structure with the data
        `<div class='book'>
              <div class="book-img">
                <a href='liveblocks-api/static/index.html?isbn=${volumeInfo.industryIdentifiers[0].identifier}' target='_blank'><img class='thumbnail' src='` +
                  extractThumbnail(volumeInfo) +
                `' alt='cover'></a>
              </div>
              <div class='book-info'>
                <h3 class='book-title fw-bold m-0'><a class="text-dark" href='${volumeInfo.previewLink}' target='_blank'>${volumeInfo.title}</a></h3>

                <div class='book-authors'>by ${volumeInfo.authors[0]}` +
                  (volumeInfo.authors[1] === undefined
                    ? " "
                    : ", " + volumeInfo.authors[1]) +
                  `` +
                  (volumeInfo.authors[2] === undefined
                    ? " "
                    : ", " + volumeInfo.authors[2]) +
                  `</div>

                          <p class='book-desc'>` +
                  (volumeInfo.description === undefined
                    ? "No description"
                    : volumeInfo.description) +
                  `</p>
              </div>
            </div>`
    )
    .join(""); // Joins it to the container
};

// Outputs the list of books for the search bar
const drawListDaily = async () => {
  const data = await getDaily(); // Runs the getDaily function with the user's input
  bookContainerDaily.innerHTML = data.items // Maps each item in a new array
    .map(
      ({ volumeInfo }) =>
        // Creates the HTML structure with the data
        `<div class='book'>
              <div class="book-img">
                <a href='liveblocks-api/static/index.html?isbn=${volumeInfo.industryIdentifiers[0].identifier}' target='_blank'><img class='thumbnail' src='` +
                  extractThumbnail(volumeInfo) +
                `' alt='cover'></a>
              </div>
              <div class='book-info'>
                <h3 class='book-title fw-bold m-0'><a class="text-dark" href='${volumeInfo.previewLink}' target='_blank'>${volumeInfo.title}</a></h3>

                <div class='book-authors'>by ${volumeInfo.authors[0]}` +
        (volumeInfo.authors[1] === undefined
          ? " "
          : ", " + volumeInfo.authors[1]) +
        `` +
        (volumeInfo.authors[2] === undefined
          ? " "
          : ", " + volumeInfo.authors[2]) +
        `</div>

                <p class='book-desc'>` +
        (volumeInfo.description === undefined
          ? "No description"
          : volumeInfo.description) +
        `</p>
              </div>
            </div>`
    )
    .join(""); // Joins it to the container
};

// Lowers debounce time to get faster results
const debounce = (fn, time, to = 0) => {
  to ? clearTimeout(to) : (to = setTimeout(drawListBook, time));
};
const debounce2 = (fn, time, to = 0) => {
  to ? clearTimeout(to) : (to = setTimeout(drawListNew, time));
};
const debounce3 = (fn, time, to = 0) => {
  to ? clearTimeout(to) : (to = setTimeout(drawListDaily, time));
};

// Runs the code when user inputs
searchBooks.addEventListener("input", () => debounce(drawListBook, 1000));

// Calls the function
debounce2(drawListNew(), 1000);
debounce2(drawListDaily(), 1000);

// Script for NYT API

// Fetches the response
fetch(
  "https://api.nytimes.com/svc/books/v3/lists.json?list-name=hardcover-fiction&api-key=6ad84e249d054efeaefe1abb8f89df5b",
  {
    method: "get",
  }
)
  .then((response) => {
    return response.json();
  })
  .then((json) => {
    updateBestSellers(json);
  })
  .catch((error) => {
    console.log("NYT API Error: Defaulting to nytimes archival data.", error); // Error message
  });

  // updates the container to showcase the bestselling books
function updateBestSellers(nytimesBestSellers) {
  nytimesBestSellers.results.forEach(function (book) {
    var isbn = book.isbns[0].isbn10;

    // Using the ISBN from the NYT API, an ajax call is used to fetch the image & link from Google Books API
    $.ajax({
      url: "https://www.googleapis.com/books/v1/volumes?q=isbn:" + isbn,
      dataType: "json",

      success: function (response) {
        if (response.totalItems === 0) {
          console.log("No result... Try again...");
        } else {
          var listing = `<div class="img-container">
                            <a href='liveblocks-api/static/index.html?isbn=${response.items[0].volumeInfo.industryIdentifiers[0].identifier}' target='_blank' class="img" id="cover-img">
                              <img src="${response.items[0].volumeInfo.imageLinks.thumbnail}" class="book-cover" />
                            </a>
                          </div>`;

          $("#nyt-api").append(listing); // Appends it to the container
        }
      },
      error: function () {
        console.log("Did not load..."); // Error message
      },
    });
  });
}

// Gets the search genre & author containers
let searchGenre = document.getElementById("search-genre");
let searchAuthor = document.getElementById("search-author");

// Function for displaying the genre book covers
function byGenre(genre) {
  searchGenre.innerHTML = ""; // Declares the variable
  var genre = genre; // Stores the genre value

  // Runs an AJAX request to fetch the data from the API
  $.ajax({
    url:
      "https://www.googleapis.com/books/v1/volumes?q=subject:" +
      genre +
      "&orderBy=newest&startIndex=1",
    dataType: "json",

    success: function (response) {
      if (response.totalItems === 0) {
        console.log("No result... Try again..."); // Error message
      } else {
        // Else, if there were no errors, maps each item in a new array
        searchGenre.innerHTML = response.items
          .map(
            ({ volumeInfo }) =>
              `<div class="img-container">
                  <a href='liveblocks-api/static/index.html?isbn=${volumeInfo.industryIdentifiers[0].identifier}' target='_blank' class="img" id="cover-img">
                    <img src="${volumeInfo.imageLinks.thumbnail}" class="book-cover" />
                  </a>
              </div>`
          )
          .join(""); // Joins it to the container
      }
    },
    error: function () {
      console.log("Did not load..."); // Error message
    },
  });
}

// Function for displaying the author book covers
function byAuthor(author) {
  searchAuthor.innerHTML = ""; // Declares the variable
  var author = author; // Stores the author value

  // Runs an AJAX request to fetch the data from the API
  $.ajax({
    url:
      'https://www.googleapis.com/books/v1/volumes?q=inauthor:"' +
      author +
      '"&orderBy=newest&startIndex=1',
    dataType: "json",

    success: function (response) {
      if (response.totalItems === 0) {
        console.log("No result... Try again..."); // Error message
      } else {
        // Else, if there were no errors, maps each item in a new array
        searchAuthor.innerHTML = response.items
          .map(
            ({ volumeInfo }) =>
              `<div class="img-container">
                  <a href='liveblocks-api/static/index.html?isbn=${volumeInfo.industryIdentifiers[0].identifier}' target='_blank' class="img" id="cover-img">
                    <img src="${volumeInfo.imageLinks.thumbnail}" class="book-cover" />
                  </a>
              </div>`
          )
          .join(""); // Joins it to the container
      }
    },
    error: function () {
      console.log("Did not load..."); // Error message
    },
  });
}