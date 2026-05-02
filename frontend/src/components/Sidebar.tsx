/**
 * Sidebar — боковая панель настроек вазы
 *
 * Содержит:
 * - Поле ввода формулы радиуса сечения r = f(h) или r = f(h, θ)
 * - Параметры: min-height, max-height
 * - Сегменты / срезы
 * - Кнопка обновления превью
 */

interface SidebarProps {
  formula: string;
  onFormulaChange: (value: string) => void;
  minHeight: number;
  onMinHeightChange: (value: number) => void;
  maxHeight: number;
  onMaxHeightChange: (value: number) => void;
  segments: number;
  onSegmentsChange: (value: number) => void;
  slices: number;
  onSlicesChange: (value: number) => void;
}

export function Sidebar({
  formula,
  onFormulaChange,
  minHeight,
  onMinHeightChange,
  maxHeight,
  onMaxHeightChange,
  segments,
  onSegmentsChange,
  slices,
  onSlicesChange,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <h2 className="sidebar__title">Параметры вазы</h2>

      <div className="field">
        <label className="field__label" htmlFor="formula">
          Формула радиуса сечения
        </label>
        <textarea
          id="formula"
          className="field__input field__input--textarea"
          value={formula}
          onChange={(e) => onFormulaChange(e.target.value)}
          placeholder="r(h) = 2 + sin(pi * h)"
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="minHeight">
          Высота: от — до
        </label>
        <div className="field__row">
          <input
            id="minHeight"
            type="number"
            className="field__input"
            value={minHeight}
            min={0}
            max={maxHeight}
            onChange={(e) => onMinHeightChange(Number(e.target.value))}
            placeholder="min"
          />
          <input
            type="number"
            className="field__input"
            value={maxHeight}
            min={minHeight}
            max={1000}
            onChange={(e) => onMaxHeightChange(Number(e.target.value))}
            placeholder="max"
          />
        </div>
      </div>

      <div className="field">
        <label className="field__label" htmlFor="segments">
          Сегменты (округлые)
        </label>
        <input
          id="segments"
          type="number"
          className="field__input"
          value={segments}
          min={3}
          max={128}
          onChange={(e) => onSegmentsChange(Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label className="field__label" htmlFor="slices">
          Срезы (высота)
        </label>
        <input
          id="slices"
          type="number"
          className="field__input"
          value={slices}
          min={10}
          max={500}
          onChange={(e) => onSlicesChange(Number(e.target.value))}
        />
      </div>

      <button className="btn btn--primary btn--full">Обновить модель</button>
    </aside>
  );
}
