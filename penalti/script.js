const ball = document.querySelector('.ball');
const keeper = document.querySelector('.keeper');
const messageDisplay = document.getElementById('message');

// --- Variáveis para pontuação ---
let currentGoals = 0;
let record = 0;

const goalsDisplay = document.createElement('p');
goalsDisplay.id = 'goals-display';
const recordDisplay = document.createElement('p');
recordDisplay.id = 'record-display';

function updateScoreDisplays() {
    goalsDisplay.textContent = `Gols: ${currentGoals}`;
    recordDisplay.textContent = `Recorde: ${record}`;
}

const controls = document.querySelector('.controls');
controls.insertBefore(goalsDisplay, messageDisplay);
controls.insertBefore(recordDisplay, goalsDisplay);

// --- Lógica de movimento do goleiro ---
let keeperAnimationId = null; // Iniciar como nulo para um controle mais claro
let keeperDirection = 1;
const keeperSpeed = 3; 
let isGameActive = false; // Variável para controlar o estado do jogo

function animateKeeper() {
    const currentTransform = window.getComputedStyle(keeper).getPropertyValue('transform');
    let matrix = new DOMMatrixReadOnly(currentTransform);
    let currentTranslateX = matrix.m41;

    const rightLimit = 155;
    const leftLimit = -155;

    let newTranslateX = currentTranslateX + (keeperDirection * keeperSpeed);

    if (newTranslateX >= rightLimit) {
        newTranslateX = rightLimit;
        keeperDirection = -1;
    } else if (newTranslateX <= leftLimit) {
        newTranslateX = leftLimit;
        keeperDirection = 1;
    }

    keeper.style.transform = `translateX(${newTranslateX}px)`;

    // Garante que a animação continue
    keeperAnimationId = requestAnimationFrame(animateKeeper);
}

function startKeeperMovement() {
    // Só inicia se já não estiver rodando
    if (!keeperAnimationId) {
        isGameActive = true;
        animateKeeper(); // Inicia o loop diretamente
    }
}

function stopKeeperMovement() {
    if (keeperAnimationId) {
        cancelAnimationFrame(keeperAnimationId);
        keeperAnimationId = null; // Reseta o ID para podermos reiniciar depois
    }
    isGameActive = false;
}

// --- Função principal do jogo para chutar a bola ---
function kickBall(direction) {
    // Impede múltiplos chutes enquanto a animação de gol/defesa ocorre
    if (!isGameActive) return;

    stopKeeperMovement();

    let resultMessage = '';
    const kickPositions = {
        left: -155,
        center: 0,
        right: 155
    };
    
    const currentTransform = window.getComputedStyle(keeper).getPropertyValue('transform');
    let matrix = new DOMMatrixReadOnly(currentTransform);
    const keeperCurrentPosition = matrix.m41;
    
    let isSaved = false;
    if (direction === 'left' && keeperCurrentPosition <= -50) {
        isSaved = true;
    } else if (direction === 'right' && keeperCurrentPosition >= 50) {
        isSaved = true;
    } else if (direction === 'center' && keeperCurrentPosition > -60 && keeperCurrentPosition < 60) {
        isSaved = true;
    }

    const jumpPosition = kickPositions[direction];
    
    if (isSaved) {
        keeper.style.transform = `translateX(${jumpPosition}px)`;
        resultMessage = 'O GOLEIRO DEFENDEU! Tente novamente. 🧤';
        currentGoals = 0;
        ball.style.transform = `translateY(-200px) translateX(${jumpPosition}px) scale(0.5)`;
    } else {
        currentGoals++;
        resultMessage = 'GOOOOOOOL! Você marcou! ⚽';

        if (currentGoals > record) {
            record = currentGoals;
            resultMessage += ' NOVO RECORDE!';
        }
        
        ball.style.transform = `translateY(-250px) translateX(${jumpPosition}px) scale(0.5)`;
    }

    messageDisplay.textContent = resultMessage;
    updateScoreDisplays();

    setTimeout(resetGame, 2000); // Chama resetGame sem parênteses
}

// Função para reiniciar o jogo
function resetGame() {
    ball.style.transform = 'translateY(0) scale(1)'; // A bola já está centralizada por padrão
    keeper.style.transform = 'translateX(0)';
    messageDisplay.textContent = 'Use as setas do teclado para chutar!';
    
    // Reseta a direção para o goleiro sempre começar indo para a direita
    keeperDirection = 1; 

    startKeeperMovement();
}

// --- Listener para eventos do teclado ---
document.addEventListener('keydown', (event) => {
    let direction;
    if (event.key === 'ArrowLeft') {
        direction = 'left';
    } else if (event.key === 'ArrowUp') {
        direction = 'center';
    } else if (event.key === 'ArrowRight') {
        direction = 'right';
    }

    if (direction) {
        kickBall(direction);
    }
});

// Inicia o jogo
updateScoreDisplays(); // Atualiza os placares iniciais
resetGame();