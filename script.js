let player;
let movieCards = []; // Armazena os elementos gerados dinamicamente do JSON
const cardContainer = document.querySelector(".Card");
const modal = document.getElementById("movie-logo-modal");
const moviesGrid = document.querySelector(".movies-grid");

// Configuração inicial do player do YouTube
function onYouTubeIframeAPIReady() {
  player = new YT.Player("main-player", {
    events: {
      onStateChange: onPlayerStateChange,
    },
  });
}

// Quando o vídeo atual termina, chama o próximo filme aleatório
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    playRandomMovie();
  }
}

// Busca dados do JSON, constrói a interface e define o logo inicial
async function loadMovies() {
  try {
    const response = await fetch("movies.json");
    const moviesData = await response.json();

    // Limpa a grid por segurança
    moviesGrid.innerHTML = "";

    // Mapeia e constrói cada card de filme dinamicamente
    moviesData.forEach((movie) => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.setAttribute("title", movie.title);
      card.setAttribute("data-video", movie.data_video);
      card.setAttribute("data-logo", movie.data_logo); // Injeta o logo vindo do JSON

      card.innerHTML = `
          <img src="${movie.img_poster}" alt="${movie.title}" />
          <div class="movie-hover">
            <div class="play-icon-purple"><i class="icon-play"></i></div>
          </div>
        `;

      moviesGrid.appendChild(card);
    });

    // Atualiza nossa lista de referências de cards na tela
    movieCards = document.querySelectorAll(".movie-card");

    // Configura os eventos (Click, Hover, Move) nos novos elementos carregados
    setupMovieEvents();

    // Define o logo do primeiro filme (Spider-Man) logo ao iniciar a página
    if (moviesData.length > 0) {
      const firstMovie = moviesData[0];
      const currentLogo = document.getElementById("current-movie-logo");
      if (currentLogo && firstMovie.data_logo) {
        currentLogo.style.backgroundImage = `url('${firstMovie.data_logo}')`;
        currentLogo.classList.add("visible");
      }
    }
  } catch (error) {
    console.error("Erro ao carregar os dados dos filmes do JSON:", error);
  }
}

// Configura os eventos individuais de cada card gerado
function setupMovieEvents() {
  movieCards.forEach((card) => {
    // 1. Evento de Clique (ESSENCIAL: Agora passa o data-logo corretamente)
    card.addEventListener("click", () => {
      const videoId = card.getAttribute("data-video");
      const logoUrl = card.getAttribute("data-logo"); // Captura o logo do card clicado
      const imgSrc = card.querySelector("img").src;

      changeMovie(videoId, imgSrc, logoUrl); // Passa os três parâmetros
    });

    // 2. Mouse Enter (Abre o modal flutuante do logo)
    card.addEventListener("mouseenter", () => {
      const logoUrl = card.getAttribute("data-logo");
      if (logoUrl) {
        modal.style.backgroundImage = `url('${logoUrl}')`;
        modal.classList.add("active");
      }
    });

    // 3. Mouse Move (Faz o modal seguir o cursor do mouse)
    card.addEventListener("mousemove", (e) => {
      modal.style.left = e.pageX + "px";
      modal.style.top = e.pageY - 45 + "px";
    });

    // 4. Mouse Leave (Esconde o modal flutuante)
    card.addEventListener("mouseleave", () => {
      modal.classList.remove("active");
    });
  });
}

// Executa a transição do vídeo, do background e do logo fixo do canto
function changeMovie(videoId, imgSrc, logoUrl) {
  if (videoId && player) {
    if (typeof player.loadVideoById === "function") {
      player.loadVideoById({
        videoId: videoId,
        startSeconds: 0,
      });
    } else {
      const iframe = document.getElementById("main-player");
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&rel=0&enablejsapi=1`;

      player = new YT.Player("main-player", {
        events: {
          onStateChange: onPlayerStateChange,
        },
      });
    }

    if (typeof player.mute === "function") {
      player.mute();
    }

    // Altera o background-image do container principal (.Card)
    if (cardContainer) {
      cardContainer.style.backgroundImage = `url('${imgSrc}')`;
    }

    // Atualiza dinamicamente o logo absoluto fixado no canto do vídeo
    const currentLogo = document.getElementById("current-movie-logo");
    if (currentLogo) {
      if (logoUrl && logoUrl !== "null" && logoUrl !== "") {
        currentLogo.style.backgroundImage = `url('${logoUrl}')`;
        currentLogo.classList.add("visible");
      } else {
        currentLogo.classList.remove("visible"); // Oculta se o filme não possuir logo cadastrado
      }
    }
  }
}

// Sorteia um filme aleatório quando o trailer chega ao fim
function playRandomMovie() {
  if (movieCards.length === 0) return;
  const randomIndex = Math.floor(Math.random() * movieCards.length);
  const randomCard = movieCards[randomIndex];

  const videoId = randomCard.getAttribute("data-video");
  const logoUrl = randomCard.getAttribute("data-logo"); // Captura o logo no sorteio automático
  const imgSrc = randomCard.querySelector("img").src;

  changeMovie(videoId, imgSrc, logoUrl); // Executa a mudança completa de forma automática
}

// Inicializa o carregamento dinâmico ao carregar o DOM
document.addEventListener("DOMContentLoaded", loadMovies);
