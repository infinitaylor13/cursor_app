class SudokuGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.mistakes = 0;
        this.timer = 0;
        this.timerInterval = null;
        this.selectedCell = null;
        this.init();
    }

    init() {
        this.setupDifficulty();
        this.generateBoard();
        this.renderBoard();
        this.setupEventListeners();
        this.startTimer();
    }

    setupDifficulty() {
        const difficultySelect = document.getElementById('difficultySelect');
        this.difficulty = {
            'easy': 40,
            'medium': 50,
            'hard': 60
        };
        this.currentDifficulty = difficultySelect.value;
    }

    startTimer() {
        this.timer = 0;
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timer++;
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            document.getElementById('time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // 生成数独题目
    generateBoard() {
        // 先生成完整的解决方案
        this.generateSolution(0, 0);
        
        // 复制解决方案
        this.solution = this.board.map(row => [...row]);
        
        // 随机删除一些数字来创建题目
        let cellsToRemove = this.difficulty[this.currentDifficulty];
        while (cellsToRemove > 0) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            if (this.board[row][col] !== 0) {
                this.board[row][col] = 0;
                cellsToRemove--;
            }
        }
    }

    // 生成完整的数独解决方案
    generateSolution(row, col) {
        if (col >= 9) {
            row++;
            col = 0;
        }
        
        if (row >= 9) {
            return true;
        }

        if (this.board[row][col] !== 0) {
            return this.generateSolution(row, col + 1);
        }

        const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        for (let num of nums) {
            if (this.isValid(row, col, num)) {
                this.board[row][col] = num;
                if (this.generateSolution(row, col + 1)) {
                    return true;
                }
                this.board[row][col] = 0;
            }
        }

        return false;
    }

    // 检查数字是否有效
    isValid(row, col, num) {
        // 检查行
        for (let x = 0; x < 9; x++) {
            if (this.board[row][x] === num) return false;
        }

        // 检查列
        for (let x = 0; x < 9; x++) {
            if (this.board[x][col] === num) return false;
        }

        // 检查3x3方格
        let startRow = Math.floor(row / 3) * 3;
        let startCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.board[i + startRow][j + startCol] === num) return false;
            }
        }

        return true;
    }

    // 打乱数组顺序
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 渲染数独板
    renderBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                if (this.board[i][j] === 0) {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.min = '1';
                    input.max = '9';
                    input.dataset.row = i;
                    input.dataset.col = j;
                    cell.appendChild(input);
                } else {
                    cell.textContent = this.board[i][j];
                    cell.classList.add('fixed');
                }
                
                board.appendChild(cell);
            }
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        document.getElementById('newGame').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('check').addEventListener('click', () => {
            this.checkSolution();
        });

        document.getElementById('hint').addEventListener('click', () => {
            this.giveHint();
        });

        document.getElementById('difficultySelect').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            this.resetGame();
        });

        // 数字键盘事件
        document.querySelectorAll('.num-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.selectedCell) {
                    const input = this.selectedCell.querySelector('input');
                    if (input) {
                        const num = btn.dataset.num;
                        input.value = num === '0' ? '' : num;
                        this.checkCell(input);
                    }
                }
            });
        });

        // 为所有输入框添加输入限制
        document.addEventListener('input', (e) => {
            if (e.target.matches('.cell input')) {
                // 移除非数字字符
                e.target.value = e.target.value.replace(/[^1-9]/g, '');
                // 限制长度为1
                if (e.target.value.length > 1) {
                    e.target.value = e.target.value.slice(0, 1);
                }
                this.checkCell(e.target);
            }
        });

        // 阻止非法按键输入
        document.addEventListener('keydown', (e) => {
            if (e.target.matches('.cell input')) {
                // 允许数字键1-9、删除键、退格键和方向键
                const allowedKeys = ['1','2','3','4','5','6','7','8','9','Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab'];
                if (!allowedKeys.includes(e.key)) {
                    e.preventDefault();
                }
            }
        });

        // 单元格选择事件
        document.getElementById('board').addEventListener('click', (e) => {
            const cell = e.target.closest('.cell');
            if (cell) {
                document.querySelectorAll('.cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                this.selectedCell = cell;
                if (cell.querySelector('input')) {
                    cell.querySelector('input').focus();
                }
            }
        });
    }

    checkCell(input) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const value = parseInt(input.value) || 0;

        if (value !== 0 && value !== this.solution[row][col]) {
            input.parentElement.classList.add('error');
        } else {
            input.parentElement.classList.remove('error');
        }
    }

    giveHint() {
        const emptyCells = [];
        const inputs = document.querySelectorAll('.cell input');
        inputs.forEach(input => {
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            if (!input.value) {
                emptyCells.push({input, row, col});
            }
        });

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            randomCell.input.value = this.solution[randomCell.row][randomCell.col];
            randomCell.input.disabled = true;
            randomCell.input.parentElement.classList.add('fixed');
        }
    }

    gameOver() {
        clearInterval(this.timerInterval);
        const message = document.getElementById('message');
        message.textContent = '游戏结束！错误次数过多';
        message.className = 'wrong';
        
        // 禁用所有输入
        document.querySelectorAll('.cell input').forEach(input => {
            input.disabled = true;
        });
    }

    resetGame() {
        this.mistakes = 0;
        document.getElementById('mistakes').textContent = '0';
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.generateBoard();
        this.renderBoard();
        this.startTimer();
        document.getElementById('message').textContent = '';
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('error');
        });
    }

    // 检查答案
    checkSolution() {
        const inputs = document.querySelectorAll('.cell input');
        let isCorrect = true;
        let currentMistakes = 0;
        const message = document.getElementById('message');

        inputs.forEach(input => {
            const row = parseInt(input.dataset.row);
            const col = parseInt(input.dataset.col);
            const value = parseInt(input.value) || 0;

            if (value !== 0 && value !== this.solution[row][col]) {
                isCorrect = false;
                currentMistakes++;
                input.parentElement.classList.add('error');
            } else {
                input.parentElement.classList.remove('error');
            }
        });

        // 更新错误次数
        if (currentMistakes > 0) {
            this.mistakes++;
            document.getElementById('mistakes').textContent = this.mistakes;
            
            if (this.mistakes >= 3) {
                this.gameOver();
                return;
            }
        }

        if (isCorrect) {
            message.textContent = '恭喜你，答案正确！';
            message.className = 'correct';
            clearInterval(this.timerInterval); // 停止计时
        } else {
            message.textContent = `答案有误，发现 ${currentMistakes} 处错误，请继续尝试！`;
            message.className = 'wrong';
        }
    }
}

// 启动游戏
window.onload = () => {
    new SudokuGame();
}; 