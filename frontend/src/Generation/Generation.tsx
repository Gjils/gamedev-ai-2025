import { createSignal } from 'solid-js';

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
    <div style={{
      padding: '40px',
      'max-width': '600px',
      margin: '0 auto',
      color: '#D6BD98',
      'font-family': 'Arial, sans-serif'
    }}>
      <h1 style={{
        'text-align': 'center',
        'margin-bottom': '30px',
        'font-size': '28px',
        color: '#D6BD98'
      }}>
        Генерация нового квеста
      </h1>
      
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        'flex-direction': 'column',
        gap: '20px'
      }}>
        {/* Quest ID */}
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <label style={{
            'font-weight': 'bold',
            'font-size': '16px'
          }}>
            ID квеста:
          </label>
          <input
            type="text"
            value={formData().quest_id}
            onInput={handleInputChange('quest_id')}
            placeholder="Например: cyberpunk-quest"
            style={{
              padding: '12px',
              'border-radius': '8px',
              border: '2px solid #677D6A',
              'background-color': '#1A3636',
              color: '#D6BD98',
              'font-size': '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#D6BD98'}
            onBlur={(e) => e.target.style.borderColor = '#677D6A'}
          />
        </div>

        {/* Genre */}
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <label style={{
            'font-weight': 'bold',
            'font-size': '16px'
          }}>
            Жанр:
          </label>
          <input
            type="text"
            value={formData().genre}
            onInput={handleInputChange('genre')}
            placeholder="Например: киберпанк, фэнтези, хоррор"
            style={{
              padding: '12px',
              'border-radius': '8px',
              border: '2px solid #677D6A',
              'background-color': '#1A3636',
              color: '#D6BD98',
              'font-size': '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#D6BD98'}
            onBlur={(e) => e.target.style.borderColor = '#677D6A'}
          />
        </div>

        {/* Hero */}
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <label style={{
            'font-weight': 'bold',
            'font-size': '16px'
          }}>
            Главный герой:
          </label>
          <input
            type="text"
            value={formData().hero}
            onInput={handleInputChange('hero')}
            placeholder="Например: хакер-одиночка, молодой маг, детектив"
            style={{
              padding: '12px',
              'border-radius': '8px',
              border: '2px solid #677D6A',
              'background-color': '#1A3636',
              color: '#D6BD98',
              'font-size': '14px',
              outline: 'none'
            }}
            onFocus={(e) => e.target.style.borderColor = '#D6BD98'}
            onBlur={(e) => e.target.style.borderColor = '#677D6A'}
          />
        </div>

        {/* Goal */}
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <label style={{
            'font-weight': 'bold',
            'font-size': '16px'
          }}>
            Цель квеста:
          </label>
          <textarea
            value={formData().goal}
            onInput={handleInputChange('goal')}
            placeholder="Например: взломать замок на двери, найти и забрать чип с вирусом"
            rows={3}
            style={{
              padding: '12px',
              'border-radius': '8px',
              border: '2px solid #677D6A',
              'background-color': '#1A3636',
              color: '#D6BD98',
              'font-size': '14px',
              outline: 'none',
              resize: 'vertical',
              'min-height': '80px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#D6BD98'}
            onBlur={(e) => e.target.style.borderColor = '#677D6A'}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting()}
          style={{
            padding: '16px 24px',
            'border-radius': '8px',
            border: 'none',
            'background-color': isSubmitting() ? '#677D6A' : '#D6BD98',
            color: '#1A3636',
            'font-size': '16px',
            'font-weight': 'bold',
            cursor: isSubmitting() ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s ease',
            'margin-top': '10px'
          }}
          onMouseEnter={(e) => {
            if (!isSubmitting()) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#E5C9A0';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting()) {
              (e.target as HTMLButtonElement).style.backgroundColor = '#D6BD98';
            }
          }}
        >
          {isSubmitting() ? 'Генерируется...' : 'Сгенерировать квест'}
        </button>
      </form>
    </div>
  );
}

export default Generation;