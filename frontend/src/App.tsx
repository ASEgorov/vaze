/**
 * Главный компонент приложения
 */
import { AppLayout } from '@/components/AppLayout';
import { useVaseStore } from '@/stores/vaseStore';

export function App() {
  const { config, setConfig, setFormulaError } = useVaseStore();

  return (
    <AppLayout
      formula={config.formula}
      onFormulaChange={(value) => {
        setConfig({ formula: value });
        setFormulaError(null);
      }}
      minHeight={config.minHeight}
      onMinHeightChange={(value) => setConfig({ minHeight: value })}
      maxHeight={config.maxHeight}
      onMaxHeightChange={(value) => setConfig({ maxHeight: value })}
      segments={config.segments}
      onSegmentsChange={(value) => setConfig({ segments: value })}
      slices={config.slices}
      onSlicesChange={(value) => setConfig({ slices: value })}
    />
  );
}
