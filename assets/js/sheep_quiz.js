// --- Quiz Data ---
const quizQuestions = [
    {
        type: "single",
        question: "How many stomach compartments does a sheep have?",
        options: ["2", "4", "1"],
        correct: "4",
        points: 1
    },
    {
        type: "single",
        question: "What is a baby sheep called?",
        options: ["calf", "lamb", "foal"],
        correct: "lamb",
        points: 1
    },
    {
        type: "multiple",
        question: "Which of these are breeds of sheep?",
        options: ["Merino", "Holstein", "Angus"],
        correct: ["Merino"],
        points: 1
    },
    {
        type: "text",
        question: "Type the animal sound sheep make (in English):",
        correct: ["baa", "baaa"],
        points: 1
    }
];

// --- Google Script endpoint ---
const endpoint = "https://script.google.com/macros/s/AKfycbxZijIvdLiQPVi6d1IAGz_WaPjey_AA45-vMy9QCaz7ddm7EpWm6lI3BFFRFqFLw_iN/exec"; // Replace with your deployed Google Apps Script URL

// --- Render Quiz ---
function renderQuiz() {
    const quizDiv = document.getElementById("quiz");
    quizDiv.innerHTML = "";

    quizQuestions.forEach((q, i) => {
        const qDiv = document.createElement("div");
        qDiv.className = "quiz-question";

        const qTitle = document.createElement("p");
        qTitle.textContent = `${i + 1}. ${q.question}`;
        qDiv.appendChild(qTitle);

        if (q.type === "single") {
            q.options.forEach(opt => {
                const label = document.createElement("label");
                label.innerHTML = `<input type="radio" name="q${i}" value="${opt}"> ${opt}<br>`;
                qDiv.appendChild(label);
            });
        } else if (q.type === "multiple") {
            q.options.forEach(opt => {
                const label = document.createElement("label");
                label.innerHTML = `<input type="checkbox" name="q${i}" value="${opt}"> ${opt}<br>`;
                qDiv.appendChild(label);
            });
        } else if (q.type === "text") {
            const input = document.createElement("input");
            input.type = "text";
            input.name = `q${i}`;
            input.placeholder = "Your answer";
            qDiv.appendChild(input);
        }

        quizDiv.appendChild(qDiv);
    });
}

// --- Handle Submit ---
document.getElementById("submit").addEventListener("click", () => {
    const submitBtn = document.getElementById("submit");
    if (submitBtn.disabled) return;

    const name = document.getElementById("participantName").value || "Anonymous";
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
            const selected = Array.from(document.querySelectorAll(`input[name="q${i}"]:checked`))
                .map(input => input.value);
            userAnswer = selected;

            const correctSet = new Set(q.correct);
            const selectedSet = new Set(selected);
            const perOptionScore = q.points / q.correct.length;

            selected.forEach(opt => {
                if (correctSet.has(opt)) questionScore += perOptionScore;
                else questionScore -= perOptionScore; // wrong selection deducts
            });
            if (questionScore < 0) questionScore = 0;
        } else if (q.type === "text") {
            const input = document.querySelector(`input[name="q${i}"]`);
            userAnswer = input.value.trim().toLowerCase();
            const correctAnswersLower = q.correct.map(a => a.toLowerCase());
            if (correctAnswersLower.includes(userAnswer)) questionScore = q.points;
        }

        totalScore += questionScore;
        answers[`q${i}`] = userAnswer;
        answers[`score_q${i}`] = questionScore.toFixed(2);
    });

    // Show feedback & highlight
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "";

    quizQuestions.forEach((q, i) => {
        const userAnswer = answers[`q${i}`];
        const questionScore = answers[`score_q${i}`];
        const qNumber = i + 1;

        if (q.type === "single") {
            const inputs = document.querySelectorAll(`input[name="q${i}"]`);
            inputs.forEach(input => {
                input.disabled = true;
                const parentLabel = input.parentElement;
                if (input.value === q.correct) {
                    parentLabel.style.color = "green";
                    parentLabel.style.fontWeight = "bold";
                }
                if (input.checked && input.value !== q.correct) {
                    parentLabel.style.color = "red";
                    parentLabel.style.fontWeight = "bold";
                }
            });
            const correct = userAnswer === q.correct;
            resultDiv.innerHTML += `<p style="color:${correct ? 'green' : 'red'};">${qNumber}. ${q.question}: ${correct ? 'Correct ✅' : `Wrong ❌ (Correct: ${q.correct})`} (Score: ${questionScore})</p>`;

        } else if (q.type === "multiple") {
            const inputs = document.querySelectorAll(`input[name="q${i}"]`);
            inputs.forEach(input => input.disabled = true);
            const correctSet = new Set(q.correct);

            inputs.forEach(input => {
                const parentLabel = input.parentElement;
                if (input.checked && correctSet.has(input.value)) {
                    parentLabel.style.color = "green"; // correct selection
                    parentLabel.style.fontWeight = "bold";
                } else if (!input.checked && correctSet.has(input.value)) {
                    parentLabel.style.color = "orange"; // missed correct option
                    parentLabel.style.fontWeight = "bold";
                } else if (input.checked && !correctSet.has(input.value)) {
                    parentLabel.style.color = "red"; // wrong selection
                    parentLabel.style.fontWeight = "bold";
                }
            });

            resultDiv.innerHTML += `<p style="color:blue;">${qNumber}. ${q.question}: Selected: ${Array.isArray(userAnswer) ? userAnswer.join(", ") : userAnswer} (Score: ${questionScore})</p>`;

        } else if (q.type === "text") {
            const input = document.querySelector(`input[name="q${i}"]`);
            input.disabled = true;
            const correctAnswersLower = q.correct.map(a => a.toLowerCase());
            const correct = correctAnswersLower.includes(userAnswer);
            input.style.color = correct ? "green" : "red";
            input.style.fontWeight = "bold";
            resultDiv.innerHTML += `<p style="color:${correct ? 'green' : 'red'};">${qNumber}. ${q.question}: ${correct ? 'Correct ✅' : `Wrong ❌ (Correct: ${q.correct.join(", ")})`} (Score: ${questionScore})</p>`;
        }
    });

    resultDiv.innerHTML += `<h3>Total Score: ${totalScore.toFixed(2)}/${quizQuestions.reduce((sum, q) => sum + q.points, 0)}</h3>`;

    // Send results to Google Sheets
    fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({ name, ...answers, totalScore: totalScore.toFixed(2) }),
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json())
        .then(data => console.log("Saved!", data))
        .catch(err => console.error("Error:", err));

    // Disable submit button and name input
    submitBtn.disabled = true;
    document.getElementById("participantName").disabled = true;
});

// --- Initialize ---
renderQuiz();
