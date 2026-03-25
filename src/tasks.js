export const tasks = [
    {
        id: -1,
        title: "TUTORIAL 1: Basic Logic",
        difficulty: "Easy",
        topic: "Training",
        stack: "JavaScript",
        module: "Ознакомление",
        mode: "code",
        description: "Welcome! Your first objective: return exactly 100. Type 'return 100;' below.",
        initialCode: "function getLevel() {\n  // Type return 100; here\n}",
        testTemplate: "return getLevel();",
        tests: [{ params: [], expected: 100 }],
        solution: "HINT: Напишите return 100; внутри функции.\n\nCODE:\nfunction getLevel() {\n  return 100;\n}"
    },
    {
        id: -2,
        title: "TUTORIAL 2: Quick Choice",
        difficulty: "Easy",
        topic: "Training",
        stack: "JavaScript",
        mode: "single-choice",
        description: "How many levels of difficulty do we have?",
        options: ["1", "3 (Easy, Medium, Hard)", "5", "Infinite"],
        correctAnswer: "3 (Easy, Medium, Hard)",
        solution: "We have 3 main levels of difficulty."
    },
    {
        id: -3,
        title: "TUTORIAL 3: Predictor",
        difficulty: "Easy",
        topic: "Training",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "What will 5 + 5 return? Type the number in the box.",
        initialCode: "console.log(5 + 5);",
        expectedOutput: "10",
        solution: "5 + 5 equals 10."
    },
    {
        id: -4,
        title: "TUTORIAL 4: Bug Hunter",
        difficulty: "Easy",
        topic: "Training",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "One line has a syntax error. Find and click it! (Hint: Look for the missing quote)",
        initialCode: "1: const ok = 'valid';\n2: const bad = 'broken;\n3: console.log(ok);",
        correctAnswer: ["2"],
        solution: "Line 2 is missing a closing quote."
    },
    {
        id: -5,
        title: "TUTORIAL 5: UI Styling",
        difficulty: "Easy",
        topic: "Training",
        stack: "Layout",
        mode: "ui-layout",
        description: "Set the background of '.box' to 'red'.",
        initialHtml: "<div class='box'></div>",
        initialCss: ".box { width: 100px; height: 100px; background: blue; }",
        validationSelectors: [
            { selector: ".box", property: "background-color", expected: "rgb(255, 0, 0)" }
        ],
        solution: ".box { background: red; }"
    },
    {
        id: -6,
        title: "TUTORIAL 6: The Final Test",
        difficulty: "Easy",
        topic: "Training",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Select all features you've seen so far.",
        options: ["Code Editor", "Heatmap", "Achievements", "Sound Effects"],
        correctAnswer: ["Code Editor", "Heatmap", "Achievements", "Sound Effects"],
        solution: "You've seen them all! Ready to start real missions?"
    },

    // --- TypeScript (TS) ---
    {
        id: 10000,
        title: "Basic Interface",
        difficulty: "Easy",
        topic: "Interfaces",
        stack: "TypeScript",
        mode: "code",
        description: "Реализуй функцию getUser, которая возвращает объект типа User с полями name (string) и age (number).",
        initialCode: "interface User {\n  name: string;\n  age: number;\n}\n\nfunction getUser(): User {\n  // твой код\n}",
        testTemplate: "return getUser();",
        tests: [{ params: [], expected: { name: "Alice", age: 25 } }],
        solution: "HINT: Объявите интерфейс User с нужными полями.\n\nCODE:\ninterface User {\n  name: string;\n  age: number;\n}\n\nfunction getUser(): User {\n  return { name: 'Alice', age: 25 };\n}"
    },
    {
        id: 10100,
        title: "Generic Filter",
        difficulty: "Hard",
        topic: "Generics",
        stack: "TypeScript",
        mode: "code",
        description: "Create a generic filter function.",
        initialCode: "function filterArr<T>(arr: T[], fn: (x: T) => boolean): T[] {\n  return arr.filter(fn);\n}",
        testTemplate: "return filterArr();",
        tests: [{ params: [[1, 2, 3], (x) => x > 1], expected: [2, 3] }],
        solution: "HINT: Используйте дженерик T для типа элементов массива.\n\nCODE:\nfunction filterItems<T>(items: T[], predicate: (item: T) => boolean): T[] {\n  return items.filter(predicate);\n}"
    },
    // --- React ---
    {
        id: 20000,
        title: "Counter State",
        difficulty: "Easy",
        topic: "Hooks",
        stack: "React",
        mode: "code",
        description: "Write the logic for the count state as a function returning the count.",
        initialCode: "function Counter() {\n  const [count, setCount] = React.useState(0);\n  return count;\n}",
        testTemplate: "return Counter();",
        tests: [{ params: [], expected: 0 }],
        solution: "HINT: Используйте useState для хранения числа и колбэк onClick для инкремента.\n\nCODE:\nfunction Counter() {\n  const [count, setCount] = React.useState(0);\n  return count;\n}"
    },
    // --- Git ---
    {
        id: 30000,
        title: "Basic Add",
        difficulty: "Easy",
        topic: "Commands",
        stack: "Git",
        mode: "single-choice",
        description: "Which command stages changes?",
        options: ["git commit", "git add", "git push", "git status"],
        correctAnswer: "git add",
        solution: "git add stages files for the next commit."
    },

    {
        id: 1,
        title: "Deep Equality with Type Coercion",
        difficulty: "Hard",
        topic: "Variables & Comparison",
        stack: "JavaScript",
        module: "Основы",
        mode: "code",
        // ... and so on for all tasks 1-80 ...
        description: "Реализуй функцию, которая сравнивает два значения. Если типы разные, она должна пытаться привести их к числу. Исключение: null и undefined равны между собой, но не равны 0.",
        initialCode: "function flexibleCompare(a, b) {\n  // твой код\n}",
        testTemplate: "return flexibleCompare(arguments[0], arguments[1]);",
        tests: [
            { params: ["5", 5], expected: true },
            { params: [null, undefined], expected: true },
            { params: [0, null], expected: false },
            { params: ["0", false], expected: true }
        ],
        solution: "HINT: Используем Number() для явного приведения и строгие проверки для null/undefined.\n\nCODE:\nfunction flexibleCompare(a, b) {\n  if (a === null && b === undefined) return true;\n  if (a === undefined && b === null) return true;\n  if (a === null || b === null || a === undefined || b === undefined) return false;\n  return Number(a) === Number(b);\n}"
    },
    {
        id: 2,
        title: "The 'use strict' Trap",
        difficulty: "Medium",
        topic: "Strict Mode",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код при выполнении в строгом режиме?",
        initialCode: "'use strict';\nfunction showThis() {\n  console.log(this);\n}\nshowThis();",
        expectedOutput: "undefined",
        solution: "HINT: В strict mode значение this по умолчанию в функциях — undefined, а не window/global.\n\nCODE:\nundefined"
    },
    {
        id: 3,
        title: "Bitwise Permissions",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Используя битовые операторы, проверь, есть ли у пользователя права на READ (4) и EXECUTE (1), если его текущая маска — 5.",
        initialCode: "function hasAccess(mask, ...flags) {\n  // твой код\n}",
        testTemplate: "return hasAccess(5, 4, 1);",
        tests: [
            { params: [5, 4, 1], expected: true },
            { params: [4, 4, 1], expected: false },
            { params: [7, 4, 2, 1], expected: true }
        ],
        solution: "HINT: Используем оператор & для сравнения масок.\n\nCODE:\nfunction hasAccess(mask, ...flags) {\n  return flags.every(f => (mask & f) === f);\n}"
    },
    {
        id: 4,
        title: "Nullish Coalescing Chain",
        difficulty: "Medium",
        topic: "Logical Operators",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Каков результат выражения: 0 ?? 'default' || 'fallback'?",
        options: ["0", "'default'", "'fallback'", "undefined"],
        correctAnswer: "0",
        solution: "HINT: ?? имеет более высокий приоритет, чем ||. 0 ?? 'default' дает 0, затем 0 || 'fallback' дает 'fallback'.\n\nCODE:\n'fallback'"
    },
    {
        id: 5,
        title: "Variable Hoisting & TDZ",
        difficulty: "Medium",
        topic: "Variables",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Найди строку, которая вызовет ReferenceError из-за временной мертвой зоны.",
        initialCode: "1: function check() {\n2:   console.log(x);\n3:   console.log(y);\n4:   var x = 10;\n5:   let y = 20;\n6: }",
        correctAnswer: ["3"],
        solution: "HINT: Переменные let попадают в TDZ до момента их объявления.\n\nCODE:\n3"
    },
    {
        id: 6,
        title: "Infinite Loop Guard",
        difficulty: "Hard",
        topic: "Loops",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши цикл, который суммирует числа от 1 до N, но прерывается, если сумма превышает лимит. Верни объект { sum, lastValue }.",
        initialCode: "function limitedSum(n, limit) {\n  // твой код\n}",
        testTemplate: "return limitedSum(10, 15);",
        tests: [
            { params: [10, 15], expected: { sum: 15, lastValue: 5 } },
            { params: [5, 100], expected: { sum: 15, lastValue: 5 } }
        ],
        solution: "HINT: Используем break при достижении лимита.\n\nCODE:\nfunction limitedSum(n, limit) {\n  let sum = 0;\n  for (let i = 1; i <= n; i++) {\n    if (sum + i > limit) return { sum, lastValue: i - 1 };\n    sum += i;\n    if (i === n) return { sum, lastValue: i };\n  }\n}"
    },
    {
        id: 7,
        title: "Arrow Function Arguments",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код?",
        initialCode: "const sum = () => arguments.length;\nconsole.log(sum(1, 2, 3));",
        expectedOutput: "ReferenceError",
        solution: "HINT: У стрелочных функций нет собственного объекта arguments.\n\nCODE:\nReferenceError"
    },
    {
        id: 8,
        title: "Implicit Coercion Quiz",
        difficulty: "Hard",
        topic: "Type Conversion",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Какие выражения вернут true?",
        options: [
            "[] == false",
            "null >= 0",
            "undefined == 0",
            "NaN === NaN",
            "'' == 0"
        ],
        correctAnswer: ["[] == false", "null >= 0", "'' == 0"],
        solution: "HINT: [] приводится к '', затем к 0. null >= 0 true, так как null приводится к 0 в сравнениях.\n\nCODE:\n['[] == false', 'null >= 0', \"'' == 0\"]"
    },
    {
        id: 9,
        title: "Function Declaration vs Expression",
        difficulty: "Medium",
        topic: "Function Expression",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Почему код упадет?",
        initialCode: "1: sayHi();\n2: var sayHi = function() {\n3:   console.log('Hi');\n4: };",
        correctAnswer: ["1"],
        solution: "HINT: Function Expression не всплывает как функция, только var sayHi (как undefined).\n\nCODE:\n1"
    },
    {
        id: 10,
        title: "Memoize Basic",
        difficulty: "Hard",
        topic: "Functions",
        stack: "JavaScript",
        mode: "code",
        description: "Реализуй мемоизатор. Твое решение будет протестировано через обертку testMemo.",
        initialCode: "function memoize(fn) {\n  const cache = {};\n  return (arg) => {\n    if (arg in cache) return cache[arg];\n    return cache[arg] = fn(arg);\n  };\n}\n\nfunction testMemo() {\n  let calls = 0;\n  const f = memoize(x => { calls++; return x*2; });\n  f(2); f(2);\n  return calls;\n}",
        testTemplate: "return testMemo();",
        tests: [
            { params: [], expected: 1 }
        ],
        solution: "HINT: Используем объект для хранения результатов по ключу arg.\n\nCODE:\nfunction memoize(fn) {\n  const cache = {};\n  return (arg) => {\n    if (arg in cache) return cache[arg];\n    return cache[arg] = fn(arg);\n  };\n}"
    },
    {
        id: 11,
        title: "Closure & Iteration",
        difficulty: "Hard",
        topic: "Loops & Closures",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код?",
        initialCode: "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
        expectedOutput: "3, 3, 3",
        solution: "HINT: var имеет функциональную область видимости, к моменту выполнения таймаута i уже равно 3.\n\nCODE:\n3, 3, 3"
    },
    {
        id: 12,
        title: "Switch Fallthrough",
        difficulty: "Medium",
        topic: "Switch",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что вернет вызов функции при x = 2? Предскажи вывод учитывая отсутствие break.",
        initialCode: "function test(x) {\n  switch(x) {\n    case 1: return 'A';\n    case 2: \n    case 3: return 'B';\n  }\n}\nconsole.log(test(2));",
        expectedOutput: "B",
        solution: "HINT: Switch работает по алгоритму Strict Equality (===). Отсутствие break в case 2 заставляет код провалиться в case 3.\n\nCODE:\n'B'"
    },
    {
        id: 13,
        title: "Object Property Logic",
        difficulty: "Hard",
        topic: "Data Types",
        stack: "JavaScript",
        mode: "code",
        description: "Создай функцию, которая принимает объект и возвращает количество свойств, чьи значения являются функциями.",
        initialCode: "function countMethods(obj) {\n  // твой код\n}",
        testTemplate: "return countMethods({ a: 1, b: () => {}, c: function() {} });",
        tests: [
            { params: [{ a: 1, b: () => { } }], expected: 1 },
            { params: [{ a: () => { }, b: () => { } }], expected: 2 }
        ],
        solution: "HINT: Используем Object.values и typeof === 'function'.\n\nCODE:\nfunction countMethods(obj) {\n  return Object.values(obj).filter(v => typeof v === 'function').length;\n}"
    },
    {
        id: 14,
        title: "Ternary Operator Nesting",
        difficulty: "Medium",
        topic: "Conditional Branching",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Какое итоговое значение примет переменная result после вычисления вложенного тернарного оператора?",
        initialCode: "const age = 20;\nconst result = age > 18 ? age < 60 ? 'Adult' : 'Senior' : 'Minor';\nconsole.log(result);",
        expectedOutput: "Adult",
        solution: "HINT: Вложенные тернарные операторы вычисляются последовательно: сначала внешнее условие (age > 18), затем внутреннее (age < 60).\n\nCODE:\n'Adult'"
    },
    {
        id: 15,
        title: "Shadowing Variables",
        difficulty: "Medium",
        topic: "Variables",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Найдите строку, где происходит перекрытие (shadowing) внешней переменной.",
        initialCode: "1: let name = 'Global';\n2: function greet() {\n3:   let name = 'Local';\n4:   console.log(name);\n5: }",
        correctAnswer: ["3"],
        solution: "HINT: Объявление name внутри функции скрывает внешнюю переменную name.\n\nCODE:\n3"
    },
    {
        id: 16,
        title: "Safe Object Access",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, которая безопасно извлекает значение из вложенного объекта по пути 'a.b.c'. Используй ?? для возврата 'N/A' если значение null/undefined.",
        initialCode: "function getDeepValue(obj) {\n  // твой код\n}",
        testTemplate: "return getDeepValue({ a: { b: { c: 42 } } });",
        tests: [
            { params: [{ a: { b: { c: 42 } } }], expected: 42 },
            { params: [{ a: null }], expected: "N/A" }
        ],
        solution: "HINT: Используем опциональную цепочку ?. и оператор ??.\n\nCODE:\nfunction getDeepValue(obj) {\n  return obj?.a?.b?.c ?? 'N/A';\n}"
    },
    {
        id: 17,
        title: "Comparison Peculiarities",
        difficulty: "Hard",
        topic: "Comparison",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Какие утверждения верны для абстрактного сравнения (==)?",
        options: [
            "NaN == NaN всегда false",
            "false == 0 всегда true",
            "[] == ![] всегда true",
            "undefined == null всегда true"
        ],
        correctAnswer: ["NaN == NaN всегда false", "false == 0 всегда true", "[] == ![] всегда true", "undefined == null всегда true"],
        solution: "HINT: Все перечисленные варианты являются классическими ловушками JS.\n\nCODE:\n['NaN == NaN всегда false', 'false == 0 всегда true', '[] == ![] всегда true', 'undefined == null всегда true']"
    },
    {
        id: 18,
        title: "Logical AND Short-circuit",
        difficulty: "Medium",
        topic: "Logical Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код?",
        initialCode: "let x = 1;\n(x > 0) && (x = 2);\nconsole.log(x);",
        expectedOutput: "2",
        solution: "HINT: Оператор && выполняет правую часть, только если левая истинна.\n\nCODE:\n2"
    },
    {
        id: 19,
        title: "Function Scope Leak",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Найдите строку, создающую глобальную переменную по ошибке.",
        initialCode: "1: function calculate() {\n2:   let a = 5;\n3:   b = 10;\n4:   return a + b;\n5: }",
        correctAnswer: ["3"],
        solution: "HINT: Присваивание без let/const/var создает свойство в глобальном объекте.\n\nCODE:\n3"
    },
    {
        id: 20,
        title: "String to Number Math",
        difficulty: "Medium",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Реализуй функцию, которая принимает две строки, перемножает их как числа и возвращает результат в виде строки. Если результат NaN, верни '0'.",
        initialCode: "function multiplyStrings(a, b) {\n  // твой код\n}",
        testTemplate: "return multiplyStrings('10', '5');",
        tests: [
            { params: ["10", "5"], expected: "50" },
            { params: ["abc", "5"], expected: "0" }
        ],
        solution: "HINT: Перемножение строк вызывает автоматическое приведение к Number.\n\nCODE:\nfunction multiplyStrings(a, b) {\n  const res = a * b;\n  return isNaN(res) ? '0' : String(res);\n}"
    },
    {
        id: 21,
        title: "Recursion Depth",
        difficulty: "Hard",
        topic: "Functions",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию sumTo(n), вычисляющую сумму чисел до N через рекурсию.",
        initialCode: "function sumTo(n) {\n  // твой код\n}",
        testTemplate: "return sumTo(100);",
        tests: [
            { params: [100], expected: 5050 },
            { params: [1], expected: 1 }
        ],
        solution: "HINT: Базовый случай n === 1, иначе n + sumTo(n-1).\n\nCODE:\nfunction sumTo(n) {\n  if (n === 1) return 1;\n  return n + sumTo(n - 1);\n}"
    },
    {
        id: 22,
        title: "Prefix vs Postfix",
        difficulty: "Medium",
        topic: "Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код?",
        initialCode: "let a = 1, b = 1;\nlet c = ++a;\nlet d = b++;\nconsole.log(c, d);",
        expectedOutput: "2 1",
        solution: "HINT: Префикс возвращает новое значение, постфикс — старое.\n\nCODE:\n2 1"
    },
    {
        id: 23,
        title: "Object Key Coercion",
        difficulty: "Hard",
        topic: "Data Types",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Проанализируйте, что будет выведено в консоль при использовании объектов в качестве ключей.",
        initialCode: "let obj = {};\nlet a = {key: 'a'};\nlet b = {key: 'b'};\nobj[a] = 123;\nobj[b] = 456;\nconsole.log(obj[a]);",
        expectedOutput: "456",
        solution: "HINT: Объекты в качестве ключей приводятся к строке '[object Object]'. Поскольку оба объекта дают одинаковую строку, второе присваивание перезаписывает первое.\n\nCODE:\n456"
    },
    {
        id: 24,
        title: "Validation Function",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию-валидатор, которая возвращает true только если аргумент — непустая строка.",
        initialCode: "function isValid(val) {\n  // твой код\n}",
        testTemplate: "return isValid(arguments[0]);",
        tests: [
            { params: [""], expected: false },
            { params: ["hi"], expected: true },
            { params: [123], expected: false }
        ],
        solution: "HINT: Проверяем typeof и length.\n\nCODE:\nfunction isValid(val) {\n  return typeof val === 'string' && val.length > 0;\n}"
    },
    {
        id: 25,
        title: "Array as Boolean",
        difficulty: "Medium",
        topic: "Type Conversion",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Чему равно Boolean([])?",
        options: ["true", "false", "undefined", "TypeError"],
        correctAnswer: "true",
        solution: "HINT: Все объекты (включая пустые массивы) при логическом преобразовании дают true.\n\nCODE:\ntrue"
    },
    {
        id: 26,
        title: "Filter Numbers",
        difficulty: "Medium",
        topic: "Data Types",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, которая оставляет в массиве только конечные числа (не NaN, не Infinity).",
        initialCode: "function getNumbers(arr) {\n  // твой код\n}",
        testTemplate: "return getNumbers([1, 'a', NaN, Infinity, 2]);",
        tests: [
            { params: [[1, NaN, 2]], expected: [1, 2] }
        ],
        solution: "HINT: Используем Number.isFinite().\n\nCODE:\nfunction getNumbers(arr) {\n  return arr.filter(n => typeof n === 'number' && Number.isFinite(n));\n}"
    },
    {
        id: 27,
        title: "Multiple Assignment",
        difficulty: "Medium",
        topic: "Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Чему равно a, b, c?\nlet a = b = c = 5 + 5;",
        expectedOutput: "10 10 10",
        solution: "HINT: Присваивание идет справа налево.\n\nCODE:\n10 10 10"
    },
    {
        id: 28,
        title: "Empty String Math",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Какие из этих операций вернут 0?",
        options: [
            "Number('')",
            "+false",
            "'' * 5",
            "null + 0"
        ],
        correctAnswer: ["Number('')", "+false", "'' * 5", "null + 0"],
        solution: "HINT: Все эти кейсы приводят значения к 0.\n\nCODE:\n[\"Number('')\", '+false', \"'' * 5\", 'null + 0']"
    },
    {
        id: 29,
        title: "Logical Assignment ??=",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Используя оператор ??=, установи свойство 'timeout' в 3000, если оно отсутствует в объекте, и верни его.",
        initialCode: "function setConfig(config) {\n  config.timeout ??= 3000;\n  return config.timeout;\n}",
        testTemplate: "return setConfig();",
        tests: [
            { params: [{ port: 80 }], expected: 3000 },
            { params: [{ timeout: 100 }], expected: 100 }
        ],
        solution: "HINT: config.timeout ??= 3000;\n\nCODE:\nfunction setConfig(config) {\n  config.timeout ??= 3000;\n  return config.timeout;\n}"
    },
    {
        id: 30,
        title: "Typeof Null History",
        difficulty: "Easy",
        topic: "Data Types",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Что вернет typeof null?",
        options: ["'null'", "'undefined'", "'object'", "'function'"],
        correctAnswer: "'object'",
        solution: "HINT: Это известная ошибка в реализации JS с первых версий.\n\nCODE:\n'object'"
    },
    {
        id: 31,
        title: "String Repeat Manual",
        difficulty: "Medium",
        topic: "Loops",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, имитирующую str.repeat(n) через цикл while.",
        initialCode: "function repeatStr(str, n) {\n  // твой код\n}",
        testTemplate: "return repeatStr('a', 3);",
        tests: [
            { params: ["a", 3], expected: "aaa" }
        ],
        solution: "HINT: Конкатенация в цикле.\n\nCODE:\nfunction repeatStr(str, n) {\n  let res = '';\n  while(n > 0) {\n    res += str;\n    n--;\n  }\n  return res;\n}"
    },
    {
        id: 32,
        title: "Confirm Interaction",
        difficulty: "Easy",
        topic: "Interaction",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Что возвращает confirm() при нажатии на 'Отмена'?",
        options: ["null", "undefined", "false", "0"],
        correctAnswer: "false",
        solution: "HINT: confirm возвращает boolean.\n\nCODE:\nfalse"
    },
    {
        id: 33,
        title: "Check Prime",
        difficulty: "Hard",
        topic: "Loops",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию для проверки числа на простоту.",
        initialCode: "function isPrime(n) {\n  // твой код\n}",
        testTemplate: "return isPrime(7);",
        tests: [
            { params: [7], expected: true },
            { params: [10], expected: false }
        ],
        solution: "HINT: Цикл от 2 до корня из n.\n\nCODE:\nfunction isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) {\n    if (n % i === 0) return false;\n  }\n  return true;\n}"
    },
    {
        id: 34,
        title: "Variable Re-declaration",
        difficulty: "Medium",
        topic: "Variables",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Где произойдет ошибка SyntaxError?",
        initialCode: "1: let x = 1;\n2: var y = 2;\n3: let x = 3;\n4: var y = 4;",
        correctAnswer: ["3"],
        solution: "HINT: let запрещает повторное объявление в той же области видимости.\n\nCODE:\n3"
    },
    {
        id: 35,
        title: "Default Parameters Value",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код?",
        initialCode: "function test(a = 10, b = a * 2) {\n  console.log(b);\n}\ntest(5);",
        expectedOutput: "10",
        solution: "HINT: Параметры вычисляются слева направо, b берет актуальное значение a.\n\nCODE:\n10"
    },
    {
        id: 36,
        title: "Object to Primitive",
        difficulty: "Hard",
        topic: "Type Conversion",
        stack: "JavaScript",
        mode: "code",
        description: "Реализуй функцию checkMagic, которая возвращает объект, который при сложении с числом возвращает 100, а при приведении к строке — 'magic'.",
        initialCode: "function checkMagic() {\n  const magicObj = {\n    // твой код\n  };\n  return [magicObj + 1, String(magicObj)];\n}",
        testTemplate: "return checkMagic();",
        tests: [
            { params: [], expected: [101, "magic"] }
        ],
        solution: "HINT: Используем Symbol.toPrimitive или valueOf/toString.\n\nCODE:\nfunction checkMagic() {\n  const magicObj = {\n    [Symbol.toPrimitive](hint) {\n      return hint === 'number' ? 100 : 'magic';\n    }\n  };\n  return [magicObj + 1, String(magicObj)];\n}"
    },
    {
        id: 37,
        title: "Labels in Loops",
        difficulty: "Medium",
        topic: "Loops",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Для чего используются метки (labels) в JS?",
        options: ["Для перехода к функции", "Для выхода из вложенных циклов", "Для именования переменных", "Для декораторов"],
        correctAnswer: "Для выхода из вложенных циклов",
        solution: "HINT: Метки позволяют break/continue управлять внешними циклами.\n\nCODE:\nДля выхода из вложенных циклов"
    },
    {
        id: 38,
        title: "Arrow Function This Context",
        difficulty: "Hard",
        topic: "Functions",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Где стрелочная функция берет this?",
        options: [
            "Из места вызова",
            "Из внешнего лексического окружения",
            "Из глобального объекта",
            "Нигде, у нее нет this"
        ],
        correctAnswer: ["Из внешнего лексического окружения"],
        solution: "HINT: Стрелочные функции обладают лексическим this.\n\nCODE:\n['Из внешнего лексического окружения']"
    },
    {
        id: 39,
        title: "BigInt Basics",
        difficulty: "Medium",
        topic: "Data Types",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, которая безопасно складывает обычное число и BigInt, возвращая BigInt.",
        initialCode: "function safeAdd(n, bi) {\n  // твой код\n}",
        testTemplate: "return safeAdd(10, 20n);",
        tests: [
            { params: [10, 20n], expected: 30n }
        ],
        solution: "HINT: BigInt(n) + bi;\n\nCODE:\nfunction safeAdd(n, bi) {\n  return BigInt(n) + bi;\n}"
    },
    {
        id: 40,
        title: "NaN Comparison Mystery",
        difficulty: "Medium",
        topic: "Comparison",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Что вернет выражение NaN == NaN?",
        options: ["true", "false", "TypeError", "undefined"],
        correctAnswer: "false",
        solution: "HINT: NaN — единственное значение в JS, не равное самому себе.\n\nCODE:\nfalse"
    },
    {
        id: 41,
        title: "IIFE Pattern",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию getInit, которая внутри себя использует IIFE для возврата строки 'init'.",
        initialCode: "function getInit() {\n  return (function() {\n    // твой код\n  })();\n}",
        testTemplate: "return getInit();",
        tests: [
            { params: [], expected: "init" }
        ],
        solution: "HINT: return 'init' внутри скобок.\n\nCODE:\nfunction getInit() {\n  return (function() {\n    return 'init';\n  })();\n}"
    },
    {
        id: 42,
        title: "String Concatenation Order",
        difficulty: "Medium",
        topic: "Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код?\nconsole.log(1 + 2 + '3');",
        expectedOutput: "33",
        solution: "HINT: Сначала 1+2=3, затем 3 + '3' = '33'.\n\nCODE:\n33"
    },
    {
        id: 43,
        title: "Rest Parameter Requirement",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Найдите ошибку в синтаксисе rest-параметров.",
        initialCode: "1: function log(a, ...args, b) {\n2:   console.log(args);\n3: }",
        correctAnswer: ["1"],
        solution: "HINT: Rest параметр должен быть последним в списке.\n\nCODE:\n1"
    },
    {
        id: 44,
        title: "Math.pow vs **",
        difficulty: "Easy",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, вычисляющую объем куба со стороной A.",
        initialCode: "function cubeVol(a) {\n  // твой код\n}",
        testTemplate: "return cubeVol(3);",
        tests: [
            { params: [3], expected: 27 }
        ],
        solution: "HINT: a ** 3;\n\nCODE:\nfunction cubeVol(a) {\n  return a ** 3;\n}"
    },
    {
        id: 45,
        title: "Truthiness of Objects",
        difficulty: "Hard",
        topic: "Type Conversion",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Какие из этих значений при превращении в Boolean дадут false?",
        options: [
            "0",
            "''",
            "null",
            "NaN",
            "[]",
            "{}"
        ],
        correctAnswer: ["0", "''", "null", "NaN"],
        solution: "HINT: Пустые массивы и объекты всегда true.\n\nCODE:\n['0', \"''\", 'null', 'NaN']"
    },
    {
        id: 46,
        title: "Function as Variable",
        difficulty: "Medium",
        topic: "Function Expression",
        stack: "JavaScript",
        mode: "code",
        description: "Присвой переменной 'run' функцию, которая возвращает 'running'.",
        initialCode: "let run = // твой код",
        testTemplate: "return run();",
        tests: [
            { params: [], expected: "running" }
        ],
        solution: "HINT: let run = function() { return 'running'; };\n\nCODE:\nlet run = function() {\n  return 'running';\n};"
    },
    {
        id: 47,
        title: "Comma Operator",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код?\nlet a = (1, 2, 3);\nconsole.log(a);",
        expectedOutput: "3",
        solution: "HINT: Оператор запятая возвращает последнее вычисленное выражение.\n\nCODE:\n3"
    },
    {
        id: 48,
        title: "Prompt Default Value",
        difficulty: "Easy",
        topic: "Interaction",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Какой второй аргумент принимает prompt(msg, default)?",
        options: ["Тип данных", "Значение по умолчанию в поле ввода", "Таймаут", "Callback"],
        module: "Основы",
        correctAnswer: "Значение по умолчанию в поле ввода",
        solution: "HINT: Это позволяет предзаполнить поле для пользователя.\n\nCODE:\nЗначение по умолчанию в поле ввода"
    },
    {
        id: 49,
        title: "For...in and Arrays",
        difficulty: "Medium",
        topic: "Loops",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Почему не рекомендуется использовать for...in для массивов?",
        options: [
            "Он работает медленнее",
            "Он перебирает нечисловые свойства",
            "Он не гарантирует порядок",
            "Он удаляет элементы"
        ],
        correctAnswer: ["Он работает медленнее", "Он перебирает нечисловые свойства", "Он не гарантирует порядок"],
        solution: "HINT: for...in оптимизирован для объектов, а не для индексов массива.\n\nCODE:\n['Он работает медленнее', 'Он перебирает нечисловые свойства', 'Он не гарантирует порядок']"
    },
    {
        id: 50,
        title: "Complex Condition",
        difficulty: "Hard",
        topic: "Conditional Branching",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши условие: если (a больше 10 И b меньше 5) ИЛИ c равно 0, верни true.",
        initialCode: "function complexCheck(a, b, c) {\n  // твой код\n}",
        testTemplate: "return complexCheck(11, 4, 1);",
        tests: [
            { params: [11, 4, 1], expected: true },
            { params: [5, 5, 0], expected: true },
            { params: [5, 5, 1], expected: false }
        ],
        solution: "HINT: return (a > 10 && b < 5) || c === 0;\n\nCODE:\nfunction complexCheck(a, b, c) {\n  return (a > 10 && b < 5) || c === 0;\n}"
    },
    // --- 30 NEW MISSIONS (Middle JS Focus) ---
    {
        id: 51,
        title: "Type Coercion: Addition Logic",
        difficulty: "Medium",
        topic: "Type Conversion",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Проанализируй порядок выполнения операций при сложении различных типов данных в JS.",
        initialCode: "console.log(true + false + '1' + 2);",
        expectedOutput: "112",
        solution: "HINT: Операции выполняются слева направо. true (1) + false (0) = 1. Затем 1 + '1' = '11' (конкатенация), затем '11' + 2 = '112'.\n\nCODE:\n'112'"
    },
    {
        id: 52,
        title: "Equality vs Identity",
        difficulty: "Hard",
        topic: "Comparison",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Какие из этих сравнений вернут true согласно спецификации алгоритма Abstract Equality Comparison?",
        options: ["' ' == 0", "[] == 0", "null == undefined", "false == '0'", "null == 0"],
        correctAnswer: ["' ' == 0", "[] == 0", "null == undefined", "false == '0'"],
        solution: "HINT: Алгоритм приведения типов (==) превращает пустые строки и массивы в 0, а null равен только undefined.\n\nCODE:\n['\" \" == 0', '[] == 0', 'null == undefined', \"false == '0'\"]"
    },
    {
        id: 53,
        title: "Logical Nullish Assignment",
        difficulty: "Medium",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Реализуй функцию инициализации конфига, используя оператор ??= для установки значений по умолчанию для свойств delay (500) и retry (true).",
        initialCode: "function initConfig(cfg) {\n  // твой код\n  return cfg;\n}",
        testTemplate: "return initConfig({ delay: 0 });",
        tests: [
            { params: [{ delay: 0 }], expected: { delay: 0, retry: true } },
            { params: [{ retry: false }], expected: { delay: 500, retry: false } }
        ],
        solution: "HINT: Оператор ??= присваивает значение только если левая часть равна null или undefined. Это безопаснее, чем ||= для чисел (0).\n\nCODE:\nfunction initConfig(cfg) {\n  cfg.delay ??= 500;\n  cfg.retry ??= true;\n  return cfg;\n}"
    },
    {
        id: 54,
        title: "ToNumber: Explicit vs Implicit",
        difficulty: "Easy",
        topic: "Type Conversion",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Найди строку, которая вернет NaN вместо числа.",
        initialCode: "1: console.log(Number('123'));\n2: console.log(+' 456 ');\n3: console.log(parseInt('789px'));\n4: console.log(Number('100n'));",
        correctAnswer: ["4"],
        solution: "HINT: Конструктор Number() не поддерживает литералы BigInt (строчное 'n') внутри строки.\n\nCODE:\n4"
    },
    {
        id: 55,
        title: "Nested Ternary Refactoring",
        difficulty: "Medium",
        topic: "Conditional Branching",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, которая возвращает 'access' если age >= 18, 'restricted' если age в диапазоне [13, 17] включительно, и 'denied' в остальных случаях.",
        initialCode: "function checkAccess(age) {\n  // используй тернарный оператор\n}",
        testTemplate: "return checkAccess(15);",
        tests: [
            { params: [18], expected: "access" },
            { params: [15], expected: "restricted" },
            { params: [10], expected: "denied" }
        ],
        solution: "HINT: Цепочка тернарных операторов — это лаконичная альтернатива if...else if.\n\nCODE:\nfunction checkAccess(age) {\n  return age >= 18 ? 'access' : age >= 13 ? 'restricted' : 'denied';\n}"
    },
    {
        id: 56,
        title: "Loose Equality Trap",
        difficulty: "Medium",
        topic: "Comparison",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Чему равно выражение: [10] == 10?",
        options: ["true", "false", "undefined", "TypeError"],
        correctAnswer: "true",
        solution: "HINT: Массив с одним числом приводится к примитиву String('10'), который JS затем сравнивает с числом 10.\n\nCODE:\ntrue"
    },
    {
        id: 57,
        title: "Exponentiation Precedence",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Каков результат вычисления данной цепочки операторов?",
        initialCode: "console.log(2 ** 3 ** 2);",
        expectedOutput: "512",
        solution: "HINT: Оператор ** правоассоциативен. Сначала вычисляется 3 в квадрате (9), затем 2 в девятой степени.\n\nCODE:\n512"
    },
    {
        id: 58,
        title: "Mathematical Precision",
        difficulty: "Medium",
        topic: "Math",
        stack: "JavaScript",
        mode: "code",
        description: "Реализуй функцию, которая складывает два числа и округляет результат до 2 знаков после запятой только если сумма имеет дробную часть.",
        initialCode: "function smartSum(a, b) {\n  // твой код\n}",
        testTemplate: "return smartSum(0.1, 0.2);",
        tests: [
            { params: [0.1, 0.2], expected: 0.3 },
            { params: [1, 2], expected: 3 },
            { params: [1.111, 2.222], expected: 3.33 }
        ],
        solution: "HINT: JS использует стандарт IEEE 754, вызывающий погрешности (0.1 + 0.2 != 0.3). toFixed решает проблему.\n\nCODE:\nfunction smartSum(a, b) {\n  const res = a + b;\n  return Number.isInteger(res) ? res : Number(res.toFixed(2));\n}"
    },
    {
        id: 59,
        title: "Zero Sign Peculiarity",
        difficulty: "Hard",
        topic: "Math",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Как в JS отличить 0 от -0?",
        options: ["0 === -0", "Object.is(0, -0)", "0 == -0", "typeof 0"],
        correctAnswer: "Object.is(0, -0)",
        solution: "HINT: Object.is(a, b) проверяет значения на идентичность, учитывая знаки нулей и NaN.\n\nCODE:\nObject.is(0, -0)"
    },
    {
        id: 60,
        title: "Logical OR Assignment Fallacy",
        difficulty: "Medium",
        topic: "Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что будет выведено в консоль после выполнения операций присваивания?",
        initialCode: "let count = 0;\ncount ||= 10;\nconsole.log(count);",
        expectedOutput: "10",
        solution: "HINT: Оператор ||= срабатывает, если текущее значение falsy (включая 0, '', false).\n\nCODE:\n10"
    },
    {
        id: 61,
        title: "Safe Division Mission",
        difficulty: "Easy",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию safeDiv, которая делит a на b. Если b равен 0, верни строку 'ERR_DIV_ZERO'.",
        initialCode: "function safeDiv(a, b) {\n  // твой код\n}",
        testTemplate: "return safeDiv(10, 0);",
        tests: [
            { params: [10, 2], expected: 5 },
            { params: [5, 0], expected: "ERR_DIV_ZERO" }
        ],
        solution: "HINT: Проверка делителя через строгое сравнение предотвращает ошибку деления на ноль.\n\nCODE:\nfunction safeDiv(a, b) {\n  if (b === 0) return 'ERR_DIV_ZERO';\n  return a / b;\n}"
    },
    {
        id: 62,
        title: "Increment Logic Complexity",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Предскажи итоговое значение переменной после цепочки инкрементов.",
        initialCode: "let i = 1;\nlet res = i++ + ++i + i;\nconsole.log(res);",
        expectedOutput: "7",
        solution: "HINT: Анализ стэка: 1 (i++ возвращает 1, i=2) + 3 (++i возвращает 3, i=3) + 3 (i=3). Итого 1+3+3.\n\nCODE:\n7"
    },
    {
        id: 63,
        title: "Truthiness: The Big Switch",
        difficulty: "Medium",
        topic: "Conditional Branching",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Какие из этих значений при превращении в логический тип (ToBoolean) дадут true?",
        options: ["'0'", "[]", "{}", "'false'", "NaN", "undefined"],
        correctAnswer: ["'0'", "[]", "{}", "'false'"],
        solution: "HINT: Любой объект (даже пустой) и любая непустая строка всегда истинны (truthy).\n\nCODE:\n['\"0\"', '[]', '{}', '\"false\"']"
    },
    {
        id: 64,
        title: "Short-Circuit Guard Pattern",
        difficulty: "Medium",
        topic: "Logical Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, которая возвращает длину массива `arr.length`, но только если `arr` не является null или undefined. Иначе верни 0.",
        initialCode: "function getLen(arr) {\n  // используй && или ??\n}",
        testTemplate: "return getLen([1, 2]);",
        tests: [
            { params: [[1, 2, 3]], expected: 3 },
            { params: [null], expected: 0 },
            { params: [undefined], expected: 0 }
        ],
        solution: "HINT: Опциональная цепочка ?. позволяет избежать ошибок TypeError при обращении к свойствам null/undefined.\n\nCODE:\nfunction getLen(arr) {\n  return arr?.length ?? 0;\n}"
    },
    {
        id: 65,
        title: "If-Else vs Operator Priority",
        difficulty: "Hard",
        topic: "Conditional Branching",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Найди строку с логической ошибкой, которая приведет к неверному результату при значении x = -5.",
        initialCode: "1: function checkSign(x) {\n2:   if (x > 0) return 'pos';\n3:   if (x = 0) return 'zero';\n4:   return 'neg';\n5: }",
        correctAnswer: ["3"],
        solution: "HINT: Присваивание (=) возвращает присвоенное значение. 0 — это falsy, поэтому условие никогда не сработает.\n\nCODE:\n3"
    },
    {
        id: 66,
        title: "Optional Chaining Mastery",
        difficulty: "Hard",
        topic: "Operators",
        stack: "JavaScript",
        mode: "code",
        description: "Реализуй функцию, которая глубоко извлекает имя компании пользователя: user.job.company.name. Если любое звено отсутствует, верни 'Freelancer'.",
        initialCode: "function getCompany(user) {\n  // твой код\n}",
        testTemplate: "return getCompany({ job: { company: { name: 'Google' } } });",
        tests: [
            { params: [{ job: { company: { name: "Meta" } } }], expected: "Meta" },
            { params: [{ job: {} }], expected: "Freelancer" }
        ],
        solution: "HINT: Комбинация ?. и ?? — стандарт де-факто для безопасного извлечения данных в современном JS.\n\nCODE:\nfunction getCompany(user) {\n  return user?.job?.company?.name ?? 'Freelancer';\n}"
    },
    {
        id: 67,
        title: "Switch: Strict Equality",
        difficulty: "Medium",
        topic: "Conditional Branching",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет консоль с учетом того, что switch использует строгое сравнение?",
        initialCode: "const val = '1';\nswitch(val) {\n  case 1: console.log('Number'); break;\n  case '1': console.log('String'); break;\n}",
        expectedOutput: "String",
        solution: "HINT: Switch работает по алгоритму Strict Equality (===), автоматическое приведение типов отключено.\n\nCODE:\n'String'"
    },
    {
        id: 68,
        title: "Conditional Return Optimization",
        difficulty: "Hard",
        topic: "Functions",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию-фильтр доступа. Верни true, если пользователь (obj) имеет роль 'admin' ИЛИ его уровень (level) >= 5. В противном случае верни false.",
        initialCode: "function canAccess(u) {\n  // напиши максимально коротко\n}",
        testTemplate: "return canAccess({ role: 'user', level: 6 });",
        tests: [
            { params: [{ role: "admin" }], expected: true },
            { params: [{ role: "user", level: 6 }], expected: true },
            { params: [{ level: 3 }], expected: false }
        ],
        solution: "HINT: Логические выражения сами по себе возвращают boolean, if/else в таких случаях избыточен.\n\nCODE:\nfunction canAccess(u) {\n  return u.role === 'admin' || u.level >= 5;\n}"
    },
    {
        id: 69,
        title: "Loop: Break Label Logic",
        difficulty: "Hard",
        topic: "Loops",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши вложенный цикл (3x3), который ищет число 5 в двумерном массиве. При нахождении прерви ОБА цикла и верни строку 'FOUND'. Если не найдено — 'NOT_FOUND'.",
        initialCode: "function findFive(matrix) {\n  // используй метку для break\n}",
        testTemplate: "return findFive([[1,2],[5,3]]);",
        tests: [
            { params: [[[1, 2], [3, 5]]], expected: "FOUND" },
            { params: [[[1, 1], [1, 1]]], expected: "NOT_FOUND" }
        ],
        solution: "HINT: Метки позволяют управлять выходом из внешних циклов без использования лишних флагов состояния.\n\nCODE:\nfunction findFive(matrix) {\n  outer: for (let row of matrix) {\n    for (let col of row) {\n      if (col === 5) return 'FOUND';\n    }\n  }\n  return 'NOT_FOUND';\n}"
    },
    {
        id: 70,
        title: "While: Condition Execution",
        difficulty: "Medium",
        topic: "Loops",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Какое последнее число будет выведено в консоль?",
        initialCode: "let i = 3;\nwhile (i) {\n  console.log(i--);\n}",
        expectedOutput: "1",
        solution: "HINT: Тело цикла выполняется пока i != 0. При i=1 выводится 1, i становится 0, и следующая итерация не начинается.\n\nCODE:\n1"
    },
    {
        id: 71,
        title: "For Loop Shadowing",
        difficulty: "Medium",
        topic: "Loops",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Найди строку, которая вызовет бесконечный цикл из-за неправильного изменения счетчика.",
        initialCode: "1: for (let i = 0; i < 10; i++) {\n2:   if (i > 5) {\n3:     i--;\n4:   }\n5:   console.log(i);\n6: }",
        correctAnswer: ["3"],
        solution: "HINT: Уменьшение i внутри цикла при i > 5 делает условие i < 10永遠 истинным.\n\nCODE:\n3"
    },
    {
        id: 72,
        title: "Iterating Object Keys",
        difficulty: "Medium",
        topic: "Loops",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию, которая перебирает объект и возвращает массив ключей, значения которых — числа.",
        initialCode: "function getNumericKeys(obj) {\n  // твой код\n}",
        testTemplate: "return getNumericKeys({ a: 1, b: '2', c: 3 });",
        tests: [
            { params: [{ a: 1, b: "2", c: 3 }], expected: ["a", "c"] }
        ],
        solution: "HINT: Сочетание for...in и typeof — классический способ динамической инспекции объектов.\n\nCODE:\nfunction getNumericKeys(obj) {\n  let res = [];\n  for (let key in obj) {\n    if (typeof obj[key] === 'number') res.push(key);\n  }\n  return res;\n}"
    },
    {
        id: 73,
        title: "Do...While Guaranteed Run",
        difficulty: "Easy",
        topic: "Loops",
        stack: "JavaScript",
        mode: "single-choice",
        description: "В чем главное отличие do...while от обычного while?",
        options: ["Работает быстрее", "Выполняется минимум один раз", "Не поддерживает break", "Использует меньше памяти"],
        correctAnswer: "Выполняется минимум один раз",
        solution: "HINT: Цикл do...while гарантирует выполнение тела хотя бы один раз, так как проверка условия идет в конце.\n\nCODE:\n'Выполняется минимум один раз'"
    },
    {
        id: 74,
        title: "For...of with Iterables",
        difficulty: "Hard",
        topic: "Loops",
        stack: "JavaScript",
        mode: "multi-choice",
        description: "Для каких типов данных можно использовать цикл for...of?",
        options: ["Array", "String", "Object", "Map/Set", "Number"],
        correctAnswer: ["Array", "String", "Map/Set"],
        solution: "HINT: for...of требует наличия итерируемого протокола [Symbol.iterator]. Обычные объекты его не имеют.\n\nCODE:\n['Array', 'String', 'Map/Set']"
    },
    {
        id: 75,
        title: "Rest Parameter vs Arguments",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Каков результат вызова функции?",
        initialCode: "function show(a, ...rest) {\n  return rest.length;\n}\nconsole.log(show(1, 2, 3, 4));",
        expectedOutput: "3",
        solution: "HINT: Rest-параметр собирает все «лишние» аргументы в массив. 1 уходит в a, [2,3,4] — в rest.\n\nCODE:\n3"
    },
    {
        id: 76,
        title: "Lexical Environment: Closure",
        difficulty: "Hard",
        topic: "Functions",
        stack: "JavaScript",
        mode: "code",
        description: "Создай функцию createIncrementer(start), которая возвращает другую функцию. Внутренняя функция при каждом вызове должна увеличивать `start` на 1 и возвращать результат.",
        initialCode: "function createIncrementer(start) {\n  // твой код\n}",
        testTemplate: "const inc = createIncrementer(10); inc(); return inc();",
        tests: [
            { params: [10], expected: 12 }
        ],
        solution: "HINT: Замыкание позволяет функции сохранять ссылку на лексическое окружение, в котором она была создана.\n\nCODE:\nfunction createIncrementer(start) {\n  return () => ++start;\n}"
    },
    {
        id: 77,
        title: "Arrow vs Declaration",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "bug-hunter",
        description: "Почему метод объекта вернет undefined?",
        initialCode: "1: const user = {\n2:   name: 'Dev',\n3:   greet: () => {\n4:     return this.name;\n5:   }\n6: };",
        correctAnswer: ["4"],
        solution: "HINT: Стрелочные функции наследуют this из внешнего контекста (здесь это глобальный объект или undefined).\n\nCODE:\n4"
    },
    {
        id: 78,
        title: "High-Order Functions: Transform",
        difficulty: "Hard",
        topic: "Functions",
        stack: "JavaScript",
        mode: "code",
        description: "Напиши функцию transform(arr, fn), которая применяет функцию `fn` к каждому элементу массива и возвращает новый массив. Не используй встроенный map.",
        initialCode: "function transform(arr, fn) {\n  // твой код\n}",
        testTemplate: "return transform([1,2,3], x => x * 10);",
        tests: [
            { params: [[1, 2], (x) => x * 2], expected: [2, 4] }
        ],
        solution: "HINT: Функции высшего порядка — база функционального программирования в JavaScript.\n\nCODE:\nfunction transform(arr, fn) {\n  let res = [];\n  for (let item of arr) res.push(fn(item));\n  return res;\n}"
    },
    {
        id: 79,
        title: "NFE (Named Function Expression)",
        difficulty: "Medium",
        topic: "Functions",
        stack: "JavaScript",
        mode: "single-choice",
        description: "Для чего в основном используется имя в Named Function Expression (например, let f = function g() {...})?",
        options: ["Для отладки и рекурсии", "Для автоматического вызова", "Для защиты от сборщика мусора", "Это синтаксическая ошибка"],
        correctAnswer: "Для отладки и рекурсии",
        solution: "HINT: NFE создает имя функции, доступное только внутри нее самой, что удобно для рекурсивных вызовов.\n\nCODE:\n'Для отладки и рекурсии'"
    },
    {
        id: 80,
        title: "Default Values: Execution Time",
        difficulty: "Hard",
        topic: "Functions",
        stack: "JavaScript",
        mode: "output-predictor",
        description: "Что выведет код с учетом того, что параметры по умолчанию вычисляются при каждом вызове?",
        initialCode: "let x = 1;\nfunction test(a = x++) {\n  console.log(a);\n}\ntest();\ntest();",
        expectedOutput: "1 2",
        solution: "HINT: Выражения в аргументах по умолчанию вычисляются на лету, если аргумент не был передан или равен undefined.\n\nCODE:\n'1 2'"
    }
];
