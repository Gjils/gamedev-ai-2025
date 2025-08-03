import { createEffect, createMemo, createResource, createSignal, For, onMount } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { useParams } from "@solidjs/router";

import GraphEdge, { GraphEdgeProps } from "../GraphEdge/GraphEdge";
import GraphNode from "../GraphNode/GraphNode";

import GraphNodeInterface from "../GraphNode/GraphNodeInterface";
import styles from './Graph.module.css';

// API URL для backend
const API_BASE_URL = 'http://localhost:8000';

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

  // Обновляем nodes когда данные загружены
  createEffect(() => {
    const data = questData();
    if (data) {
      setNodes(data);
    }
  });

  const edges = createMemo(() => {
    const edges: GraphEdgeProps[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[i].choices?.map((choice: any) => choice.next_scene).includes(nodes[j].scene_id)) {
          edges.push({ source: nodes[i].position, target: nodes[j].position });
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
      )}
    </div>
  );
}

export default Graph;
