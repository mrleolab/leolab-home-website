const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function sceneHarness(width, height) {
  const dots = [];
  const ctx = {
    setTransform() {},
    fillRect(...values) {
      assert(values.every(Number.isFinite), 'all canvas coordinates must be finite');
      dots.push(values);
    },
    createRadialGradient() { return { addColorStop() {} }; },
  };
  const canvas = { parentElement: { clientWidth: width, clientHeight: height }, getContext: () => ctx };
  const sandbox = {
    document: { querySelector: () => canvas, hidden: false, addEventListener() {} },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    devicePixelRatio: 2,
    ResizeObserver: class { observe() {} },
    IntersectionObserver: class { observe() {} },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
  };
  const source = fs.readFileSync(`${__dirname}/science-background.js`, 'utf8');
  vm.runInNewContext(source.replace('resize(); render(0); resume();',
    'resize(); globalThis.testScene={render,points,palette,atoms,bonds};'), sandbox);
  return { ...sandbox.testScene, dots };
}

test('six shapes include distinct robot and Microduck geometry and colors', () => {
  const scene = sceneHarness(390, 766);
  assert.equal(scene.palette.length, 6);
  assert.equal(scene.atoms.length, 60);
  assert.equal(scene.bonds.length, 90);
  for (const point of scene.points) {
    assert.equal(point.shapes.length, 6);
    for (const shape of point.shapes) assert(shape.every(Number.isFinite));
    assert.equal(point.robotColor.length, 3);
    assert.equal(point.duckColor.length, 3);
  }
  assert(scene.points.some(p => p.duckColor[0] === 255 && p.duckColor[1] === 157), 'duck has orange beak and feet');
});

test('all six scenes and transition frames render without clipping on phones', () => {
  for (const width of [320, 390, 430]) {
    const scene = sceneHarness(width, 766);
    for (let time = 0; time <= 18; time += .25) {
      scene.dots.length = 0;
      scene.render(time);
      const particles = scene.dots.slice(-scene.points.length);
      for (const [x, y, w, h] of particles) {
        assert(x >= 0 && x + w <= width, `particle outside ${width}px screen at ${time}s`);
        assert(y >= 0 && y + h <= 766, 'particle outside hero height');
      }
    }
  }
});
