/**
 * Расширенная версия с обработкой разных типов ответов
 */
export async function advancedApiRequest(url, options = {}) {
    // Настройки по умолчанию
    const defaultOptions = {
        method: 'GET',              // Метод запроса
        headers: {                  // Заголовки
            'Content-Type': 'application/json',
        },
        timeout: 5000,              // Таймаут 5 секунд
    };
    
    // Объединяем настройки
    const fetchOptions = { ...defaultOptions, ...options };
    
    // Создаем контроллер для таймаута
    const controller = new AbortController();
    fetchOptions.signal = controller.signal;
    
    // Таймаут: если сервер не отвечает 5 секунд - отменяем запрос
    const timeoutId = setTimeout(() => controller.abort(), fetchOptions.timeout);
    
    try {
        console.log(`📡 Запрос к: ${url}`);
        
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId); // Отменяем таймаут, если ответ получен
        
        // Проверка статуса
        if (!response.ok) {
            throw new Error(`Статус ${response.status}: ${response.statusText}`);
        }
        
        // Пытаемся распарсить как JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('✅ Данные получены:', data);
            return data;
        } else {
            // Если не JSON, возвращаем как текст
            const text = await response.text();
            console.log('✅ Получен текст:', text.substring(0, 100) + '...');
            return text;
        }
        
    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            throw new Error('Таймаут: сервер не ответил за 5 секунд');
        }
        
        console.error('❌ Ошибка запроса:', error.message);
        throw error;
    }
}