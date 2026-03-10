import { advancedApiRequest } from '../utils/api.js';

class MarsApiManager {
    constructor(baseUrl = 'https://olimp.miet.ru/ppo_it/api') {
        this.baseUrl = baseUrl;
        this.cache = new Map(); // Кэш для сохраненных тайлов
    }
    
    /**
     * Получить один случайный тайл
     */
    async getRandomTile() {
        try {
            const response = await advancedApiRequest(this.baseUrl);
            
            // Извлекаем данные тайла из ответа
            // Структура: { message: { data: [...] }, status: "ok" }
            const tileData = response.message.data;
            
            // Преобразуем строки в числа (в API могут приходить строки)
            return this._parseTileData(tileData);
            
        } catch (error) {
            console.error('Не удалось получить тайл:', error);
            throw error;
        }
    }
    
    /**
     * Получить координаты модулей и цены
     */
    async getModuleCoordinates() {
        try {
            const response = await advancedApiRequest(`${this.baseUrl}/coords`);
            
            // Структура: { message: { sender: [x,y], listener: [x,y], price: [a,b] } }
            const { sender, listener, price } = response.message;
            
            return {
                sender: { x: sender[0], y: sender[1] },
                listener: { x: listener[0], y: listener[1] },
                prices: {
                    cuper: price[0],
                    engel: price[1]
                }
            };
            
        } catch (error) {
            console.error('Не удалось получить координаты:', error);
            throw error;
        }
    }
    
    /**
     * Получить несколько тайлов (сколько нужно для сборки карты)
     */
    async getMultipleTiles(count = 16) {
        const tiles = [];
        const requests = [];
        
        // Создаем массив промисов
        for (let i = 0; i < count; i++) {
            requests.push(this.getRandomTile());
        }
        
        // Ждем выполнения всех запросов параллельно
        try {
            const results = await Promise.all(requests);
            return results;
        } catch (error) {
            console.error('Ошибка при получении нескольких тайлов:', error);
            throw error;
        }
    }
    
    /**
     * Вспомогательная функция: преобразует данные тайла в числа
     */
    _parseTileData(tileData) {
        return tileData.map(row => 
            row.map(value => parseInt(value, 10))
        );
    }
    
    /**
     * Установить новый базовый URL (для проверочного набора)
     */
    setBaseUrl(newUrl) {
        this.baseUrl = newUrl;
        this.cache.clear(); // Очищаем кэш при смене URL
        console.log(`Базовый URL изменен на: ${newUrl}`);
    }
}

// Создаем и экспортируем единственный экземпляр (синглтон)
export const marsApi = new MarsApiManager();