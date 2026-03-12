import { advancedApiRequest } from '../utils/api.js';
import { marsStore } from '../stores/marsStore.js';

class MarsApiManager {
    constructor(baseUrl = 'https://olimp.miet.ru/ppo_it/api') {
        // Пробуем загрузить сохраненный URL
        const savedUrl = marsStore.loadApiUrl();
        this.baseUrl = savedUrl || baseUrl;
        this.cache = new Map();
        
        console.log(`🚀 API менеджер инициализирован с URL: ${this.baseUrl}`);
    }
    
    async getRandomTile(useCache = true) {
        // Проверяем кэш в памяти
        if (useCache && this.cache.size > 0) {
            // Имитируем случайный тайл из кэша (упрощенно)
            const cacheArray = Array.from(this.cache.values());
            if (cacheArray.length > 0) {
                const randomTile = cacheArray[Math.floor(Math.random() * cacheArray.length)];
                console.log('🎯 Тайл взят из кэша');
                return randomTile;
            }
        }
        
        try {
            const response = await advancedApiRequest(this.baseUrl);
            const tileData = response.message.data;
            const parsedTile = this._parseTileData(tileData);
            
            // Сохраняем в кэш
            const tileId = Date.now() + Math.random();
            this.cache.set(tileId, parsedTile);
            
            return parsedTile;
        } catch (error) {
            console.error('Не удалось получить тайл:', error);
            throw error;
        }
    }
    
    async getModuleCoordinates() {
        // Проверяем, есть ли сохраненные координаты
        const saved = marsStore.loadModuleCoordinates();
        if (saved) {
            console.log('📍 Координаты загружены из хранилища');
            return {
                sender: saved.sender,
                listener: saved.listener,
                prices: saved.prices
            };
        }
        
        // Если нет - запрашиваем с сервера
        try {
            const response = await advancedApiRequest(`${this.baseUrl}/coords`);
            const { sender, listener, price } = response.message;
            
            const result = {
                sender: { x: sender[0], y: sender[1] },
                listener: { x: listener[0], y: listener[1] },
                prices: {
                    cuper: price[0],
                    engel: price[1]
                }
            };
            
            // Сохраняем для будущих сессий
            marsStore.saveModuleCoordinates(
                { sender: result.sender, listener: result.listener },
                [result.prices.cuper, result.prices.engel]
            );
            
            return result;
        } catch (error) {
            console.error('Не удалось получить координаты:', error);
            throw error;
        }
    }
    
    async assembleMap() {
        // Проверяем, есть ли уже собранная карта
        const savedMap = marsStore.loadMap();
        if (savedMap) {
            console.log('🗺️ Используем сохраненную карту');
            return savedMap;
        }
        
        console.log('🔄 Собираем новую карту...');
        const tiles = [];
        
        // Собираем 16 тайлов
        for (let i = 0; i < 16; i++) {
            const tile = await this.getRandomTile(false); // Игнорируем кэш для сборки
            tiles.push(tile);
            console.log(`  Прогресс: ${i + 1}/16 тайлов`);
        }
        
        // Здесь будет алгоритм сборки карты (следующий день)
        // Пока просто склеиваем их последовательно
        const assembledMap = this._simpleAssemble(tiles);
        
        // Сохраняем результат
        marsStore.saveMap(assembledMap, tiles);
        
        return assembledMap;
    }
    
    // Временная функция для демонстрации
    _simpleAssemble(tiles) {
        // Просто склеиваем тайлы в сетку 4x4
        const map = [];
        for (let i = 0; i < 256; i++) {
            map.push(new Array(256).fill(0));
        }
        
        for (let ty = 0; ty < 4; ty++) {
            for (let tx = 0; tx < 4; tx++) {
                const tileIndex = ty * 4 + tx;
                if (tileIndex < tiles.length) {
                    const tile = tiles[tileIndex];
                    for (let y = 0; y < 64; y++) {
                        for (let x = 0; x < 64; x++) {
                            map[ty * 64 + y][tx * 64 + x] = tile[y][x];
                        }
                    }
                }
            }
        }
        
        return map;
    }
    
    setBaseUrl(newUrl) {
        this.baseUrl = newUrl;
        marsStore.saveApiUrl(newUrl);
        this.cache.clear();
        console.log(`URL изменен на: ${newUrl}`);
    }
}

export const marsApi = new MarsApiManager();