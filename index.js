// import * as mockupData from "/mockupData.js";
const BASE_URL = "https://steam-api-mass.onrender.com";
const init = () => {
  //get 20 games to show on the main content
  // getGameList();
  //render main content
  //get 10 genres to show on the vertical nav-bar
  //render vertical nav-bar
  renderGenresList({});
  renderGamesList({ page: 1, limit: 20 });
};

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
const getGenresList = async (params) => {
  try {
    const { page, limit } = params;
    let queryString = "";

    if (page) {
      queryString += `&page=${page}`;
    }
    if (limit) {
      queryString += `&limit=${limit}`;
    }

    const res = await fetch(`${BASE_URL}/genres${queryString}`);
    const genresList = await res.json();

    console.log("genresList", genresList);
    return genresList;
  } catch (e) {
    console.log("error", e.message);
  }
};
const getTagsList = async (params) => {
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
const renderGenresList = async (params) => {
  const genresListElm = document.querySelector("#genres-list");
  console.log(genresListElm);
  const ulGenresList = genresListElm.children[0];
  ulGenresList.innerHTML = "";
  //call api
  const genresList = await getGenresList(params);
  // const genresList = { ...ALL_GENRES }.data;
  genresList.data.forEach((g) => {
    const li = document.createElement("li");
    li.className = "genre-item";
    li.innerHTML = `
        <a href="#" class="nav-item ">${g.name}</a>
      `;
    ulGenresList.appendChild(li);
  });
};
const renderGamesList = async (params) => {
  const gamesListElm = document.querySelector("#games-list");
  //   const ulGenresList = gamesListElm.children[0];
  gamesListElm.innerHTML = "";
  //call api
  const gamesList = await getGameList(params);
  // const gamesList = { ...ALL_GAMES }.data;
  //
  gamesList.data.forEach((g) => {
    const col = document.createElement("div");
    col.className = "col";
    col.innerHTML = `<div class="item">
      <img src=${g.header_image} alt="aaa" />
      <div class="info">
        <div class="detail">
          <p>LOGO</p>
          <h3>${g.name}</h3>
        </div>
      </div>
  </div>`;
    gamesListElm.appendChild(col);
  });
};
init();

let categoryItems = document.querySelectorAll(".genre-item");
setTimeout(() => console.log(document.querySelectorAll(".genre-item")), 5000);
// // console.log(categoriesElm.children[0].children);
// for (let i; i < categoryItems.length; i++) {
//   console.log(categoryItems[i]);
// }
// Array.from(categoryItems).forEach((li) => {
//   console.log(li);
//   // li.addEventListener("click", renderGamesList({steamspy_tags:li.nodeValue}))
// });
