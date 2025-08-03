import { useParams } from "@solidjs/router";
import { createEffect, createMemo, createResource, createSignal, For, onMount } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";

import GraphEdge, { GraphEdgeProps } from "../GraphEdge/GraphEdge";
import GraphNode from "../GraphNode/GraphNode";

import GraphNodeInterface from "../GraphNode/GraphNodeInterface";
import NodeInfo from "../NodeInfo/NodeInfo";
import styles from './Graph.module.css';

// API URL для backend
const API_BASE_URL = 'http://localhost:8000';

const NODE_SIZE = { width: 150, height: 60 };

// Функция для вычисления начального transform для центрирования графа
function calculateCenterTransform(nodes: GraphNodeInterface[], containerSize: { width: number; height: number }) {
  if (!nodes.length) return { x: 0, y: 0, scale: 1 };

  // Находим границы графа
  const positions = nodes.map(node => node.position);
  const minX = Math.min(...positions.map(p => p.x));
  const maxX = Math.max(...positions.map(p => p.x));
  const minY = Math.min(...positions.map(p => p.y));
  const maxY = Math.max(...positions.map(p => p.y));

  // Добавляем размеры узлов к границам
  const graphWidth = (maxX - minX) + NODE_SIZE.width;
  const graphHeight = (maxY - minY) + NODE_SIZE.height;

  // Размеры контейнера с отступами
  const MARGIN = 50;
  const availableWidth = containerSize.width - 2 * MARGIN;
  const availableHeight = containerSize.height - 2 * MARGIN;

  // Вычисляем масштаб для помещения графа в доступную область
  const scaleX = availableWidth / graphWidth;
  const scaleY = availableHeight / graphHeight;
  const scale = Math.min(scaleX, scaleY, 1); // Не увеличиваем больше 100%

  // Вычисляем центр графа
  const graphCenterX = minX + (maxX - minX) / 2;
  const graphCenterY = minY + (maxY - minY) / 2;

  // Вычисляем центр контейнера
  const containerCenterX = containerSize.width / 2;
  const containerCenterY = containerSize.height / 2;

  // Вычисляем смещение для центрирования
  const offsetX = containerCenterX - (graphCenterX * scale);
  const offsetY = containerCenterY - (graphCenterY * scale);

  return {
    x: offsetX,
    y: offsetY,
    scale: scale
  };
}

interface QuestResponse {
  quest_name: string;
  quest_data: {
    scenes: any[];
  };
  node_positions: Array<{
    scene_id: string;
    position: { x: number; y: number };
  }>;
}

// Функция для загрузки данных квеста
async function fetchQuestData(questName: string): Promise<GraphNodeInterface[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/get_quest_data/${questName}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: QuestResponse = await response.json();
    
    // Объединяем данные сцен с позициями
    const nodes = data.quest_data.scenes.map(scene => ({
      ...scene,
      position: data.node_positions.find(pos => pos.scene_id === scene.scene_id)?.position ?? { x: 0, y: 0 }
    }));
    
    return nodes;
  } catch (error) {
    console.error('Ошибка при загрузке данных квеста:', error);
    throw error;
  }
}

function Graph() {
  const { questName } = useParams();
  let containerRef: HTMLDivElement | null = null;
  const [transform, setTransform] = createSignal({ x: 0, y: 0, scale: 1 });

  // Используем createResource для загрузки данных
  const [questData] = createResource(() => questName, fetchQuestData);
  
  // Создаём store только когда данные загружены
  const [nodes, setNodes] = createStore<GraphNodeInterface[]>([]);
  
  // Состояние для выбранного узла
  const [selectedNode, setSelectedNode] = createSignal<GraphNodeInterface | null>(null);

  // Обработчик клика по узлу
  const handleNodeClick = (node: GraphNodeInterface) => {
    setSelectedNode(node);
  };

  // Функция для центрирования графа по кнопке
  const centerGraph = () => {
    if (containerRef && nodes.length > 0) {
      const containerRect = containerRef.getBoundingClientRect();
      const centerTransform = calculateCenterTransform(nodes, {
        width: containerRect.width,
        height: containerRect.height
      });
      setTransform(centerTransform);
    }
  };

  // Обновляем nodes когда данные загружены
  createEffect(() => {
    const data = questData();
    if (data && containerRef) {
      setNodes(data);
      
      // Автоматически центрируем граф после загрузки данных
      const containerRect = containerRef.getBoundingClientRect();
      const centerTransform = calculateCenterTransform(data, {
        width: containerRect.width,
        height: containerRect.height
      });
      
      setTransform(centerTransform);
    }
  });

  const edges = createMemo(() => {
    const edges: GraphEdgeProps[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[i].choices?.map((choice: any) => choice.next_scene).includes(nodes[j].scene_id)) {
          edges.push({ source: nodes[i].position, target: nodes[j].position, node_size: NODE_SIZE });
        }
      }
    }
    return edges;
  });

  onMount(() => {
    if (!containerRef) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sensitivity = 0.03; // Оптимальное значение для плавности
      const scaleDelta = 1 + (e.deltaY > 0 ? -sensitivity : sensitivity);
      
      setTransform((t) => ({
        ...t,
        scale: Math.max(0.1, Math.min(5, t.scale * scaleDelta)),
      }));
    };

    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      // Проверяем, что клик произошел на контейнере или на фоне графа, но не на узле
      const target = e.target as HTMLElement;
      const isBackgroundClick = target === containerRef || 
                               target.classList.contains(styles.Graph) ||
                               target.classList.contains(styles.GraphContainer) ||
                               target.classList.contains(styles.EdgesContainer) ||
                               target.tagName === 'svg';
      
      if (e.button === 0 && isBackgroundClick) { // Левая кнопка и клик на фоне
        isDragging = true;
        startX = e.clientX - transform().x;
        startY = e.clientY - transform().y;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setTransform({
          ...transform(),
          x: e.clientX - startX,
          y: e.clientY - startY,
        });
      }
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    containerRef.addEventListener("wheel", handleWheel, { passive: false });
    containerRef.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      if (!containerRef) return;
      containerRef.removeEventListener("wheel", handleWheel);
      containerRef.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div
      ref={(el) => { containerRef = el; }}
      class={styles.GraphContainer}
    > 
      {questData.loading && (
        <div class={styles.Loading}>
          Загрузка квеста {questName}...
        </div>
      )}
      
      {questData.error && (
        <div class={styles.Error}>
          Ошибка загрузки квеста: {questData.error.message}
        </div>
      )}
      
      {!questData.loading && !questData.error && (
        <>
          <div
            style={{
              transform: `translate(${transform().x}px, ${transform().y}px) scale(${transform().scale})`,
            }}
            class={styles.Graph}
          >
          
          {/* Узлы графа */}
          <For each={nodes}>
            {(node, index) => (
              <GraphNode 
                node={node} 
                setNode={setNodes.bind(null, index()) as SetStoreFunction<GraphNodeInterface>} 
                scale={() => transform().scale}
                transform={transform()}
                onClick={() => handleNodeClick(node)}
              />
            )}
          </For>
          {/* Связь */}
          <svg 
            class={styles.EdgesContainer}
          >
            <For each={edges()}>
              {(edge) => (
                <GraphEdge {...edge} />
              )}
            </For>
          </svg>
        </div>
        </>
      )}
      
      {/* Отображение информации о выбранной сцене */}
      <NodeInfo
        node={selectedNode()}
        isVisible={!!selectedNode()}
        onClose={() => setSelectedNode(null)}
        setCurrentNode={(scene_id) => setSelectedNode(nodes.find(node => node.scene_id === scene_id) || null)}
      />
    </div>
  );
}

export default Graph;
