// import * as mockupData from "/mockupData.js";
const BASE_URL = "https://steam-api-mass.onrender.com";
const NO_GAME_MATCHES = "Sorry...  There is no game matched.";
let TOTAL_GENRES;
let TOTAL_GAMES;
const paginationLimit = 20;
let CURRENT_PAGE = 1;

const init = async () => {
  await renderGenreList({});
  await renderGameList({ page: CURRENT_PAGE, limit: paginationLimit });
  await renderTagList({});
};
const addEventListenerForItem = (itemType) => {
  if (itemType === "game") {
    //Add EventListener for Game
    let gameItems = document.querySelectorAll(".item");
    for (let i = 0; i < gameItems.length; i++) {
      gameItems[i].addEventListener("click", () => {
        renderGameDetail({
          appid: gameItems[i].id,
        });
      });
    }
    return;
  } else if (itemType === "genre") {
    //Add EventListener for Category
    let categoryItems = document.querySelectorAll(".genre-item");
    for (let i = 0; i < categoryItems.length; i++) {
      categoryItems[i].addEventListener("click", () => {
        renderGameList({
          genres: categoryItems[i].children[0].textContent,
        });
      });
    }
    //Load more
    const btnLoadMoreCategory = document.querySelector("#more-category");
    btnLoadMoreCategory.addEventListener("click", () => {
      btnLoadMoreCategory.style.display = "none";
      renderGenreList({ limit: TOTAL_GENRES });
    });
    return;
  } else if (itemType === "tag") {
    let tagItems = document.querySelectorAll(".tag-item");
    for (let i = 0; i < tagItems.length; i++) {
      tagItems[i].addEventListener("click", () => {
        renderGameList({
          steamspy_tags: tagItems[i].children[0].textContent,
        });
      });
    }
  }
};
// http://127.0.0.1:5500/127.0.0.1/4000
// http://127.0.0.1:5500/appid=440
const getGameList = async (params) => {
  try {
    const { q, steamspy_tags, page, limit, genres } = params;
    let queryString = "";
    if (q) {
      queryString += `&q=${q}`;
    }
    if (steamspy_tags) {
      queryString += `&steamspy_tags=${steamspy_tags}`;
    }
    if (page) {
      queryString += `&page=${page}`;
    }
    if (limit) {
      queryString += `&limit=${limit}`;
    } else {
      queryString += `&limit=${paginationLimit}`;
    }
    if (genres) {
      queryString += `&genres=${genres}`;
    }

    const res = await fetch(
      `${BASE_URL}/games${`?` + queryString.substring(1)}`
    );
    const gameList = await res.json();

    return gameList;
  } catch (e) {
    console.log("error", e.message);
  }
};
const getGenreList = async (params) => {
  try {
    const { page, limit } = params;
    let queryString = "";

    if (page) {
      queryString += `&page=${page}`;
    }
    if (limit) {
      queryString += `&limit=${limit}`;
    }

    const res = await fetch(
      `${BASE_URL}/genres${`?` + queryString.substring(1)}`
    );
    const genresList = await res.json();
    TOTAL_GENRES = genresList.total;
    return genresList;
  } catch (e) {
    console.log("error", e.message);
  }
};
const getTagList = async (params) => {
  try {
    const { page, limit } = params;
    let queryString = "";

    if (page) {
      queryString += `&page=${page}`;
    }
    if (limit) {
      queryString += `&limit=${limit}`;
    }

    const res = await fetch(`${BASE_URL}/steamspy-tags${queryString}`);
    const tagsList = await res.json();

    return tagsList;
  } catch (e) {
    console.log("error", e.message);
  }
};
const getSingleGameDetail = async (params) => {
  try {
    const { appid } = params;

    const res = await fetch(`${BASE_URL}/single-game/${appid}`);
    const gameDetail = await res.json();

    return gameDetail;
  } catch (e) {
    console.log("error", e.message);
  }
};

/* render */
const renderGenreList = async (params) => {
  const genreListElm = document.querySelector("#genres-list");
  const ulGenreList = genreListElm.children[0];
  ulGenreList.innerHTML = "";
  //call api
  const genreList = await getGenreList(params);
  genreList.data.forEach((g) => {
    const li = document.createElement("li");
    li.className = "genre-item";
    li.innerHTML = `
        <a href="#" class="nav-item ">${g.name}</a>
      `;
    ulGenreList.appendChild(li);
  });

  addEventListenerForItem("genre");
};
const renderTagList = async (params) => {
  const tagListElm = document.querySelector("#tag-list");
  const ulTagList = tagListElm.children[0];
  ulTagList.innerHTML = "";
  //call api
  const tagList = await getTagList(params);
  tagList.data.forEach((t) => {
    const li = document.createElement("li");
    li.className = "tag-item";
    li.innerHTML = `
        <a href="#" ">${t.name}</a>
      `;
    ulTagList.appendChild(li);
  });

  addEventListenerForItem("tag");
};
const renderGameList = async (params) => {
  const pagination = document.querySelector(".pagination-container");
  pagination.style.display = "flex";
  const gameListElm = document.querySelector("#games-list");
  gameListElm.innerHTML = "";
  const gameList = await getGameList(params);
  if (gameList.data.length === 0) {
    gameListElm.innerHTML = NO_GAME_MATCHES;
    return;
  } else {
    gameList.data.forEach((g) => {
      const col = document.createElement("div");
      col.className = "col";
      col.innerHTML = `<div class="item"  id="${g.appid}">
        <img src=${g.header_image} alt="aaa" />
        <div class="info">
          <div class="detail">
            <p>${g.price === 0 ? "FREE" : `$${g.price}`}</p>
            <h3>${g.name}</h3>
          </div>
        </div>
    </div>`;
      gameListElm.appendChild(col);
    });
    addEventListenerForItem("game");
  }
  //update total
  TOTAL_GAMES = gameList.total;

  renderPagination(gameList.page);
  return;
};

const renderGameDetail = async (params) => {
  const gameListElm = document.querySelector("#games-list");
  gameListElm.innerHTML = "";
  gameListElm.classList.remove("col");
  const gameDetail = await getSingleGameDetail(params);
  const {
    name,
    description,
    developer,
    steamspy_tags,
    positive_ratings,
    negative_ratings,
    release_date,
    price,
    header_image,
  } = gameDetail.data;

  const col = document.createElement("div");
  col.className = "game-detail";
  col.innerHTML = `<div class="wrapper">
      <img src=${header_image} alt="header_img" />
      <h2 class="title">${name}</h2>
      <div class="info">
        <h3 class="price">${price === 0 ? "FREE" : `$${price}`}</h3>
        <div class="detail">
          <p>Recent Review: <span>${
            Math.round(
              (positive_ratings / (negative_ratings + positive_ratings)) * 100
            ) / 100
          }</span></p>
          <p>Developer: <span>${developer}</span></p>
          <p>Release Date: <span>${release_date}</span></p>
          </br>
          <p class="description"><span>${description}</span></p>
        </div>
      </div>
  </div>`;
  gameListElm.appendChild(col);
  const pagination = document.querySelector(".pagination-container");
  pagination.style.display = "none";
  const relatedTags = document.createElement("div");
  relatedTags.className = "related-tags";
  col.appendChild(relatedTags);
  steamspy_tags.forEach((tag) => {
    const tagElm = document.createElement("a");

    tagElm.innerHTML = tag;
    tagElm.setAttribute("href", "#");
    relatedTags.appendChild(tagElm);
  });
};

//handle search bar
const inputSearch = document.querySelector("#search-box");
inputSearch.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("search-icon").click();
  }
});
const iconSearch = document.querySelector("#search-icon");
iconSearch.addEventListener("click", () => {
  renderGameList({ q: document.querySelector("#search-box").value });
});

const renderPagination = (currentPage) => {
  const pageCount = Math.ceil(TOTAL_GAMES / paginationLimit);
  //HANDLE NEXT-PREV BUTTON
  const prevArrowElm = document.getElementById("prev-arrow");
  prevArrowElm.innerHTML = `<button class="pagination-arrow-button" id="prev-button">
  &lt;
</button>`;
  const nextArrowElm = document.getElementById("next-arrow");
  nextArrowElm.innerHTML = `<button class="pagination-arrow-button" id="next-button">
  &gt;
</button>`;
  const prevButton = prevArrowElm.children[0];
  const nextButton = nextArrowElm.children[0];
  nextButton.disabled = currentPage === pageCount;
  prevButton.disabled = currentPage === 1;

  nextButton.addEventListener("click", (e) => {
    renderGameList({ page: currentPage + 1 });
  });
  prevButton.addEventListener("click", (e) => {
    renderGameList({ page: currentPage - 1 });
  });

  //RENDER NUMBER
  renderPaginationNumber(pageCount, currentPage);
};
const renderPaginationNumber = (count, currPage) => {
  const paginatedList = document.getElementById("paginated-list");
  //HOT TO DISPLAY NUMBER
  paginatedList.innerHTML = "";
  if (count <= 4) {
    for (let i = 1; i <= 4; i++) {
      const liNum = document.createElement("li");
      liNum.innerHTML = `<button class="pagination-button">${i}</button>`;
      if (currPage === i) {
        liNum.children[0].classList.add("active");
      }
      paginatedList.appendChild(liNum);
    }
  } else if (count > 4) {
    for (let i = 1; i <= 3; i++) {
      const liNum = document.createElement("li");
      liNum.innerHTML = `<button class="pagination-button">${i}</button>`;
      if (currPage === i) {
        liNum.children[0].classList.add("active");
      }
      paginatedList.appendChild(liNum);
    }
    const threeDotsPrev = document.createElement("li");
    threeDotsPrev.innerHTML = `<button class="pagination-button ">...</button>`;
    threeDotsPrev.children[0].disabled = true;
    paginatedList.appendChild(threeDotsPrev);

    //handle active current in the middle
    if (currPage >= 4 && currPage < count - 2) {
      paginatedList.removeChild(paginatedList.children[2]);
      const tmpCurrPage = document.createElement("li");
      tmpCurrPage.innerHTML = `<button class="pagination-button active">${currPage}</button>`;
      paginatedList.appendChild(tmpCurrPage);
      const threeDotsPost = document.createElement("li");
      threeDotsPost.innerHTML = `<button class="pagination-button">...</button>`;
      threeDotsPost.children[0].disabled = true;
      paginatedList.appendChild(threeDotsPost);
    }
    //handle after threeDots
    for (let i = count - 1; i <= count; i++) {
      const liNum = document.createElement("li");
      liNum.innerHTML = `<button class="pagination-button">${i}</button>`;
      if (currPage === i) {
        liNum.children[0].classList.add("active");
      }
      paginatedList.appendChild(liNum);
    }
  }
  //HANDLE CLICK NUMBERS
  const paginationNumberList =
    paginatedList.querySelectorAll(".pagination-button");
  paginationNumberList.forEach((btn) => {
    btn.addEventListener("click", () => {
      currPage = +btn.textContent;
      renderGameList({ page: currPage });
    });
  });
  return;
};
init();
