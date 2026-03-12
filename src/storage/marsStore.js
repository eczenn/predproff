import { saveToStorage, loadFromStorage, removeFromStorage } from '../utils/storage.js';

/**
 * Класс для управления данными миссии на Марсе
 * Сохраняет карту, координаты модулей и станций между сессиями
 */
class MarsDataStore {
    constructor() {
        // Ключи для хранения разных данных
        this.keys = {
            MAP: 'mars_map',
            TILES: 'collected_tiles',
            MODULES: 'module_coordinates',
            STATIONS: 'base_stations',
            API_URL: 'api_endpoint',
            LAST_UPDATE: 'last_update'
        };
        
        // Версия структуры данных (на случай изменений в будущем)
        this.version = '1.0';
    }
    
    /**
     * Сохранить собранную карту
     * @param {Array<Array<number>>} mapData - матрица высот 256x256
     * @param {Array} tiles - исходные тайлы (опционально)
     */
    saveMap(mapData, tiles = null) {
        const dataToSave = {
            version: this.version,
            timestamp: Date.now(),
            map: mapData,
            metadata: {
                width: mapData.length,
                height: mapData[0].length,
                min: Math.min(...mapData.flat()),
                max: Math.max(...mapData.flat())
            }
        };
        
        saveToStorage(this.keys.MAP, dataToSave);
        
        if (tiles) {
            saveToStorage(this.keys.TILES, {
                version: this.version,
                timestamp: Date.now(),
                tiles: tiles
            });
        }
        
        this._updateTimestamp();
    }
    
    /**
     * Загрузить сохраненную карту
     * @returns {Array<Array<number>>|null} - матрица карты или null
     */
    loadMap() {
        const data = loadFromStorage(this.keys.MAP);
        
        if (!data) return null;
        
        // Проверка версии (на случай обновления формата)
        if (data.version !== this.version) {
            console.warn('⚠️ Версия данных устарела, попробуйте пересобрать карту');
            return null;
        }
        
        console.log(`🗺️ Карта загружена от ${new Date(data.timestamp).toLocaleString()}`);
        console.log(`   Размер: ${data.metadata.width}x${data.metadata.height}`);
        console.log(`   Высоты: ${data.metadata.min} - ${data.metadata.max}`);
        
        return data.map;
    }
    
    /**
     * Сохранить координаты исследовательских модулей
     * @param {Object} modules - { sender: {x,y}, listener: {x,y} }
     * @param {Array} prices - цены на станции
     */
    saveModuleCoordinates(modules, prices) {
        saveToStorage(this.keys.MODULES, {
            version: this.version,
            timestamp: Date.now(),
            sender: modules.sender,
            listener: modules.listener,
            prices: prices
        });
    }
    
    /**
     * Загрузить координаты модулей
     * @returns {Object|null} - координаты или null
     */
    loadModuleCoordinates() {
        return loadFromStorage(this.keys.MODULES);
    }
    
    /**
     * Сохранить размещенные базовые станции
     * @param {Array} stations - массив станций
     */
    saveStations(stations) {
        saveToStorage(this.keys.STATIONS, {
            version: this.version,
            timestamp: Date.now(),
            stations: stations,
            stats: {
                cuper: stations.filter(s => s.type === 'cuper').length,
                engel: stations.filter(s => s.type === 'engel').length,
                totalCost: stations.reduce((sum, s) => sum + s.cost, 0)
            }
        });
    }
    
    /**
     * Загрузить станции
     * @returns {Array|null} - массив станций
     */
    loadStations() {
        const data = loadFromStorage(this.keys.STATIONS);
        return data ? data.stations : null;
    }
    
    /**
     * Сохранить текущий адрес API
     * @param {string} url - адрес сервера
     */
    saveApiUrl(url) {
        saveToStorage(this.keys.API_URL, {
            url: url,
            timestamp: Date.now()
        });
    }
    
    /**
     * Загрузить сохраненный адрес API
     * @returns {string|null} - адрес или null
     */
    loadApiUrl() {
        const data = loadFromStorage(this.keys.API_URL);
        return data ? data.url : null;
    }
    
    /**
     * Проверить, есть ли сохраненная карта
     * @returns {boolean}
     */
    hasSavedMap() {
        return loadFromStorage(this.keys.MAP) !== null;
    }
    
    /**
     * Очистить все данные миссии
     */
    clearAll() {
        Object.values(this.keys).forEach(key => {
            removeFromStorage(key);
        });
        console.log('🧹 Все данные миссии очищены');
    }
    
    /**
     * Внутренний метод: обновить время последнего изменения
     */
    _updateTimestamp() {
        saveToStorage(this.keys.LAST_UPDATE, Date.now());
    }
    
    /**
     * Получить статистику по хранилищу
     */
    getStats() {
        const stats = {};
        for (const [name, key] of Object.entries(this.keys)) {
            const data = loadFromStorage(key);
            stats[name] = data ? '✅' : '❌';
        }
        return stats;
    }
}

// Создаем и экспортируем единственный экземпляр
export const marsStore = new MarsDataStore();