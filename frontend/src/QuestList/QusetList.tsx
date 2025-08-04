import { A } from '@solidjs/router';
import { createResource, For } from 'solid-js';

import styles from './QuestList.module.css';

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
        <>
        <header class={styles.Header}>
            <h1 class={styles.Heading}>Список квестов</h1>
        </header>
        <div class={styles.QuestListContainer}>
            {questList.loading && (
                <div class={styles.Loading}>
                    Загрузка квестов...
                </div>
            )}
            
            {questList.error && (
                <div class={styles.Error}>
                    Ошибка загрузки: {questList.error.message}
                </div>
            )}
            
            {!questList.loading && !questList.error && (
                <For each={questList()}>
                    {(questName) => (
                        <A class={styles.QuestLink}
                        href={questName}>
                            {questName}
                        </A>
                    )}
                </For>
            )}
            
            {!questList.loading && !questList.error && questList()?.length === 0 && (
                <div class={styles.NoContent}>
                    Квесты не найдены
                </div>
            )}

            <A class={styles.GenerateButton} href='/generate'>
                Сгенерировать квест
            </A>
        </div>
        </>
    );
}

export default QuestList;
