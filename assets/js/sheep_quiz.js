const quizData = [
    { frage: "Wie nennt man ein junges Schaf?", antworten: ["Kalb", "Lamm", "Zicklein", "Fohlen"], korrekt: "Lamm" },
    { frage: "Welches Land hat die meisten Schafe pro Einwohner?", antworten: ["Australien", "Neuseeland", "Schottland", "Wales"], korrekt: "Neuseeland" },
    { frage: "Welche Farbe hat die Wolle der meisten Schafe?", antworten: ["Weiß", "Schwarz", "Braun", "Grau"], korrekt: "Weiß" },
    { frage: "Wie nennt man das Entfernen der Wolle eines Schafes?", antworten: ["Scheren", "Schneiden", "Trimmen", "Pflegen"], korrekt: "Scheren" },
    { frage: "Wie viele Magenabteile hat ein Schaf?", antworten: ["1", "2", "3", "4"], korrekt: "4" }
];

function buildQuiz() {
    const quizContainer = document.getElementById("quiz");
    quizContainer.innerHTML = "";
    quizData.forEach((q, index) => {
        quizContainer.innerHTML += `
      <div class="question"><strong>${index + 1}. ${q.frage}</strong></div>
      <div class="answers">
        ${q.antworten.map(ans => `
          <label>
            <input type="radio" name="question${index}" value="${ans}"> ${ans}
          </label>
        `).join("")}
      </div>
    `;
    });
}

function submitResults() {
    const name = document.getElementById("participantName").value.trim();
    if (!name) {
        alert("Bitte geben Sie Ihren Namen ein, bevor Sie absenden.");
        return;
    }

    let score = 0;
    const answersGiven = [];
    quizData.forEach((q, index) => {
        const selected = document.querySelector(`input[name="question${index}"]:checked`);
        if (selected) {
            answersGiven.push(selected.value);
            if (selected.value === q.korrekt) score++;
        } else {
            answersGiven.push("");
        }
    });

    document.getElementById("result").textContent = `Sie haben ${score} von ${quizData.length} Punkten erreicht!`;

    fetch("http://192.168.140.209:5000/save-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            score: score,
            total: quizData.length,
            answers: answersGiven,
            timestamp: new Date().toISOString()
        })
    }).catch(err => console.error("Fehler beim Senden:", err));
}

document.getElementById("submit").addEventListener("click", submitResults);
buildQuiz();