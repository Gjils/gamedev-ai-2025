import { Accessor, createSignal } from 'solid-js';
import { SetStoreFunction } from 'solid-js/store';
import styles from './GraphNode.module.css';
import GraphNodeInterface from './GraphNodeInterface';

interface GraphNodeProps {
  scale: Accessor<number>;
  node: GraphNodeInterface;
  setNode: SetStoreFunction<GraphNodeInterface>;
  transform: { x: number; y: number; scale: number };
  onClick?: () => void;
}

function GraphNode(props : GraphNodeProps) {
  const position = () => props.node.position;
  const transform = () => props.transform;
  const { scene_id } = props.node;
  const { setNode } = props;

  const [isDragging, setIsDragging] = createSignal(false);
  const [dragStartPos, setDragStartPos] = createSignal({ x: 0, y: 0 });
  let nodeRef: HTMLDivElement | undefined;

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return; // Только левая кнопка мыши
    
    e.preventDefault();
    e.stopPropagation();
    
    // Запоминаем начальную позицию для определения клика vs перетаскивания
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
    
    // Добавляем глобальные обработчики для отслеживания перемещения мыши
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging()) return;
    
    // Преобразуем экранные координаты в координаты графа
    // Учитываем трансформацию контейнера (смещение и масштаб)
    // Также учитываем размер узла, чтобы центр узла был под курсором
    const nodeWidth = 150; // из CSS
    const nodeHeight = 60; // из CSS

    const newX = (e.clientX - transform().x) / transform().scale - nodeWidth / 2;
    const newY = (e.clientY - transform().y) / transform().scale - nodeHeight / 2;

    setNode("position", { x: newX, y: newY });
  };

  const handleMouseUp = (e: MouseEvent) => {
    const startPos = dragStartPos();
    const distance = Math.sqrt(
      Math.pow(e.clientX - startPos.x, 2) + Math.pow(e.clientY - startPos.y, 2)
    );
    
    // Если мышь сдвинулась меньше чем на 5 пикселей, считаем это кликом
    if (distance < 5 && props.onClick) {
      props.onClick();
    }
    
    setIsDragging(false);
    
    // Удаляем глобальные обработчики
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div 
      ref={nodeRef}
      class={`${styles.GraphNode} ${isDragging() ? styles.dragging : ''}`}
      style={{ 
        left: `${position().x}px`, 
        top: `${position().y}px`,
        cursor: isDragging() ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
    >
      <span>{scene_id}</span>
    </div>
  );
}

export default GraphNode;