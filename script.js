let player;
let movieCards = [];
const cardContainer = document.querySelector(".Card");
const modal = document.getElementById("movie-logo-modal");
const moviesGrid = document.querySelector(".movies-grid");

// 1. Configuração inicial da API do YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player("main-player", {
    events: {
      onStateChange: onPlayerStateChange,
    },
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playRandomMovie();
  }
}

// 2. Carrega os filmes do JSON e renderiza usando a chave correta (img_poster)
async function loadMovies() {
  try {
    const response = await fetch("movies.json");
    const moviesData = await response.json();

    moviesGrid.innerHTML = "";
    movieCards = [];

    moviesData.forEach((movie) => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.setAttribute("title", movie.title);
      card.setAttribute("data-video", movie.data_video);
      card.setAttribute("data-logo", movie.data_logo);

      // 🌟 CORREÇÃO AQUI: Mudamos de movie.img_src para movie.img_poster para casar com seu JSON
      card.innerHTML = `
          <img src="${movie.img_poster}" alt="${movie.title}" onerror="this.style.display='none'; this.parentElement.classList.add('fallback-card');" />
          <div class="movie-hover">
            <div class="play-icon-purple"><i class="icon-play"></i></div>
          </div>
      `;

      // Evento 1: Mouse entra no Card (Ativa o Modal)
      card.addEventListener("mouseenter", () => {
        const logoUrl = card.getAttribute("data-logo");
        if (logoUrl && logoUrl !== "null" && logoUrl !== "") {
          modal.style.backgroundImage = `url('${logoUrl}')`;
          modal.classList.add("active");
        }
      });

      // Evento 2: Mouse se move (Rastreamento do cursor)
      card.addEventListener("mousemove", (e) => {
        modal.style.left = `${e.clientX}px`;
        modal.style.top = `${e.clientY - 35}px`;
      });

      // Evento 3: Mouse sai do Card (Esconde o Modal)
      card.addEventListener("mouseleave", () => {
        modal.classList.remove("active");
      });

      // Evento 4: Clique no Pôster (Troca o vídeo e o fundo instantaneamente)
      card.addEventListener("click", () => {
        const videoId = card.getAttribute("data-video");
        const logoUrl = card.getAttribute("data-logo");
        changeMovie(videoId, movie.img_poster, logoUrl);
      });

      moviesGrid.appendChild(card);
      movieCards.push(card);
    });

    // Inicializa o primeiro filme da lista no topo ao abrir a página
    if (moviesData.length > 0) {
      const firstVideoId = moviesData[0].data_video;
      const firstImgPoster = moviesData[0].img_poster;
      const firstLogoUrl = moviesData[0].data_logo;
      changeMovie(firstVideoId, firstImgPoster, firstLogoUrl);
    }
  } catch (error) {
    console.error("Erro ao carregar os filmes do JSON:", error);
  }
}

// 3. Altera o filme em exibição no Player e o Background
function changeMovie(videoId, imgSrc, logoUrl) {
  if (!videoId) return;

  if (player && typeof player.loadVideoById === "function") {
    player.loadVideoById({
      videoId: videoId,
      startSeconds: 0,
    });
  } else {
    const iframe = document.getElementById("main-player");
    if (iframe) {
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&enablejsapi=1&playlist=${videoId}&loop=1`;
    }
  }

  // Define o poster correspondente como fundo desfocado da aplicação
  if (cardContainer && imgSrc) {
    cardContainer.style.backgroundImage = `url('${imgSrc}')`;
  }

  // Atualiza a logo flutuante fixa no canto superior direito do player
  const currentLogo = document.getElementById("current-movie-logo");
  if (currentLogo) {
    if (logoUrl && logoUrl !== "null" && logoUrl !== "") {
      currentLogo.style.backgroundImage = `url('${logoUrl}')`;
      currentLogo.classList.add("visible");
    } else {
      currentLogo.classList.remove("visible");
    }
  }
}

// 4. Sorteia um filme caso o anterior chegue ao fim
function playRandomMovie() {
  if (movieCards.length === 0) return;
  const randomIndex = Math.floor(Math.random() * movieCards.length);
  const randomCard = movieCards[randomIndex];

  const videoId = randomCard.getAttribute("data-video");
  const imgElement = randomCard.querySelector("img");
  const imgSrc = imgElement ? imgElement.src : "";
  const logoUrl = randomCard.getAttribute("data-logo");

  changeMovie(videoId, imgSrc, logoUrl);
}

document.addEventListener("DOMContentLoaded", loadMovies);
