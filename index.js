const BASE_URL = "https://steam-api-mass.onrender.com";
const NO_GAME_MATCHES = "Sorry...  There is no game matched.";
const LIMIT = 20;
let total_genres;
let total_games;
let current_page = 1;
let selected_category = "";
let selected_tag = "";
let selected_q = "";
let tag_list;
let genre_list;

const init = async () => {
  await renderGenreList({});
  await renderGameList({ page: current_page, limit: LIMIT });
  await renderTagList({});
};

// init;
document.addEventListener("DOMContentLoaded", init);
const showLoadingPage = (isShow) => {
  document.getElementById("loader").style.display = isShow ? "block" : "none";
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
        selected_category = categoryItems[i].children[0].textContent;
        renderGameList({
          genres: selected_category,
        });
        renderGenre(genre_list.data);
      });
    }
    //Load more button
    const btnLoadMoreCategory = document.querySelector("#more-category");
    btnLoadMoreCategory.addEventListener("click", () => {
      btnLoadMoreCategory.style.display = "none";
      renderGenreList({ limit: total_genres });
    });
    return;
  } else if (itemType === "tag") {
    let tagItems = document.querySelectorAll(".tag-item");
    for (let i = 0; i < tagItems.length; i++) {
      tagItems[i].addEventListener("click", () => {
        selected_tag = tagItems[i].children[0].textContent;
        renderGameList({
          steamspy_tags: selected_tag,
        });
        renderTag(tag_list.data);
      });
    }
    return;
  }
};

const getGameList = async (params) => {
  try {
    const searchParams = new URLSearchParams(params);
    if (!searchParams.get("limit")) {
      searchParams.append("limit", `${LIMIT}`);
    }
    if (selected_category && !searchParams.get("genres")) {
      searchParams.append("genres", selected_category);
    }
    if (selected_q && !searchParams.get("q")) {
      searchParams.append("q", selected_q);
    }
    if (selected_tag && !searchParams.get("steamspy_tags")) {
      console.log(searchParams);
      searchParams.append("steamspy_tags", selected_tag);
    }
    const res = await fetch(
      `${BASE_URL}/games${`?` + searchParams.toString()}`
    );
    const gameList = await res.json();

    return gameList;
  } catch (e) {
    console.log("error", e.message);
  }
};

const getGenreList = async (params) => {
  try {
    const searchParams = new URLSearchParams(params);

    const res = await fetch(
      `${BASE_URL}/genres${`?` + searchParams.toString()}`
    );
    const genreList = await res.json();
    total_genres = genreList.total; //update total genres

    return genreList;
  } catch (e) {
    console.log("error", e.message);
  }
};

const getTagList = async (params) => {
  try {
    const searchParams = new URLSearchParams(params);

    const res = await fetch(
      `${BASE_URL}/steamspy-tags${`?` + searchParams.toString()}`
    );
    const tagList = await res.json();

    return tagList;
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
  //clear all the current genres in list
  showLoadingPage(true);
  const genreList = await getGenreList(params);
  showLoadingPage(false);
  genre_list = { ...genreList };
  renderGenre(genreList.data);
};
const renderGenre = (listData) => {
  const genreListElm = document.querySelector("#genres-list");
  const ulGenreList = genreListElm.children[0];
  ulGenreList.innerHTML = "";
  listData.forEach((g) => {
    const li = document.createElement("li");
    li.className = "genre-item";
    li.innerHTML = `
      <a href="#" class="nav-item ${
        g.name === selected_category ? "active" : ""
      } ">${g.name}</a>
    `;
    ulGenreList.appendChild(li);
  });
  //add event listener
  addEventListenerForItem("genre");
};

const renderTagList = async (params) => {
  //call api
  showLoadingPage(true);
  const tagList = await getTagList(params);
  showLoadingPage(false);
  tag_list = { ...tagList };
  renderTag(tagList.data);
  return;
};
const renderTag = (listData) => {
  const tagListElm = document.querySelector("#tag-list");
  const ulTagList = tagListElm.children[0];
  ulTagList.innerHTML = ""; //clear all the current tags in list
  listData.forEach((t) => {
    const li = document.createElement("li");
    li.className = "tag-item";
    li.innerHTML = `
        <a href="#" ${t.name === selected_tag ? "class='active'" : ""}>${
      t.name
    }</a>
      `;
    ulTagList.appendChild(li);
  });
  //add event listener
  addEventListenerForItem("tag");
};
const renderGameList = async (params) => {
  const pagination = document.querySelector(".pagination-container");
  pagination.style.display = "flex";

  const gameListElm = document.querySelector("#games-list");
  gameListElm.innerHTML = "";
  showLoadingPage(true);

  const gameList = await getGameList(params);
  showLoadingPage(false);
  if (gameList.data.length === 0) {
    gameListElm.innerHTML = NO_GAME_MATCHES;
    gameListElm.style.color = "white";
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
  total_games = gameList.total;

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

  const relatedTags = document.createElement("div");
  relatedTags.className = "related-tags";
  col.appendChild(relatedTags);
  steamspy_tags.forEach((tag) => {
    const tagElm = document.createElement("a");
    tagElm.innerHTML = tag;
    tagElm.setAttribute("href", "#");
    relatedTags.appendChild(tagElm);
  });
  //hide pagination
  const pagination = document.querySelector(".pagination-container");
  pagination.style.display = "none";
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
iconSearch.addEventListener("click", (e) => {
  e.preventDefault();
  selected_q = inputSearch.value;
  renderGameList({ q: selected_q });
  // inputSearch.value = "";  do not need to clear
});

const renderPagination = (currentPage) => {
  const pageCount = Math.ceil(total_games / LIMIT);
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
  if (count <= 5) {
    //render all pages
    for (let i = 1; i <= count; i++) {
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
    if (currPage >= 4) {
      if (currPage < count - 2) {
        paginatedList.removeChild(paginatedList.children[2]);
        const tmpCurrPage = document.createElement("li");
        tmpCurrPage.innerHTML = `<button class="pagination-button active">${currPage}</button>`;
        paginatedList.appendChild(tmpCurrPage);
        const threeDotsPost = document.createElement("li");
        threeDotsPost.innerHTML = `<button class="pagination-button">...</button>`;
        threeDotsPost.children[0].disabled = true;
        paginatedList.appendChild(threeDotsPost);
      } else if (currPage > count - 2) {
        paginatedList.removeChild(paginatedList.children[2]);
      } else {
        const tmpCurrPage = document.createElement("li");
        tmpCurrPage.innerHTML = `<button class="pagination-button active">${currPage}</button>`;
        paginatedList.appendChild(tmpCurrPage);
      }
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
