import { For, Show } from 'solid-js';
import GraphNodeInterface from "../GraphNode/GraphNodeInterface";

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
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100vw',
          height: '100vh',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          'z-index': '1000',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center'
        }}
        onClick={handleBackdropClick}
      >
        {/* Modal Window */}
        <div
          style={{
            'background-color': '#1A3636',
            border: '2px solid #D6BD98',
            'border-radius': '12px',
            padding: '24px',
            'max-width': '600px',
            'max-height': '80vh',
            width: '90%',
            'overflow-y': 'auto',
            color: '#D6BD98',
            'font-family': 'Arial, sans-serif',
            position: 'relative',
            'box-shadow': '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={props.onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: '#D6BD98',
              'font-size': '24px',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              'border-radius': '50%',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#677D6A';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>

          {/* Header */}
          <div style={{
            'margin-bottom': '20px',
            'padding-right': '40px'
          }}>
            <h2 style={{
              margin: '0 0 8px 0',
              'font-size': '24px',
              color: '#D6BD98',
              'font-weight': 'bold'
            }}>
              Сцена: {props.node?.scene_id}
            </h2>
            <div style={{
              width: '100%',
              height: '2px',
              'background-color': '#677D6A',
              'border-radius': '1px'
            }}></div>
          </div>

          {/* Scene Text */}
          <div style={{
            'margin-bottom': '24px'
          }}>
            <h3 style={{
              margin: '0 0 12px 0',
              'font-size': '18px',
              color: '#D6BD98',
              'font-weight': 'bold'
            }}>
              Описание сцены:
            </h3>
            <div style={{
              'background-color': '#2A4A4A',
              padding: '16px',
              'border-radius': '8px',
              'line-height': '1.6',
              'font-size': '14px',
              border: '1px solid #677D6A'
            }}>
              {props.node?.text || 'Описание отсутствует'}
            </div>
          </div>

          {/* Choices */}
          <Show when={props.node?.choices && props.node.choices.length > 0}>
            <div>
              <h3 style={{
                margin: '0 0 16px 0',
                'font-size': '18px',
                color: '#D6BD98',
                'font-weight': 'bold'
              }}>
                Варианты выбора ({props.node?.choices?.length || 0}):
              </h3>
              <div style={{
                display: 'flex',
                'flex-direction': 'column',
                gap: '12px'
              }}>
                <For each={props.node?.choices}>
                  {(choice, index) => (
                    <div style={{
                      'background-color': '#2A4A4A',
                      padding: '14px',
                      'border-radius': '8px',
                      border: '1px solid #677D6A',
                      transition: 'border-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#D6BD98';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.borderColor = '#677D6A';
                    }}
                    onClick={() => {
                      props.setCurrentNode(choice.next_scene);
                    }}
                    >
                      <div style={{
                        display: 'flex',
                        'justify-content': 'space-between',
                        'align-items': 'flex-start',
                        gap: '12px'
                      }}>
                        <div style={{
                          flex: '1'
                        }}>
                          <div style={{
                            'font-weight': 'bold',
                            'margin-bottom': '6px',
                            color: '#D6BD98'
                          }}>
                            Выбор {index() + 1}:
                          </div>
                          <div style={{
                            'font-size': '14px',
                            'line-height': '1.5',
                            'margin-bottom': '8px'
                          }}>
                            {choice.text}
                          </div>
                          <div style={{
                            'font-size': '12px',
                            color: '#A0A0A0',
                            'font-style': 'italic'
                          }}>
                            → Ведет к сцене: <span style={{ color: '#D6BD98', 'font-weight': 'bold' }}>{choice.next_scene}</span>
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
            <div style={{
              'background-color': '#2A4A4A',
              padding: '16px',
              'border-radius': '8px',
              'text-align': 'center',
              'font-style': 'italic',
              color: '#A0A0A0',
              border: '1px solid #677D6A'
            }}>
              Это финальная сцена - вариантов выбора нет
            </div>
          </Show>

          {/* Position Info (debug) */}
          <Show when={props.node?.position}>
            <div style={{
              'margin-top': '20px',
              'padding-top': '16px',
              'border-top': '1px solid #677D6A',
              'font-size': '12px',
              color: '#A0A0A0'
            }}>
              Позиция: x={props.node?.position?.x}, y={props.node?.position?.y}
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}

export default NodeInfo;
