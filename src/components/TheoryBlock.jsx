import React, { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Send,
  ArrowLeft,
  Copy,
  Check,
  Sun,
  Moon,
} from "lucide-react";

const CopyButton = ({ code, codeKey }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <button
      className={`code-copy-btn ${copied ? "copied" : ""}`}
      onClick={handleCopy}
      title={copied ? "Скопировано!" : "Копировать"}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

const handleEditorWillMount = (monaco) => {
  monaco.editor.defineTheme("vs-tactical", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "function", foreground: "d2a8ff" },
    ],
    colors: {
      "editor.background": "#1e2128",
      "editor.foreground": "#ffffff",
      "editor.lineHighlightBackground": "#161b22",
      "editor.selectionBackground": "#264f78",
      "editorCursor.foreground": "#58a6ff",
      "editorIndentGuide.background": "#404040",
    },
  });

  monaco.editor.defineTheme("vs-tactical-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "6a737d", fontStyle: "italic" },
      { token: "keyword", foreground: "cf222e" },
      { token: "string", foreground: "0a3069" },
      { token: "number", foreground: "0550ae" },
      { token: "function", foreground: "8250df" },
    ],
    colors: {
      "editor.background": "#e8e0d4",
      "editor.foreground": "#2d2520",
      "editor.lineHighlightBackground": "#d4c4b0",
      "editor.selectionBackground": "#b4a890",
      "editorCursor.foreground": "#2d2520",
      "editorIndentGuide.background": "#c4b4a0",
    },
  });
};

const parseQuestionWithCode = (questionText) => {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(questionText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: questionText.slice(lastIndex, match.index),
      });
    }
    parts.push({
      type: "code",
      content: match[1].trim(),
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < questionText.length) {
    parts.push({
      type: "text",
      content: questionText.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: questionText }];
};

const tokenizeCode = (code) => {
  const tokens = [];
  const keywords = /\b(var|let|const|function|return|if|else|for|while|do|switch|case|break|continue|new|typeof|instanceof|try|catch|finally|throw|class|extends|import|export|default|from|async|await|yield|static|get|set|of|in)\b/g;
  const builtins = /\b(Array|Object|String|Number|Boolean|Function|Symbol|Map|Set|WeakMap|WeakSet|Promise|Date|Math|JSON|console|window|document|true|false|null|undefined|NaN|Infinity)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g;
  const comments = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const templateLiterals = /`(?:[^`\\]|\\.)*`/g;
  const regex = /\/(?:[^\/\\]|\\.)+\/[gimsuy]*/g;
  
  const allTokens = [];
  const patterns = [
    { regex: comments, type: "comment" },
    { regex: templateLiterals, type: "template" },
    { regex: strings, type: "string" },
    { regex: regex, type: "regex" },
    { regex: keywords, type: "keyword" },
    { regex: builtins, type: "builtin" },
    { regex: numbers, type: "number" },
  ];
  
  const processedRanges = [];
  
  patterns.forEach(({ regex: r, type }) => {
    let match;
    r.lastIndex = 0;
    while ((match = r.exec(code)) !== null) {
      processedRanges.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[0],
        type,
      });
    }
  });
  
  processedRanges.sort((a, b) => a.start - b.start);
  
  const filtered = [];
  for (const range of processedRanges) {
    let overlaps = false;
    for (const existing of filtered) {
      if (range.start >= existing.start && range.start < existing.end) {
        overlaps = true;
        break;
      }
    }
    if (!overlaps) {
      filtered.push(range);
    }
  }
  
  filtered.sort((a, b) => a.start - b.start);
  
  let pos = 0;
  for (const range of filtered) {
    if (range.start > pos) {
      tokens.push({ text: code.slice(pos, range.start), type: "plain" });
    }
    tokens.push({ text: range.text, type: range.type });
    pos = range.end;
  }
  if (pos < code.length) {
    tokens.push({ text: code.slice(pos), type: "plain" });
  }
  
  return tokens;
};

const highlightCode = (code) => {
  const lines = code.split("\n");
  return lines.map((line, lineIndex) => {
    const tokens = tokenizeCode(line);
    const lineNum = lineIndex + 1;
    const highlighted = tokens.map((t) => {
      if (t.type === "plain") {
        return t.text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      return `<span class="hl-${t.type}">${t.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</span>`;
    }).join("");
    return `<span class="code-line"><span class="line-num">${String(lineNum).padStart(2, " ")}</span><span class="line-content">${highlighted}</span></span>`;
  }).join("");
};

const TheoryBlock = ({
  teoriaTask,
  userAnswers,
  setUserAnswers,
  onSubmit,
  isSubmitting,
  results,
  onBack,
  onClearResults,
  isTheoryLocked,
  getCooldownRemaining,
}) => {
  const [expandedTheory, setExpandedTheory] = useState(false);
  const [answerEditors, setAnswerEditors] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const [theoryTheme, setTheoryTheme] = useState(
    () => localStorage.getItem("theoryTheme") || "dark"
  );

  const toggleTheoryTheme = () => {
    setTheoryTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("theoryTheme", next);
      return next;
    });
  };

  const handleCopyClick = useCallback((code, key) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }, []);

  const handleContainerClick = useCallback((e) => {
    const copyBtn = e.target.closest('.code-copy-btn');
    if (copyBtn) {
      e.preventDefault();
      e.stopPropagation();
      const code = decodeURIComponent(copyBtn.dataset.code || '');
      const key = copyBtn.dataset.codeKey || Date.now().toString();
      handleCopyClick(code, key);
    }
  }, [handleCopyClick]);

  const renderMarkdownWithCode = useCallback((text) => {
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    const codeBlocks = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        codeBlocks.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
          isFirst: codeBlocks.length === 0,
        });
      }
      codeBlocks.push({
        type: "code",
        content: match[2].trim(),
        lang: match[1] || "js",
        isFirst: codeBlocks.length === 0,
      });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      codeBlocks.push({
        type: "text",
        content: text.slice(lastIndex),
        isFirst: codeBlocks.length === 0,
      });
    }

    return codeBlocks.length > 0 ? codeBlocks : [{ type: "text", content: text, isFirst: true }];
  }, []);

  const processTextContent = (text) => {
    let step = 0;
    const codeBlocks = [];

    // 1. Вытащить код-блоки и заменить плейсхолдерами
    const withPlaceholders = text.replace(
      /```(\w+)?\n?([\s\S]*?)```/g,
      (match, lang, code) => {
        const key = `___CODE_BLOCK_${step}___`;
        codeBlocks.push({ key, code: code.trim(), lang: lang || "js" });
        step++;
        return key;
      }
    );

    // 2. Инлайн-форматирование (сбрасывает HTML-спецсимволы ПЕРЕД заменой тегов)
    const applyInline = (str) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/`([^`]+)`/g, '<span class="inline-code">$1</span>');

    // 3. Построчная обработка — списки flush-ятся на месте
    const lines = withPlaceholders.split("\n");
    const output = [];
    let listBuffer = [];
    let listType = null; // "dash" | "numbered"

    const flushList = () => {
      if (!listBuffer.length) return;
      const items = listBuffer
        .map((item, i) =>
          listType === "dash"
            ? `<li><span class="bullet">•</span>${item}</li>`
            : `<li><span class="list-num">${i + 1}.</span>${item}</li>`
        )
        .join("");
      output.push(`<ul class="theory-list">${items}</ul>`);
      listBuffer = [];
      listType = null;
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      // Плейсхолдер кода
      if (/^___CODE_BLOCK_\d+___$/.test(line)) {
        flushList();
        output.push(line);
        continue;
      }

      // H2
      const h2 = line.match(/^## (.+)$/);
      if (h2) {
        flushList();
        output.push(`<h2>${applyInline(h2[1])}</h2>`);
        continue;
      }

      // H3
      const h3 = line.match(/^### (.+)$/);
      if (h3) {
        flushList();
        output.push(`<h3>${applyInline(h3[1])}</h3>`);
        continue;
      }

      // Нумерованный список (не начинающийся с **)
      const numbered = line.match(/^(\d+)\. ([^*].+)$/);
      if (numbered) {
        if (listType === "dash") flushList();
        listType = "numbered";
        listBuffer.push(applyInline(numbered[2]));
        continue;
      }

      // Dash список
      const dash = line.match(/^- (.+)$/);
      if (dash) {
        if (listType === "numbered") flushList();
        listType = "dash";
        listBuffer.push(applyInline(dash[1]));
        continue;
      }

      // Пустая строка
      if (!line.trim()) {
        flushList();
        continue;
      }

      // Обычный текст
      flushList();
      output.push(`<p>${applyInline(line)}</p>`);
    }

    flushList();

    // 4. Подставить HTML кода вместо плейсхолдеров
    let html = output.join("\n");
    codeBlocks.forEach(({ key, code, lang }) => {
      const highlighted = highlightCode(code);
      const themeClass = theoryTheme === "light" ? " light" : "";
      const blockHtml = `<div class="theory-code-block${themeClass}" data-code="${encodeURIComponent(code)}"><div class="code-block-header"><span class="code-lang-label">${lang}</span><button class="code-copy-btn" data-code="${encodeURIComponent(code)}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button></div><div class="code-block-wrapper"><pre class="code-highlighted">${highlighted}</pre></div></div>`;
      html = html.replace(key, blockHtml);
    });

    return html;
  };

  const handleAnswerChange = (questionId, value) => {
    if (teoriaTask?.card && typeof setUserAnswers === "function") {
      setUserAnswers((prev) => ({
        ...prev,
        [teoriaTask.card]: {
          ...(prev[teoriaTask.card] || {}),
          [questionId]: value,
        },
      }));
    }
  };

  const isLocked =
    isTheoryLocked && teoriaTask?.card
      ? isTheoryLocked(teoriaTask.card)
      : false;
  const cooldownRemaining =
    getCooldownRemaining && teoriaTask?.card
      ? getCooldownRemaining(teoriaTask.card)
      : null;

  if (!teoriaTask) return null;

  return (
    <div className="theory-workspace">
      <div className={`theory-content-section ${theoryTheme}`}>
        <div className="theory-toggle-row">
          <button
            className={`theory-toggle-btn ${theoryTheme} ${expandedTheory ? "expanded" : ""}`}
            onClick={() => setExpandedTheory(!expandedTheory)}
          >
            <BookOpen size={16} />
            {expandedTheory ? "Скрыть теорию" : "Показать теорию"}
            {expandedTheory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            className={`theory-theme-btn ${theoryTheme}`}
            onClick={toggleTheoryTheme}
            title={theoryTheme === "dark" ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
          >
            {theoryTheme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>

        {expandedTheory && (
          <div
            className={`theory-text-content ${theoryTheme === "light" ? "light" : ""}`}
            dangerouslySetInnerHTML={{
              __html: processTextContent(teoriaTask.theory),
            }}
            onClick={handleContainerClick}
          />
        )}

        <div className="theory-questions-section">
          <h3 className={`questions-title ${theoryTheme}`}>Вопросы для самопроверки</h3>

          {teoriaTask.questions.map((q) => {
            const questionParts = parseQuestionWithCode(q.question);
            const questionResult = results?.results?.find(
              (r) => String(r.id) === String(q.id),
            );

            return (
              <div key={q.id} className={`theory-question-block ${theoryTheme}`}>
                <div className="question-header-block">
                  <span className={`question-number-block ${theoryTheme}`}>Вопрос {q.id}</span>
                  {questionResult && (
                    <span
                      className={`question-result-block ${questionResult.percent >= 70 ? "pass" : "fail"}`}
                    >
                      {questionResult.percent}%
                    </span>
                  )}
                </div>

                <div className={`question-text-block ${theoryTheme}`}>
                  {questionParts.map((part, idx) =>
                    part.type === "code" ? (
                      <div key={idx} className={`question-code-wrapper ${theoryTheme}`}>
                        <Editor
                          height="100px"
                          defaultLanguage="javascript"
                          theme="vs-tactical"
                          value={part.content}
                          options={{
                            readOnly: true,
                            minimap: { enabled: false },
                            fontSize: 13,
                            lineNumbers: "off",
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                          }}
                          beforeMount={handleEditorWillMount}
                        />
                      </div>
                    ) : (
                      <span key={idx}>{part.content}</span>
                    ),
                  )}
                </div>

                <div className={`question-answer-editor ${theoryTheme}`}>
                  <Editor
                    height="80px"
                    defaultLanguage="javascript"
                    theme={theoryTheme === "light" ? "vs-tactical-light" : "vs-tactical"}
                    value={userAnswers[q.id] || ""}
                    onChange={(value) => handleAnswerChange(q.id, value || "")}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: "off",
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      placeholder: "Напиши свой ответ...",
                    }}
                    beforeMount={handleEditorWillMount}
                  />
                </div>

                {questionResult && (
                  <div className={`question-feedback-block ${theoryTheme}`}>
                    <span className={`feedback-label-block ${theoryTheme}`}>AI: </span>
                    {questionResult.feedback}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="theory-actions-section">
          {results ? (
            <div className="theory-result-block">
              <div
                className={`result-badge-block ${results.totalPercent >= 70 ? "pass" : "fail"}`}
              >
                {results.totalPercent >= 70 ? (
                  <CheckCircle size={20} />
                ) : (
                  <XCircle size={20} />
                )}
                <span>{results.totalPercent}%</span>
              </div>
              <p className="result-text-block">
                {results.totalPercent >= 70
                  ? "Отлично! Теория усвоена."
                  : "Нужно повторить теорию и попробовать снова."}
              </p>
              <button
                className="theory-retry-btn"
                onClick={() => {
                  if (teoriaTask?.card && onClearResults) {
                    onClearResults(teoriaTask.card);
                  }
                }}
              >
                Попробовать снова
              </button>
            </div>
          ) : isLocked ? (
            <div className="theory-locked-block">
              <span className="theory-locked-text">
                🔒 Теория недоступна. Попробуй через {cooldownRemaining}
              </span>
            </div>
          ) : (
            <button
              className={`theory-submit-btn ${theoryTheme}`}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (typeof onSubmit === "function") {
                  onSubmit();
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" />
                  Проверяю...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Проверить ответы
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheoryBlock;
