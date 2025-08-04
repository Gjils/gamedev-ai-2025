import { createSignal } from 'solid-js';

import { A, useNavigate } from '@solidjs/router';
import styles from './Generation.module.css';

interface QuestFormData {
  quest_id: string;
  genre: string;
  hero: string;
  goal: string;
}

function Generation() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = createSignal<QuestFormData>({
    quest_id: '',
    genre: '',
    hero: '',
    goal: ''
  });

  const [isSubmitting, setIsSubmitting] = createSignal(false);

  const handleInputChange = (field: keyof QuestFormData) => (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setFormData(prev => ({
      ...prev,
      [field]: target.value
    }));
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    
    const data = formData();
    
    // Проверяем заполненность полей
    if (!data.quest_id || !data.genre || !data.hero || !data.goal) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Формируем промпт из данных формы
      const user_prompt = `Жанр: ${data.genre}\nГлавный герой: ${data.hero}\nЦель квеста: ${data.goal}`;
      
      // Отправляем запрос на backend
      const response = await fetch('http://localhost:8000/generate_quest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quest_name: data.quest_id,
          user_prompt: user_prompt
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Квест успешно сгенерирован:', result);
      
      // Перенаправляем на страницу с квестом
      navigate(`/${data.quest_id}`);
      
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      alert(`Произошла ошибка при генерации квеста: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
        <header class={styles.Header}>
            <A href="/" class={styles.BackButton}>Назад</A>
            <h1 class={styles.Heading}>Генерация квеста</h1>
        </header>
        <div class={styles.GenerationContainer}>
        <form onSubmit={handleSubmit} class={styles.Form}>
            {/* Quest ID */}
            <div class={styles.FormField}>
            <label class={styles.FormLabel}>
                ID квеста:
            </label>
            <input
                type="text"
                value={formData().quest_id}
                onInput={handleInputChange('quest_id')}
                placeholder="Например: cyberpunk-quest"
                class={styles.FormInput}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--secondary-color)'}
            />
            </div>

            {/* Genre */}
            <div class={styles.FormField}>
            <label class={styles.FormLabel}>
                Жанр:
            </label>
            <input
                type="text"
                value={formData().genre}
                onInput={handleInputChange('genre')}
                placeholder="Например: киберпанк, фэнтези, хоррор"
                class={styles.FormInput}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--secondary-color)'}
            />
            </div>

            {/* Hero */}
            <div class={styles.FormField}>
            <label class={styles.FormLabel}>
                Главный герой:
            </label>
            <input
                type="text"
                value={formData().hero}
                onInput={handleInputChange('hero')}
                placeholder="Например: хакер-одиночка, молодой маг, детектив"
                class={styles.FormInput}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--secondary-color)'}
            />
            </div>

            {/* Goal */}
            <div class={styles.FormField}>
            <label class={styles.FormLabel}>
                Цель квеста:
            </label>
            <textarea
                value={formData().goal}
                onInput={handleInputChange('goal')}
                placeholder="Например: взломать замок на двери, найти и забрать чип с вирусом"
                rows={3}
                class={styles.FormTextarea}
                onFocus={(e) => e.target.style.borderColor = 'var(--text-color)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--secondary-color)'}
            />
            </div>

            {/* Submit Button */}
            <button
            type="submit"
            disabled={isSubmitting()}
            class={styles.FormButton}
            >
            {isSubmitting() ? 'Генерируется...' : 'Сгенерировать квест'}
            </button>
        </form>
        </div>
    </>
  );
}

export default Generation;