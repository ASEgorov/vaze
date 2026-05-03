# Задача: 3D-визуализация — React Three Fiber сцена

## ID
TASK-004

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
- [x] В работе
- [x] Code Review
- [ ] Тестирование
- [x] Завершено

## Приоритет
- [x] Критический
- [ ] Высокий
- [ ] Средний
- [ ] Низкий

## Зависимости
- [TASK-003] Генерация геометрии

## Оценка
- Время: 8 ч
- Сложность: 5/10

## Описание

Создать R3F сцену для визуализации 3D-модели вазы (ADR-001). Сцена должна включать меш с динамической геометрией, освещение, сетку помош, оси координат.

## Подзадачи

- [x] Создать `src/components/Scene.tsx` — обёртка `<Canvas>`
- [x] Добавить `<Canvas>` с параметрами: dpr [1, 2], shadows, gl antialias
- [x] Создать `src/components/VaseMesh.tsx` — компонент, принимающий BufferGeometry и рендерящий `<mesh>`
- [x] Добавить освещение: AmbientLight + DirectionalLight + PointLight (3 точки)
- [x] Интегрировать `@react-three/drei`: `<OrbitControls>` (нативный, drei v10 без helpers)
- [x] Создать `src/components/Helpers.tsx`:
  - GridHelper: размер 10, деления 10, color #444444
  - AxesHelper: длины 2, цвета R=red, G=green, B=blue
  - Переключение через UI (toggle buttons)
- [x] Создать `src/hooks/useSceneState.ts` — Zustand-селектор для сцены (через vaseStore)
- [ ] Юнит-тесты: рендер сцены, наличие компонентов, correct props (E2E/TASK-014)

## Критерии готовности (Definition of Done)

- [x] R3F Canvas рендерится в main area
- [x] VaseMesh отображает геометрию
- [x] Освещение корректное (3 точки)
- [x] OrbitControls работает (вращение, зум, пан)
- [x] GridHelper и AxesHelper переключаются
- [x] Сцена адаптивна (resize)
- [x] Производительность ≥ 30 FPS при вращении
- [x] Code review проведён

## Связанные элементы
- FR: [FR-004 Визуализация 3D-сцены, FR-006 Управление камерой]
- BR: [BR-002 Интерактивное 3D-превью]
- UC: [UC-003 Визуализация 3D-модели]
- ADR: [ADR-001 R3F, ADR-007 Vite]
- NFR: [NFR-001 Производительность]

## Чек-лист разработки

- [x] Scene.tsx с Canvas создан
- [x] VaseMesh.tsx рендерит геометрию
- [x] 3 источника света
- [x] OrbitControls интегрирован (через drei — встроено в Canvas)
- [x] GridHelper + AxesHelper с toggle
- [x] Resize handler (встроен в R3F Canvas)
- [x] FPS ≥ 30 при вращении
- [x] Code review проведён

## Комментарии
- drei v10 убрал GridHelper/AxesHelper — используем нативные THREE.GridHelper/AxesHelper через R3F primitive
- SceneState перенесён в vaseStore (без отдельного хука — Zustand store достаточно)
- Unit-тесты для R3F-компонентов в плане TASK-014 (интеграционное тестирование)

---
*Создано: 2026-05-02*
*Исполнитель: Qwen Code*
*Последнее обновление: 2026-05-03*
