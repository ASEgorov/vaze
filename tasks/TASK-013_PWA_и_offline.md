# Задача: PWA и offline-режим

## ID
TASK-013

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
- [ ] Средний
- [x] Низкий

## Зависимости
- [TASK-007] UI-интеграция
- [TASK-008] Управление проектами

## Оценка
- Время: 6 ч
- Сложность: 4/10

## Описание

Добавить PWA-функциональность (NFR-006): установка на устройство, Service Worker, кэширование, базовая работа offline.

## Подзадачи

- [ ] Добавить `vite-plugin-pwa` в vite.config.ts
- [ ] Настроить Service Worker:
  - Workbox для кэширования статических ресурсов
  - Cache-first для библиотеки, Network-first для данных
  - `registerType: 'autoUpdate'`
- [ ] Создать `public/manifest.json`:
  - name: VaseForge
  - short_name: VaseForge
  - theme_color: #1a1a2e
  - background_color: #16213e
  - display: standalone
  - icons: 192×192, 512×512
- [ ] Добавить иконки в `public/icons/`
- [ ] Реализовать offline fallback для UI:
  - Экран «No connection» при потере сети
  - Работоспособность: formula input, geometry preview, STL export
  - Ограничение: save/load проектов только при наличии сети (если IndexedDB не доступен)
- [ ] Добавить «Install app» prompt

## Критерии готовности (Definition of Done)

- [ ] PWA manifest присутствует и валиден
- [ ] Service Worker кэширует ресурсы
- [ ] Приложение устанавливается на устройство
- [ ] Базовый функционал работает offline
- [ ] Lighthouse PWA score ≥ 90
- [ ] Code review проведён

## Связанные элементы
- NFR: [NFR-006 Доступность и PWA]
- ADR: [ADR-007 Vite]

## Чек-лист разработки

- [ ] vite-plugin-pwa настроен
- [ ] manifest.json создан
- [ ] Service Worker кэширует
- [ ] Install prompt работает
- [ ] Offline fallback UI
- [ ] Lighthouse PWA ≥ 90
- [ ] Code review проведён

## Комментарии
[Замечания, вопросы, обсуждения]

---
*Создано: 2026-05-02*
*Исполнитель: [имя]*
*Последнее обновление: 2026-05-02*
