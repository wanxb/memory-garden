window.MemoryGardenUI = (() => {
  function createUI(scene) {
    const quoteBox = document.getElementById('quoteBox');
    const countEl = document.getElementById('count');
    const randomBtn = document.getElementById('randomBtn');
    const clearBtn = document.getElementById('clearBtn');
    const plantBtn = document.getElementById('plantBtn');
    const bloomBtn = document.getElementById('bloomBtn');
    const shareBtn = document.getElementById('shareBtn');
    const saveBtn = document.getElementById('saveBtn');
    const canvas = document.getElementById('garden');

    let currentQuote = '';
    let pendingPlant = false;

    function setCount() {
      countEl.textContent = `已种下 ${scene.getSeedCount()} 株`;
    }

    function addSeedAt(x, y, text) {
      currentQuote = text;
      scene.addSeed(x, y, text);
      quoteBox.textContent = text;
      setCount();
    }

    function promptAndPlant(x, y) {
      const text = prompt('种一句话进花园：', scene.randomQuote());
      if (text === null) return;
      const value = text.trim() || '今夜也有微光。';
      addSeedAt(x, y, value);
    }

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (pendingPlant) {
        addSeedAt(x, y, currentQuote || scene.randomQuote());
        pendingPlant = false;
        quoteBox.textContent = `已落种：${currentQuote}`;
        return;
      }
      promptAndPlant(x, y);
    });

    plantBtn.addEventListener('click', () => {
      currentQuote = scene.randomQuote();
      pendingPlant = true;
      quoteBox.textContent = `准备落种：${currentQuote}（现在点击夜空任意位置）`;
    });

    randomBtn.addEventListener('click', () => {
      addSeedAt(120 + Math.random() * Math.max(120, innerWidth - 240), innerHeight * (0.52 + Math.random() * 0.28), scene.randomQuote());
    });

    bloomBtn.addEventListener('click', () => scene.launchMeteorBurst());

    clearBtn.addEventListener('click', () => {
      scene.clearAll();
      currentQuote = '';
      pendingPlant = false;
      quoteBox.textContent = '花园重新安静了。再点一次，重新种。';
      setCount();
    });

    shareBtn.addEventListener('click', async () => {
      const text = currentQuote || quoteBox.textContent;
      try {
        await navigator.clipboard.writeText(text);
        quoteBox.textContent = `已复制：${text}`;
      } catch {
        quoteBox.textContent = '复制失败了，可能是浏览器权限不让。';
      }
    });

    saveBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'memory-garden-poster.png';
      a.click();
    });

    setCount();
  }

  return { createUI };
})();
