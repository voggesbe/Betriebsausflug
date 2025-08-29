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
        question: "Welches Geräusch macht ein Schaf (auf Englisch)?",
        correct: ["baa", "baaa"],
        points: 1
    },
    {
        type: "single",
        question: "Wie nennt man die Wolle eines Schafs, bevor sie geschoren wird?",
        options: ["Vlies", "Fell", "Pelz"],
        correct: "Vlies",
        points: 1
    },
    {
        type: "multiple",
        question: "Welche Tiere leben typischerweise in einer Herde?",
        options: ["Schaf", "Löwe", "Ziege", "Elefant"],
        correct: ["Schaf", "Ziege", "Elefant"],
        points: 3
    },
    {
        type: "single",
        question: "Was ist die Lieblingsnahrung von Schafen?",
        options: ["Gras", "Fleisch", "Obst"],
        correct: "Gras",
        points: 1
    },
    {
        type: "text",
        question: "Auf Deutsch: Wie nennt man einen männlichen Schafbock?",
        correct: ["Widder"],
        points: 1
    }
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
            const correctLower = q.correct.map(a => a.toLowerCase());
            if (correctLower.includes(userAnswer)) questionScore = q.points;
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
            const correctLower = q.correct.map(a => a.toLowerCase());
            const correct = correctLower.includes(userAnswer);
            input.style.color = correct ? "green" : "red";
            input.style.fontWeight = "bold";

            if (!correct) {
                const p = document.createElement("p");
                p.textContent = `Richtige Antwort: ${q.correct.join(", ")} (Punkte: ${questionScore})`;
                p.style.color = "#ff6600";
                fbBox.appendChild(p);
            }
        }

        resultDiv.appendChild(fbBox);
    });

    const totalH3 = document.createElement("h3");
    totalH3.textContent = `Gesamtpunkte: ${totalScore.toFixed(2)}/${quizQuestions.reduce((sum, q) => sum + q.points, 0)}`;
    totalH3.style.color = "#333";
    totalH3.style.textAlign = "center";
    totalH3.style.marginTop = "1rem";
    resultDiv.appendChild(totalH3);

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
