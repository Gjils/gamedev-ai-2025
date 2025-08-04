import { For, Show, createSignal } from 'solid-js';
import GraphNodeInterface from "../GraphNode/GraphNodeInterface";

import { SetStoreFunction } from 'solid-js/store';
import styles from './NodeInfo.module.css';

interface NodeInfoProps {
  node: GraphNodeInterface | null;
  isVisible: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
  setCurrentNode: (scene_id: string) => void;
  setNode?: SetStoreFunction<GraphNodeInterface>;
}

function NodeInfo(props: NodeInfoProps) {
  // Состояния для редактирования
  const [isEditingText, setIsEditingText] = createSignal(false);
  const [isEditingChoices, setIsEditingChoices] = createSignal<number | null>(null);
  const [editedText, setEditedText] = createSignal('');
  const [editedChoiceText, setEditedChoiceText] = createSignal('');

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

  // Функции для редактирования текста сцены
  const startEditingText = () => {
    setEditedText(props.node?.text || '');
    setIsEditingText(true);
  };

  const saveSceneText = () => {
    if (props.node && props.setNode) {
      props.setNode('text', editedText());
    }
    setIsEditingText(false);
  };

  const cancelEditingText = () => {
    setIsEditingText(false);
    setEditedText('');
  };

  // Функции для редактирования выборов
  const startEditingChoice = (index: number) => {
    if (props.node?.choices?.[index]) {
      setEditedChoiceText(props.node.choices[index].text || '');
      setIsEditingChoices(index);
    }
  };

  const saveChoiceText = (index: number) => {
    if (props.node && props.setNode && props.node.choices?.[index]) {
      props.setNode('choices', index, 'text', editedChoiceText());
    }
    setIsEditingChoices(null);
    setEditedChoiceText('');
  };

  const cancelEditingChoice = () => {
    setIsEditingChoices(null);
    setEditedChoiceText('');
  };

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
            <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center' }}>
              <h3 class={styles.SceneTitle}>
                Описание сцены:
              </h3>
              <Show when={!isEditingText()}>
                <button 
                  onClick={startEditingText}
                  class={styles.EditButton}
                  title="Редактировать текст сцены"
                >
                  ✏️
                </button>
              </Show>
            </div>
            <div class={styles.SceneTextContainer}>
              <Show when={!isEditingText()}>
                <div onClick={startEditingText} style={{ cursor: 'pointer' }}>
                  {props.node?.text || 'Описание отсутствует'}
                </div>
              </Show>
              <Show when={isEditingText()}>
                <div>
                  <textarea
                    value={editedText()}
                    onInput={(e) => setEditedText(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    class={styles.EditTextarea}
                    rows={4}
                    placeholder="Введите описание сцены..."
                  />
                  <div class={styles.EditButtons}>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      saveSceneText();
                    }} class={styles.SaveButton}>
                      Сохранить
                    </button>
                    <button onClick={(e) => {
                      e.stopPropagation();
                      cancelEditingText();
                    }} class={styles.CancelButton}>
                      Отмена
                    </button>
                  </div>
                </div>
              </Show>
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
                      if (isEditingChoices() === null) {
                        (e.target as HTMLElement).style.borderColor = 'var(--secondary-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (isEditingChoices() === null) {
                        (e.target as HTMLElement).style.borderColor = 'var(--text-color)';
                      }
                    }}
                    onClick={() => {
                      if (isEditingChoices() === null) {
                        props.setCurrentNode(choice.next_scene);
                      }
                    }}
                    >
                      <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'flex-start' }}>
                        <div style={{ flex: '1' }}>
                          <Show when={isEditingChoices() !== index()}>
                            <div class={styles.ChoiceText}>
                              {choice.text}
                            </div>
                          </Show>
                          <Show when={isEditingChoices() === index()}>
                            <div>
                              <textarea
                                value={editedChoiceText()}
                                onInput={(e) => setEditedChoiceText(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                class={styles.EditTextarea}
                                rows={2}
                                placeholder="Введите текст выбора..."
                              />
                              <div class={styles.EditButtons}>
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  saveChoiceText(index());
                                }} class={styles.SaveButton}>
                                  Сохранить
                                </button>
                                <button onClick={(e) => {
                                  e.stopPropagation();
                                  cancelEditingChoice();
                                }} class={styles.CancelButton}>
                                  Отмена
                                </button>
                              </div>
                            </div>
                          </Show>
                          <div class={styles.ChoiceNextScene}>
                            → Ведет к <span class={styles.NextSceneText}>{choice.next_scene}</span>
                          </div>
                        </div>
                        <Show when={isEditingChoices() === null}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingChoice(index());
                            }}
                            class={styles.EditButton}
                            title="Редактировать выбор"
                          >
                            ✏️
                          </button>
                        </Show>
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
