export const PROXY_URL =
  "https://script.google.com/macros/s/AKfycbx26lp5I0nC3TLyJZir_GkwTmLHo4L3d3jKHvbxUhLJDSVwJqYl-WasABaLKgfYjjaPRA/exec";

export const MODELS = [
  "openrouter/auto", // Резервный вариант: автоматический выбор лучшей бесплатной
];

export const POINT_VALUES = {
  "single-choice": 1,
  "multi-choice": 2,
  "output-predictor": 2,
  "bug-hunter": 1,
  code: 5,
};

function buildPrompt(task) {
  const mode = task.mode;
  const diff = task.difficulty;

  // Difficulty-specific instruction for prompt quality
  const difficultyGuide = {
    Easy: "Задача уровня Junior — базовые концепции, простые примеры. Не слишком тривиально, но и не сложно.",
    Medium:
      "Задача уровня Middle — ловушки языка, неочевидное поведение, паттерны. Требует опыта.",
    Hard: "Задача уровня Senior — тонкости спецификации ECMAScript, edge-cases, продвинутые концепции. Реальный уровень собеседования в топ-компанию.",
  };

  // Mode-specific schema instructions
  const modeSchemas = {
    "single-choice": `{
  "title": "Короткое название задачи",
  "description": "Полный текст вопроса",
  "options": ["Вариант A", "Вариант B", "Вариант C", "Вариант D"],
  "correctAnswer": "Правильный вариант (точное совпадение с одним из options)",
  "solution": "Объяснение почему этот ответ правильный"
}`,
    "multi-choice": `{
  "title": "Короткое название задачи",
  "description": "Полный текст вопроса (укажите что нужно выбрать ВСЕ правильные)",
  "options": ["A", "B", "C", "D", "E"],
  "correctAnswer": ["Правильный A", "Правильный B"],
  "solution": "Объяснение"
}`,
    "output-predictor": `{
  "title": "Название",
  "description": "Что выведет данный код?",
  "initialCode": "let x = 5;\\nconsole.log(x + 3);",
  "expectedOutput": "8",
  "correctAnswer": "8",
  "solution": "Объяснение вычисления"
}`,
    "bug-hunter": `{
  "title": "Название",
  "description": "Найдите строку с ошибкой",
  "initialCode": "1: код строка 1\\n2: код строка 2\\n3: код строка 3",
  "correctAnswer": 2,
  "solution": "Объяснение ошибки на строке 2"
}`,
    code: `{
        "title": "Название",
        "description": "Описание задачи",
        "initialCode": "function solve(a, b) {\\n  // { params: [1, 2], expected: 3 }\\n  // ваш код\\n}",
        "tests": [
          {"params": [1, 2], "expected": 3}
        ],
        "solution": "function solve(a, b) { return a + b; }",
        "testTemplate": "return solve("
      }`,
  };
  const modeSpecificRules = {
    "single-choice":
      "КРИТИЧЕСКОЕ ПРАВИЛО: Это строго ТЕОРЕТИЧЕСКИЙ режим. В вопросе НЕ должно быть исходного кода. Спрашивай только про концепции, особенности спецификации или теорию. НЕ используй фразы 'что выведет код'.",
    "multi-choice":
      "КРИТИЧЕСКОЕ ПРАВИЛО: Это строго ТЕОРЕТИЧЕСКИЙ режим. Спрашивай теорию, где нужно выбрать несколько правильных утверждений. Код в вопросе давать нельзя.",
    "output-predictor":
      "КРИТИЧЕСКОЕ ПРАВИЛО: Режим предсказания вывода. Напиши блок кода (положи в initialCode) и спроси 'Что выведет этот код?'.",
    "bug-hunter":
      "КРИТИЧЕСКОЕ ПРАВИЛО: Найди баг. Напиши код с одной ошибкой. Строки должны начинаться с номера: '1: ...', '2: ...'.",
    code: "КРИТИЧЕСКОЕ ПРАВИЛО: Задача на умение писать длинный код. Избегай написания сложных парсеров. Ориентируйся на манипуляции с массивами, объектами и строками.",
  };

  return `Ты — генератор технических задач для платформы подготовки JavaScript разработчиков к собеседованиям.

ОРИГИНАЛЬНАЯ ЗАДАЧА ДЛЯ РЕФРЕНСА:
${JSON.stringify(task, null, 2)}

ИНСТРУКЦИИ:
1. Сгенерируй НОВУЮ задачу на ту же тему: "${task.topic}"
2. Сложность: ${diff}. ${difficultyGuide[diff] || difficultyGuide.Easy}
3. Режим: "${mode}" — структура JSON должна точно соответствовать этой схеме:
${modeSchemas[mode] || modeSchemas["single-choice"]}
4. Задача должна быть ДРУГОЙ по содержанию, но РАВНОЙ по сложности и теме
5. Все тексты на РУССКОМ языке
6. Для mode "code" — ОБЯЗАТЕЛЬНО включи массив tests с минимум 3 тестами
7. Для mode "output-predictor" — ОБЯЗАТЕЛЬНО задай и expectedOutput И correctAnswer (одинаковое значение)
8. Для mode "bug-hunter" — correctAnswer это ЧИСЛО (номер строки с ошибкой), initialCode пронумерован: "1: ...\n2: ..."
9. НЕ копируй оригинальную задачу — придумай новую ситуацию на ту же тему
10. Ответь ТОЛЬКО raw JSON объектом. Без markdown, без пояснений, без \`\`\`
11. ${modeSpecificRules[mode] || ""}`;
}

export async function generateAiTask(originalTask) {
  const prompt = buildPrompt(originalTask);

  for (const modelId of MODELS) {
    try {
      console.log(`🤖 AI Agent → ${modelId}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(PROXY_URL, {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: "system",
              content:
                "Output ONLY raw JSON. No markdown. No backticks. No text before or after.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        console.warn(`⚠ ${modelId} returned ${response.status}`);
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || data.content || "";

      const startIdx = text.indexOf("{");
      const endIdx = text.lastIndexOf("}");
      if (startIdx === -1) {
        console.warn(`⚠ ${modelId}: No JSON object found in response`);
        continue;
      }

      const cleanedText = text.substring(startIdx, endIdx + 1);
      const newTask = JSON.parse(cleanedText);

      if (!newTask.title || !newTask.description) {
        console.warn(`⚠ ${modelId}: Generated task missing title/description`);
        continue;
      }

      const finalTask = {
        ...newTask,
        id: `ai-${originalTask.id}-${Date.now()}`,
        originalId: originalTask.id,
        card: originalTask.card,
        difficulty: originalTask.difficulty,
        stack: originalTask.stack,
        topic: originalTask.topic,
        module: originalTask.module,
        mode: originalTask.mode,
        isAiGenerated: true,
      };

      if (
        originalTask.mode === "output-predictor" &&
        !finalTask.expectedOutput
      ) {
        finalTask.expectedOutput = String(finalTask.correctAnswer || "");
      }
      if (originalTask.mode === "bug-hunter") {
        finalTask.correctAnswer = Number(finalTask.correctAnswer);
      }

      console.log(`✅ AI task generated via ${modelId}:`, finalTask.title);
      return finalTask;
    } catch (error) {
      console.error(`❌ ${modelId} failed:`, error.message);
    }
  }
  throw new Error("Все AI узлы недоступны. Попробуйте позже.");
}

export const checkTeoriaAnswers = async ({
  card,
  module,
  stack,
  answers,
  questions,
}) => {
  const questionsData = questions.map((q) => ({
    id: q.id,
    question: q.question,
    userAnswer: String(answers[q.id] || "").trim(), // Убираем пробелы
    expected: q.expected,
    keywords: q.keywords || [],
  }));

  // Формируем более структурированный список для промпта
  const contextList = questionsData
    .map(
      (q) =>
        `---
ID: ${q.id}
QUESTION: ${q.question}
USER_ANSWER: "${q.userAnswer}"
KEYWORDS_REQUIRED: ${q.keywords.join(", ")}`,
    )
    .join("\n");

  const prompt = `Ты — строгий технический интервьюер. Оцени ответы студента по JavaScript.

ПРАВИЛА ОЦЕНКИ:
1. Если USER_ANSWER содержит бессмысленный набор букв (например: "asdasd", "qwerty", "123123", "sdasdas"), случайные символы или текст, не относящийся к теме вопроса — ОЦЕНКА СТРОГО 0%.
2. Если USER_ANSWER пустой — ОЦЕНКА 0%.
3. Если ответ по теме, но неточный — 30-50%.
4. Если ответ содержит ключевые слова (KEYWORDS_REQUIRED) и верно объясняет суть — 80-100%.

ФОРМАТ ОТВЕТА:
Выдай ТОЛЬКО JSON массив объектов: [{"id": "...", "percent": число, "comment": "..."}]

ДАННЫЕ ДЛЯ ПРОВЕРКИ:
${contextList}`;

  for (const modelId of MODELS) {
    try {
      console.log(`🧠 AI Theory Checker → ${modelId}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      const response = await fetch(PROXY_URL, {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: "system",
              content:
                "Ты — API-валидатор. Твоя задача — проверять осмысленность ответов. На мусорные строки всегда отвечай 0% процентов. Выход только JSON.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      clearTimeout(timeoutId);
      console.log("Response status:", response.status);
      if (!response.ok) {
        console.log("Response not ok, continuing...");
        continue;
      }

      const data = await response.json();
      console.log("Response data:", data);
      const text = data.choices?.[0]?.message?.content || data.content || "";

      // Находим и парсим JSON (как в твоем коде)
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.log("No JSON found in response, continuing...");
        continue;
      }

      const results = JSON.parse(jsonMatch[0]);

      const totalPercent = Math.round(
        results.reduce((sum, r) => sum + (Number(r.percent) || 0), 0) /
          results.length,
      );

      return { results, totalPercent };
    } catch (error) {
      console.error(`❌ ${modelId} failed:`, error.message);
    }
  }
  throw new Error("Ошибка проверки");
};
