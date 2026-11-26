const carousel = document.querySelector("[data-carousel]");
const slides = [...carousel.querySelector("[data-slides]").children];
const buttons = carousel.querySelectorAll("[data-carousel-button]");

let activeIndex = slides.findIndex(slide =>
    slide.hasAttribute("data-active")
);

if (activeIndex === -1) {
    activeIndex = 0;
}

function zeigeSlides() {
    const leftIndex =
        (activeIndex - 1 + slides.length) % slides.length;

    const rightIndex =
        (activeIndex + 1) % slides.length;

    slides.forEach((slide, index) => {
		slide.inert = index !== activeIndex;
        delete slide.dataset.active;
        delete slide.dataset.position;

        if (index === activeIndex) {
            slide.dataset.active = "";
        } else if (index === leftIndex) {
            slide.dataset.position = "left";
        } else if (index === rightIndex) {
            slide.dataset.position = "right";
        }
    });
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const richtung =
            button.dataset.carouselButton === "next" ? 1 : -1;

        activeIndex =
            (activeIndex + richtung + slides.length) % slides.length;

        zeigeSlides();
    });
});

zeigeSlides();

const suchfeld = document.querySelector("#themensuche");
const ergebnisse = document.querySelector("#suchergebnisse");
const suchstatus = document.querySelector("#suchstatus");

const themen = [
    ...document.querySelectorAll(".slide[data-thema]")
];

suchfeld.addEventListener("input", () => {
    const suchtext = suchfeld.value.trim().toLocaleLowerCase("de");

    ergebnisse.replaceChildren();
    suchstatus.textContent = "";
    ergebnisse.hidden = true;

    if (suchtext === "") {
        return;
    }

    const treffer = themen.filter(thema => {
        const suchbareWoerter =
            `${thema.dataset.thema} ${thema.dataset.suchbegriffe || ""}`;

        return suchbareWoerter
            .toLocaleLowerCase("de")
            .includes(suchtext);
    });

    treffer.forEach(thema => {
        const eintrag = document.createElement("li");
        const link = document.createElement("a");

        link.textContent = thema.dataset.thema;
        link.href = thema.querySelector("a").getAttribute("href");

        eintrag.append(link);
        ergebnisse.append(eintrag);
    });

    ergebnisse.hidden = treffer.length === 0;

    suchstatus.textContent = treffer.length === 0
        ? "Kein passendes Thema gefunden."
        : `${treffer.length} Themen gefunden.`;

function suchtrefferMitPfeilenAuswaehlen(event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
    }

    if (ergebnisse.hidden) {
        return;
    }

    const links = [...ergebnisse.querySelectorAll("a")];

    if (links.length === 0) {
        return;
    }

    event.preventDefault();

    const aktuellerIndex = links.indexOf(document.activeElement);
    let naechsterIndex;

    if (event.key === "ArrowDown") {
        naechsterIndex = aktuellerIndex === -1
            ? 0
            : (aktuellerIndex + 1) % links.length;
    } else {
        naechsterIndex = aktuellerIndex === -1
            ? links.length - 1
            : (aktuellerIndex - 1 + links.length) % links.length;
    }

	links[naechsterIndex].focus({ preventScroll: true });
}

suchfeld.addEventListener("keydown", suchtrefferMitPfeilenAuswaehlen);
ergebnisse.addEventListener("keydown", suchtrefferMitPfeilenAuswaehlen);
});
