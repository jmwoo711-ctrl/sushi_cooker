// 스시 마스터 (Sushi Master) 게임 엔진
document.addEventListener('DOMContentLoaded', () => {
  // --- 게임 상수 및 레시피 데이터 ---
  const RECIPES = [
    {
      id: 'salmon',
      name: '연어 초밥',
      topping: 'salmon',
      needsRice: true,
      needsNori: false,
      allowNoWasabi: true,
      price: 120,
    },
    {
      id: 'tuna',
      name: '참치 초밥',
      topping: 'tuna',
      needsRice: true,
      needsNori: false,
      allowNoWasabi: true,
      price: 150,
    },
    {
      id: 'shrimp',
      name: '초새우 초밥',
      topping: 'shrimp',
      needsRice: true,
      needsNori: false,
      allowNoWasabi: true,
      price: 110,
    },
    {
      id: 'tamago',
      name: '계란 초밥',
      topping: 'tamago',
      needsRice: true,
      needsNori: true, // 김 띠
      allowNoWasabi: true,
      price: 90,
    },
    {
      id: 'unagi',
      name: '장어 초밥',
      topping: 'unagi',
      needsRice: true,
      needsNori: true, // 김 띠
      allowNoWasabi: true,
      price: 180,
    },
    {
      id: 'ikura',
      name: '날치알 군함',
      topping: 'ikura',
      needsRice: true,
      needsNori: true, // 군함 김
      allowNoWasabi: true,
      price: 160,
    }
  ];

  const CUSTOMER_TYPES = [
    { name: '고양이 손님', avatar: '🐱', speed: 1.0 },
    { name: '단골 직장인', avatar: '👨‍💼', speed: 1.1 },
    { name: '미식가', avatar: '🧐', speed: 1.25 },
    { name: '학생', avatar: '👧', speed: 0.95 },
    { name: '할머니', avatar: '👵', speed: 0.85 },
    { name: '외국인 관광객', avatar: '👱‍♂️', speed: 1.05 },
    { name: '곰돌이 손님', avatar: '🐻', speed: 0.9 }
  ];

  const GAME_DURATION = 80; // 초
  const MAX_SEATS = 3;

  // --- 게임 상태 관리 ---
  let state = {
    isPlaying: false,
    timeLeft: GAME_DURATION,
    score: 0,
    combo: 0,
    maxCombo: 0,
    servedCount: 0,
    customers: [null, null, null], // 슬롯 0, 1, 2
    board: {
      hasRice: false,
      hasWasabi: false,
      topping: null, // 'salmon', 'tuna', etc.
      hasNori: false
    }
  };

  let gameTimer = null;
  let customerSpawnTimer = null;

  // --- DOM 엘리먼트 캐싱 ---
  const elScore = document.getElementById('stat-score');
  const elCombo = document.getElementById('stat-combo');
  const elTimer = document.getElementById('stat-timer');
  const elCurrentDish = document.getElementById('current-dish');
  const elBoardEmptyHint = document.getElementById('board-empty-hint');
  const seatsContainer = document.querySelectorAll('.seat-slot');
  const startOverlay = document.getElementById('start-overlay');
  const endOverlay = document.getElementById('end-overlay');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnMute = document.getElementById('btn-mute');
  const btnServe = document.getElementById('btn-serve');
  const btnTrash = document.getElementById('btn-trash');

  // --- 도마(조리대) 상태 렌더링 ---
  function renderBoard() {
    const { hasRice, hasWasabi, topping, hasNori } = state.board;

    if (!hasRice && !topping && !hasNori) {
      elBoardEmptyHint.style.display = 'block';
      elCurrentDish.innerHTML = '';
      return;
    }

    elBoardEmptyHint.style.display = 'none';
    let html = `<div class="sushi-render">`;

    // 밥 렌더링
    if (hasRice) {
      html += `<div class="rice-ball"></div>`;
    }

    // 와사비 렌더링
    if (hasWasabi) {
      html += `<div class="wasabi-dot"></div>`;
    }

    // 군함말이 김 (ikura인 경우 군함 형태로)
    if (hasNori && topping === 'ikura') {
      html += `<div class="nori-wrap"></div>`;
    }

    // 토핑 렌더링
    if (topping === 'salmon') {
      html += `<div class="topping-layer topping-salmon"></div>`;
    } else if (topping === 'tuna') {
      html += `<div class="topping-layer topping-tuna"></div>`;
    } else if (topping === 'shrimp') {
      html += `<div class="topping-layer topping-shrimp"></div>`;
    } else if (topping === 'tamago') {
      html += `<div class="topping-layer topping-tamago"></div>`;
    } else if (topping === 'unagi') {
      html += `<div class="topping-layer topping-unagi"></div>`;
    } else if (topping === 'ikura') {
      html += `
        <div class="topping-ikura">
          <div class="ikura-pearl"></div>
          <div class="ikura-pearl"></div>
          <div class="ikura-pearl"></div>
          <div class="ikura-pearl"></div>
          <div class="ikura-pearl"></div>
          <div class="ikura-pearl"></div>
          <div class="ikura-pearl"></div>
        </div>
      `;
    }

    // 김 띠 (계란/장어초밥 띠)
    if (hasNori && (topping === 'tamago' || topping === 'unagi' || (!topping && hasRice))) {
      html += `<div class="nori-belt"></div>`;
    }

    html += `</div>`;
    elCurrentDish.innerHTML = html;
  }

  // --- 미니 초밥 뷰 생성 헬퍼 (주문 말풍선용) ---
  function getMiniSushiHTML(recipe, hasWasabi) {
    let toppingClass = '';
    let extraHTML = '';

    if (recipe.topping === 'salmon') toppingClass = 'topping-salmon';
    else if (recipe.topping === 'tuna') toppingClass = 'topping-tuna';
    else if (recipe.topping === 'shrimp') toppingClass = 'topping-shrimp';
    else if (recipe.topping === 'tamago') toppingClass = 'topping-tamago';
    else if (recipe.topping === 'unagi') toppingClass = 'topping-unagi';
    else if (recipe.topping === 'ikura') {
      extraHTML = `
        <div class="nori-wrap" style="transform: scale(0.6); bottom: -6px;"></div>
        <div class="topping-ikura" style="transform: scale(0.6); top: -2px;">
          <div class="ikura-pearl"></div><div class="ikura-pearl"></div><div class="ikura-pearl"></div>
        </div>
      `;
    }

    const beltHTML = (recipe.topping === 'tamago' || recipe.topping === 'unagi')
      ? `<div class="nori-belt" style="height: 34px; width: 8px; transform: scale(0.7); top: -2px;"></div>`
      : '';

    return `
      <div class="sushi-render" style="transform: scale(0.65); transform-origin: center center;">
        <div class="rice-ball"></div>
        ${hasWasabi ? '<div class="wasabi-dot"></div>' : ''}
        ${toppingClass ? `<div class="topping-layer ${toppingClass}"></div>` : ''}
        ${beltHTML}
        ${extraHTML}
      </div>
    `;
  }

  // --- 재료 추가 핸들러 ---
  function addIngredient(type) {
    if (!state.isPlaying) return;

    if (type === 'rice') {
      if (state.board.hasRice) {
        showFloatText('이미 밥이 올려져 있어요!', '#e74c3c');
        window.soundCtrl.playError();
        return;
      }
      state.board.hasRice = true;
      window.soundCtrl.playRice();
    } else if (type === 'wasabi') {
      if (!state.board.hasRice) {
        showFloatText('먼저 밥(샤리)을 쥐어주세요!', '#e67e22');
        window.soundCtrl.playError();
        return;
      }
      if (state.board.hasWasabi) {
        showFloatText('와사비가 이미 충분해요!', '#e67e22');
        return;
      }
      state.board.hasWasabi = true;
      window.soundCtrl.playWasabi();
    } else if (type === 'nori') {
      if (state.board.hasNori) return;
      state.board.hasNori = true;
      window.soundCtrl.playTopping();
    } else {
      // 일반 네타(토핑)
      if (state.board.topping) {
        showFloatText('토핑이 이미 올려져 있어요!', '#e74c3c');
        window.soundCtrl.playError();
        return;
      }
      state.board.topping = type;
      // 계란, 장어, 날치알은 김이 필수/세트인 경우가 많음 (편의를 위해 자동 김띠 둘러주기)
      if (type === 'tamago' || type === 'unagi' || type === 'ikura') {
        state.board.hasNori = true;
      }
      window.soundCtrl.playTopping();
    }

    renderBoard();
  }

  // --- 도마 비우기 (버리기) ---
  function clearBoard(silent = false) {
    if (!silent && (state.board.hasRice || state.board.topping)) {
      window.soundCtrl.playError();
      showFloatText('도마 비움 (-10P)', '#e74c3c');
      state.score = Math.max(0, state.score - 10);
      updateStats();
    }
    state.board = {
      hasRice: false,
      hasWasabi: false,
      topping: null,
      hasNori: false
    };
    renderBoard();
  }

  // --- 손님 시스템 ---
  class Customer {
    constructor(slotIndex) {
      this.slotIndex = slotIndex;
      const type = CUSTOMER_TYPES[Math.floor(Math.random() * CUSTOMER_TYPES.length)];
      this.name = type.name;
      this.avatar = type.avatar;

      // 주문 생성
      const recipe = RECIPES[Math.floor(Math.random() * RECIPES.length)];
      // 25% 확률로 와사비 제외 요청
      const wantWasabi = Math.random() > 0.25;

      this.order = {
        recipe: recipe,
        hasWasabi: wantWasabi
      };

      this.maxPatience = 22 / type.speed; // 인내심 시간(초)
      this.currentPatience = this.maxPatience;
      this.isAngry = false;
      this.domElement = seatsContainer[slotIndex];

      this.render();
    }

    render() {
      const order = this.order;
      const wasabiLabel = order.hasWasabi
        ? '<span class="order-tags">생와사비 O</span>'
        : '<span class="order-tags no-wasabi">와사비 빼주세요!</span>';

      this.domElement.innerHTML = `
        <div class="speech-bubble">
          <div class="order-title">${order.recipe.name}</div>
          <div class="order-details">
            <div class="order-sushi-preview">
              ${getMiniSushiHTML(order.recipe, order.hasWasabi)}
            </div>
            ${wasabiLabel}
          </div>
          <div class="patience-bar-container">
            <div class="patience-bar" id="patience-${this.slotIndex}" style="width: 100%;"></div>
          </div>
        </div>
        <div class="customer-avatar waiting" id="avatar-${this.slotIndex}">
          ${this.avatar}
        </div>
      `;
    }

    update(dt) {
      this.currentPatience -= dt;
      const pct = Math.max(0, (this.currentPatience / this.maxPatience) * 100);
      const bar = document.getElementById(`patience-${this.slotIndex}`);
      const avatar = document.getElementById(`avatar-${this.slotIndex}`);

      if (bar) {
        bar.style.width = `${pct}%`;
        if (pct < 30) {
          bar.style.backgroundColor = '#e74c3c'; // 빨강
          if (!this.isAngry && avatar) {
            this.isAngry = true;
            avatar.classList.add('angry');
          }
        } else if (pct < 60) {
          bar.style.backgroundColor = '#f39c12'; // 주황/노랑
        } else {
          bar.style.backgroundColor = '#00b894'; // 초록
        }
      }

      if (this.currentPatience <= 0) {
        this.leaveAngry();
      }
    }

    leaveHappy(tip = 0) {
      window.soundCtrl.playServe();
      window.soundCtrl.playCoin();
      showFloatText(`+${this.order.recipe.price + tip}P 😋`, '#2ecc71', this.domElement);

      this.domElement.innerHTML = `
        <div class="speech-bubble" style="background: #e8f8f5; border-color: #27ae60;">
          <div style="font-weight: 800; color: #27ae60;">너무 맛있어요! 👍</div>
        </div>
        <div class="customer-avatar" style="transform: scale(1.1);">
          ✨${this.avatar}✨
        </div>
      `;

      setTimeout(() => {
        this.clear();
      }, 700);
    }

    leaveAngry() {
      window.soundCtrl.playAngry();
      showFloatText('너무 늦어요! 😡', '#e74c3c', this.domElement);
      state.combo = 0;
      updateStats();

      this.domElement.innerHTML = `
        <div class="speech-bubble" style="background: #fdeed9; border-color: #c0392b;">
          <div style="font-weight: 800; color: #c0392b;">그냥 갈게요! 💢</div>
        </div>
        <div class="customer-avatar angry">
          ${this.avatar}
        </div>
      `;

      setTimeout(() => {
        this.clear();
      }, 700);
    }

    clear() {
      this.domElement.innerHTML = '';
      state.customers[this.slotIndex] = null;
    }
  }

  // --- 초밥 서빙 로직 ---
  function serveSushi(targetSlot = null) {
    if (!state.isPlaying) return;

    const { hasRice, hasWasabi, topping, hasNori } = state.board;

    if (!hasRice && !topping) {
      showFloatText('초밥을 먼저 만들어주세요!', '#f39c12');
      return;
    }

    // 도마 위 상태가 유효한 초밥 형태인지 확인
    if (!hasRice || !topping) {
      showFloatText('밥이나 토핑이 빠졌어요!', '#e74c3c');
      window.soundCtrl.playError();
      return;
    }

    // 대상 손님 결정: targetSlot 지정되었거나, 주문이 일치하는 가장 급한 손님
    let matchedCustomer = null;
    let matchedSlot = -1;

    const currentMatchesOrder = (c) => {
      if (!c) return false;
      const order = c.order;
      const recipe = order.recipe;

      if (recipe.topping !== topping) return false;
      if (order.hasWasabi !== hasWasabi) return false;
      return true;
    };

    if (targetSlot !== null && state.customers[targetSlot]) {
      if (currentMatchesOrder(state.customers[targetSlot])) {
        matchedCustomer = state.customers[targetSlot];
        matchedSlot = targetSlot;
      }
    } else {
      // 일치하는 손님 중 가장 남은 시간이 적은 손님 우선 서빙
      let lowestPatience = Infinity;
      for (let i = 0; i < MAX_SEATS; i++) {
        const c = state.customers[i];
        if (c && currentMatchesOrder(c)) {
          if (c.currentPatience < lowestPatience) {
            lowestPatience = c.currentPatience;
            matchedCustomer = c;
            matchedSlot = i;
          }
        }
      }
    }

    if (matchedCustomer) {
      // 서빙 성공!
      const recipe = matchedCustomer.order.recipe;
      state.combo++;
      if (state.combo > state.maxCombo) state.maxCombo = state.combo;
      state.servedCount++;

      // 보너스 점수 계산
      const speedRatio = matchedCustomer.currentPatience / matchedCustomer.maxPatience;
      const speedBonus = Math.floor(speedRatio * 50);
      const comboBonus = (state.combo - 1) * 25;
      const totalGain = recipe.price + speedBonus + comboBonus;

      state.score += totalGain;

      if (state.combo >= 3) {
        window.soundCtrl.playCombo();
        showFloatText(`🔥 ${state.combo} 콤보!`, '#ff7675');
      }

      matchedCustomer.leaveHappy(speedBonus + comboBonus);
      state.customers[matchedSlot] = null;
      clearBoard(true);
      updateStats();
    } else {
      // 일치하는 손님이 없거나 잘못된 주문
      window.soundCtrl.playError();
      state.combo = 0;
      showFloatText('주문과 다른 초밥이에요!', '#e74c3c');
      updateStats();
    }
  }

  // --- 플로팅 텍스트 이펙트 ---
  function showFloatText(text, color, parentElement = null) {
    const floatEl = document.createElement('div');
    floatEl.className = 'floating-text';
    floatEl.style.color = color;
    floatEl.textContent = text;

    if (parentElement) {
      const rect = parentElement.getBoundingClientRect();
      floatEl.style.left = `${rect.left + rect.width / 2 - 40}px`;
      floatEl.style.top = `${rect.top + 20}px`;
    } else {
      floatEl.style.left = '50%';
      floatEl.style.top = '48%';
      floatEl.style.transform = 'translate(-50%, -50%)';
    }

    document.body.appendChild(floatEl);
    setTimeout(() => {
      floatEl.remove();
    }, 800);
  }

  // --- 손님 스폰 시스템 ---
  function spawnCustomer() {
    if (!state.isPlaying) return;

    // 빈 좌석 찾기
    const emptySlots = [];
    for (let i = 0; i < MAX_SEATS; i++) {
      if (state.customers[i] === null) emptySlots.push(i);
    }

    if (emptySlots.length > 0) {
      const chosenSlot = emptySlots[Math.floor(Math.random() * emptySlots.length)];
      state.customers[chosenSlot] = new Customer(chosenSlot);
    }
  }

  // --- HUD 스탯 업데이트 ---
  function updateStats() {
    elScore.textContent = `₩ ${state.score.toLocaleString()}`;
    elCombo.textContent = `${state.combo} COMBO`;
    elTimer.textContent = `${Math.ceil(state.timeLeft)}s`;

    if (state.combo > 1) {
      elCombo.style.animation = 'popIn 0.2s';
      setTimeout(() => elCombo.style.animation = '', 200);
    }
  }

  // --- 게임 시작 & 루프 ---
  function startGame() {
    window.soundCtrl.init();
    window.soundCtrl.startBGM();

    state = {
      isPlaying: true,
      timeLeft: GAME_DURATION,
      score: 0,
      combo: 0,
      maxCombo: 0,
      servedCount: 0,
      customers: [null, null, null],
      board: { hasRice: false, hasWasabi: false, topping: null, hasNori: false }
    };

    seatsContainer.forEach(s => s.innerHTML = '');
    clearBoard(true);
    updateStats();

    startOverlay.style.display = 'none';
    endOverlay.style.display = 'none';

    // 손님 2명 즉시 입장
    spawnCustomer();
    setTimeout(spawnCustomer, 600);

    // 메인 루프 (100ms)
    let lastTime = performance.now();
    gameTimer = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        endGame();
        return;
      }

      // 손님 인내심 갱신
      for (let i = 0; i < MAX_SEATS; i++) {
        if (state.customers[i]) {
          state.customers[i].update(dt);
        }
      }

      updateStats();
    }, 100);

    // 주기적 손님 스폰
    customerSpawnTimer = setInterval(() => {
      spawnCustomer();
    }, 3200);
  }

  // --- 게임 오버 및 정산 ---
  function endGame() {
    state.isPlaying = false;
    clearInterval(gameTimer);
    clearInterval(customerSpawnTimer);

    // 랭크 계산
    let rank = 'C';
    let comment = '아직 연습이 더 필요해요!';
    if (state.score >= 2600) {
      rank = 'S';
      comment = '전설의 초밥 명장 탄생! 손님들이 감동했습니다! 🏆';
    } else if (state.score >= 1800) {
      rank = 'A';
      comment = '환상적인 스피드와 손맛! 인기 초밥집으로 등극! 🌟';
    } else if (state.score >= 1100) {
      rank = 'B';
      comment = '훌륭한 솜씨예요! 조금만 더 빠르면 완벽해요! 👍';
    }

    document.getElementById('final-rank').textContent = rank;
    document.getElementById('final-score').textContent = `₩ ${state.score.toLocaleString()}`;
    document.getElementById('final-served').textContent = `${state.servedCount} 접시`;
    document.getElementById('final-combo').textContent = `${state.maxCombo} 콤보`;
    document.getElementById('rank-comment').textContent = comment;

    endOverlay.style.display = 'flex';
  }

  // --- 이벤트 바인딩 ---
  btnStart.addEventListener('click', startGame);
  btnRestart.addEventListener('click', startGame);

  btnMute.addEventListener('click', () => {
    const isMuted = window.soundCtrl.toggleMute();
    btnMute.textContent = isMuted ? '🔇 음소거 해제' : '🔊 사운드';
  });

  btnServe.addEventListener('click', () => serveSushi());
  btnTrash.addEventListener('click', () => clearBoard(false));

  // 좌석 클릭 시 해당 손님에게 직접 서빙
  seatsContainer.forEach((seat, idx) => {
    seat.addEventListener('click', () => {
      serveSushi(idx);
    });
  });

  // 재료 버튼 바인딩
  document.querySelectorAll('.ing-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = btn.getAttribute('data-ing');
      if (type) addIngredient(type);
    });
  });

  // 키보드 단축키 지원 (쾌적한 조작감)
  window.addEventListener('keydown', (e) => {
    if (!state.isPlaying) return;

    const key = e.key.toUpperCase();

    if (key === '1') addIngredient('rice');
    else if (key === '2') addIngredient('wasabi');
    else if (key === 'Q') addIngredient('salmon');
    else if (key === 'W') addIngredient('tuna');
    else if (key === 'E') addIngredient('shrimp');
    else if (key === 'R') addIngredient('tamago');
    else if (key === 'T') addIngredient('unagi');
    else if (key === 'Y') addIngredient('ikura');
    else if (e.code === 'Space' || key === 'ENTER') {
      e.preventDefault();
      serveSushi();
    } else if (key === 'X' || key === 'DELETE' || key === 'BACKSPACE') {
      clearBoard(false);
    }
  });

  renderBoard();
});
