const verseCards = [
  {
    reference: "Éxodo 2:24",
    text: "Y oyó Dios el gemido de ellos, y se acordó de su pacto con Abraham, Isaac y Jacob.",
    image: "Imagenes/1.png",
  },
  {
    reference: "Éxodo 3:4",
    text: "…lo llamó Dios de en medio de la zarza, y dijo: ¡Moisés, Moisés! Y él respondió: Heme aquí.",
    image: "Imagenes/2.png",
  },
  {
    reference: "Éxodo 3:14",
    text: "Y respondió Dios a Moisés: YO SOY EL QUE SOY. Y dijo: Así dirás a los hijos de Israel: YO SOY me envió a vosotros.",
    image: "Imagenes/3.png",
  },
  {
    reference: "Éxodo 3:8",
    text: "…y he descendido para librarlos de mano de los egipcios, y sacarlos de aquella tierra a una tierra buena y ancha, a tierra que fluye leche y miel.",
    image: "Imagenes/4.png",
  },
  {
    reference: "Éxodo 6:6",
    text: "…y yo os sacaré de debajo de las tareas pesadas de Egipto, y os libraré de su servidumbre, y os redimiré con brazo extendido, y con juicios grandes.",
    image: "Imagenes/5.png",
  },
  {
    reference: "Éxodo 12:13",
    text: "Y la sangre os será por señal en las casas donde vosotros estéis; y veré la sangre y pasaré de vosotros…",
    image: "Imagenes/6.png",
  },
  {
    reference: "Éxodo 12:41",
    text: "Y pasados los cuatrocientos treinta años, en el mismo día todas las huestes de Jehová salieron de la tierra de Egipto.",
    image: "Imagenes/7.png",
  },
  {
    reference: "Éxodo 14:13-14",
    text: "13 Y Moisés dijo al pueblo: No temáis; estad firmes, y ved la salvación que Jehová hará hoy con vosotros… 14 Jehová peleará por vosotros, y vosotros estaréis tranquilos.",
    image: "Imagenes/8.png",
  },
  {
    reference: "Éxodo 15:2",
    text: "Jehová es mi fortaleza y mi cántico, y ha sido mi salvación. Este es mi Dios, y lo alabaré...",
    image: "Imagenes/9.png",
  },
  {
    reference: "Éxodo 16:4",
    text: "Y Jehová dijo a Moisés: He aquí yo os haré llover pan del cielo; y el pueblo saldrá y recogerá diariamente la porción de un día...",
    image: "Imagenes/10.png",
  },
  {
    reference: "Éxodo 19:5-6",
    text: "5 Ahora, pues, si diereis oído a mi voz, y guardareis mi pacto, vosotros seréis mi especial tesoro sobre todos los pueblos; porque mía es toda la tierra. 6 Y vosotros me seréis un reino de sacerdotes, y gente santa.",
    image: "Imagenes/11.png",
  },
  {
    reference: "Éxodo 20:3",
    text: "No tendrás dioses ajenos delante de mí.",
    image: "Imagenes/12.png",
  },
  {
    reference: "Éxodo 34:6-7",
    text: "… ¡Jehová! ¡Jehová! fuerte, misericordioso y piadoso; tardo para la ira, y grande en misericordia y verdad; 7 que guarda misericordia a millares, que perdona la iniquidad, la rebelión y el pecado; y que de ningún modo tendrá por inocente al malvado.",
    image: "Imagenes/13.png",
  },
  {
    reference: "Éxodo 25:8",
    text: "Y harán un santuario para mí, y habitaré en medio de ellos.",
    image: "Imagenes/14.png",
  },
  {
    reference: "Éxodo 40:34",
    text: "Entonces una nube cubrió el tabernáculo de reunión, y la gloria de Jehová llenó el tabernáculo.",
    image: "Imagenes/15.png",
  },
];

const verseReferenceEl = document.getElementById("verseReference");
const verseTextEl = document.getElementById("verseText");
const verseContentEl = document.getElementById("verseContent");
const backgroundLayerEl = document.getElementById("backgroundLayer");
const carouselTrackEl = document.getElementById("carouselTrack");
const pageShellEl = document.getElementById("pageShell");

let selectedIndex = 0;
let isVerseAnimating = false;
let pendingVerseData = null;
let backgroundFadeTimeout;
const BACKGROUND_TARGET_OPACITY = 0.32;

const modulo = (value, total) => {
  const remainder = value % total;
  return remainder >= 0 ? remainder : remainder + total;
};

/**
 * En función del ancho de pantalla, definimos cuántas tarjetas
 * se muestran a la vez en el carrusel.
 * - <= 768px → 3 tarjetas (móviles / tablet)
 * - > 768px → hasta 5 tarjetas (escritorio)
 */
const getMaxVisibleSlides = () => {
  const width = window.innerWidth || document.documentElement.clientWidth;
  if (width <= 768) return 3;
  return 5;
};

const getSlideDirection = (currentIndex, nextIndex, total) => {
  if (!total || currentIndex === nextIndex) return null;
  const forwardSteps = modulo(nextIndex - currentIndex, total);
  const backwardSteps = modulo(currentIndex - nextIndex, total);
  if (forwardSteps === backwardSteps) {
    return forwardSteps === 0 ? null : "forward";
  }
  return forwardSteps < backwardSteps ? "forward" : "backward";
};

const triggerCarouselSlide = (direction) => {
  if (!direction || !carouselTrackEl) return;
  carouselTrackEl.classList.remove(
    "carousel-track--slide-forward",
    "carousel-track--slide-backward"
  );
  // Force reflow para reiniciar la animación
  void carouselTrackEl.offsetWidth;
  const className =
    direction === "forward"
      ? "carousel-track--slide-forward"
      : "carousel-track--slide-backward";
  carouselTrackEl.classList.add(className);
};

const getVisibleIndices = () => {
  const total = verseCards.length;
  const maxVisible = Math.min(getMaxVisibleSlides(), total);

  let startOffset = 0;

  if (maxVisible === 1) {
    // Solo una grande en el centro (móvil chico)
    startOffset = 0;
  } else if (maxVisible >= 5) {
    // Vista completa: la seleccionada queda en el slot central
    startOffset = -2;
  } else {
    // 3 visibles: la seleccionada queda en medio
    startOffset = -1;
  }

  return Array.from({ length: maxVisible }, (_, i) =>
    modulo(selectedIndex + startOffset + i, total)
  );
};

const classForPosition = (position, totalVisible) => {
  if (totalVisible === 1) {
    // Sólo una tarjeta: es la seleccionada, full protagonismo
    return "carousel-card--selected";
  }

  if (totalVisible === 2) {
    return position === 0
      ? "carousel-card--previous carousel-card--muted"
      : "carousel-card--selected";
  }

  // Para 3 o más, calculamos la posición "central" (seleccionada)
  const selectedSlot = totalVisible >= 5 ? 2 : 1;
  const leftNeighborSlot = Math.max(selectedSlot - 1, 0);
  const rightNeighborSlot = Math.min(selectedSlot + 1, totalVisible - 1);

  if (position === leftNeighborSlot && position < selectedSlot) {
    return "carousel-card--previous carousel-card--muted carousel-card--adjacent";
  }

  if (position < selectedSlot) {
    return "carousel-card--previous carousel-card--muted";
  }

  if (position === selectedSlot) return "carousel-card--selected";

  if (position === rightNeighborSlot && position > selectedSlot) {
    return "carousel-card--adjacent carousel-card--muted";
  }

  if (position === totalVisible - 1 && totalVisible >= 5) {
    return "carousel-card--future-fade carousel-card--muted";
  }

  return "carousel-card--preview carousel-card--muted";
};

const renderCarousel = () => {
  if (!carouselTrackEl) return;
  carouselTrackEl.innerHTML = "";
  const visibleIndices = getVisibleIndices();

  visibleIndices.forEach((cardIndex, position) => {
    const cardData = verseCards[cardIndex];
    const wrapper = document.createElement("div");
    wrapper.className = "carousel-card-wrapper";

    const card = document.createElement("button");
    card.type = "button";
    card.className = `carousel-card ${classForPosition(
      position,
      visibleIndices.length
    )}`;

    if (cardIndex === selectedIndex) {
      card.setAttribute("aria-current", "true");
    }

    card.dataset.index = String(cardIndex);
    card.title = cardData.reference;
    card.setAttribute("aria-label", `Seleccionar ${cardData.reference}`);

    const img = document.createElement("img");
    img.src = cardData.image;
    img.alt = cardData.reference;
    card.appendChild(img);

    card.addEventListener("click", () => handleCardSelection(cardIndex));
    wrapper.appendChild(card);

    const caption = document.createElement("p");
    caption.className = "carousel-card__caption";
    caption.textContent = cardData.reference;
    wrapper.appendChild(caption);

    carouselTrackEl.appendChild(wrapper);
  });
};

const handleCardSelection = (nextIndex) => {
  if (nextIndex === selectedIndex) return;
  setSelectedIndex(nextIndex);
};

const animateVerseChange = (data) => {
  if (isVerseAnimating) {
    pendingVerseData = data;
    return;
  }

  isVerseAnimating = true;
  verseContentEl.classList.remove("verse-content--fade-in");
  verseContentEl.classList.add("verse-content--fade-out");

  const handleFadeOut = (event) => {
    if (event.animationName !== "verseFadeOut") return;
    verseContentEl.removeEventListener("animationend", handleFadeOut);

    verseReferenceEl.textContent = data.reference;
    verseTextEl.textContent = data.text;

    verseContentEl.classList.remove("verse-content--fade-out");
    verseContentEl.classList.add("verse-content--fade-in");

    verseContentEl.addEventListener(
      "animationend",
      (fadeInEvent) => {
        if (fadeInEvent.animationName !== "verseFadeIn") return;
        verseContentEl.classList.remove("verse-content--fade-in");
        isVerseAnimating = false;

        if (pendingVerseData) {
          const queued = pendingVerseData;
          pendingVerseData = null;
          animateVerseChange(queued);
        }
      },
      { once: true }
    );
  };

  verseContentEl.addEventListener("animationend", handleFadeOut);
};

const updateVersePanel = (animate = true) => {
  const data = verseCards[selectedIndex];
  if (!animate) {
    verseReferenceEl.textContent = data.reference;
    verseTextEl.textContent = data.text;
    return;
  }
  animateVerseChange(data);
};

const updateBackgroundLayer = (imagePath, index, animate = true) => {
  if (!backgroundLayerEl) return;

  const applyBackground = () => {
    backgroundLayerEl.style.backgroundImage = `url("${imagePath}")`;
    backgroundLayerEl.dataset.index = String(index);
  };

  if (!animate) {
    applyBackground();
    backgroundLayerEl.style.opacity = BACKGROUND_TARGET_OPACITY;
    return;
  }

  if (backgroundFadeTimeout) {
    clearTimeout(backgroundFadeTimeout);
  }

  backgroundLayerEl.style.opacity = "0";

  backgroundFadeTimeout = setTimeout(() => {
    applyBackground();
    requestAnimationFrame(() => {
      backgroundLayerEl.style.opacity = BACKGROUND_TARGET_OPACITY;
    });
  }, 250);
};

const setSelectedIndex = (nextIndex, options = {}) => {
  const { animateVerse = true, animateBackground = true, direction = null } =
    options;
  const previousIndex = selectedIndex;
  selectedIndex = modulo(nextIndex, verseCards.length);
  const slideDirection =
    direction ??
    getSlideDirection(previousIndex, selectedIndex, verseCards.length);

  renderCarousel();
  updateVersePanel(animateVerse);
  updateBackgroundLayer(
    verseCards[selectedIndex].image,
    selectedIndex,
    animateBackground
  );
  triggerCarouselSlide(slideDirection);
};

/**
 * Modo compacto por altura (landscape bajo, pantallas pequeñas)
 */
const applyLayoutMode = () => {
  const h = window.innerHeight;
  if (!pageShellEl) return;

  if (h < 700) {
    pageShellEl.classList.add("layout-compact");
  } else {
    pageShellEl.classList.remove("layout-compact");
  }
};

/**
 * En cada resize:
 * - Recalculamos layout compacto
 * - Volvemos a renderizar el carrusel con el nuevo número de tarjetas visibles
 */
const handleResize = () => {
  applyLayoutMode();
  renderCarousel();
};

const bootstrap = () => {
  if (!verseCards.length) return;

  applyLayoutMode();
  renderCarousel();
  updateVersePanel(false);
  updateBackgroundLayer(verseCards[selectedIndex].image, selectedIndex, false);

  window.addEventListener("resize", handleResize);
};

bootstrap();
