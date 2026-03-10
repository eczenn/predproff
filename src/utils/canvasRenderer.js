/**
 * Модуль для отрисовки данных на Canvas
 */

export class CanvasRenderer {
    constructor(canvasId) {
        // Получаем элемент canvas
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas с id "${canvasId}" не найден!`);
        }
        
        // Получаем контекст для рисования
        this.ctx = this.canvas.getContext('2d');
        
        // Размер канваса
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Цвета для разных высот
        this.colors = {
            low: '#006400',      // темно-зеленый (низины)
            medium: '#8B4513',    // коричневый (средняя высота)
            high: '#FFFFFF',      // белый (вершины)
            water: '#1E90FF'      // синий (вода, если есть)
        };
    }

    /**
     * Очищает канвас
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Рисует карту высот
     * @param {Array} mapData - двумерный массив 256x256
     */
    drawHeightMap(mapData) {
        this.clear();
        
        // Размер одной ячейки карты в пикселях канваса
        const cellSize = this.width / mapData.length;
        
        // Находим диапазон высот
        let min = 255, max = 0;
        for (let row of mapData) {
            for (let val of row) {
                if (val < min) min = val;
                if (val > max) max = val;
            }
        }
        
        // Рисуем каждый пиксель карты
        for (let y = 0; y < mapData.length; y++) {
            for (let x = 0; x < mapData[y].length; x++) {
                const height = mapData[y][x];
                
                // Нормализуем высоту (0-1)
                const normalized = (height - min) / (max - min);
                
                // Выбираем цвет в зависимости от высоты
                let color;
                if (normalized < 0.33) {
                    color = this.colors.low;
                } else if (normalized < 0.66) {
                    color = this.colors.medium;
                } else {
                    color = this.colors.high;
                }
                
                // Рисуем пиксель
                this.ctx.fillStyle = color;
                this.ctx.fillRect(
                    x * cellSize, 
                    y * cellSize, 
                    cellSize, 
                    cellSize
                );
            }
        }
        
        // Добавляем информацию
        this.drawInfo(`Высоты: ${min} - ${max}`);
    }

    /**
     * Рисует точку (для модулей и станций)
     * @param {number} x - координата x (0-255)
     * @param {number} y - координата y (0-255)
     * @param {string} color - цвет точки
     * @param {string} label - подпись
     */
    drawPoint(x, y, color, label = '') {
        const cellSize = this.width / 256;
        const pixelX = x * cellSize;
        const pixelY = y * cellSize;
        const radius = cellSize * 2;
        
        // Рисуем круг
        this.ctx.beginPath();
        this.ctx.arc(pixelX, pixelY, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Рисуем подпись
        if (label) {
            this.ctx.fillStyle = 'black';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(label, pixelX + 10, pixelY - 10);
        }
    }

    /**
     * Рисует зону покрытия станции
     * @param {number} x - центр по x
     * @param {number} y - центр по y
     * @param {number} radius - радиус покрытия
     * @param {string} color - цвет
     */
    drawCoverageZone(x, y, radius, color) {
        const cellSize = this.width / 256;
        const pixelX = x * cellSize;
        const pixelY = y * cellSize;
        const pixelRadius = radius * cellSize;
        
        this.ctx.beginPath();
        this.ctx.arc(pixelX, pixelY, pixelRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.3; // Полупрозрачный
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0; // Возвращаем как было
    }

    /**
     * Рисует текстовую информацию
     */
    drawInfo(text) {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText(text, 10, 20);
        this.ctx.shadowBlur = 0;
    }

    /**
     * Рисует легенду
     */
    drawLegend() {
        const x = this.width - 120;
        const y = 20;
        
        // Низкие высоты
        this.ctx.fillStyle = this.colors.low;
        this.ctx.fillRect(x, y, 20, 20);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Низкие', x + 25, y + 15);
        
        // Средние высоты
        this.ctx.fillStyle = this.colors.medium;
        this.ctx.fillRect(x, y + 25, 20, 20);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('Средние', x + 25, y + 40);
        
        // Высокие высоты
        this.ctx.fillStyle = this.colors.high;
        this.ctx.fillRect(x, y + 50, 20, 20);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('Высокие', x + 25, y + 65);
    }
}