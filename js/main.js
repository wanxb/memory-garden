(() => {
  const canvas = document.getElementById('garden');
  const scene = window.MemoryGardenScene.createScene(canvas, window.MemoryGardenData.quotes);
  window.MemoryGardenUI.createUI(scene);
  addEventListener('resize', scene.resize);
})();
