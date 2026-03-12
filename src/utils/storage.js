/**
 * Модуль для работы с localStorage
 * Все функции используют единый ключ для префикса, чтобы не конфликтовать
 * с другими приложениями на том же домене
 */

const STORAGE_PREFIX = 'mars_olympiad_';

/**
 * Сохранить данные в localStorage
 * @param {string} key - ключ (без префикса)
 * @param {any} data - любые данные (будут преобразованы в JSON)
 * @returns {boolean} - успешно ли сохранилось
 */
export function saveToStorage(key, data) {
    try {
        const fullKey = STORAGE_PREFIX + key;
        const jsonData = JSON.stringify(data);
        localStorage.setItem(fullKey, jsonData);
        
        console.log(`✅ Данные сохранены по ключу: ${fullKey}`);
        return true;
    } catch (error) {
        console.error('❌ Ошибка сохранения в localStorage:', error);
        
        // Самая частая ошибка - переполнение хранилища
        if (error.name === 'QuotaExceededError') {
            alert('Недостаточно места в хранилище!');
        }
        return false;
    }
}

/**
 * Загрузить данные из localStorage
 * @param {string} key - ключ (без префикса)
 * @param {any} defaultValue - значение по умолчанию, если данных нет
 * @returns {any} - загруженные данные или defaultValue
 */
export function loadFromStorage(key, defaultValue = null) {
    try {
        const fullKey = STORAGE_PREFIX + key;
        const jsonData = localStorage.getItem(fullKey);
        
        if (jsonData === null) {
            console.log(`ℹ️ Данные по ключу ${fullKey} не найдены`);
            return defaultValue;
        }
        
        const data = JSON.parse(jsonData);
        console.log(`✅ Данные загружены из ${fullKey}`);
        return data;
    } catch (error) {
        console.error('❌ Ошибка загрузки из localStorage:', error);
        return defaultValue;
    }
}

/**
 * Удалить данные из localStorage
 * @param {string} key - ключ (без префикса)
 */
export function removeFromStorage(key) {
    const fullKey = STORAGE_PREFIX + key;
    localStorage.removeItem(fullKey);
    console.log(`🗑️ Данные удалены: ${fullKey}`);
}

/**
 * Очистить все данные нашего приложения (не трогает чужие)
 */
export function clearAllAppData() {
    const keysToRemove = [];
    
    // Находим все ключи с нашим префиксом
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    
    // Удаляем их
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`🧹 Очищено ${keysToRemove.length} записей`);
}

/**
 * Получить информацию об использовании хранилища
 * @returns {object} - статистика
 */
export function getStorageInfo() {
    let totalSize = 0;
    const items = [];
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        const size = new Blob([value]).size; // Размер в байтах
        
        if (key.startsWith(STORAGE_PREFIX)) {
            items.push({
                key,
                size: (size / 1024).toFixed(2) + ' KB'
            });
        }
        totalSize += size;
    }
    
    return {
        items,
        totalSize: (totalSize / 1024).toFixed(2) + ' KB',
        itemCount: items.length
    };
}