/**
 * Модуль для обработки данных карты Марса
 * Превращает сырые данные API в удобные структуры
 */

export class DataProcessor {
    /**
     * Преобразует строковые значения в числа
     * @param {Array} tileData - сырые данные тайла
     * @returns {Array} - тайл с числами
     */
    static parseTileData(tileData) {
        // API может вернуть строки вместо чисел
        return tileData.map(row => 
            row.map(cell => {
                // Если пришла строка - превращаем в число
                if (typeof cell === 'string') {
                    return parseInt(cell, 10);
                }
                // Если уже число - оставляем
                return cell;
            })
        );
    }

    /**
     * Проверяет, корректен ли тайл
     * @param {Array} tile - данные тайла
     * @returns {boolean} - валидный или нет
     */
    static validateTile(tile) {
        // Проверка 1: это массив?
        if (!Array.isArray(tile)) return false;
        
        // Проверка 2: размер 64x64?
        if (tile.length !== 64) return false;
        if (!Array.isArray(tile[0]) || tile[0].length !== 64) return false;
        
        // Проверка 3: все значения в диапазоне 0-255?
        for (let row of tile) {
            for (let value of row) {
                if (typeof value !== 'number' || value < 0 || value > 255) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Собирает карту из тайлов
     * @param {Array} tiles - массив тайлов 64x64
     * @returns {Array} - полная карта 256x256
     */
    static assembleMap(tiles) {
        // Создаем пустую карту 256x256
        const map = Array(256).fill().map(() => Array(256).fill(0));
        
        // Раскладываем тайлы по местам
        // TODO: здесь будет алгоритм определения порядка тайлов
        // Пока просто раскладываем по порядку 4x4
        for (let tileIndex = 0; tileIndex < tiles.length; tileIndex++) {
            const tile = tiles[tileIndex];
            
            // Вычисляем позицию тайла (0-3 по x и y)
            const tileX = tileIndex % 4;
            const tileY = Math.floor(tileIndex / 4);
            
            // Вставляем пиксели тайла в нужное место карты
            for (let y = 0; y < 64; y++) {
                for (let x = 0; x < 64; x++) {
                    const mapX = tileX * 64 + x;
                    const mapY = tileY * 64 + y;
                    map[mapY][mapX] = tile[y][x];
                }
            }
        }
        
        return map;
    }

    /**
     * Находит минимальную и максимальную высоту на карте
     * @param {Array} map - карта высот
     * @returns {Object} - min и max значения
     */
    static getHeightRange(map) {
        let min = 255;
        let max = 0;
        
        for (let row of map) {
            for (let value of row) {
                if (value < min) min = value;
                if (value > max) max = value;
            }
        }
        
        return { min, max };
    }

    /**
     * Нормализует высоты для визуализации
     * @param {number} height - исходная высота 0-255
     * @param {Object} range - диапазон высот на карте
     * @returns {number} - значение 0-1 для отрисовки
     */
    static normalizeHeight(height, range) {
        return (height - range.min) / (range.max - range.min);
    }
}