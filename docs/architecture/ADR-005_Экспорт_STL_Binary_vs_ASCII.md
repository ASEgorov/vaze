# ADR-005: Выбор бинарного формата STL для экспорта

## ID
ADR-005

## Статус
- [x] Предложено
- [ ] Принято
- [ ] Отклонено
- [ ] Устарело

## Контекст

VaseForge экспортирует 3D-модели в формате STL для 3D-печати. STL имеет два формата:
- **Binary STL**: 80-byte header + 50 bytes per triangle (compact, 2x меньше ASCII)
- **ASCII STL**: текстовый формат (readable, но 10x больше бинарного)

Необходимо выбрать формат экспорта.

## Решение

Поддержать **оба формата STL**, но по умолчанию использовать **Binary STL**.

### Почему Binary STL по умолчанию:
- **Размер**: в 2–10 раз меньше ASCII (зависит от количества треугольников)
- **Скорость**: быстрее генерация (нет string concatenation)
- **Стандарт индустрии**: все слайсеры (Cura, PrusaSlicer, Bambu Studio) поддерживают binary STL
- **Binary STL-спецификация**: стандартная, документированная, 100% совместима с ASCII

### ASCII STL как опция:
- Для отладки (можно открыть в текстовом редакторе)
- Для совместимости со старым ПО
- Для интеграции с системами, которые парсят STL как текст

### Реализация экспорта:
```typescript
function exportSTL(geometry: BufferGeometry, format: 'binary' | 'ascii'): Blob {
  if (format === 'binary') {
    return exportBinarySTL(geometry);
  }
  return exportAsciiSTL(geometry);
}
```

## Структура Binary STL

```
| Offset | Size (bytes) | Description |
|--------|-------------|-------------|
| 0 | 80 | Header |
| 80 | 4 | Number of triangles (uint32 LE) |
| 84 | 50 × N | Triangle records |

Triangle record (50 bytes):
- 12 × float32 LE: normal + 3 vertices (x, y, z)
- 2 × uint16 LE: attribute byte count (usually 0)
```

## Последствия

### Положительные
- Binary по умолчанию — маленькие файлы, быстрая генерация
- ASCII как опция — для совместимости и отладки
- Прямое чтение из BufferGeometry без преобразований
- Поддержка всех слайсеров

### Отрицательные
- Binary STL нельзя открыть в текстовом редакторе (нужен hex viewer для отладки)
- 50-байтовый record на треугольник — фиксированный overhead

## Альтернативы

| Альтернатива | Плюсы | Минусы | Оценка |
|--------------|-------|--------|--------|
| Binary STL | Компактный, быстрый, стандарт | Не readable | + (default) |
| ASCII STL | Readable, debuggable | 10x size, медленный | + (optional) |
| OBJ | Поддерживает материалы, текстуры | Сложнее, не стандарт для 3D-печати | ✗ |

## Связанные элементы
- BR: [BR-003 Экспорт в STL]
- FR: [FR-005 Экспорт в STL]
- UC: [UC-004 Экспорт 3D-модели]

---
*Создано: 2026-05-02*
*Автор: Qwen Code*
*Последнее обновление: 2026-05-02*
