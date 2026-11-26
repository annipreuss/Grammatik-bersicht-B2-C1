function normalisieren(text) {
  return text
    .normalize("NFC")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("de");
}

// Aufgabe 1 :)

const lueckenPruefen = document.getElementById("lueckentext-pruefen");

if (lueckenPruefen) {
  const lueckenRueckmeldung = document.getElementById("lueckentext-rueckmeldung");
  const lueckenSaetze = document.querySelectorAll("ol.lueckentext > li");

  lueckenPruefen.addEventListener("click", () => {
    let richtigeSaetze = 0;

    for (const satz of lueckenSaetze) {
      let satzRichtig = true;

      for (const feld of satz.querySelectorAll("input")) {
		const eingabe = normalisieren(feld.value);

		const loesungen = feld.dataset.loesung
		  .split("|")
		  .map(normalisieren);

		const richtig = loesungen.includes(eingabe);

        feld.classList.toggle("luecke-richtig", richtig);
        feld.classList.toggle("luecke-falsch", !richtig);
        feld.setAttribute("aria-invalid", String(!richtig));

        if (!richtig) {
          satzRichtig = false;
        }
      }

      if (satzRichtig) {
        richtigeSaetze++;
      }
    }

    lueckenRueckmeldung.textContent =
      `${richtigeSaetze} von ${lueckenSaetze.length} Sätzen vollständig richtig.`;
  });
  
   const lueckenFelder = document.querySelectorAll(
    "ol.lueckentext > li input"
  );

  lueckenFelder.forEach((feld) => {
    feld.addEventListener("input", () => {
      for (const luecke of lueckenFelder) {
        luecke.classList.remove(
          "luecke-richtig",
          "luecke-falsch"
        );
        luecke.removeAttribute("aria-invalid");
      }

      lueckenRueckmeldung.textContent = "";
    });
  });
}


// Aufgabe 2 :)
function startePassivVorherNachher() {
  const karte = document.querySelector("#passiv-vorher-nachher");
  if (!karte) return;

  const verben = [
    "korrigieren", "reservieren", "buchen", "aktualisieren",
    "reparieren", "reinigen", "ausschalten", "hochladen"
  ];

  const satzpaare = [
    {
      vorher: "Die Studierenden konnten die Präsentationsfolien nicht finden.",
      nachher: "Jetzt sind sie auf ILIAS verfügbar.",
      verb: "hochladen",
      beispiel: "Die Präsentationsfolien wurden auf ILIAS hochgeladen."
    },
    {
      vorher: "Der Beamer im Vorlesungsraum war kaputt.",
      nachher: "Jetzt funktioniert er wieder.",
      verb: "reparieren",
      beispiel: "Der Beamer im Vorlesungsraum wurde repariert."
    },
    {
      vorher: "Im Hochschulportal standen noch die alten Sprechzeiten.",
      nachher: "Jetzt sind die neuen Zeiten zu sehen.",
      verb: "aktualisieren",
      beispiel: "Die Sprechzeiten im Hochschulportal wurden aktualisiert."
    },
    {
      vorher: "Die Lernplätze in der Bibliothek waren gestern alle besetzt.",
      nachher: "Heute steht auf einigen Tischen ein Schild mit dem Namen der Lerngruppe.",
      verb: "reservieren",
      beispiel: "Einige Lernplätze wurden für die Lerngruppe reserviert."
    },
    {
      vorher: "Die Tische im Seminarraum waren schmutzig.",
      nachher: "Jetzt sind sie sauber.",
      verb: "reinigen",
      beispiel: "Die Tische im Seminarraum wurden gereinigt."
    },
    {
      vorher: "Die Computer im PC-Pool liefen noch nach Ende der Lehrveranstaltung.",
      nachher: "Jetzt sind sie aus.",
      verb: "ausschalten",
      beispiel: "Die Computer im PC-Pool wurden ausgeschaltet."
    },
    {
      vorher: "In der Musterlösung gab es mehrere Fehler.",
      nachher: "Jetzt sind alle Antworten richtig.",
      verb: "korrigieren",
      beispiel: "Die Fehler in der Musterlösung wurden korrigiert."
    },
    {
      vorher: "Letzte Woche gab es noch keinen festen Raum für den Deutschkurs.",
      nachher: "Jetzt findet der Deutschkurs im Raum SH-313 statt.",
      verb: "buchen",
      beispiel: "Der Raum SH-313 wurde für den Deutschkurs gebucht."
    }
  ];

  const liste = karte.querySelector("[data-satzpaare]");
  const verbliste = karte.querySelector("[data-verbliste]");
  let gewaehltesVerb = "";
	for (const verb of verben) {
	  const button = document.createElement("button");
	  button.type = "button";
	  button.className = "passiv-verb";
	  button.textContent = verb;
	  button.dataset.verb = verb;

	  button.setAttribute("aria-pressed", "false");

	button.addEventListener("click", () => {
	  gewaehltesVerb = verb;

	  for (const verbButton of verbliste.children) {
		verbButton.setAttribute("aria-pressed", String(verbButton === button));
	  }

	  rueckmeldung.textContent =
		`„${verb}“ ausgewählt. Klicken Sie jetzt auf ein Satzpaar.`;
	});
	  verbliste.append(button);
	}
	
  const pruefen = karte.querySelector("[data-zuordnung-pruefen]");
  const vergleichen = karte.querySelector("[data-loesungen-zeigen]");
  const schreibauftrag = karte.querySelector("[data-schreibauftrag]");
  const rueckmeldung = karte.querySelector("[data-rueckmeldung]");

  // Für jedes Satzpaar einen nummerierten Listeneintrag anlegen.
  satzpaare.forEach((paar, index) => {
    const eintrag = document.createElement("div");

    eintrag.innerHTML = `
      <button type="button" class="passiv-satz" data-satzziel>
       ${index + 1}. ${paar.vorher} ${paar.nachher}
        <strong data-zugeordnet></strong>
      </button>
      <span data-verb-hinweis></span>

      <div data-schreibfeld hidden>
		<textarea rows="2" aria-label="Passivsatz zu Satzpaar ${index + 1}"></textarea>
        <p data-beispiel hidden>
          <strong>Beispiellösung:</strong> ${paar.beispiel}
        </p>
      </div>
    `;

    // Schon beim Laden alle acht Satzpaare in die Liste einfügen.
    liste.append(eintrag);

    const satzziel = eintrag.querySelector("[data-satzziel]");

    satzziel.addEventListener("click", () => {
      if (!gewaehltesVerb) {
        rueckmeldung.textContent = "Wählen Sie zuerst oben ein Verb aus.";
        return;
      }

      // Falls das Verb bereits zugeordnet war, die alte Zuordnung lösen.
      for (const andererEintrag of liste.children) {
        if (andererEintrag.dataset.zuordnung === gewaehltesVerb) {
          delete andererEintrag.dataset.zuordnung;
		  delete andererEintrag.dataset.ergebnis;
          andererEintrag.querySelector("[data-zugeordnet]").textContent = "";
          andererEintrag.querySelector("[data-verb-hinweis]").textContent = "";
        }
      }

      eintrag.dataset.zuordnung = gewaehltesVerb;
	  delete eintrag.dataset.ergebnis;
      eintrag.querySelector("[data-zugeordnet]").textContent =
        ` → ${gewaehltesVerb}`;
      eintrag.querySelector("[data-verb-hinweis]").textContent = "";

      rueckmeldung.textContent =
        `„${gewaehltesVerb}“ wurde Satzpaar ${index + 1} zugeordnet.`;

      gewaehltesVerb = "";
      for (const verbButton of verbliste.children) {
        verbButton.setAttribute("aria-pressed", "false");
      }
    });
  });

  // Schritt 1 prüfen und bei vollständiger Zuordnung Schritt 2 öffnen.
  pruefen.addEventListener("click", () => {
    let anzahlRichtig = 0;

    satzpaare.forEach((paar, index) => {
      const eintrag = liste.children[index];
      const zuordnung = eintrag.dataset.zuordnung;
      const hinweis = eintrag.querySelector("[data-verb-hinweis]");

	if (zuordnung === paar.verb) {
	  anzahlRichtig++;
	  eintrag.dataset.ergebnis = "richtig";
	  hinweis.textContent = "";
	} else if (zuordnung) {
	  eintrag.dataset.ergebnis = "falsch";
	  hinweis.textContent = "";
	} else {
	  delete eintrag.dataset.ergebnis;
	  hinweis.textContent = "Bitte ordnen Sie ein Verb zu.";
	}
    });

    rueckmeldung.textContent = "";

    if (anzahlRichtig === satzpaare.length) {
      schreibauftrag.hidden = false;
      vergleichen.hidden = false;
      pruefen.hidden = true;

      for (const verbButton of verbliste.children) {
        verbButton.disabled = true;
      }

      for (const eintrag of liste.children) {
        eintrag.querySelector("[data-satzziel]").disabled = true;
        eintrag.querySelector("[data-schreibfeld]").hidden = false;
      }
	  
      liste.querySelector("textarea").focus();
    }
  });

  // Eigene Sätze und Beispiele zum direkten Vergleich stehen lassen.
  vergleichen.addEventListener("click", () => {
    const textfelder = liste.querySelectorAll("textarea");

    for (const textfeld of textfelder) {
      if (textfeld.value.trim() === "") {
        rueckmeldung.textContent =
          "Schreiben Sie bitte zuerst zu jedem Satzpaar einen Satz.";
        textfeld.focus();
        return;
      }
    }

    for (const beispiel of liste.querySelectorAll("[data-beispiel]")) {
      beispiel.hidden = false;
    }

    vergleichen.hidden = true;
    rueckmeldung.textContent = "";
    liste.querySelector("textarea").focus();
  });
}

startePassivVorherNachher();