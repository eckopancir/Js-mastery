export const categories = ["algorithms", "async", "leetcode", "patterns", "react-hooks", "utils"];

export const typingTasks = [
  {
    id: 1,
    title: "Bubble Sort",
    category: "algorithms",
    difficulty: "easy",
    theory: "Сортировка пузырьком. Проходим по массиву, меняем местами соседей. Худший случай O(n²).",
    code: `function bubbleSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      if (arr[j] > arr[j + 1]) [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
    }
  }
  return arr;
}`,
    tests: [
      { params: [[3, 1, 2]], expected: [1, 2, 3] },
      { params: [[5, 4, 3, 2, 1]], expected: [1, 2, 3, 4, 5] },
      { params: [[]], expected: [] }
    ],
    memoryTime: 10,
    typingTime: 45
  },
  {
    id: 2,
    title: "Selection Sort",
    category: "algorithms",
    difficulty: "easy",
    theory: "Ищем минимальный элемент и перемещаем в начало. Сложность O(n²).",
    code: `function selectionSort(arr) {
  for (let i = 0; i < arr.length; i++) {
    let min = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[min]) min = j;
    }
    [arr[i], arr[min]] = [arr[min], arr[i]];
  }
  return arr;
}`,
    tests: [
      { params: [[10, -1, 0]], expected: [-1, 0, 10] },
      { params: [[2, 1]], expected: [1, 2] }
    ],
    memoryTime: 10,
    typingTime: 50
  },
  {
    id: 3,
    title: "Insertion Sort",
    category: "algorithms",
    difficulty: "easy",
    theory: "Вставляем элементы из неотсортированной части на нужные места. Хорош для почти отсортированных данных.",
    code: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let curr = arr[i], j = i - 1;
    while (j >= 0 && arr[j] > curr) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = curr;
  }
  return arr;
}`,
    tests: [
      { params: [[4, 3, 2, 1]], expected: [1, 2, 3, 4] },
      { params: [[1, 2, 3]], expected: [1, 2, 3] }
    ],
    memoryTime: 10,
    typingTime: 55
  },
  {
    id: 4,
    title: "Merge Sort",
    category: "algorithms",
    difficulty: "hard",
    theory: "Рекурсивное деление пополам и слияние. Сложность O(n log n).",
    code: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}

function merge(l, r) {
  let res = [], i = 0, j = 0;
  while (i < l.length && j < r.length) {
    res.push(l[i] < r[j] ? l[i++] : r[j++]);
  }
  return [...res, ...l.slice(i), ...r.slice(j)];
}`,
    tests: [
      { params: [[1, 5, 2, 8]], expected: [1, 2, 5, 8] }
    ],
    memoryTime: 15,
    typingTime: 90
  },
  {
    id: 5,
    title: "Deep Clone",
    category: "utils",
    difficulty: "medium",
    theory: "Рекурсивное копирование объектов.",
    code: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  const copy = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    copy[key] = deepClone(obj[key]);
  }
  return copy;
}`,
    tests: [
      { params: [{ a: 1, b: { c: 2 } }], expected: { a: 1, b: { c: 2 } } }
    ],
    memoryTime: 12,
    typingTime: 60
  },
  {
    id: 6,
    title: "Observer (Simple)",
    category: "patterns",
    difficulty: "medium",
    theory: "База для событий. Подписка и уведомление.",
    code: `class Subject {
  constructor() { this.observers = []; }
  subscribe(fn) { this.observers.push(fn); }
  notify(data) { this.observers.forEach(fn => fn(data)); }
}`,
    // Для классов тесты сложнее, обычно проверяем инстанс
    tests: [
      { params: [], expected: true }
    ],
    memoryTime: 10,
    typingTime: 40
  },
  {
    id: 7,
    title: "Debounce Function",
    category: "utils",
    difficulty: "medium",
    theory: "Откладывает выполнение функции.",
    code: `function debounce(fn, ms) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), ms);
  };
}`,
    tests: [
      { params: [() => { }, 100], expected: 'function' }
    ],
    memoryTime: 10,
    typingTime: 45
  },
  {
    id: 8,
    title: "usePrevious",
    category: "react-hooks",
    difficulty: "easy",
    theory: "Хранит значение из предыдущего рендера.",
    code: `function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}`,
    tests: [], // Хуки сложно тестировать без окружения React, оставляем для синтаксической проверки
    memoryTime: 8,
    typingTime: 35
  },
  {
    id: 9,
    title: "useClickOutside",
    category: "react-hooks",
    difficulty: "medium",
    theory: "Клик вне элемента.",
    code: `function useClickOutside(ref, callback) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      callback(e);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, callback]);
}`,
    tests: [],
    memoryTime: 12,
    typingTime: 70
  },
  {
    id: 10,
    title: "useMediaQuery",
    category: "react-hooks",
    difficulty: "medium",
    theory: "Адаптивность в React.",
    code: `function useMediaQuery(query) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const q = window.matchMedia(query);
    setMatch(q.matches);
    const handler = (e) => setMatch(e.matches);
    q.addEventListener('change', handler);
    return () => q.removeEventListener('change', handler);
  }, [query]);
  return match;
}`,
    tests: [],
    memoryTime: 12,
    typingTime: 85
  },
  {
    id: 11,
    title: "Deep Merge",
    category: "utils",
    difficulty: "medium",
    theory: "Рекурсивно объединяет объекты.",
    code: `function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}`,
    tests: [
      { params: [{ a: 1 }, { b: 2 }], expected: { a: 1, b: 2 } }
    ],
    memoryTime: 12,
    typingTime: 75
  },
  {
    id: 12,
    title: "Curry (Basic)",
    category: "utils",
    difficulty: "medium",
    theory: "Трансформация f(a,b) в f(a)(b).",
    code: `function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn.apply(this, args);
    return (...args2) => curried.apply(this, [...args, ...args2]);
  };
}`,
    tests: [
      { params: [(a, b) => a + b], expected: 'function' }
    ],
    memoryTime: 10,
    typingTime: 50
  },
  {
    id: 13,
    title: "Throttle (JS)",
    category: "utils",
    difficulty: "medium",
    theory: "Вызывает функцию раз в N мс.",
    code: `function throttle(fn, ms) {
  let isThrottled = false;
  return function(...args) {
    if (isThrottled) return;
    fn.apply(this, args);
    isThrottled = true;
    setTimeout(() => isThrottled = false, ms);
  };
}`,
    tests: [],
    memoryTime: 10,
    typingTime: 55
  },
  {
    id: 14,
    title: "Binary Search",
    category: "algorithms",
    difficulty: "medium",
    theory: "Поиск в отсортированном массиве O(log n).",
    code: `function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) return mid;
    arr[mid] < target ? low = mid + 1 : high = mid - 1;
  }
  return -1;
}`,
    tests: [
      { params: [[1, 2, 3, 4, 5], 3], expected: 2 },
      { params: [[1, 2, 3, 4, 5], 6], expected: -1 }
    ],
    memoryTime: 10,
    typingTime: 60
  },
  {
    id: 15,
    title: "FizzBuzz",
    category: "leetcode",
    difficulty: "easy",
    theory: "Fizz для 3, Buzz для 5.",
    code: `function fizzBuzz(n) {
  const res = [];
  for (let i = 1; i <= n; i++) {
    let s = '';
    if (i % 3 === 0) s += 'Fizz';
    if (i % 5 === 0) s += 'Buzz';
    res.push(s || i.toString());
  }
  return res;
}`,
    tests: [
      { params: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] }
    ],
    memoryTime: 8,
    typingTime: 50
  },
  {
    id: 16,
    title: "Reverse String (In place)",
    category: "leetcode",
    difficulty: "easy",
    theory: "Два указателя для разворота массива.",
    code: `function reverseString(s) {
  let l = 0, r = s.length - 1;
  while (l < r) {
    [s[l], s[r]] = [s[r], s[l]];
    l++; r--;
  }
  return s;
}`,
    tests: [
      { params: [["h", "e", "l", "l", "o"]], expected: ["o", "l", "l", "e", "h"] }
    ],
    memoryTime: 7,
    typingTime: 35
  },
  {
    id: 17,
    title: "Promise Retry",
    category: "async",
    difficulty: "hard",
    theory: "Повтор асинхронной функции.",
    code: `async function retry(fn, retries = 3) {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    return retry(fn, retries - 1);
  }
}`,
    tests: [],
    memoryTime: 10,
    typingTime: 45
  },
  {
    id: 18,
    title: "Sequential Promises",
    category: "async",
    difficulty: "medium",
    theory: "Выполнение промисов по очереди.",
    code: `function sequence(tasks) {
  return tasks.reduce((p, task) => 
    p.then(task), 
  Promise.resolve());
}`,
    tests: [],
    memoryTime: 8,
    typingTime: 30
  },
  {
    id: 19,
    title: "Array to Tree",
    category: "utils",
    difficulty: "hard",
    theory: "Плоский массив в иерархию.",
    code: `function arrayToTree(arr, parentId = null) {
  return arr
    .filter(item => item.parentId === parentId)
    .map(item => ({
      ...item,
      children: arrayToTree(arr, item.id)
    }));
}`,
    tests: [
      {
        params: [[{ id: 1, parentId: null }, { id: 2, parentId: 1 }]],
        expected: [{ id: 1, parentId: null, children: [{ id: 2, parentId: 1, children: [] }] }]
      }
    ],
    memoryTime: 15,
    typingTime: 70
  },
  {
    id: 20,
    title: "Deep IsEmpty",
    category: "utils",
    difficulty: "medium",
    theory: "Рекурсивная проверка на пустоту.",
    code: `function isDeepEmpty(val) {
  if (val === null || typeof val !== 'object') return false;
  const keys = Object.keys(val);
  if (keys.length === 0) return true;
  return keys.every(key => isDeepEmpty(val[key]));
}`,
    tests: [
      { params: [{}], expected: true },
      { params: [{ a: {} }], expected: true },
      { params: [{ a: 1 }], expected: false }
    ],
    memoryTime: 12,
    typingTime: 60
  },
  {
    id: 21,
    title: "Intersection O(n)",
    category: "algorithms",
    difficulty: "medium",
    theory: "Пересечение массивов через хэш-таблицу.",
    code: `function intersect(a, b) {
  const map = a.reduce((acc, i) => { acc[i] = i; return acc; }, {});
  return b.filter(i => i in map);
}`,
    tests: [
      { params: [[1, 2, 3], [2, 3, 4]], expected: [2, 3] }
    ],
    memoryTime: 10,
    typingTime: 50
  },
  {
    id: 22,
    title: "Safe Type Checker",
    category: "utils",
    difficulty: "easy",
    theory: "Корректное определение null и Array.",
    code: `function getType(val) {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
}`,
    tests: [
      { params: [null], expected: 'null' },
      { params: [[]], expected: 'array' },
      { params: [5], expected: 'number' }
    ],
    memoryTime: 7,
    typingTime: 35
  },
  {
    id: 23,
    title: "First Non-Repeating Char",
    category: "leetcode",
    difficulty: "medium",
    theory: "Поиск первого уникального символа.",
    code: `function firstUniqChar(s) {
  const map = {};
  for (let char of s) map[char] = (map[char] || 0) + 1;
  for (let i = 0; i < s.length; i++) {
    if (map[s[i]] === 1) return i;
  }
  return -1;
}`,
    tests: [
      { params: ["leetcode"], expected: 0 },
      { params: ["aabb"], expected: -1 }
    ],
    memoryTime: 10,
    typingTime: 60
  },
  {
    id: 24,
    title: "Proxy Validation",
    category: "patterns",
    difficulty: "medium",
    theory: "Валидация через Proxy.",
    code: `function createValidator() {
  return new Proxy({}, {
    set(target, prop, val) {
      if (prop === 'age' && val < 0) return false;
      target[prop] = val;
      return true;
    }
  });
}`,
    tests: [
      { params: [], expected: 'object' }
    ],
    memoryTime: 10,
    typingTime: 50
  },
  {
    id: 25,
    title: "CSS-in-JS Style Object",
    category: "utils",
    difficulty: "easy",
    theory: "Объект стилей в строку camelCase -> kebab-case.",
    code: `function stringifyStyle(obj) {
  return Object.entries(obj).map(entry => {
    const k = entry[0];
    const v = entry[1];
    return k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + v;
  }).join(';');
}`,
    tests: [
      { params: [{ backgroundColor: 'red', fontSize: '12px' }], expected: "background-color:red;font-size:12px" }
    ],
    memoryTime: 10,
    typingTime: 55
  }
];

export function getRandomTask() {
    const available = typingTasks.filter(t => t.tests && t.tests.length > 0);
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
}