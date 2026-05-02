# Задача: Оптимизация производительности

## ID
TASK-012

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
- [TASK-003] Генерация геометрии

## Оценка
- Время: 8 ч
- Сложность: 6/10

## Описание

Достичь целевых метрик производительности (NFR-001): FPS ≥ 30 при взаимодействии, обновление модели ≤ 500 мс, bundle ≤ 350 КБ gzip.

## Подзадачи

- [ ] Настроить code splitting в vite.config.ts:
  - `three`, `@react-three/fiber`, `@react-three/drei` → отдельный chunk
  - `mathjs` → отдельный chunk
- [ ] Добавить lazy loading для тяжёлых компонентов:
  - `<Canvas>` через React.lazy
  - Библиотека формул через React.lazy
- [ ] Оптимизировать генерацию геометрии:
  - useMemo для кэширования geometry
  - Debounce для formula input (300 мс)
  - Worker для тяжёлых вычислений (>200K тр)
- [ ] Настроить WebGL оптимизации:
  - `gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}`
  - `dpr: [1, 2]` — адаптивное качество рендеринга
  - Frustum culling для helper-компонентов
- [ ] Bundle analysis: `npm run build -- --report`
- [ ] Целевые метрики:
  - FPS idle ≥ 55, FPS interact ≥ 30
  - Обновление модели ≤ 500 мс
  - Загрузка сцены ≤ 2 сек
  - Bundle (gzip) ≤ 350 КБ

## Критерии готовности (Definition of Done)

- [ ] Code splitting настроен
- [ ] Lazy loading для тяжёлых компонентов
- [ ] useMemo + debounce для geometry
- [ ] FPS ≥ 30 при вращении модели
- [ ] Обновление модели ≤ 500 мс
- [ ] Bundle ≤ 350 КБ gzip
- [ ] Lighthouse performance score ≥ 80
- [ ] Code review проведён

## Связанные элементы
- NFR: [NFR-001 Производительность]
- ADR: [ADR-007 Vite]

## Чек-лист разработки

- [ ] Code splitting в vite.config.ts
- [ ] Lazy loading компонентов
- [ ] useMemo для geometry
- [ ] Debounce formula input
- [ ] WebGL powerPreference
- [ ] Bundle analysis ≤ 350 КБ
- [ ] FPS ≥ 30 при вращении
- [ ] Lighthouse ≥ 80
- [ ] Code review проведён

## Комментарии
[Замечания, вопросы, обсуждения]

---
*Создано: 2026-05-02*
*Исполнитель: [имя]*
*Последнее обновление: 2026-05-02*
