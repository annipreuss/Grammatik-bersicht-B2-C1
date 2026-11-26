
/// Die Variablen aufgabenKarten, aktuelleAufgabe und aufgabenKarussell
// sowie die Funktion aufgabeAnzeigen() kommen aus deinem Karussell.

scormStarten();

const niveau = aufgabenKarten[0].id.split("_")[0];
const seitentitel = `Aufgaben zu Adverbialsätzen (${niveau})`;

document.title = seitentitel;
aufgabenKarussell.querySelector("h1").textContent = seitentitel;

// In ILIAS bestimmt der gestartete Manifest-Eintrag die sichtbare Karte.
const gestarteteKarte = scormAktiv
  ? scormAPI.GetValue("cmi.launch_data")
  : "";

const startIndex = aufgabenKarten.findIndex(
  karte => karte.id === gestarteteKarte
);

if (startIndex >= 0) {
  aktuelleAufgabe = startIndex;
  aufgabeAnzeigen();
}

function normalisieren(text) {
  return text
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("de");
}

function auswerten(felder) {
  let ausgefuellt = 0;
  let richtig = 0;

  for (const feld of felder) {
	const eingabe = normalisieren(feld.value);

	const loesungen = feld.dataset.loesung
	  .split("|")
	  .map(normalisieren);

	const passt = loesungen.includes(eingabe);

    if (eingabe) ausgefuellt++;
    if (passt) richtig++;

    feld.classList.toggle("luecke-richtig", passt);
    feld.classList.toggle("luecke-falsch", !passt);
    feld.setAttribute("aria-invalid", String(!passt));
  }

  return { ausgefuellt, richtig };
}

function eingabenLaden(felder) {
  const gespeichert = scormAPI.GetValue("cmi.suspend_data");
  if (!gespeichert) return;

  try {
    const werte = JSON.parse(gespeichert);
    if (!Array.isArray(werte)) return;

    felder.forEach((feld, index) => {
      if (typeof werte[index] === "string") {
        feld.value = werte[index];
      }
    });
  } catch {
    console.warn("Die gespeicherten Eingaben konnten nicht gelesen werden.");
  }
}

function karteEinrichten(karte) {
  const felder = [...karte.querySelectorAll("input[data-loesung]")];
  const istGestarteteKarte = scormAktiv && karte.id === gestarteteKarte;
  const titel = karte.querySelector("h2").textContent;

  felder.forEach((feld, index) => {
    feld.setAttribute("aria-label", `${titel}, Lücke ${index + 1}`);
    feld.autocomplete = "off";

    // Einzelne Konnektoren brauchen weniger Platz als ganze Nebensätze.
    const ersteLoesung = feld.dataset.loesung.split("|")[0];
    feld.size = Math.min(65, Math.max(14, ersteLoesung.length + 2));
    feld.style.maxWidth = "100%";
    feld.style.boxSizing = "border-box";
  });

  if (istGestarteteKarte) {
    eingabenLaden(felder);
}

  const pruefen = document.createElement("button");
  pruefen.type = "button";
  pruefen.className = "linkbutton";
  pruefen.textContent = "Antworten prüfen";
  pruefen.setAttribute("data-enter-bestaetigen", "");

  const rueckmeldung = document.createElement("p");
  rueckmeldung.setAttribute("role", "status");

  // Die Musterlösungen können nach einem vollständigen Versuch geöffnet werden.
  const vergleich = document.createElement("details");
  vergleich.hidden = true;

  const beschriftung = document.createElement("summary");
  beschriftung.textContent = "Mit Beispiellösungen vergleichen";

  const liste = document.createElement("ol");
  for (const feld of felder) {
    const eintrag = document.createElement("li");
    eintrag.textContent = feld.dataset.loesung.split("|").join(" / ");
    liste.append(eintrag);
  }

  vergleich.append(beschriftung, liste);
  karte.append(pruefen, rueckmeldung, vergleich);
  
 let speicherTimer;

karte.addEventListener("input", () => {
    // Die bisherige Bewertung gilt nicht mehr.
    for (const feld of felder) {
        feld.classList.remove("luecke-richtig", "luecke-falsch");
        feld.removeAttribute("aria-invalid");
    }

    rueckmeldung.textContent = "";

    vergleich.hidden = true;
    vergleich.open = false;

    // Nur die tatsächlich gestartete SCORM-Aufgabe speichern.
    if (!istGestarteteKarte || !scormAktiv) return;

    clearTimeout(speicherTimer);

    const werte = felder.map(feld => feld.value);
    const gesetzt = scormWertSetzen(
        "cmi.suspend_data",
        JSON.stringify(werte)
    );

    if (!gesetzt) {
        rueckmeldung.textContent =
            "Die Eingaben konnten nicht übernommen werden.";
        return;
    }

    speicherTimer = setTimeout(() => {
        if (!scormAktiv) return;

        if (!scormSpeichern()) {
            rueckmeldung.textContent =
                "Die Eingaben konnten nicht gespeichert werden.";
        }
    }, 700);
});

  if (istGestarteteKarte &&
      scormAPI.GetValue("cmi.completion_status") === "completed") {
    rueckmeldung.textContent = "Diese Aufgabe wurde bereits bearbeitet.";
    vergleich.hidden = false;
  }

  pruefen.addEventListener("click", () => {
    const { ausgefuellt, richtig } = auswerten(felder);
    const ergebnis = `${richtig} von ${felder.length} Lücken richtig.`;

    if (ausgefuellt < felder.length) {
      const offen = felder.length - ausgefuellt;
      const hinweis = offen === 1
        ? "Eine Lücke ist noch offen."
        : `${offen} Lücken sind noch offen.`;

      rueckmeldung.textContent = `${ergebnis} ${hinweis}`;
      return;
    }

    vergleich.hidden = false;

    if (!scormAktiv) {
      rueckmeldung.textContent = `${ergebnis} Aufgabe bearbeitet (lokale Ansicht).`;
      return;
    }

    if (!istGestarteteKarte) {
      rueckmeldung.textContent =
        `${ergebnis} Für die Speicherung bitte diese Aufgabe im ILIAS-Inhaltsverzeichnis öffnen.`;
      return;
    }

    // Wiederholtes Prüfen setzt denselben Status für denselben Eintrag.
    // Die Zahl der richtigen Antworten bleibt auf der HTML-Seite.
    const statusGesetzt = scormWertSetzen("cmi.completion_status", "completed");
    const gespeichert = statusGesetzt && scormSpeichern();

    rueckmeldung.textContent = gespeichert
      ? `${ergebnis} Aufgabe als bearbeitet gespeichert.`
      : `${ergebnis} Der Fortschritt konnte nicht gespeichert werden. Bitte erneut prüfen.`;
  });
}

aufgabenKarten.forEach(karteEinrichten);

// Lokal blättert dein Karussell wie bisher.
// In ILIAS startet derselbe Pfeil den SCORM-Eintrag der Zielkarte.
aufgabenKarussell.addEventListener("click", event => {
  const pfeil = event.target.closest("[data-aufgabenrichtung]");
  if (!pfeil || !scormAktiv) return;

  // Der ursprüngliche Pfeil-Klick soll nicht zusätzlich lokal weiterblättern.
  event.preventDefault();
  event.stopPropagation();

  const richtung = Number(pfeil.dataset.aufgabenrichtung);
  const zielIndex =
    (aktuelleAufgabe + richtung + aufgabenKarten.length) % aufgabenKarten.length;

  scormZielOeffnen(aufgabenKarten[zielIndex].id);
}, true);