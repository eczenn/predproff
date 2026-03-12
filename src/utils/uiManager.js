/**
 * Универсальный менеджер для работы с DOM
 * Упрощает создание и управление элементами интерфейса
 */
export class UIManager {
    constructor(rootElement = document.body) {
        this.root = rootElement;
        this.elements = new Map(); // Хранилище созданных элементов
        this.eventListeners = new Map(); // Для возможности удаления слушателей
    }
    
    /**
     * Создать элемент с заданными свойствами
     */
    createElement(tag, options = {}) {
        const element = document.createElement(tag);
        
        // Устанавливаем ID
        if (options.id) {
            element.id = options.id;
            this.elements.set(options.id, element);
        }
        
        // Добавляем классы
        if (options.className) {
            element.className = options.className;
        }
        
        // Добавляем несколько классов через массив
        if (options.classes && Array.isArray(options.classes)) {
            element.classList.add(...options.classes);
        }
        
        // Устанавливаем текст
        if (options.text) {
            element.textContent = options.text;
        }
        
        // Устанавливаем HTML
        if (options.html) {
            element.innerHTML = options.html;
        }
        
        // Устанавливаем атрибуты
        if (options.attrs) {
            Object.entries(options.attrs).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        
        // Устанавливаем стили
        if (options.styles) {
            Object.entries(options.styles).forEach(([key, value]) => {
                element.style[key] = value;
            });
        }
        
        // Добавляем обработчики событий
        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                this.addEventListener(element, event, handler);
            });
        }
        
        // Сразу добавляем в родитель, если указан
        if (options.parent) {
            const parent = typeof options.parent === 'string' 
                ? this.elements.get(options.parent) || document.getElementById(options.parent)
                : options.parent;
            
            if (parent) {
                parent.appendChild(element);
            }
        }
        
        return element;
    }
    
    /**
     * Безопасное добавление обработчика события
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        // Сохраняем для возможности удаления
        const key = `${element.id || 'anonymous'}_${event}`;
        if (!this.eventListeners.has(key)) {
            this.eventListeners.set(key, []);
        }
        this.eventListeners.get(key).push({ element, event, handler });
    }
    
    /**
     * Удалить все обработчики события для элемента
     */
    removeEventListeners(element, event = null) {
        const key = `${element.id || 'anonymous'}_${event || '*'}`;
        
        if (event) {
            // Удаляем конкретное событие
            const listeners = this.eventListeners.get(key) || [];
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners.delete(key);
        } else {
            // Удаляем все события для элемента
            this.eventListeners.forEach((listeners, k) => {
                if (k.startsWith(element.id || 'anonymous')) {
                    listeners.forEach(({ element, event, handler }) => {
                        element.removeEventListener(event, handler);
                    });
                    this.eventListeners.delete(k);
                }
            });
        }
    }
    
    /**
     * Быстрое создание кнопки
     */
    createButton(text, onClick, options = {}) {
        return this.createElement('button', {
            text,
            className: options.className || 'btn',
            events: { click: onClick },
            ...options
        });
    }
    
    /**
     * Быстрое создание панели управления
     */
    createControlPanel(title, parent) {
        const panel = this.createElement('div', {
            className: 'control-panel',
            parent
        });
        
        if (title) {
            this.createElement('h3', {
                text: title,
                parent: panel
            });
        }
        
        return panel;
    }
    
    /**
     * Показать/скрыть элемент
     */
    toggle(element, show = null) {
        if (!element) return;
        
        if (show === null) {
            // Переключаем
            element.style.display = element.style.display === 'none' ? '' : 'none';
        } else {
            element.style.display = show ? '' : 'none';
        }
    }
    
    /**
     * Получить элемент по ID (из кэша или из DOM)
     */
    get(id) {
        return this.elements.get(id) || document.getElementById(id);
    }
    
    /**
     * Создать сообщение об ошибке
     */
    showError(message, parent, duration = 3000) {
        const errorDiv = this.createElement('div', {
            className: 'error-message',
            text: `❌ ${message}`,
            styles: {
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '10px',
                borderRadius: '4px',
                margin: '10px 0'
            },
            parent
        });
        
        setTimeout(() => errorDiv.remove(), duration);
        return errorDiv;
    }
    
    /**
     * Создать сообщение об успехе
     */
    showSuccess(message, parent, duration = 3000) {
        const successDiv = this.createElement('div', {
            className: 'success-message',
            text: `✅ ${message}`,
            styles: {
                backgroundColor: '#d4edda',
                color: '#155724',
                padding: '10px',
                borderRadius: '4px',
                margin: '10px 0'
            },
            parent
        });
        
        setTimeout(() => successDiv.remove(), duration);
        return successDiv;
    }
    
    /**
     * Очистить контейнер
     */
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }
}

// Создаем глобальный экземпляр для использования во всем приложении
export const ui = new UIManager();