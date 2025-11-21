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
const mapViewEl = document.getElementById("mapView");
const mapViewportEl = document.getElementById("mapViewport");
const mapImageEl = document.getElementById("mapImage");
const viewToggleBtn = document.getElementById("viewToggleBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
let overlayEl = null;
let overlayImageEl = null;
let overlayCloseEl = null;
let overlayContentEl = null;

let selectedIndex = 0;
let isVerseAnimating = false;
let pendingVerseData = null;
let backgroundFadeTimeout;
const BACKGROUND_TARGET_OPACITY = 0.32;
const MAP_DEFAULT_SCALE = .3;
const MAP_MAX_SCALE = 2.2;
const MAP_ZOOM_STEP = 0.12;
let isMapMode = false;
const mapState = { scale: MAP_DEFAULT_SCALE, x: 0, y: 0 };
const mapDrag = { active: false, startX: 0, startY: 0, originX: 0, originY: 0, pointerId: null };

const modulo = (value, total) => {
  const remainder = value % total;
  return remainder >= 0 ? remainder : remainder + total;
};

const resizeVerseContentToFit = () => {
  if (!verseContentEl) return;

  // Reset styles to measure natural size
  verseContentEl.style.height = "auto";
  verseContentEl.style.fontSize = "";

  const styles = window.getComputedStyle(verseContentEl);
  const fontCapPx = 0.85 * 16; // 0.85rem en px; cap para evitar crecimiento
  const baseFontSize = Math.min(parseFloat(styles.fontSize) || fontCapPx, fontCapPx);
  verseContentEl.style.fontSize = `${baseFontSize}px`;

  const minFontSize = baseFontSize * 0.82;
  const viewportHeight =
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight ||
    0;

  // Limites razonables para no empujar al carrusel
  const minHeight = Math.max(110, Math.min(viewportHeight * 0.22, 200));
  const maxHeight = Math.max(minHeight + 20, Math.min(viewportHeight * 0.46, 360));

  let currentFont = baseFontSize;
  let contentHeight = verseContentEl.scrollHeight;
  let guard = 0;

  // Si supera el alto permitido, reducimos tipografía hasta que quepa
  while (contentHeight > maxHeight && currentFont > minFontSize && guard < 16) {
    currentFont -= 0.5;
    verseContentEl.style.fontSize = `${currentFont}px`;
    verseContentEl.style.height = "auto";
    contentHeight = verseContentEl.scrollHeight;
    guard += 1;
  }

  const finalHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
  verseContentEl.style.height = `${finalHeight}px`;
};

const getAvailableWidth = () => {
  if (pageShellEl) {
    const styles = window.getComputedStyle(pageShellEl);
    const paddingLeft = parseFloat(styles.paddingLeft || "0");
    const paddingRight = parseFloat(styles.paddingRight || "0");
    return Math.max(
      pageShellEl.clientWidth - paddingLeft - paddingRight,
      0
    );
  }

  return (
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth ||
    0
  );
};

/**
 * En función del ancho de pantalla, definimos cuántas tarjetas
 * se muestran a la vez en el carrusel.
 * Calculamos con el ancho disponible real (contenedor sin padding):
 * - <= 720px → 3 tarjetas
 * - <= 1100px → 4 tarjetas
 * - > 1100px → 5 tarjetas
 */
const getMaxVisibleSlides = () => {
  const width = getAvailableWidth();
  if (width <= 720) return 3;
  if (width <= 1100) return 4;
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

    card.addEventListener("click", (event) => {
      if (cardIndex === selectedIndex) {
        event.preventDefault();
        openOverlay(cardData.image, cardData.reference);
        return;
      }
      handleCardSelection(cardIndex);
    });
    wrapper.appendChild(card);

    const caption = document.createElement("p");
    caption.className = "carousel-card__caption";
    caption.textContent = cardData.reference;
    wrapper.appendChild(caption);

    if (cardIndex === selectedIndex) {
      const expandButton = document.createElement("button");
      expandButton.type = "button";
      expandButton.className = "expand-button";
      expandButton.setAttribute("aria-label", "Ver imagen a pantalla completa");
      expandButton.title = "Ver imagen a pantalla completa";
      expandButton.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9.5 4.5H4.5V9.5" />
          <path d="M4.5 4.5L9.5 9.5" />
          <path d="M14.5 4.5H19.5V9.5" />
          <path d="M19.5 4.5L14.5 9.5" />
          <path d="M9.5 19.5H4.5V14.5" />
          <path d="M4.5 19.5L9.5 14.5" />
          <path d="M14.5 19.5H19.5V14.5" />
          <path d="M19.5 19.5L14.5 14.5" />
        </svg>
      `;
      expandButton.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        openOverlay(cardData.image, cardData.reference);
      });
      wrapper.appendChild(expandButton);
    }

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
    resizeVerseContentToFit();

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
    resizeVerseContentToFit();
    return;
  }
  animateVerseChange(data);
};

const ensureOverlay = () => {
  if (overlayEl) return;

  overlayEl = document.createElement("div");
  overlayEl.className = "image-overlay";
  overlayEl.setAttribute("role", "dialog");
  overlayEl.setAttribute("aria-modal", "true");
  overlayEl.tabIndex = -1;
  overlayEl.hidden = true;

  overlayContentEl = document.createElement("div");
  overlayContentEl.className = "image-overlay__content";

  overlayCloseEl = document.createElement("button");
  overlayCloseEl.type = "button";
  overlayCloseEl.className = "image-overlay__close";
  overlayCloseEl.setAttribute("aria-label", "Cerrar imagen a pantalla completa");
  overlayCloseEl.textContent = "×";

  overlayImageEl = document.createElement("img");
  overlayImageEl.className = "image-overlay__img";
  overlayImageEl.alt = "";

  overlayContentEl.appendChild(overlayCloseEl);
  overlayContentEl.appendChild(overlayImageEl);
  overlayEl.appendChild(overlayContentEl);
  document.body.appendChild(overlayEl);

  overlayEl.addEventListener("click", (event) => {
    if (event.target === overlayEl) {
      closeOverlay();
    }
  });

  overlayContentEl.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  overlayCloseEl.addEventListener("click", (event) => {
    event.preventDefault();
    closeOverlay();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlayEl?.classList.contains("is-visible")) {
      closeOverlay();
    }
  });
};

const openOverlay = (imageSrc, altText = "") => {
  ensureOverlay();
  overlayImageEl.src = imageSrc;
  overlayImageEl.alt = altText;
  overlayEl.hidden = false;

  requestAnimationFrame(() => {
    overlayEl.classList.add("is-visible");
  });

  document.body.classList.add("overlay-open");
  overlayEl.focus({ preventScroll: true });
};

const closeOverlay = () => {
  if (!overlayEl) return;
  overlayEl.classList.remove("is-visible");
  document.body.classList.remove("overlay-open");
  setTimeout(() => {
    overlayEl.hidden = true;
    overlayImageEl.src = "";
  }, 220);
};

const getViewportRect = () => {
  if (!mapViewportEl) return { width: 0, height: 0 };
  const rect = mapViewportEl.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
};

const getScaledMapSize = () => {
  if (!mapImageEl) return { width: 0, height: 0 };
  const naturalWidth = mapImageEl.naturalWidth || 0;
  const naturalHeight = mapImageEl.naturalHeight || 0;
  return { width: naturalWidth * mapState.scale, height: naturalHeight * mapState.scale };
};

const getFitScale = () => {
  if (!mapImageEl || !mapViewportEl) return 1;
  const viewport = getViewportRect();
  const naturalWidth = mapImageEl.naturalWidth || 1;
  const naturalHeight = mapImageEl.naturalHeight || 1;
  const fitScale = Math.min(
    viewport.width / naturalWidth,
    viewport.height / naturalHeight
  );
  if (!Number.isFinite(fitScale) || fitScale <= 0) return 1;
  return Math.min(1, fitScale);
};

const clampMapPosition = (x, y) => {
  const viewport = getViewportRect();
  const scaled = getScaledMapSize();
  const maxOffsetX = Math.max((scaled.width - viewport.width) / 2, 0);
  const maxOffsetY = Math.max((scaled.height - viewport.height) / 2, 0);

  return {
    x: Math.min(Math.max(x, -maxOffsetX), maxOffsetX),
    y: Math.min(Math.max(y, -maxOffsetY), maxOffsetY),
  };
};

const applyMapTransform = () => {
  if (!mapImageEl) return;
  const clamped = clampMapPosition(mapState.x, mapState.y);
  mapState.x = clamped.x;
  mapState.y = clamped.y;
  mapImageEl.style.transform = `translate3d(${mapState.x}px, ${mapState.y}px, 0) scale(${mapState.scale})`;
};

const resetMapTransform = () => {
  const fitScale = getFitScale();
  mapState.scale = Math.max(MAP_DEFAULT_SCALE, fitScale * 1.05);
  mapState.scale = Math.min(mapState.scale, MAP_MAX_SCALE);
  mapState.x = 0;
  mapState.y = 0;
  applyMapTransform();
};

const zoomMap = (delta) => {
  const minScale = getFitScale();
  mapState.scale = Math.min(
    MAP_MAX_SCALE,
    Math.max(minScale, mapState.scale + delta)
  );
  applyMapTransform();
};

const enterMapMode = () => {
  isMapMode = true;
  document.body.classList.add("map-mode");
  if (pageShellEl) pageShellEl.setAttribute("aria-hidden", "true");
  if (mapViewEl) mapViewEl.setAttribute("aria-hidden", "false");
  if (viewToggleBtn) {
    viewToggleBtn.textContent = "Cambiar a Tarjetas";
    viewToggleBtn.setAttribute("aria-pressed", "true");
  }
  resetMapTransform();
};

const exitMapMode = () => {
  isMapMode = false;
  document.body.classList.remove("map-mode");
  if (pageShellEl) pageShellEl.removeAttribute("aria-hidden");
  if (mapViewEl) mapViewEl.setAttribute("aria-hidden", "true");
  if (viewToggleBtn) {
    viewToggleBtn.textContent = "Cambiar a Mapa";
    viewToggleBtn.setAttribute("aria-pressed", "false");
  }
};

const toggleViewMode = () => {
  if (isMapMode) {
    exitMapMode();
  } else {
    enterMapMode();
  }
};

const startMapDrag = (event) => {
  if (!isMapMode || !mapViewportEl) return;
  if (event.target.closest && event.target.closest(".map-zoom-controls")) return;
  mapDrag.active = true;
  mapDrag.startX = event.clientX;
  mapDrag.startY = event.clientY;
  mapDrag.originX = mapState.x;
  mapDrag.originY = mapState.y;
  mapDrag.pointerId = event.pointerId;
  mapViewportEl.setPointerCapture(event.pointerId);
  mapViewportEl.classList.add("is-dragging");
};

const moveMapDrag = (event) => {
  if (!mapDrag.active || event.pointerId !== mapDrag.pointerId) return;
  event.preventDefault();
  const deltaX = event.clientX - mapDrag.startX;
  const deltaY = event.clientY - mapDrag.startY;
  const clamped = clampMapPosition(mapDrag.originX + deltaX, mapDrag.originY + deltaY);
  mapState.x = clamped.x;
  mapState.y = clamped.y;
  applyMapTransform();
};

const endMapDrag = (event) => {
  if (!mapDrag.active || (mapDrag.pointerId !== null && event.pointerId !== mapDrag.pointerId)) return;
  mapDrag.active = false;
  mapViewportEl?.classList.remove("is-dragging");
  if (mapDrag.pointerId !== null && mapViewportEl?.hasPointerCapture(mapDrag.pointerId)) {
    mapViewportEl.releasePointerCapture(mapDrag.pointerId);
  }
  mapDrag.pointerId = null;
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
  resizeVerseContentToFit();
  if (isMapMode) {
    applyMapTransform();
  }
};

const bootstrap = () => {
  if (!verseCards.length) return;

  applyLayoutMode();
  renderCarousel();
  updateVersePanel(false);
  updateBackgroundLayer(verseCards[selectedIndex].image, selectedIndex, false);
  resizeVerseContentToFit();
  ensureOverlay();
  exitMapMode();

  if (viewToggleBtn) {
    viewToggleBtn.addEventListener("click", toggleViewMode);
  }

  if (mapViewportEl) {
    mapViewportEl.addEventListener("pointerdown", startMapDrag);
    mapViewportEl.addEventListener("pointermove", moveMapDrag);
    mapViewportEl.addEventListener("pointerup", endMapDrag);
    mapViewportEl.addEventListener("pointercancel", endMapDrag);
    mapViewportEl.addEventListener("pointerleave", endMapDrag);
  }

  mapImageEl?.addEventListener("load", () => {
    resetMapTransform();
  });

  zoomInBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    zoomMap(MAP_ZOOM_STEP);
  });

  zoomOutBtn?.addEventListener("click", (event) => {
    event.preventDefault();
    zoomMap(-MAP_ZOOM_STEP);
  });

  window.addEventListener("resize", handleResize);
};

bootstrap();
