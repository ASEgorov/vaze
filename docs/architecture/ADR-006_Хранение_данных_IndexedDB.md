# ADR-006: Выбор IndexedDB для хранения проектов и библиотеки

## ID
ADR-006

## Статус
- [x] Предложено
- [ ] Принято
- [ ] Отклонено
- [ ] Устарело

## Контекст

VaseForge хранит локально:
- **Проекты**: формулы, параметры модели, настройки камеры, размеры (до 10–20 МБ)
- **Библиотека формул**: пользовательские формулы, метаданные, превью (1–5 МБ)
- **Кэш**: загруженные модели, превью, история изменений

Необходимо выбрать систему хранения с учётом объёма данных и ограничений.

## Решение

Использовать **IndexedDB** через обёртку **idb-keyval** (или Dexie.js) для хранения проектов и библиотеки.

### Почему IndexedDB:
- **Объём**: квота ~60% диска (в отличие от localStorage — 5 МБ)
- **Асинхронность**: не блокирует main thread
- **Structured data**: поддерживает blob, arraybuffer, complex objects
- **Индeксы**: Dexie.js позволяет индексировать по полям (date, name, category)
- **PWA-friendly**: работает offline, кэшируется Service Worker'ом

### Структура базы данных:
```typescript
const db = new Dexie('VaseForgeDB');

// Таблица проектов
db.version(1).stores({
  projects: '++id, name, createdAt, updatedAt, category',
  formulas: '++id, name, description, category, createdAt',
  cache: '++id, type, key, timestamp',
});
```

### Опциональный fallback:
- Для простых UI-состояний (theme, language) использовать **localStorage**
- IndexedDB — для проектов и формул (сложные объекты, бинарные данные)

## Реализация

```typescript
// Пример через Dexie.js
class VaseForgeDB extends Dexie {
  projects!: Dexie.Table<Project, number>;
  formulas!: Dexie.Table<Formula, number>;

  constructor() {
    super('VaseForgeDB');
    this.version(1).stores({
      projects: '++id, name, createdAt, updatedAt',
      formulas: '++id, name, createdAt, category',
    });
  }
}

const db = new VaseForgeDB();

// Операции
await db.projects.add({ name: 'Vase1', formula: '5 + 2*sin(h*0.1)', ... });
const all = await db.projects.toArray();
const byDate = await db.projects.where('createdAt').above(1600000000).sortBy('createdAt');
```

## Последствия

### Положительные
- Квота ~60% диска — достаточно для сотен проектов
- Dexie.js — декларативный API, TypeScript, поддержка Promises
- Индексация по полям — быстрый поиск и фильтрация
- Структурированные объекты — без JSON.stringify/parse overhead

### Отрицательные
- Более сложный API чем localStorage
- Нет built-in sync (нужно делать вручную, если захотим облако)
- IndexedDB в Safari имеет quirks (нужно тестировать)

## Альтернативы

| Альтернатива | Плюсы | Минусы | Оценка |
|--------------|-------|--------|--------|
| IndexedDB + Dexie | 60% квота, async, indexes | Сложнее API, Safari quirks | + (выбрано) |
| localStorage | Простой API, sync | 5 МБ квота, блокирует thread, no indexes | ✗ |
| Cache Storage | Service Worker кэш | Не подходит для данных приложения | ✗ |
| File System Access API | Прямая работа с файлами | Только HTTPS, Chrome-only, нет storage | - |

## Связанные элементы
- BR: [BR-004 Сохранение и загрузка проектов]
- FR: [FR-007 Сохранение проекта, FR-008 Загрузка проекта]
- UC: [UC-005 Управление проектами]

---
*Создано: 2026-05-02*
*Автор: Qwen Code*
*Последнее обновление: 2026-05-02*
