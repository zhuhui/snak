class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.gameStarted = false;
        this.gameOver = false;
        this.score = 0;
        
        // 蛇的初始位置和速度
        this.snake = [{x: 10, y: 10}];
        this.velocityX = 0;
        this.velocityY = 0;
        
        // 食物位置
        this.food = this.generateFood();
        
        // 控制按钮
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');
        this.gameOverAdElement = document.getElementById('gameOverAd');
        
        // 初始化音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 绑定事件处理器
        this.bindEvents();
        
        // 初始化游戏循环
        this.gameLoop = null;
    }
    
    // 生成移动音效
    playMoveSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    // 生成得分音效
    playScoreSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }

    // 生成游戏结束音效
    playGameOverSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }
    
    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // 按钮控制
        this.startBtn.addEventListener('click', () => {
            if (!this.gameStarted) {
                this.startGame();
            }
        });
        
        this.restartBtn.addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
    }
    
    handleKeyPress(e) {
        if (!this.gameStarted) return;
        
        let directionChanged = false;
        
        // 方向键和WASD控制
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.velocityY !== 1) {
                    this.velocityX = 0;
                    this.velocityY = -1;
                    directionChanged = true;
                }
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.velocityY !== -1) {
                    this.velocityX = 0;
                    this.velocityY = 1;
                    directionChanged = true;
                }
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.velocityX !== 1) {
                    this.velocityX = -1;
                    this.velocityY = 0;
                    directionChanged = true;
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.velocityX !== -1) {
                    this.velocityX = 1;
                    this.velocityY = 0;
                    directionChanged = true;
                }
                break;
        }

        // 如果方向改变，播放移动音效
        if (directionChanged) {
            this.playMoveSound();
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }
    
    update() {
        if (this.gameOver) return;
        
        // 移动蛇
        const head = {
            x: this.snake[0].x + this.velocityX,
            y: this.snake[0].y + this.velocityY
        };
        
        // 检查碰撞
        if (this.checkCollision(head)) {
            this.playGameOverSound();
            this.endGame();
            return;
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreElement.textContent = this.score;
            this.food = this.generateFood();
            this.playScoreSound();
        } else {
            this.snake.pop();
        }
    }
    
    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            return true;
        }
        
        // 检查自身碰撞
        return this.snake.some(segment => segment.x === head.x && segment.y === head.y);
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        this.ctx.fillStyle = '#22c55e';
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头用不同的颜色
                this.ctx.fillStyle = '#15803d';
            } else {
                this.ctx.fillStyle = '#22c55e';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize,
                segment.y * this.gridSize,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(
            this.food.x * this.gridSize,
            this.food.y * this.gridSize,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }
    
    startGame() {
        if (this.gameStarted) return;
        
        this.gameStarted = true;
        this.startBtn.disabled = true;
        this.restartBtn.disabled = false;
        this.gameOverElement.classList.add('hidden');
        
        // 设置初始方向
        this.velocityX = 1;
        this.velocityY = 0;
        
        // 开始游戏循环
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 100);
    }
    
    endGame() {
        this.gameOver = true;
        clearInterval(this.gameLoop);
        this.gameOverElement.classList.remove('hidden');
        
        // 显示游戏结束广告
        setTimeout(() => {
            this.gameOverAdElement.classList.remove('hidden');
            // 刷新广告
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error('Ad refresh failed:', e);
            }
        }, 1000); // 延迟1秒显示广告
    }
    
    resetGame() {
        // 重置游戏状态
        this.snake = [{x: 10, y: 10}];
        this.velocityX = 0;
        this.velocityY = 0;
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.food = this.generateFood();
        this.gameOver = false;
        this.gameStarted = false;
        
        // 重置UI
        this.startBtn.disabled = false;
        this.restartBtn.disabled = true;
        this.gameOverElement.classList.add('hidden');
        this.gameOverAdElement.classList.add('hidden');
        
        // 清除游戏循环
        clearInterval(this.gameLoop);
        
        // 重绘画布
        this.draw();
    }
}

// 初始化游戏
window.onload = () => {
    new SnakeGame();
}; 