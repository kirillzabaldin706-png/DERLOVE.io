const start = document.getElementById("start");
const content = document.getElementById("content");
const canvas = document.getElementById("tree");
const ctx = canvas.getContext("2d");

let hearts = [];
let animationComplete = false;
let isMobile = window.innerWidth < 768;
let animationPhase = 0; // 0 - рост ствола, 1 - рост веток, 2 - распускание цветов

// Определяем размеры в зависимости от устройства
function getCanvasDimensions() {
  const rect = canvas.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
}

// Устанавливаем размеры холста
function setupCanvas() {
  const dims = getCanvasDimensions();
  canvas.width = dims.width;
  canvas.height = dims.height;
}

// Адаптивные параметры дерева
function getTreeParams() {
  const width = canvas.width;
  const height = canvas.height;
  
  if (isMobile) {
    return {
      trunkHeight: height * 0.45,
      trunkWidth: 7,
      branchCount: 4,
      mainHeartCount: 25,
      secondaryHeartCount: 80,
      trunkHeartCount: 30,
      branchLength: 80,
      branchOffset: 35
    };
  } else {
    return {
      trunkHeight: 220,
      trunkWidth: 8,
      branchCount: 6,
      mainHeartCount: 35,
      secondaryHeartCount: 150,
      trunkHeartCount: 50,
      branchLength: 100,
      branchOffset: 40
    };
  }
}

start.addEventListener("click", () => {
  start.style.display = "none";
  content.classList.remove("hidden");
  
  // Ждём рендеринга контента
  setTimeout(() => {
    setupCanvas();
    animateTree();
  }, 300);
  
  startTimer();
});

// Унифицированная анимация дерева
function animateTree() {
  animationPhase = 0;
  animationComplete = false;
  hearts = [];
  
  // Сначала рисуем землю
  drawGround();
  
  // Затем начинаем анимацию
  animateTrunk();
}

// Анимация роста ствола
function animateTrunk() {
  const centerX = canvas.width / 2;
  const bottomY = canvas.height;
  const params = getTreeParams();
  const trunkHeight = params.trunkHeight;
  const trunkWidth = params.trunkWidth;
  let currentHeight = 0;
  
  animationPhase = 0;
  
  const trunkInterval = setInterval(() => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    
    currentHeight += isMobile ? 2 : 3;
    if (currentHeight > trunkHeight) {
      currentHeight = trunkHeight;
      clearInterval(trunkInterval);
      
      // После роста ствола начинаем рисовать ветки
      setTimeout(animateBranches, 200);
    }
    
    // Рисуем растущий ствол
    drawTrunk(centerX, bottomY, currentHeight, trunkWidth);
    
    // Добавляем эффект роста
    drawGrowthEffect(centerX, bottomY - currentHeight);
  }, 20);
}

// Анимация роста веток
function animateBranches() {
  animationPhase = 1;
  const centerX = canvas.width / 2;
  const bottomY = canvas.height;
  const params = getTreeParams();
  const trunkHeight = params.trunkHeight;
  const trunkWidth = params.trunkWidth;
  
  // Рисуем ствол полностью
  drawTrunk(centerX, bottomY, trunkHeight, trunkWidth);
  
  // Создаем ветки
  const branches = [
    { angle: -Math.PI/4, length: params.branchLength, x: centerX, y: bottomY - trunkHeight, level: 1 },
    { angle: Math.PI/4, length: params.branchLength, x: centerX, y: bottomY - trunkHeight, level: 1 },
    { angle: -Math.PI/6, length: params.branchLength + 10, x: centerX, y: bottomY - trunkHeight - params.branchOffset, level: 1 },
    { angle: Math.PI/6, length: params.branchLength + 10, x: centerX, y: bottomY - trunkHeight - params.branchOffset, level: 1 }
  ];
  
  if (!isMobile) {
    branches.push(
      { angle: -Math.PI/3, length: params.branchLength - 15, x: centerX, y: bottomY - trunkHeight - params.branchOffset * 2, level: 1 },
      { angle: Math.PI/3, length: params.branchLength - 15, x: centerX, y: bottomY - trunkHeight - params.branchOffset * 2, level: 1 }
    );
  }
  
  let branchIndex = 0;
  
  function drawBranch(branch, progress) {
    const lineWidth = branch.level === 1 ? (isMobile ? 2.5 : 3.5) : (isMobile ? 2 : 2.5);
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = lineWidth * progress;
    ctx.lineCap = "round";
    
    ctx.beginPath();
    ctx.moveTo(branch.x, branch.y);
    const endX = branch.x + Math.cos(branch.angle) * branch.length * progress;
    const endY = branch.y + Math.sin(branch.angle) * branch.length * progress;
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    return { x: endX, y: endY };
  }
  
  function animateNextBranch() {
    if (branchIndex >= branches.length) {
      setTimeout(animateFlowers, 300);
      return;
    }
    
    const branch = branches[branchIndex];
    let progress = 0;
    
    const interval = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGround();
      
      // Рисуем ствол
      drawTrunk(canvas.width/2, canvas.height, params.trunkHeight, params.trunkWidth);
      
      // Рисуем все предыдущие ветки полностью
      for (let i = 0; i < branchIndex; i++) {
        drawBranch(branches[i], 1);
      }
      
      // Рисуем текущую ветку с прогрессом
      drawBranch(branch, progress);
      
      progress += 0.03;
      if (progress >= 1) {
        progress = 1;
        clearInterval(interval);
        branchIndex++;
        setTimeout(animateNextBranch, isMobile ? 100 : 70);
      }
    }, 25);
  }
  
  animateNextBranch();
}

// Анимация распускания цветов
function animateFlowers() {
  animationPhase = 2;
  hearts = [];
  const params = getTreeParams();
  
  // Создаем сердечки на концах веток
  const branchEnds = [
    { x: canvas.width/2 - 65, y: canvas.height - 260 },
    { x: canvas.width/2 + 65, y: canvas.height - 260 },
    { x: canvas.width/2 - 90, y: canvas.height - 280 },
    { x: canvas.width/2 + 90, y: canvas.height - 280 }
  ];
  
  if (!isMobile) {
    branchEnds.push(
      { x: canvas.width/2 - 45, y: canvas.height - 300 },
      { x: canvas.width/2 + 45, y: canvas.height - 300 }
    );
  }
  
  // Основные цветы на концах веток
  const mainCount = isMobile ? params.mainHeartCount : params.mainHeartCount * 1.2;
  for (let i = 0; i < mainCount; i++) {
    const base = branchEnds[i % branchEnds.length];
    hearts.push({
      x: base.x + (Math.random() - 0.5) * 20,
      y: base.y + (Math.random() - 0.5) * 15,
      size: 0,
      maxSize: 14 + Math.random() * 6,
      color: getRandomFlowerColor(),
      delay: i * 40,
      type: 'main',
      bloomProgress: 0
    });
  }
  
  // Дополнительные цветы вокруг веток
  const secondaryCount = isMobile ? params.secondaryHeartCount : params.secondaryHeartCount * 1.3;
  for (let i = 0; i < secondaryCount; i++) {
    const baseIndex = Math.floor(Math.random() * branchEnds.length);
    const base = branchEnds[baseIndex];
    
    const angle = Math.random() * Math.PI * 2;
    const distance = 10 + Math.random() * 70;
    
    hearts.push({
      x: base.x + Math.cos(angle) * distance,
      y: base.y + Math.sin(angle) * distance,
      size: 0,
      maxSize: 9 + Math.random() * 8,
      color: getRandomFlowerColor(),
      delay: 300 + Math.random() * 1500,
      type: 'secondary',
      bloomProgress: 0
    });
  }
  
  // Цветы по стволу
  const trunkCount = isMobile ? params.trunkHeartCount : params.trunkHeartCount * 1.2;
  for (let i = 0; i < trunkCount; i++) {
    const progress = i / trunkCount;
    hearts.push({
      x: canvas.width/2 + (Math.random() - 0.5) * 20,
      y: canvas.height - params.trunkHeight + (params.trunkHeight * progress),
      size: 0,
      maxSize: 7 + Math.random() * 7,
      color: getRandomFlowerColor(),
      delay: 800 + Math.random() * 2000,
      type: 'trunk',
      bloomProgress: 0
    });
  }
  
  // Сортируем сердечки по времени появления
  hearts.sort((a, b) => a.delay - b.delay);
  
  // Анимируем распускание всех сердечек
  hearts.forEach((heart, index) => {
    setTimeout(() => {
      bloomHeart(heart);
    }, heart.delay);
  });
  
  // Добавляем мерцание
  setInterval(() => {
    if (animationComplete) {
      drawScene();
    }
  }, 100);
}

// Получаем случайный цвет для цветка
function getRandomFlowerColor() {
  const colors = [
    '#FF69B4', '#FF1493', '#FFB6C1', '#FFC0CB', 
    '#DB7093', '#C71585', '#E91E63', '#F44336',
    '#FF5252', '#FF80AB', '#F06292', '#EC407A'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Анимация распускания сердца
function bloomHeart(heart) {
  heart.bloomProgress = 0;
  
  const bloomInterval = setInterval(() => {
    heart.bloomProgress += 0.03;
    
    if (heart.bloomProgress >= 1) {
      heart.bloomProgress = 1;
      clearInterval(bloomInterval);
      
      // Добавляем легкое мерцание после распускания
      heart.pulse = true;
      heart.pulseOffset = Math.random() * Math.PI * 2;
      
      // Помечаем что все цветы распустились
      const allBloomed = hearts.every(h => h.bloomProgress >= 1);
      if (allBloomed) {
        animationComplete = true;
        drawScene();
      }
      
      return;
    }
    
    // Плавное увеличение размера
    heart.size = heart.maxSize * heart.bloomProgress;
    
    if (animationComplete) drawScene();
  }, 30);
}

// Рисуем всю сцену
function drawScene() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGround();
  
  // Ствол
  const params = getTreeParams();
  drawTrunk(canvas.width/2, canvas.height, params.trunkHeight, params.trunkWidth);
  
  // Ветки
  ctx.strokeStyle = "#8B4513";
  ctx.lineCap = "round";
  
  const branches = [
    { angle: -Math.PI/4, length: params.branchLength, x: canvas.width/2, y: canvas.height - params.trunkHeight },
    { angle: Math.PI/4, length: params.branchLength, x: canvas.width/2, y: canvas.height - params.trunkHeight },
    { angle: -Math.PI/6, length: params.branchLength + 10, x: canvas.width/2, y: canvas.height - params.trunkHeight - params.branchOffset },
    { angle: Math.PI/6, length: params.branchLength + 10, x: canvas.width/2, y: canvas.height - params.trunkHeight - params.branchOffset }
  ];
  
  if (!isMobile) {
    branches.push(
      { angle: -Math.PI/3, length: params.branchLength - 15, x: canvas.width/2, y: canvas.height - params.trunkHeight - params.branchOffset * 2 },
      { angle: Math.PI/3, length: params.branchLength - 15, x: canvas.width/2, y: canvas.height - params.trunkHeight - params.branchOffset * 2 }
    );
  }
  
  branches.forEach((branch, index) => {
    ctx.lineWidth = index < 2 ? (isMobile ? 2.5 : 3.5) : (isMobile ? 2 : 2.5);
    ctx.beginPath();
    ctx.moveTo(branch.x, branch.y);
    ctx.lineTo(
      branch.x + Math.cos(branch.angle) * branch.length,
      branch.y + Math.sin(branch.angle) * branch.length
    );
    ctx.stroke();
  });
  
  // Сердечки
  hearts.forEach(heart => {
    if (heart.bloomProgress >= 1) {
      if (heart.pulse) {
        const pulseSize = heart.maxSize + Math.sin(Date.now() / 300 + heart.pulseOffset) * 0.8;
        drawHeart(heart.x, heart.y, pulseSize, heart.color);
      } else {
        drawHeart(heart.x, heart.y, heart.size, heart.color);
      }
    } else {
      // Показываем частично распустившиеся сердечки
      const size = heart.maxSize * heart.bloomProgress;
      drawHeart(heart.x, heart.y, size, heart.color);
    }
  });
}

// Рисуем сердце
function drawHeart(x, y, size, color) {
  if (size <= 0) return;
  
  // Тень
  ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
  ctx.shadowBlur = isMobile ? 5 : 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Основное сердце
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.3, color);
  gradient.addColorStop(1, shadeColor(color, -20));
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(x, y + size * 0.5);
  ctx.bezierCurveTo(
    x - size * 0.5, y - size * 0.2,
    x - size, y + size * 0.5,
    x, y + size * 1.5
  );
  ctx.bezierCurveTo(
    x + size, y + size * 0.5,
    x + size * 0.5, y - size * 0.2,
    x, y + size * 0.5
  );
  ctx.fill();
  
  // Блик
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.arc(x - size * 0.2, y - size * 0.1, size * 0.18, 0, Math.PI * 2);
  ctx.fill();
  
  // Убираем тень
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Функция для затемнения цвета
function shadeColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (
    0x1000000 +
    (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)
  ).toString(16).slice(1);
}

// Рисуем землю
function drawGround() {
  const gradient = ctx.createLinearGradient(0, canvas.height * 0.85, 0, canvas.height);
  gradient.addColorStop(0, "#8B4513");
  gradient.addColorStop(0.3, "#A0522D");
  gradient.addColorStop(1, "#CD853F");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, canvas.height * 0.85, canvas.width, canvas.height * 0.15);
  
  // Трава
  ctx.fillStyle = "#4CAF50";
  const grassCount = isMobile ? 50 : 100;
  for (let i = 0; i < grassCount; i++) {
    const x = Math.random() * canvas.width;
    const width = 1 + Math.random() * 2.5;
    const height = 8 + Math.random() * 15;
    const y = canvas.height * 0.85 - height + Math.random() * 5;
    ctx.fillRect(x, y, width, height);
  }
  
  // Цветочки на траве
  const flowerCount = isMobile ? 20 : 40;
  for (let i = 0; i < flowerCount; i++) {
    const x = Math.random() * canvas.width;
    const y = canvas.height * 0.85 - 5;
    drawSmallFlower(x, y);
  }
}

// Маленькие цветочки на траве
function drawSmallFlower(x, y) {
  // Стебель
  ctx.strokeStyle = "#4CAF50";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 15);
  ctx.stroke();
  
  // Цветок
  const colors = ['#FF69B4', '#FF1493', '#FFB6C1'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y - 18, 3, 0, Math.PI * 2);
  ctx.fill();
}

// Рисуем ствол с текстурой
function drawTrunk(centerX, bottomY, height, width) {
  const gradient = ctx.createLinearGradient(
    centerX - width/2, bottomY - height,
    centerX + width/2, bottomY
  );
  gradient.addColorStop(0, "#654321");
  gradient.addColorStop(0.5, "#8B4513");
  gradient.addColorStop(1, "#A0522D");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(centerX - width/2, bottomY - height, width, height);
  
  // Текстура коры
  ctx.strokeStyle = "rgba(50, 30, 20, 0.3)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const lineCount = isMobile ? 7 : 12;
  for (let i = 0; i < lineCount; i++) {
    const x1 = centerX - width/2 + Math.random() * 2;
    const x2 = centerX + width/2 - Math.random() * 2;
    const y1 = bottomY - height + Math.random() * height;
    const y2 = y1 + 10 + Math.random() * 20;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  ctx.stroke();
}

// Эффект роста
function drawGrowthEffect(x, y) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  const particleCount = isMobile ? 10 : 18;
  for (let i = 0; i < particleCount; i++) {
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = -5 - Math.random() * 12;
    const size = 1 + Math.random() * 2;
    const opacity = 0.3 + Math.random() * 0.7;
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x + offsetX, y + offsetY, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Таймер
function startTimer() {
  const startDate = new Date("2024-02-14T00:00:00");
  const timeElement = document.getElementById("time");
  
  const timer = setInterval(() => {
    const now = new Date();
    const diffMs = now - startDate;
    
    if (diffMs < 0) {
      timeElement.innerText = "0 días 00:00:00";
      clearInterval(timer);
      return;
    }

    let diff = Math.floor(diffMs / 1000);
    const days = Math.floor(diff / 86400);
    diff %= 86400;
    const hours = Math.floor(diff / 3600);
    diff %= 3600;
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;

    // Адаптивный формат времени
    if (isMobile) {
      timeElement.innerText = 
        `${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      timeElement.innerText = 
        `${days} día${days !== 1 ? 's' : ''} ` +
        `${hours.toString().padStart(2, '0')} hora${hours !== 1 ? 's' : ''} ` +
        `${minutes.toString().padStart(2, '0')} minuto${minutes !== 1 ? 's' : ''} ` +
        `${seconds.toString().padStart(2, '0')} segundo${seconds !== 1 ? 's' : ''}`;
    }
  }, 1000);
}

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
  const wasMobile = isMobile;
  isMobile = window.innerWidth < 768;
  
  // Пересоздаём холст при изменении ориентации
  if (wasMobile !== isMobile && content.classList.contains('hidden') === false) {
    setupCanvas();
    hearts = [];
    animationComplete = false;
    const params = getTreeParams();
    drawGround();
    drawTrunk(canvas.width/2, canvas.height, params.trunkHeight, params.trunkWidth);
    animateTree();
  } else if (content.classList.contains('hidden') === false) {
    setupCanvas();
    if (animationComplete) {
      drawScene();
    }
  }
});

// Инициализация звёзд (для фона)
setInterval(() => {
  if (animationComplete) {
    drawStars();
  }
}, 300);

// Рисуем мерцающие звёзды
function drawStars() {
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  const starCount = isMobile ? 20 : 40;
  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height * 0.7;
    const size = 0.5 + Math.random() * 1.5;
    const opacity = 0.2 + Math.random() * 0.8;
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}