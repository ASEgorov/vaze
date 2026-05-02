/**
 * Типы проекта VaseForge
 */

export interface VaseConfig {
  formula: string;
  minHeight: number;
  maxHeight: number;
  segments: number;
  slices: number;
}

export interface ValidationError {
  message: string;
  type: 'syntax' | 'whitelist' | 'range' | 'timeout' | 'other';
}

export interface Project {
  id: string;
  name: string;
  config: VaseConfig;
  createdAt: number;
  updatedAt: number;
}

export interface ExportOptions {
  format: 'binary' | 'ascii';
  scale: number;
  orientation: 'auto' | 'flat' | 'vertical';
}
