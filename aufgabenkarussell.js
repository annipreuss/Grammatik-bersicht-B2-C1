const aufgabenKarussell = document.querySelector(
  "[data-aufgabenkarussell]"
);

const aufgabenKarten = [
  ...aufgabenKarussell.querySelector("[data-aufgabenkarten]").children
];

const aufgabenPfeile = aufgabenKarussell.querySelectorAll(
  "[data-aufgabenrichtung]"
);

const aufgabenStand = aufgabenKarussell.querySelector(
  "[data-aufgabenstand]"
);

let aktuelleAufgabe = 0;

function aufgabeAnzeigen() {
  aufgabenKarten.forEach((karte, index) => {
    karte.hidden = index !== aktuelleAufgabe;
  });

  aufgabenStand.textContent =
    `Aufgabe ${aktuelleAufgabe + 1} von ${aufgabenKarten.length}`;
}

aufgabenPfeile.forEach((pfeil) => {
  pfeil.addEventListener("click", () => {
    const richtung = Number(pfeil.dataset.aufgabenrichtung);

    aktuelleAufgabe =
      (aktuelleAufgabe + richtung + aufgabenKarten.length)
      % aufgabenKarten.length;

    aufgabeAnzeigen();
  });
});

aufgabeAnzeigen();

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.isComposing || event.defaultPrevented) return;

  const feld = event.target;
  if (!(feld instanceof HTMLInputElement) || feld.type !== "text") return;
  if (feld.form) return;

  const karte = feld.closest("[data-aufgabenkarten] > *");
  if (!karte) return;

  const buttons = karte.querySelectorAll("[data-enter-bestaetigen]");
  for (const button of buttons) {
    if (button.disabled || button.getClientRects().length === 0) continue;

    event.preventDefault();
    if (!event.repeat) button.click();
    break;
  }
});