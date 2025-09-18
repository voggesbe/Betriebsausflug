// --- Quiz Data (German) ---
// IMPORTANT: keep correct types consistent: single -> string, multiple -> array, text -> array (we normalize anyway)
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
        correct: "Waagrecht gestellte Schlitze",
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
        correct: ["Feta", "Roquefort", "Pecorino"],
        points: 2

    },
    {
        type: "text",
        question: "Welches Schaf wurde 1996 als erstes Säugetier der Welt geklont?",
        correct: ["Dolly"],
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
        correct: ["China"],
        points: 3

    },
    {
        type: "single",
        question: "Wie groß sind traditionelle Herden von Wanderschäfern in Mitteleuropa?",
        options: ["bis zu 100 Tieren", "bis zu 500 Tieren", "bis über 1000 Tiere"],
        correct: "bis über 1000 Tiere",
        points: 2

    },
];

// --- Google Script endpoint ---
const endpoint = "https://script.google.com/macros/s/AKfycbxZijIvdLiQPVi6d1IAGz_WaPjey_AA45-vMy9QCaz7ddm7EpWm6lI3BFFRFqFLw_iN/exec";

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
    const headers = ["Timestamp", "Teilnehmer Name"].concat(
        quizQuestions.flatMap((q, i) => [`Frage ${i + 1} Antwort`, `Frage ${i + 1} Punkte`])
    ).concat(["Gesamt Punkte"]);

    const params = new URLSearchParams({
        action: "createHeaders",
        headers: JSON.stringify(headers)
    });

    fetch(`${endpoint}?${params.toString()}`)
        .then(r => r.text())
        .then(console.log)
        .catch(err => console.error("Header creation failed:", err));
}


// --- scoring helper for text questions ---
function scoreTextQuestion(userRaw, q) {
    // normalize correct answers
    const correctArray = (Array.isArray(q.correct) ? q.correct : [q.correct]).map(a => (a || "").trim().toLowerCase());
    const correctSet = new Set(correctArray.filter(Boolean));

    // normalize user input: split on commas, semicolons, slash, "und", "and"
    const userAnswers = (userRaw || "")
        .split(/,|;|\/|\bund\b|\band\b/i)
        .map(s => s.trim().toLowerCase())
        .filter(Boolean);

    const uniqueUser = Array.from(new Set(userAnswers));

    const expectedCount = q.expectedCount || 1;
    const perAnswerScore = q.points / expectedCount;

    const correctMatches = uniqueUser.filter(a => correctSet.has(a)).length;
    const wrongAnswers = uniqueUser.filter(a => !correctSet.has(a)).length;

    // award per correct match, subtract same amount for wrongs, clamp at 0
    let questionScore = perAnswerScore * correctMatches - perAnswerScore * wrongAnswers;
    if (questionScore < 0) questionScore = 0;

    // round to 2 decimals
    return { score: Math.round(questionScore * 100) / 100, userAnswers: uniqueUser };
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
            const raw = input ? input.value : "";
            const res = scoreTextQuestion(raw, q);
            questionScore = res.score;
            userAnswer = res.userAnswers; // array of parsed answers
        }

        totalScore += questionScore;
        answers[`q${i}`] = userAnswer;
        answers[`score_q${i}`] = (Math.round(questionScore * 100) / 100).toFixed(2);
    });

    // --- Show feedback ---
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    quizQuestions.forEach((q, i) => {
        const userAnswer = answers[`q${i}`];
        const questionScore = parseFloat(answers[`score_q${i}`]);
        const qNumber = i + 1;

        const fbBox = document.createElement("div");
        fbBox.className = "feedback-box";

        const fbTitle = document.createElement("h4");
        fbTitle.textContent = `${qNumber}. ${q.question}`;
        fbBox.appendChild(fbTitle);

        // Helper to show correct answers only if needed
        const showCorrectAnswers = () => {
            const p = document.createElement("p");
            const correctArray = Array.isArray(q.correct) ? q.correct : [q.correct];
            p.textContent = `Richtige Antwort(en): ${correctArray.join(", ")} (Punkte: ${questionScore}) von ${q.points}`;
            p.style.color = "#ff6600";
            p.style.fontSize = "inherit";
            fbBox.appendChild(p);
        };

        if (q.type === "single") {
            const inputs = document.querySelectorAll(`input[name="q${i}"]`);
            let fullyCorrect = true;

            inputs.forEach(input => {
                input.disabled = true;
                const label = input.parentElement;
                const optionText = input.value;

                if (input.checked && input.value === q.correct) {
                    label.innerHTML = `✅ ${optionText}`;
                    label.classList.add("correct");
                } else if (input.checked && input.value !== q.correct) {
                    label.innerHTML = `❌ ${optionText}`;
                    label.classList.add("wrong");
                    fullyCorrect = false;
                } else if (!input.checked && input.value === q.correct) {
                    fullyCorrect = false;
                }
            });

            if (!fullyCorrect) showCorrectAnswers();
        }

        else if (q.type === "multiple") {
            const inputs = document.querySelectorAll(`input[name="q${i}"]`);
            const correctSet = new Set(q.correct);
            let fullyCorrect = true;

            inputs.forEach(input => {
                input.disabled = true;
                const label = input.parentElement;
                const optionText = input.value;

                if (input.checked && correctSet.has(input.value)) {
                    label.innerHTML = `✅ ${optionText}`;
                    label.classList.add("correct");
                } else if (!input.checked && correctSet.has(input.value)) {
                    label.innerHTML = `⚠️ ${optionText}`;
                    label.classList.add("missed");
                    fullyCorrect = false;
                } else if (input.checked && !correctSet.has(input.value)) {
                    label.innerHTML = `❌ ${optionText}`;
                    label.classList.add("wrong");
                    fullyCorrect = false;
                }
            });

            if (!fullyCorrect) showCorrectAnswers();
        }

        else if (q.type === "text") {
            const input = document.querySelector(`input[name="q${i}"]`);
            input.disabled = true;

            const userAnswerRaw = input.value.trim().toLowerCase();
            const userAnswers = userAnswerRaw.split(/,|und/).map(a => a.trim()).filter(Boolean);

            const correctArray = Array.isArray(q.correct) ? q.correct : [q.correct];
            const correctLower = correctArray.map(a => a.toLowerCase());

            const rightAnswers = userAnswers.filter(ans => correctLower.includes(ans));
            const wrongAnswers = userAnswers.filter(ans => !correctLower.includes(ans));

            input.style.display = "none"; // hide the text input

            const responseDiv = document.createElement("div");
            responseDiv.style.fontSize = "inherit";

            const fullyCorrect = rightAnswers.length === correctArray.length && wrongAnswers.length === 0;

            const userFeedback = rightAnswers.map(ans => {
                const original = correctArray.find(c => c.toLowerCase() === ans);
                return `<span style="color:green; font-weight:bold;">✅ ${original}</span>`;
            }).concat(wrongAnswers.map(ans => `<span style="color:red; font-weight:bold;">❌ ${ans}</span>`)).join(", ");

            responseDiv.innerHTML = userFeedback;
            fbBox.appendChild(responseDiv);

            if (!fullyCorrect) showCorrectAnswers();
        }

        resultDiv.appendChild(fbBox);
    });


    // Gesamtpunktzahl und Bewertungstext anzeigen
    const totalH3 = document.createElement("h3");
    const maxScore = quizQuestions.reduce((sum, q) => sum + q.points, 0);
    totalH3.textContent = `Gesamtpunkte: ${totalScore}/${maxScore}`;
    totalH3.style.color = "#333";
    totalH3.style.textAlign = "center";
    totalH3.style.marginTop = "1rem";

    // Bewertung anhand der Gesamtpunkte mit Icons & Hintergrundfarbe
    let bewertung = "";
    let icon = "";
    let bgColor = "";

    if (totalScore <= 5) {
        bewertung = "Schäfchenzähler";
        icon = "🐑";
        bgColor = "#fff8c4"; // soft yellow
    } else if (totalScore <= 12) {
        bewertung = "Hütehund-Niveau";
        icon = "🐕";
        bgColor = "#cce5ff"; // light blue
    } else if (totalScore <= 20) {
        bewertung = "Erfahrener Schäfer";
        icon = "👨‍🌾";
        bgColor = "#d4edda"; // light green
    } else {
        bewertung = "Schafmeister";
        icon = "👑🐑";
        bgColor = "#ffe5b4"; // gold/light orange
    }

    // Container for rating
    const ratingDiv = document.createElement("div");
    ratingDiv.style.backgroundColor = bgColor;
    ratingDiv.style.padding = "1rem";
    ratingDiv.style.marginTop = "1rem";
    ratingDiv.style.textAlign = "center";
    ratingDiv.style.borderRadius = "12px";
    ratingDiv.style.fontWeight = "bold";
    ratingDiv.style.fontSize = "inherit";
    ratingDiv.textContent = `${icon} ${bewertung}`;

    resultDiv.appendChild(totalH3);
    resultDiv.appendChild(ratingDiv);



    // --- Prepare row and send results to Google Sheets ---
    const timestamp = new Date().toLocaleString();
    const row = [timestamp, name];
    quizQuestions.forEach((q, i) => {
        const ans = answers[`q${i}`];
        const displayAns = Array.isArray(ans) ? ans.join("; ") : (ans === undefined || ans === null ? "" : ans);
        row.push(displayAns);
        row.push(answers[`score_q${i}`]);
    });
    row.push(Math.round(totalScore * 100) / 100);

    const params = new URLSearchParams({
        action: "appendRow",
        row: JSON.stringify(row)
    });

    fetch(`${endpoint}?${params.toString()}`)
        .then(r => r.text())
        .then(console.log)
        .catch(err => console.error("Fehler beim Speichern der Ergebnisse:", err));

});

// --- Initialize ---
document.getElementById("participantName").placeholder = "Dein Name";
document.getElementById("submit").textContent = "Quiz absenden";
renderQuiz();
createSheetHeaders();
