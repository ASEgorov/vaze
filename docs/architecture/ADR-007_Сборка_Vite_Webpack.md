# ADR-007: Выбор Vite в качестве сборщика

## ID
ADR-007

## Статус
- [x] Предложено
- [ ] Принято
- [ ] Отклонено
- [ ] Устарело

## Контекст

Для сборки фронтенд-проекта необходимо выбрать инструмент сборки. Основные кандидаты: Vite (esbuild/rollup), Webpack 5, esbuild alone.

## Решение

Использовать **Vite** как основной инструмент сборки и dev-сервер.

### Почему Vite:
- **HMR**: мгновенная hot module replacement — обновление за миллисекунды
- **Build speed**: esbuild для dev-сервера (Go, компилируется), rollup для production (оптимизация)
- **TypeScript out-of-the-box**: нет need для ts-loader, встроенная поддержка
- **CSS preprocessing**: sass, less, stylus — через плагины
- **Plugin ecosystem**: Vite плагины для TypeScript, React, PWA, sitemap и т.д.
- **Dev server**: встроенный HMR, proxy, CORS — без дополнительной настройки
- **Bundle analysis**: встроенная поддержка через `rollup-plugin-visualizer`

### Конфигурация:
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePwa } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    vitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          mathjs: ['mathjs'],
        },
      },
    },
  },
});
```

## Последствия

### Положительные
- Мгновенный dev-server — нет холодного старта как в Webpack
- Production-билд: tree-shaking, code splitting, minification, sourcemaps
- PWA plugin: встроенная генерация Service Worker'а
- Manual chunks: three.js и math.js в отдельные chunks — кэширование
- TypeScript support без дополнительной настройки

### Отрицательные
- Migrate с Webpack — нужно переписать конфигурацию (если проект уже на Webpack)
- Некоторые Webpack плагины могут не иметь Vite-аналогов
- Vite использует Rollup для build — некоторые Rollup плагины не совместимы с Vite

## Альтернативы

| Альтернатива | Плюсы | Минусы | Оценка |
|--------------|-------|--------|--------|
| Vite | HMR, speed, TS, PWA, plugins | Rollup для build | + (выбрано) |
| Webpack 5 | Экосистема плагинов, mature | Медленный dev-server, verbose config | - |
| esbuild alone | Быстрый | Нет HMR, мало плагинов, нет tree-shaking | ✗ |

## Связанные элементы
- Стек: React + TypeScript + Vite
- NFR: [NFR-001 Производительность — размер bundle ≤ 350 КБ gzip]

---
*Создано: 2026-05-02*
*Автор: Qwen Code*
*Последнее обновление: 2026-05-02*
