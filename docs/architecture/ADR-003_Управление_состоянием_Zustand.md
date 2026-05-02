# ADR-003: Выбор Zustand для управления состоянием

## ID
ADR-003

## Статус
- [x] Предложено
- [ ] Принято
- [ ] Отклонено
- [ ] Устарело

## Контекст

VaseForge использует React как UI-фреймворк. Для управления глобальным состоянием (текущая формула, параметры модели, список проектов, настройки камеры, UI-состояние) необходимо выбрать библиотеку state management.

Основные кандидаты: Zustand, Jotai, Redux Toolkit, React Context + useReducer.

## Решение

Использовать **Zustand** как основную библиотеку для управления состоянием.

### Почему Zustand:
- **Минимальный overhead**: ~1 КБ, нет провайдеров, нет boilerplate
- **Hooks-first API**: `useStore` хук для подписки на части стора
- **Middleware**: persisted (синхронизация с localStorage/IndexedDB), devtools, immer
- **TypeScript**: отличная поддержка из коробки
- **Производительность**: селекторы для подписки только на нужных частях состояния — нет лишних re-renders
- **Интеграция с R3F**: Zustand отлично работает с React Three Fiber через `useStore`
- **Селекторы**: подписка на `state.formula` не вызывает re-render при изменении `state.ui`

## Структура стора

```typescript
interface AppState {
  // Форма
  formula: {
    text: string;
    parsed: AST | null;
    errors: ValidationError[];
  };

  // Параметры модели
  model: {
    maxHeight: number;
    segments: number;
    scale: number;
    orientation: 'base' | 'side' | 'custom';
  };

  // Геометрия
  geometry: {
    mesh: BufferGeometry | null;
    triangleCount: number;
    boundingBox: Box3 | null;
  };

  // Камера
  camera: {
    position: Vector3;
    target: Vector3;
  };

  // Проекты
  projects: {
    list: ProjectSummary[];
    current: Project | null;
  };

  // Библиотека
  library: {
    formulas: FormulaCard[];
    categories: string[];
  };

  // UI
  ui: {
    activeCategory: string;
    showGrid: boolean;
    showAxes: boolean;
    notifications: Notification[];
  };
}
```

## Последствия

### Положительные
- Лёгкий старт: `create<AppState>(...)` — и всё работает
- Middleware `persist` для автосохранения в localStorage
- Простая миграция: Zustand можно заменить при необходимости
- Devtools middleware для отладки в React DevTools
- Immer middleware для immutable updates

### Отрицательные
- Меньше экосистема чем Redux (меньше middleware, less community)
- Нет built-in time-travel debugging (нужен сторонний middleware)
- Менее строгая структура actions (в отличие от Redux reducers)

## Альтернативы

| Альтернатива | Плюсы | Минусы | Оценка |
|--------------|-------|--------|--------|
| Zustand | 1 КБ, hooks-first, middleware, TS | Меньше community чем Redux | + (выбрано) |
| Jotai | Атомарное состояние, fine-grained | Меньше middleware, сложнее для complex state | - |
| Redux Toolkit | Экосистема, devtools, middleware | Boilerplate, 15 КБ, провайдеры | - |
| Context + useReducer | No dependency | Re-render всех consumers, сложно масштабировать | ✗ |

## Связанные элементы
- FR: [FR-007 Сохранение проекта, FR-008 Загрузка проекта]
- UC: [UC-005 Управление проектами]

---
*Создано: 2026-05-02*
*Автор: Qwen Code*
*Последнее обновление: 2026-05-02*
