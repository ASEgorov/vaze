# Задача: Формула-парсер — math.js интеграция

## ID
TASK-002

## Тип
- [x] Разработка
- [ ] Анализ
- [ ] Дизайн
- [ ] Тестирование
- [ ] Документация
- [ ] Багфикс
- [ ] Другое

## Статус
- [ ] Бэклог
- [ ] Готово к старту
- [ ] В работе
- [ ] Code Review
- [ ] Тестирование
- [x] Завершено

## Приоритет
- [x] Критический
- [ ] Высокий
- [ ] Средний
- [ ] Низкий

## Зависимости
- [TASK-001] Сборка проекта

## Оценка
- Время: 8 ч
- Сложность: 5/10

## Описание

Реализовать модуль парсинга и валидации математических формул на основе math.js (ADR-002). Парсер должен поддерживать переменные `h` (0 → maxHeight) и `theta` (0 → 2π), константы `pi`, `e`, и whitelist функций.

## Подзадачи

- [x] Создать `src/utils/formulaParser.ts` с инициализацией math.js
- [x] Реализовать `parseFormula(expression: string): { ast: AST | null; errors: ValidationError[] }`
- [x] Реализовать `evaluateFormula(ast: AST, vars: { h?: number; theta?: number }): number`
- [x] Добавить whitelist функций: `sin, cos, tan, asin, acos, atan, pow, sqrt, abs, log, exp, floor, ceil, round, min, max, mod`
- [x] Добавить защиту: timeout (1 сек), лимит операций (10000), max длина формулы (500 символов)
- [x] Создать `src/hooks/useFormulaValidation.ts` — кастомный хук для валидации в реальном времени
- [x] Добавить юнит-тесты: корректные формулы, ошибки синтаксиса, NaN, timeout, whitelist (49 тестов)
- [x] Экспортировать `hasFormulaVariable(formula: string, variable: string): boolean` для ADR-004

## Критерии готовности (Definition of Done)

- [x] Формулы парсятся и вычисляются корректно
- [x] whitelist функций работает — запрещённые функции блокируются
- [x] timeout и лимит операций enforced
- [x] Ошибки возвращаются с понятными сообщениями
- [x] Поддержка переменных `h` и `theta`
- [x] Функция `hasFormulaVariable` определяет наличие theta
- [x] Unit-тесты проходят (49 тестов, 100% passing)
- [x] Code review проведён

## Связанные элементы
- FR: [FR-001 Парсинг и валидация формулы]
- BR: [BR-005 Валидация формула]
- UC: [UC-001 Парсер формула]
- ADR: [ADR-002 Парсер math.js]
- NFR: [NFR-003 Безопасность]

## Чек-лист разработки

- [x] Инициализирован math.js
- [x] parseFormula возвращает AST + ошибки
- [x] evaluateFormula работает с {h} и {h, theta}
- [x] whitelist функций настроен
- [x] timeout и operation limit enforced
- [x] useFormulaValidation хук создан
- [x] hasFormulaVariable работает
- [x] Юнит-тесты написаны и проходят (49 тестов)
- [x] Code review проведён

## Комментарии
[Замечания, вопросы, обсуждения]

---
*Создано: 2026-05-02*
*Исполнитель: [имя]*
*Последнее обновление: 2026-05-02*
