/**
 * Toolbar — верхняя панель инструментов
 *
 * Содержит кнопки: экспорт STL, сохранение проекта, загрузка проекта.
 */

export function Toolbar() {
  return (
    <header className="toolbar">
      <h1 className="toolbar__title">VaseForge</h1>
      <div className="toolbar__actions">
        <button className="btn btn--outline">Сохранить</button>
        <button className="btn btn--outline">Загрузить</button>
        <button className="btn btn--primary">Экспорт STL</button>
      </div>
    </header>
  );
}
