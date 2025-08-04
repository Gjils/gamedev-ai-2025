import { createSignal } from 'solid-js';

import styles from './Generation.module.css';
import { A } from '@solidjs/router';

interface QuestFormData {
  quest_id: string;
  genre: string;
  hero: string;
  goal: string;
}

function Generation() {
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
      // TODO: Здесь будет отправка данных на backend для генерации квеста
      console.log('Данные квеста:', data);
      alert('Квест отправлен на генерацию!');
    } catch (error) {
      console.error('Ошибка при отправке:', error);
      alert('Произошла ошибка при отправке');
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