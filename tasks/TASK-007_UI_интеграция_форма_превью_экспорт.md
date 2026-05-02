# Задача: UI-интеграция — форма, превью, тулбар

## ID
TASK-007

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
- [ ] Завершено

## Приоритет
- [x] Критический
- [ ] Высокий
- [ ] Средний
- [ ] Низкий

## Зависимости
- [TASK-002] Формула-парсер
- [TASK-003] Генерация геометрии
- [TASK-004] 3D-визуализация R3F
- [TASK-005] Экспорт STL

## Оценка
- Время: 12 ч
- Сложность: 6/10

## Описание

Собрать главный UI: сайдбар с полем ввода формулы и параметрами, основная область с 3D-превью, тулбар с кнопками экспорта. Связать все части через Zustand.

## Подзадачи

- [ ] Создать `src/components/Sidebar.tsx`:
  - Поле ввода формулы с подсветкой ошибок
  - Слайдер maxHeight (10–1000 мм)
  - Слайдер segments (8–1024)
  - Слайер scale (0.1–5.0)
  - Чекбоксы: showGrid, showAxes
- [ ] Создать `src/components/MainPanel.tsx` — обёртка для Canvas
- [ ] Создать `src/components/Toolbar.tsx`:
  - Кнопка Export STL
  - Кнопка Save Project
  - Кнопка Load Project
  - Кнопка Reset Camera
- [ ] Создать `src/stores/appStore.ts` — Zustand-стор с middleware persist
- [ ] Подключить formula input → useFormulaValidation → geometry generator
- [ ] Подключить параметры → regeneration
- [ ] Подключить export button → useSTLExport
- [ ] Responsive layout: desktop (sidebar left), mobile (sidebar top/bottom)

## Критерии готовности (Definition of Done)

- [ ] Sidebar с формулой и параметрами рендерится
- [ ] Изменение формулы → пересчёт геометрии
- [ ] Изменение параметров → пересчёт
- [ ] Toolbar кнопки работают
- [ ] Export STL скачивает файл
- [ ] Layout адаптивен
- [ ] Code review проведён

## Связанные элементы
- US: [US-001, US-002, US-003, US-004]
- BR: [BR-001, BR-002, BR-003]
- FR: [FR-001, FR-003, FR-004, FR-005]
- UC: [UC-002, UC-003, UC-004]

## Чек-лист разработки

- [ ] Sidebar.tsx с формулой и параметрами
- [ ] MainPanel.tsx с Canvas
- [ ] Toolbar.tsx с кнопками
- [ ] appStore.ts Zustand-стор
- [ ] Pipeline: formula → geometry → mesh
- [ ] Export STL скачивает
- [ ] Responsive layout
- [ ] Code review проведён

## Комментарии
[Замечания, вопросы, обсуждения]

---
*Создано: 2026-05-02*
*Исполнитель: [имя]*
*Последнее обновление: 2026-05-02*
