export const tasksGo = [
  {
    id: 40001,
    title: "Hello, World!",
    difficulty: "Easy",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "code",
    description: "Напишите функцию hello(), которая возвращает строку \"Hello, World!\".",
    initialCode: "func hello() string {\n  // Ваш код\n}",
    testTemplate: "return hello();",
    tests: [
      { params: [], expected: "Hello, World!" },
    ],
    solution: "func hello() string {\n  return \"Hello, World!\"\n}",
  },
  {
    id: 40002,
    title: "Объявление переменных",
    difficulty: "Easy",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "single-choice",
    description: "Какой синтаксис объявления переменной НЕвалиден в Go?",
    options: [
      "var x int = 10",
      "x := 10",
      "var x = 10",
      "int x = 10",
    ],
    correctAnswer: "int x = 10",
    solution: "Go использует постфиксный тип: var x int = 10, или краткую форму x := 10.",
  },
  {
    id: 40003,
    title: "Типы данных",
    difficulty: "Easy",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "multi-choice",
    description: "Выберите все встроенные целочисленные типы в Go:",
    options: [
      "int",
      "int64",
      "uint",
      "Integer",
      "int32",
    ],
    correctAnswer: [0, 1, 2, 4],
    solution: "Go предоставляет int, int8/16/32/64, uint, uint8/16/32/64. Типа Integer не существует.",
  },
  {
    id: 40004,
    title: "Множественный возврат",
    difficulty: "Easy",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "output-predictor",
    description: "Что выведет код?",
    initialCode: `func divide(a, b int) (int, error) {
  if b == 0 {
    return 0, errors.New("division by zero")
  }
  return a / b, nil
}
func main() {
  res, _ := divide(10, 3)
  fmt.Println(res)
}`,
    expectedOutput: "3",
    solution: "Функция divide возвращает (int, error). _ игнорирует ошибку. 10 / 3 = 3 (целочисленное деление).",
  },
  {
    id: 40005,
    title: "Срезы (slices)",
    difficulty: "Easy",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "single-choice",
    description: "Что выведет код?\n\nnums := []int{1, 2, 3, 4, 5}\ns := nums[1:4]\nfmt.Println(s)",
    options: [
      "[1 2 3]",
      "[2 3 4]",
      "[2 3 4 5]",
      "[1 2 3 4]",
    ],
    correctAnswer: "[2 3 4]",
    solution: "Срез nums[1:4] включает элементы с индекса 1 по 3 (не включая 4). Результат: [2 3 4].",
  },
  {
    id: 40006,
    title: "Указатели",
    difficulty: "Medium",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "output-predictor",
    description: "Что выведет код?",
    initialCode: `func main() {
  x := 42
  p := &x
  *p = 21
  fmt.Println(x)
}`,
    expectedOutput: "21",
    solution: "p — указатель на x. Изменение *p меняет и x.",
  },
  {
    id: 40007,
    title: "Структуры и методы",
    difficulty: "Medium",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "code",
    description: "Создайте структуру Rectangle с полями width, height (float64) и метод area(), возвращающий площадь.",
    initialCode: `type Rectangle struct {
  width  float64
  height float64
}

// Ваш код`,
    testTemplate: "r := Rectangle{10, 5}; return r.area();",
    tests: [
      { params: [], expected: "50" },
    ],
    solution: "func (r Rectangle) area() float64 {\n  return r.width * r.height\n}",
  },
  {
    id: 40008,
    title: "Интерфейсы",
    difficulty: "Medium",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "single-choice",
    description: "Когда тип удовлетворяет интерфейсу в Go?",
    options: [
      "Когда явно implements интерфейс",
      "Когда реализует все методы интерфейса",
      "Когда наследуется от интерфейса",
      "Только если интерфейс пустой",
    ],
    correctAnswer: "Когда реализует все методы интерфейса",
    solution: "Go использует неявную реализацию интерфейсов: тип автоматически удовлетворяет интерфейсу, если реализует все его методы.",
  },
  {
    id: 40009,
    title: "Горутины",
    difficulty: "Medium",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "single-choice",
    description: "Как запустить функцию f() в отдельной горутине?",
    options: [
      "go f()",
      "thread f()",
      "async f()",
      "goroutine f()",
    ],
    correctAnswer: "go f()",
    solution: "Ключевое слово go перед вызовом функции запускает её в лёгком потоке — горутине.",
  },
  {
    id: 40010,
    title: "Каналы",
    difficulty: "Medium",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "output-predictor",
    description: "Что выведет код?",
    initialCode: `func main() {
  ch := make(chan int)
  go func() { ch <- 42 }()
  fmt.Println(<-ch)
}`,
    expectedOutput: "42",
    solution: "Канал ch передаёт значение 42 из горутины в main. <-ch читает из канала.",
  },
  {
    id: 40011,
    title: "Отложенные вызовы",
    difficulty: "Medium",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "output-predictor",
    description: "Что выведет код?",
    initialCode: `func main() {
  defer fmt.Print("world ")
  fmt.Print("hello ")
}`,
    expectedOutput: "hello world",
    solution: "defer откладывает выполнение до выхода из функции. Выполняется в обратном порядке LIFO.",
  },
  {
    id: 40012,
    title: "Обработка ошибок",
    difficulty: "Medium",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "code",
    description: "Напишите функцию safeDivide(a, b float64) (float64, error), возвращающую ошибку при b == 0.",
    initialCode: `import "errors"

func safeDivide(a, b float64) (float64, error) {
  // Ваш код
}`,
    testTemplate: "res, err := safeDivide(10, 0); if err != nil { return \"error\" }; return \"ok\";",
    tests: [
      { params: [], expected: "error" },
    ],
    solution: "func safeDivide(a, b float64) (float64, error) {\n  if b == 0 {\n    return 0, errors.New(\"division by zero\")\n  }\n  return a / b, nil\n}",
  },
  {
    id: 40013,
    title: "Метод sort.Slice",
    difficulty: "Hard",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "code",
    description: "Отсортируйте срез чисел по убыванию с помощью sort.Slice.",
    initialCode: `import "sort"

func sortDesc(nums []int) []int {
  // Ваш код
}`,
    testTemplate: "return fmt.Sprint(sortDesc([]int{3, 1, 4, 1, 5}));",
    tests: [
      { params: [], expected: "[5 4 3 1 1]" },
    ],
    solution: "func sortDesc(nums []int) []int {\n  sort.Slice(nums, func(i, j int) bool {\n    return nums[i] > nums[j]\n  })\n  return nums\n}",
  },
  {
    id: 40014,
    title: "sync.WaitGroup",
    difficulty: "Hard",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "code",
    description: "Используя sync.WaitGroup, дождитесь завершения 3 горутин, каждая печатает число от 1 до 3.",
    initialCode: `import (
  "fmt"
  "sync"
)

func printNums() {
  var wg sync.WaitGroup
  // Ваш код
}`,
    testTemplate: "printNums(); return \"ok\"",
    tests: [
      { params: [], expected: "ok" },
    ],
    solution: "func printNums() {\n  var wg sync.WaitGroup\n  for i := 1; i <= 3; i++ {\n    wg.Add(1)\n    go func(n int) {\n      defer wg.Done()\n      fmt.Println(n)\n    }(i)\n  }\n  wg.Wait()\n}",
  },
  {
    id: 40015,
    title: "Паттерн Select",
    difficulty: "Hard",
    topic: "Go Syntax",
    card: "Go Syntax",
    stack: "Go",
    module: "Основы",
    mode: "single-choice",
    description: "Что делает select в Go?",
    options: [
      "Выбирает случайный case из готовых каналов",
      "Выполняет все case последовательно",
      "Создаёт новый канал",
      "Закрывает канал",
    ],
    correctAnswer: "Выбирает случайный case из готовых каналов",
    solution: "select ждёт, пока один из каналов будет готов, и выполняет соответствующий case. При нескольких готовых выбирает случайный.",
  },
];
