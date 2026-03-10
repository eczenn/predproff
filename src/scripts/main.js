import { marsApi } from './api/marsApi.js';
import { DataProcessor } from './utils/dataProcessor.js';
import { CanvasRenderer } from './utils/canvasRenderer.js';

// Главный класс приложения
class MarsMapApp {
    constructor() {
        // Инициализируем рендерер
        this.renderer = new CanvasRenderer('map-canvas');
        
        // Хранилище данных
        this.mapData = null;
        this.modules = null;
        this.stations = [];
        
        // Флаги отображения
        this.showModules = false;
        this.showStations = false;
        this.showCoverage = false;
        
        // Запускаем приложение
        this.init();
    }
    
    async init() {
        console.log('🚀 Запуск приложения карты Марса');
        
        // Показываем заглушку
        this.renderer.drawInfo('Загрузка данных...');
        
        try {
            // ШАГ 1: Получаем данные
            await this.loadData();
            
            // ШАГ 2: Отображаем карту
            this.renderMap();
            
            console.log('✅ Приложение готово к работе');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации:', error);
            this.renderer.drawInfo(`Ошибка: ${error.message}`);
        }
    }
    
    async loadData() {
        // Получаем тайлы
        console.log('📡 Запрашиваем тайлы...');
        const rawTiles = await marsApi.getMultipleTiles(16);
        
        // Обрабатываем тайлы
        const processedTiles = rawTiles.map(tile => 
            DataProcessor.parseTileData(tile)
        );
        
        // Собираем карту
        this.mapData = DataProcessor.assembleMap(processedTiles);
        
        // Получаем координаты модулей
        console.log('📍 Запрашиваем координаты модулей...');
        this.modules = await marsApi.getModuleCoordinates();
        
        console.log('📊 Данные загружены:', {
            mapSize: this.mapData.length,
            modules: this.modules
        });
    }
    
    renderMap() {
        if (!this.mapData) return;
        
        // Рисуем карту
        this.renderer.drawHeightMap(this.mapData);
        
        // Добавляем легенду
        this.renderer.drawLegend();
        
        // Если нужно, рисуем модули
        if (this.showModules && this.modules) {
            this.renderer.drawPoint(
                this.modules.sender.x,
                this.modules.sender.y,
                'red',
                'Передатчик'
            );
            this.renderer.drawPoint(
                this.modules.listener.x,
                this.modules.listener.y,
                'blue',
                'Приемник'
            );
        }
        
        // Если нужно, рисуем станции
        if (this.showStations && this.stations.length > 0) {
            this.renderStations();
        }
    }
    
    renderStations() {
        // TODO: добавить отрисовку станций
        console.log('🔄 Отрисовка станций');
    }
    
    // Методы для управления отображением
    toggleModules() {
        this.showModules = !this.showModules;
        this.renderMap();
    }
    
    toggleStations() {
        this.showStations = !this.showStations;
        this.renderMap();
    }
    
    setApiUrl(url) {
        marsApi.setBaseUrl(url);
        this.loadData().then(() => this.renderMap());
    }
}

// Создаем и экспортируем приложение
export const app = new MarsMapApp();