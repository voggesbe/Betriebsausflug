// --- Quiz Data (German) ---
const quizQuestions = [
    {
        type: "single",
        question: "Wie viele Mägen hat ein Schaf?",
        options: ["1", "2", "4"],
        correct: "4",
        points: 1
    },
    {
        type: "single",
        question: "Wie nennt man ein junges Schaf?",
        options: ["Lamm", "Fohlen", "Kalb"],
        correct: "Lamm",
        points: 1
    },
    {
        type: "multiple",
        question: "Welche der folgenden sind Schafrassen?",
        options: ["Merino", "Angus", "Texel"],
        correct: ["Merino", "Texel"],
        points: 2
    },
    {
        type: "text",
        question: "Zu welcher Tierfamilie gehören Schafe biologisch gesehen?",
        correct: ["Bovidae (Hornträger)", "Hornträger", "Bovidae"],
        points: 3
    },
    {
        type: "text",
        question: "Welches Geräusch macht ein Schaf (auf Englisch)?",
        correct: ["baa", "baaa"],
        points: 1
    },
    {
        type: "single",
        question: "Welche Form haben die Pupillen von Schafen?",
        options: ["Waagrecht gestellte Schlitze", "Senkrecht gestellte Schlitze", "Runde Pupillen"],
        correct: ["Waagrecht gestellte Schlitze"],
        points: 1
    },
    {
        type: "text",
        question: "Welche zwei Körperteile von Schafen werden häufig zur Unterscheidung verschiedener Rassen und Individuen verwendet?",
        correct: ["Hörner und Fellfarbe", "Hörner", "Fellfarbe"],
        expectedCount: 2,
        points: 2
    },
    {
        type: "single",
        question: "Wie nennt man die Wolle eines Schafs, bevor sie geschoren wird?",
        options: ["Vlies", "Fell", "Pelz"],
        correct: "Vlies",
        points: 1
    },
    {
        type: "text",
        question: "Aus Schafsmilch werden viele Käsesorten gemacht. Nenne einen dieser Käse.",
        correct: [" Feta", "Roquefort", "Pecorino"],
        points: 2
    },
    {
        type: "text",
        question: "Welches Schaf wurde 1996 als erstes Säugetier der Welt geklont?",
        correct: "Dolly",
        points: 1
    },
    {
        type: "text",
        question: "Wie nennt man einen männlichen Schafbock?",
        correct: ["Widder"],
        points: 1
    },
    {
        type: "text",
        question: "Welches Land hat weltweit die größte Zahl an Schafen?",
        correct: "China",
        points: 3
    },
    {
        type: "single",
        question: "Wie groß sind traditionelle Herden von Wanderschäfern in Mitteleuropa?",
        options: ["bis zu 100 Tieren", "bis zu 500 Tieren", "bis über 1000 Tiere"],
        correct: ["bis über 1000 Tiere"],
        points: 2
    },
];

// --- Google Script endpoint ---
const endpoint = "https://script.google.com/macros/s/AKfycbxZijIvdLiQPVi6d1IAGz_WaPjey_AA45-vMy9QCaz7ddm7EpWm6lI3BFFRFqFLw_iN/exec"; // replace with your deployed Apps Script URL

// --- Render Quiz ---
function renderQuiz() {
    const quizDiv = document.getElementById("quiz");
    quizDiv.innerHTML = "";

    quizQuestions.forEach((q, i) => {
        const qDiv = document.createElement("div");
        qDiv.className = "quiz-question";

        const qTitle = document.createElement("p");
        qTitle.className = "question";
        qTitle.textContent = `${i + 1}. ${q.question}`;
        qDiv.appendChild(qTitle);

        const answersDiv = document.createElement("div");
        answersDiv.className = "answers";

        if (q.type === "single") {
            q.options.forEach(opt => {
                const label = document.createElement("label");
                label.innerHTML = `<input type="radio" name="q${i}" value="${opt}"> ${opt}`;
                answersDiv.appendChild(label);
            });
        } else if (q.type === "multiple") {
            q.options.forEach(opt => {
                const label = document.createElement("label");
                label.innerHTML = `<input type="checkbox" name="q${i}" value="${opt}"> ${opt}`;
                answersDiv.appendChild(label);
            });
        } else if (q.type === "text") {
            const input = document.createElement("input");
            input.type = "text";
            input.name = `q${i}`;
            input.placeholder = "Ihre Antwort";
            answersDiv.appendChild(input);
        }

        qDiv.appendChild(answersDiv);
        quizDiv.appendChild(qDiv);
    });
}

// --- Create Google Sheets Headers ---
function createSheetHeaders() {
    fetch(endpoint + "?action=createHeaders", {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({
            headers: ["Timestamp", "Teilnehmer Name"].concat(
                quizQuestions.flatMap((q, i) => [`Frage ${i + 1} Antwort`, `Frage ${i + 1} Punkte`])
            ).concat(["Gesamt Punkte"])
        }),
        headers: { "Content-Type": "application/json" }
    }).catch(err => console.log("Headers creation skipped (expected with no-cors):", err));
}

// --- Handle Submit ---
document.getElementById("submit").addEventListener("click", () => {
    const submitBtn = document.getElementById("submit");
    if (submitBtn.disabled) return;

    const name = document.getElementById("participantName").value || "Anonym";
    let totalScore = 0;
    const answers = {};

    quizQuestions.forEach((q, i) => {
        let questionScore = 0;
        let userAnswer;

        if (q.type === "single") {
            const selected = document.querySelector(`input[name="q${i}"]:checked`);
            userAnswer = selected ? selected.value : "";
            if (userAnswer === q.correct) questionScore = q.points;
        } else if (q.type === "multiple") {
            const selected = Array.from(document.querySelectorAll(`input[name="q${i}"]:checked`)).map(input => input.value);
            userAnswer = selected;
            const correctSet = new Set(q.correct);
            const perOptionScore = q.points / q.correct.length;

            selected.forEach(opt => {
                if (correctSet.has(opt)) questionScore += perOptionScore;
                else questionScore -= perOptionScore;
            });
            if (questionScore < 0) questionScore = 0;
        } else if (q.type === "text") {
            const input = document.querySelector(`input[name="q${i}"]`);
            userAnswer = input.value.trim().toLowerCase();

            // Split the entries if there are more than one answer, seperated by commas and "und"
            const userAnswers = userAnswerRaw
                .split(/,|und/)
                .map(a => a.trim())
                .filter(a => a.length > 0);

            const expectedCount = q.expectedCount || 1;

            // all right answers in lower case
            const correctLower = q.correct.map(a => a.toLowerCase());

            // checks if at least one of the user answers is in the list of correct answers
            if (userAnswers.some(ans => correctLower.includes(ans))) {
                questionScore = q.points;
            }
            // check if there are incorrect answers
            let incorrectCount = userAnswers.filter(ans => ans && !correctLower.includes(ans)).length;

            questionScore = q.points - incorrectCount - Math.max(0, expectedCount - userAnswers.length); // subtract points for incorrect answers and missing answers

            // make sure that points don't get negative
            if (questionScore < 0) questionScore = 0;
        }

        totalScore += questionScore;
        answers[`q${i}`] = userAnswer;
        answers[`score_q${i}`] = questionScore.toFixed(2);
    });

    // --- Show feedback ---
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    quizQuestions.forEach((q, i) => {
        const userAnswer = answers[`q${i}`];
        const questionScore = answers[`score_q${i}`];
        const qNumber = i + 1;

        const fbBox = document.createElement("div");
        fbBox.className = "feedback-box";

        const fbTitle = document.createElement("h4");
        fbTitle.textContent = `${qNumber}. ${q.question}`;
        fbBox.appendChild(fbTitle);

        if (q.type === "single") {
            const inputs = document.querySelectorAll(`input[name="q${i}"]`);
            inputs.forEach(input => input.disabled = true);
            inputs.forEach(input => {
                const label = input.parentElement;
                if (input.value === q.correct) {
                    label.style.color = "green";
                    label.style.fontWeight = "bold";
                } else if (input.checked && input.value !== q.correct) {
                    label.style.color = "red";
                    label.style.fontWeight = "bold";
                }
            });

            if (userAnswer !== q.correct) {
                const p = document.createElement("p");
                p.textContent = `Richtige Antwort: ${q.correct} (Punkte: ${questionScore})`;
                p.style.color = "#ff6600";
                fbBox.appendChild(p);
            }

        } else if (q.type === "multiple") {
            const inputs = document.querySelectorAll(`input[name="q${i}"]`);
            inputs.forEach(input => input.disabled = true);
            const correctSet = new Set(q.correct);

            inputs.forEach(input => {
                const label = input.parentElement;
                if (input.checked && correctSet.has(input.value)) {
                    label.style.color = "green";
                } else if (!input.checked && correctSet.has(input.value)) {
                    label.style.color = "orange"; // missed
                } else if (input.checked && !correctSet.has(input.value)) {
                    label.style.color = "red"; // wrong
                }
            });

            if (userAnswer.sort().join(",") !== q.correct.sort().join(",")) {
                const p = document.createElement("p");
                p.textContent = `Richtige Antwort(en): ${q.correct.join(", ")} (Punkte: ${questionScore})`;
                p.style.color = "#ff6600";
                fbBox.appendChild(p);
            }

        } else if (q.type === "text") {
            const input = document.querySelector(`input[name="q${i}"]`);
            input.disabled = true;

            // Get raw user input and convert to lowercase
            const userAnswerRaw = input.value.trim().toLowerCase();

            // Split user input by commas and "und", trim spaces, and filter empty entries
            const userAnswers = userAnswerRaw.split(/,|und/).map(a => a.trim()).filter(Boolean);

            // Lowercase all correct answers for comparison
            const correctLower = q.correct.map(a => a.toLowerCase());

            // Find which answers are correct and which are incorrect
            const rightAnswers = userAnswers.filter(ans => correctLower.includes(ans));
            const wrongAnswers = userAnswers.filter(ans => !correctLower.includes(ans));

            // Hide the input field to show formatted feedback
            input.style.display = "none";

            // Create a colored response list: green for correct, red for incorrect
            const responseDiv = document.createElement("div");
            responseDiv.innerHTML = rightAnswers.map(a => `<span style="color:green; font-weight:bold;">${a}</span>`)
                .concat(wrongAnswers.map(a => `<span style="color:red; font-weight:bold;">${a}</span>`))
                .join(", ");
            fbBox.appendChild(responseDiv);

            // Show correct answers and points if user's answer is not fully correct
            if (rightAnswers.length !== correctLower.length || wrongAnswers.length > 0) {
                const p = document.createElement("p");
                p.textContent = `Correct answer(s): ${q.correct.join(", ")} (Points: ${questionScore})`;
                p.style.color = "#ff6600";
                fbBox.appendChild(p);
            }
        }


        resultDiv.appendChild(fbBox);
    });

    // Gesamtpunktzahl berechnen
    const totalScorePoints = Object.keys(answers)
        .filter(key => key.startsWith("score_q"))
        .reduce((sum, key) => sum + answers[key], 0);

    // Gesamtpunktzahl und Bewertungstext anzeigen
    const totalH3 = document.createElement("h3");
    const maxScore = quizQuestions.reduce((sum, q) => sum + q.points, 0);
    totalH3.textContent = `Gesamtpunkte: ${totalScorePoints}/${maxScore}`;
    totalH3.style.color = "#333";
    totalH3.style.textAlign = "center";
    totalH3.style.marginTop = "1rem";

    // Bewertung anhand der Gesamtpunkte
    let bewertung = "";
    if (totalScorePoints <= 5) {
        bewertung = "Schäfchenzähler";
    } else if (totalScorePoints <= 12) {
        bewertung = "Hütehund-Niveau";
    } else if (totalScorePoints <= 20) {
        bewertung = "Erfahrener Schäfer";
    } else {
        bewertung = "Schafmeister";
    }

    const bewertungP = document.createElement("p");
    bewertungP.textContent = `Bewertung: ${bewertung}`;
    bewertungP.style.textAlign = "center";
    bewertungP.style.fontWeight = "bold";
    bewertungP.style.marginTop = "0.3rem";

    resultDiv.appendChild(totalH3);
    resultDiv.appendChild(bewertungP);



    // --- Send results to Google Sheets ---
    fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ name, ...answers, totalScore }),
        headers: { "Content-Type": "application/json" }
    }).catch(err => console.error("Fehler beim Speichern der Ergebnisse:", err));

    submitBtn.disabled = true;
    document.getElementById("participantName").disabled = true;
});

// --- Initialize ---
document.getElementById("participantName").placeholder = "Ihr Name";
document.getElementById("submit").textContent = "Quiz absenden";

// --- Render quiz and create sheet headers ---
renderQuiz();
createSheetHeaders();
