/**
 * AppLayout — основной лейаут приложения
 *
 * Структура:
 * ┌──────────────────────────────────────────────┐
 * │              Toolbar (header)                │
 * ├──────────┬───────────────────────────────────┤
 * │          │      MainPreview                  │
 * │ Sidebar  │      (3D canvas + R3F)            │
 * │          │                                   │
 * └──────────┴───────────────────────────────────┘
 */
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { MainPreview } from './MainPreview';

interface AppLayoutProps {
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

export function AppLayout({
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
}: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Toolbar />
      <div className="app-layout__body">
        <Sidebar
          formula={formula}
          onFormulaChange={onFormulaChange}
          minHeight={minHeight}
          onMinHeightChange={onMinHeightChange}
          maxHeight={maxHeight}
          onMaxHeightChange={onMaxHeightChange}
          segments={segments}
          onSegmentsChange={onSegmentsChange}
          slices={slices}
          onSlicesChange={onSlicesChange}
        />
        <MainPreview />
      </div>
    </div>
  );
}
