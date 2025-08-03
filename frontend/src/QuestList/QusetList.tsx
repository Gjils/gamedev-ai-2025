import { A } from '@solidjs/router';
import { createResource, For } from 'solid-js';

// API URL для backend
const API_BASE_URL = 'http://localhost:8000';

interface QuestListResponse {
  quests: string[];
}

// Функция для загрузки списка квестов
async function fetchQuestList(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/list_quests`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: QuestListResponse = await response.json();
    return data.quests;
  } catch (error) {
    console.error('Ошибка при загрузке списка квестов:', error);
    throw error;
  }
}

function QuestList() {
    // Загружаем список квестов
    const [questList] = createResource(fetchQuestList);

    return (
        <div style={{
            padding: '20px',
            color: '#D6BD98',
            'font-family': 'Arial, sans-serif'
        }}>
            <header style={{
                'font-size': '24px',
                'font-weight': 'bold',
                'margin-bottom': '20px',
                'text-align': 'center'
            }}>
                Список квестов
            </header>
            
            {questList.loading && (
                <div style={{
                    'text-align': 'center',
                    'font-size': '16px',
                    color: '#D6BD98'
                }}>
                    Загрузка квестов...
                </div>
            )}
            
            {questList.error && (
                <div style={{
                    'text-align': 'center',
                    'font-size': '16px',
                    color: '#ff6b6b'
                }}>
                    Ошибка загрузки: {questList.error.message}
                </div>
            )}
            
            {!questList.loading && !questList.error && (
                <ul style={{
                    'list-style': 'none',
                    padding: '0',
                    margin: '0'
                }}>
                    <For each={questList()}>
                        {(questName) => (
                            <A style={{
                                padding: '12px 16px',
                                margin: '8px 0',
                                'background-color': '#677D6A',
                                'border-radius': '8px',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease',
                                'border': '1px solid #D6BD98'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#7A8A7D';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#677D6A';
                            }}
                            href={questName}>
                                {questName}
                            </A>
                        )}
                    </For>
                </ul>
            )}
            
            {!questList.loading && !questList.error && questList()?.length === 0 && (
                <div style={{
                    'text-align': 'center',
                    'font-size': '16px',
                    color: '#D6BD98',
                    'font-style': 'italic'
                }}>
                    Квесты не найдены
                </div>
            )}
        </div>
    );
}

export default QuestList;
