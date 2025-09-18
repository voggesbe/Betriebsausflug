---
layout: page
title: Schaf-Quiz 🐑
no_sidebar: true
hide_until_date: '2025-09-19T07:30:00'  # ISO format date-time (optional)
---

<div id="quiz-container">
  <label><strong>Name:</strong> <input type="text" id="participantName" placeholder="Ihr Name"></label>
  <div id="quiz"></div>
  <button id="submit">Quiz absenden</button>
  <div id="result"></div>
</div>

<script src="{{ '/assets/js/sheep_quiz.js' | relative_url }}"></script>