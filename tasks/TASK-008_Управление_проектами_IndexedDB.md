# Задача: Управление проектами — IndexedDB + Zustand persist

## ID
TASK-008

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
- [ ] Высокий
- [ ] Критический
- [x] Средний
- [ ] Низкий

## Зависимости
- [TASK-007] UI-интеграция

## Оценка
- Время: 8 ч
- Сложность: 5/10

## Описание

Реализовать сохранение и загрузку проектов через IndexedDB (ADR-006). Автосохранение при изменениях, список проектов, загрузка выбранного проекта, удаление.

## Подзадачи

- [ ] Создать `src/db/projectsDB.ts` — Dexie-база с таблицами:
  - `projects: ++id, name, createdAt, updatedAt, formula, maxHeight, segments, scale`
  - `formulas: ++id, name, description, category, formula, createdAt`
- [ ] Создать `src/stores/projectStore.ts` — Zustand-стор с middleware persist (IndexedDB)
- [ ] Реализовать `saveProject(name: string): Promise<Project>`
- [ ] Реализовать `loadProject(id: number): Promise<Project | undefined>`
- [ ] Реализовать `deleteProject(id: number): Promise<void>`
- [ ] Реализовать `listProjects(): Promise<ProjectSummary[]>`
- [ ] Добавить автосохранение через useEffect (debounce 2 сек)
- [ ] Создать `src/components/ProjectManager.tsx`:
  - Список проектов с кнопками Load/Delete
  - Модальное окно сохранения (имя + категория)
  - Поиск по названию

## Критерии готовности (Definition of Done)

- [ ] Проекты сохраняются в IndexedDB
- [ ] Проекты загружаются из IndexedDB
- [ ] Автосохранение работает (debounce 2 сек)
- [ ] Список проектов отображается
- [ ] Удаление проекта работает
- [ ] Данные не теряются при перезагрузке страницы
- [ ] Code review проведён

## Связанные элементы
- FR: [FR-007 Сохранение проекта, FR-008 Загрузка проекта]
- BR: [BR-004 Сохранение и загрузка проектов]
- UC: [UC-005 Управление проектами]
- ADR: [ADR-006 IndexedDB]
- NFR: [NFR-005 Надёжность — автосохранение]

## Чек-лист разработки

- [ ] Dexie-база создана
- [ ] saveProject реализован
- [ ] loadProject реализован
- [ ] deleteProject реализован
- [ ] listProjects реализован
- [ ] Автосохранение с debounce
- [ ] ProjectManager UI
- [ ] Данные не теряются при перезагрузке
- [ ] Code review проведён

## Комментарии
[Замечания, вопросы, обсуждения]

---
*Создано: 2026-05-02*
*Исполнитель: [имя]*
*Последнее обновление: 2026-05-02*
