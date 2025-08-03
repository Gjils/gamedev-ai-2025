import { For, Show } from 'solid-js';
import GraphNodeInterface from "../GraphNode/GraphNodeInterface";

import styles from './NodeInfo.module.css';

interface NodeInfoProps {
  node: GraphNodeInterface | null;
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  setCurrentNode: (scene_id: string) => void;
}

function NodeInfo(props: NodeInfoProps) {
  const handleBackdropClick = (e: MouseEvent) => {
    // Закрываем окно при клике на фон
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    }
  };

  // Добавляем обработчик Escape при монтировании
  document.addEventListener('keydown', handleEscapeKey);

  return (
    <Show when={props.isVisible && props.node}>
      {/* Backdrop */}
      <div
        class={styles.Backdrop}
        onClick={handleBackdropClick}
      >
        {/* Modal Window */}
        <div
          class={styles.Modal}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={props.onClose}
            class={styles.CloseButton}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'var(--secondary-color)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>

          {/* Header */}
          <div class={styles.Header}>
            <h2 class={styles.HeaderTitle}>
              Сцена {props.node?.scene_id}
            </h2>
            <div class={styles.HeaderDivider}></div>
            <div class={styles.HeaderDivider}></div>
          </div>

          {/* Scene Text */}
          <div class={styles.Scene}>
            <h3 class={styles.SceneTitle}>
              Описание сцены:
            </h3>
            <div class={styles.SceneTextContainer}>
              {props.node?.text || 'Описание отсутствует'}
            </div>
          </div>

          {/* Choices */}
          <Show when={props.node?.choices && props.node.choices.length > 0}>
            <div>
              <h3 class={styles.ChoicesTitle}>
                Варианты выбора:
              </h3>
              <div style={{
                display: 'flex',
                'flex-direction': 'column',
                gap: '12px'
              }}>
                <For each={props.node?.choices}>
                  {(choice, index) => (
                    <div class={styles.Choice}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.borderColor = 'var(--secondary-color)';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.borderColor = 'var(--text-color)';
                    }}
                    onClick={() => {
                      props.setCurrentNode(choice.next_scene);
                    }}
                    >
                      <div >
                        <div style={{
                          flex: '1'
                        }}>
                          <div class={styles.ChoiceText}>
                            {choice.text}
                          </div>
                          <div class={styles.ChoiceNextScene}>
                            → Ведет к <span class={styles.NextSceneText}>{choice.next_scene}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* No Choices Message */}
          <Show when={!props.node?.choices || props.node.choices.length === 0}>
            <div class={styles.FinalScene}>
              Это финальная сцена
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}

export default NodeInfo;
