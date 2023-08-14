// import * as mockupData from "/mockupData.js";
const BASE_URL = "https://steam-api-mass.onrender.com";
const NO_GAME_MATCHES = "Sorry...  There is no game matched.";
let TOTAL_GENRES;
let TOTAL_GAMES;

const init = async () => {
  await renderGenreList({});
  await renderGameList({ page: 1, limit: 20 });
};
const addEventListenerForItem = (itemType) => {
  if (itemType === "game") {
    //Add EventListener for Game
    let gameItems = document.querySelectorAll(".item");
    console.log(gameItems);
    for (let i = 0; i < gameItems.length; i++) {
      gameItems[i].addEventListener("click", () => {
        console.log(gameItems[i].id);
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
          steamspy_tags: categoryItems[i].children[0].textContent,
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
  }
};
// http://127.0.0.1:5500/127.0.0.1/4000
// http://127.0.0.1:5500/appid=440
const getGameList = async (params) => {
  try {
    const { q, steamspy_tags, page, limit, genres } = params;
    console.log(params);
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
      queryString += `&limit=20`;
    }
    if (genres) {
      queryString += `&genres=${genres}`;
    }

    const res = await fetch(
      `${BASE_URL}/games${`?` + queryString.substring(1)}`
    );
    const gamesList = await res.json();

    console.log("gamesList", gamesList);
    return gamesList;
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
    console.log("genresList", genresList);
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

    console.log("tagsList", tagsList["data"]);
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

    console.log("gameDetail", gameDetail["data"]);

    return gameDetail;
  } catch (e) {
    console.log("error", e.message);
  }
};

/* render */
const renderGenreList = async (params) => {
  const genresListElm = document.querySelector("#genres-list");
  console.log(genresListElm);
  const ulGenresList = genresListElm.children[0];
  ulGenresList.innerHTML = "";
  //call api
  const genresList = await getGenreList(params);
  // const genresList = { ...ALL_GENRES }.data;
  genresList.data.forEach((g) => {
    const li = document.createElement("li");
    li.className = "genre-item";
    li.innerHTML = `
        <a href="#" class="nav-item ">${g.name}</a>
      `;
    ulGenresList.appendChild(li);
  });

  addEventListenerForItem("genre");
};
const renderGameList = async (params) => {
  const gamesListElm = document.querySelector("#games-list");
  gamesListElm.innerHTML = "";
  const gamesList = await getGameList(params);
  // console.log(gamesList);
  if (gamesList.data.length === 0) {
    gamesListElm.innerHTML = NO_GAME_MATCHES;
    return;
  }
  gamesList.data.forEach((g) => {
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
    gamesListElm.appendChild(col);
  });
  addEventListenerForItem("game");
};

const renderGameDetail = async (params) => {
  console.log(params);
  const gamesListElm = document.querySelector("#games-list");
  gamesListElm.innerHTML = "";
  gamesListElm.classList.remove("col");
  const gameDetail = await getSingleGameDetail(params);
  console.log(gameDetail);
  const {
    name,
    description,
    developer,
    steamspy_tags,
    positive_ratings,
    negative_ratings,
    release_date,
    price,
    platforms,
    header_image,
    categories,
    background,
    appid,
  } = gameDetail.data;

  const col = document.createElement("div");
  col.className = "game-detail";
  col.innerHTML = `<div class="wrapper">
      <img src=${header_image} alt="header_img" />
      <h2 class="title">${name}</h2>
      <div class="info">
        <h3 class="price">$${price}</h3>
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
  gamesListElm.appendChild(col);

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
init();
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
