/* Modelos atómicos en 3D — lógica de la escena (Three.js) y de la interfaz */
/* Se carga como script normal (no módulo) para que funcione también
   al abrir index.html directamente desde la computadora. Three.js se
   importa desde internet usando el importmap definido en index.html. */
(async function () {
'use strict';
let THREE, OrbitControls, CSS2DRenderer, CSS2DObject;
try {
  THREE = await import('three');
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
  ({ CSS2DRenderer, CSS2DObject } = await import('three/addons/renderers/CSS2DRenderer.js'));
} catch (err) {
  document.getElementById('viewer').insertAdjacentHTML('beforeend',
    '<div class="err">No se pudo cargar el motor 3D. Revisa tu conexión a internet y recarga la página.</div>');
  console.error(err);
  return;
}

/* ------------------------------------------------------------------ */
/*  Contenido                                                           */
/* ------------------------------------------------------------------ */
const MODELS = {
  dalton: {
    year: '1808', scientist: 'John Dalton', color: '#d39a5e',
    title: 'Modelo de Dalton', alias: '“La esfera sólida” o “bola de billar”',
    desc: 'Dalton retomó la idea griega del átomo y la convirtió en una teoría científica basada en las leyes de las combinaciones químicas. Imaginó el átomo como una esfera maciza, compacta e indivisible, sin partes internas.',
    post: [
      'La materia está formada por partículas diminutas e indivisibles llamadas átomos.',
      'Los átomos de un mismo elemento son idénticos en masa y propiedades.',
      'Los átomos de elementos distintos tienen masa y propiedades diferentes.',
      'Los compuestos se forman al unirse átomos en proporciones de números enteros sencillos.',
      'En una reacción química los átomos solo se reorganizan: no se crean ni se destruyen.'
    ],
    limit: 'No explica la electricidad ni la existencia de partículas subatómicas. Hoy sabemos que el átomo sí es divisible y que existen isótopos (átomos del mismo elemento con distinta masa).',
    legend: [['#c98a4b','Átomo: esfera maciza e indivisible']],
    fact: 'Dalton representaba los átomos con bolitas de madera en sus clases. Además era daltónico: el término “daltonismo” viene de su nombre porque fue el primero en describir esa condición.'
  },
  thomson: {
    year: '1904', scientist: 'Joseph John Thomson', color: '#ef8a6b',
    title: 'Modelo de Thomson', alias: '“Budín de pasas” (pudín con pasas)',
    desc: 'Al estudiar los rayos catódicos (1897), Thomson descubrió el electrón, una partícula con carga negativa mucho más ligera que el átomo. Si el átomo es neutro, debía existir también carga positiva que compensara a los electrones.',
    post: [
      'El átomo es una esfera de carga positiva distribuida de manera uniforme.',
      'Los electrones (carga negativa) están incrustados en esa esfera, como pasas en un budín.',
      'La carga positiva total es igual a la negativa, por eso el átomo es eléctricamente neutro.',
      'El átomo ya no es indivisible: contiene partículas más pequeñas.'
    ],
    limit: 'No explica el experimento de la lámina de oro de Rutherford: si la carga positiva estuviera repartida, ninguna partícula alfa habría rebotado. Tampoco incluye un núcleo.',
    legend: [['#ff8a65','Masa de carga positiva (+)'],['#3b82f6','Electrones (−)']],
    fact: 'Thomson recibió el Premio Nobel de Física en 1906, y siete de sus estudiantes y colaboradores también ganaron un Nobel, entre ellos Ernest Rutherford.'
  },
  rutherford: {
    year: '1911', scientist: 'Ernest Rutherford', color: '#5fb3ff',
    title: 'Modelo de Rutherford', alias: '“Modelo nuclear” o “planetario”',
    desc: 'En el experimento de la lámina de oro (Geiger y Marsden, 1909), casi todas las partículas alfa atravesaron el metal, pero unas pocas se desviaron o rebotaron. Rutherford concluyó que la carga positiva y casi toda la masa están concentradas en un núcleo diminuto.',
    post: [
      'El átomo tiene un núcleo central muy pequeño, denso y con carga positiva.',
      'En el núcleo se concentra casi toda la masa del átomo.',
      'Los electrones giran alrededor del núcleo, como planetas alrededor del Sol.',
      'La mayor parte del átomo es espacio vacío.'
    ],
    limit: 'Según la física clásica, un electrón en órbita debería perder energía y caer en espiral al núcleo, por lo que el átomo no sería estable. Tampoco explica los espectros de emisión. Bohr (1913) lo corrigió proponiendo órbitas con energía cuantizada.',
    legend: [['#ef4444','Núcleo con carga positiva (+)'],['#60a5fa','Electrones (−) en órbita']],
    fact: 'Si el núcleo fuera del tamaño de una canica en el centro de un estadio de fútbol, los electrones estarían por las gradas: todo lo demás es espacio vacío.'
  },
  bohr: {
    year: '1913', scientist: 'Niels Bohr', color: '#38bdf8',
    title: 'Modelo de Bohr', alias: '“Modelo de niveles de energía” o “de órbitas cuantizadas”',
    desc: 'Bohr corrigió el modelo de Rutherford aplicando las ideas cuánticas de Planck y Einstein. Propuso que el electrón solo puede girar en ciertas órbitas permitidas, cada una con una energía fija. Así explicó por qué el átomo es estable y por qué el hidrógeno emite luz solo de algunos colores (su espectro de líneas).',
    post: [
      'Los electrones giran alrededor del núcleo en órbitas circulares fijas llamadas niveles de energía (n = 1, 2, 3…).',
      'Mientras el electrón permanece en una órbita permitida no emite ni absorbe energía (órbitas estacionarias).',
      'Solo están permitidas las órbitas cuyo momento angular es un múltiplo entero de h/2π: la energía está cuantizada.',
      'Cuando el electrón salta a un nivel superior absorbe energía; cuando baja a uno inferior la emite como un fotón de luz, con energía igual a la diferencia entre niveles (E = hν).',
      'Mientras más alejado del núcleo está el nivel, mayor es su energía.'
    ],
    limit: 'Solo explica bien el átomo de hidrógeno (y iones con un solo electrón); falla con átomos de más electrones. Sigue suponiendo trayectorias definidas, lo que contradice el principio de incertidumbre. Schrödinger lo superó con los orbitales.',
    legend: [['#ef4444','Núcleo (+)'],['#60a5fa','Electrón (−)'],['#7dd3fc','Niveles de energía n = 1 a 4 (radios no a escala)'],['#ff3b3b','Fotón emitido: el color depende del salto']],
    fact: 'Bohr recibió el Nobel de Física en 1922. La luz roja de 656 nm que emite el hidrógeno al bajar de n = 3 a n = 2 es la que da el color rosado a muchas nebulosas del espacio.'
  },
  schrodinger: {
    year: '1926', scientist: 'Erwin Schrödinger', color: '#a78bfa',
    title: 'Modelo de Schrödinger', alias: '“Modelo mecánico-cuántico” o “de la nube electrónica”',
    desc: 'Schrödinger describió al electrón como una onda mediante su famosa ecuación. Ya no hay trayectorias definidas: la solución (función de onda ψ) indica la probabilidad de encontrar al electrón en cada punto del espacio. Cada punto de la nube es una posible posición del electrón.',
    post: [
      'El electrón se comporta como partícula y como onda (dualidad onda-partícula).',
      'No se puede conocer a la vez su posición y velocidad exactas (principio de incertidumbre de Heisenberg).',
      'Los electrones ocupan orbitales: regiones donde es más probable encontrarlos.',
      'Cada orbital se describe con números cuánticos: n (energía y tamaño), l (forma) y m (orientación). Después se añadió el espín (s).',
      'Es el modelo que se usa actualmente en química y física.'
    ],
    limit: 'Es una descripción probabilística: no dice dónde está el electrón, solo dónde es probable hallarlo. En su forma original no incluye efectos relativistas ni el espín, que se añadieron después (Pauli, Dirac).',
    legend: [['#ef4444','Núcleo'],['#a78bfa','Nube: fase positiva de ψ'],['#22d3ee','Nube: fase negativa de ψ']],
    fact: 'Schrödinger compartió el Nobel de Física de 1933 con Paul Dirac. Es famoso también por su “gato”, un experimento mental de 1935 para mostrar lo extraño de la mecánica cuántica.'
  }
};
const ORDER = ['dalton','thomson','rutherford','bohr','schrodinger'];

/* ------------------------------------------------------------------ */
/*  Escena                                                              */
/* ------------------------------------------------------------------ */
const viewer = document.getElementById('viewer');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch (e) {
  viewer.insertAdjacentHTML('beforeend','<div class="err">Tu navegador no pudo iniciar WebGL, necesario para ver los modelos en 3D. Prueba con Chrome, Edge o Firefox actualizados.</div>');
}
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
viewer.prepend(renderer.domElement);

const labelRenderer = new CSS2DRenderer();
labelRenderer.domElement.className = 'labels';
viewer.insertBefore(labelRenderer.domElement, renderer.domElement.nextSibling);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
const HOME_BASE = new THREE.Vector3(0, 2.6, 9.5);
const HOME = HOME_BASE.clone();
camera.position.copy(HOME);
let fitted = false;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = 3;
controls.maxDistance = 22;
controls.autoRotate = true;
controls.autoRotateSpeed = 1.1;
controls.addEventListener('start', () => document.getElementById('hint').style.opacity = 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.55));
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(5, 8, 6); scene.add(key);
const rim = new THREE.DirectionalLight(0x7aa2ff, 0.8); rim.position.set(-6, -2, -5); scene.add(rim);

function resize(){
  const w = viewer.clientWidth, h = viewer.clientHeight;
  renderer.setSize(w, h); labelRenderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
  // En pantallas verticales (teléfono) alejamos la cámara para que el modelo quepa completo
  HOME.copy(HOME_BASE).multiplyScalar(Math.max(1, 1.08 / camera.aspect));
  if (!fitted && w > 0){ camera.position.copy(HOME); fitted = true; }
}
new ResizeObserver(resize).observe(viewer);

/* ---------- utilidades ---------- */
function canvasTex(w, h, draw){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const glowTex = canvasTex(128,128,(g,w)=>{
  const gr = g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.25,'rgba(255,255,255,.45)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0,0,w,w);
});
const dotTex = canvasTex(64,64,(g,w)=>{
  const gr = g.createRadialGradient(w/2,w/2,0,w/2,w/2,w/2);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.4,'rgba(255,255,255,.6)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0,0,w,w);
});
function signTex(sign, color){
  return canvasTex(64,64,(g,w)=>{
    g.strokeStyle = color; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(16,32); g.lineTo(48,32);
    if (sign === '+'){ g.moveTo(32,16); g.lineTo(32,48); }
    g.stroke();
  });
}
function glow(color, size, opacity = .8){
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  s.scale.setScalar(size); return s;
}
function fib(n, r){
  const pts = [], g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++){
    const y = 1 - (i / (n - 1)) * 2, rad = Math.sqrt(1 - y*y), th = g * i;
    pts.push(new THREE.Vector3(Math.cos(th)*rad*r, y*r, Math.sin(th)*rad*r));
  }
  return pts;
}
function label(text, cls = 'lbl'){
  const d = document.createElement('div'); d.className = cls; d.textContent = text;
  return new CSS2DObject(d);
}

const groups = {};
const labels = {};       // key -> [CSS2DObject]
function addGroup(k){ const g = new THREE.Group(); g.visible = false; scene.add(g); groups[k] = g; labels[k] = []; return g; }

/* ---------- 1. DALTON ---------- */
{
  const g = addGroup('dalton');
  const wood = canvasTex(1024, 512, (c, w, h) => {
    c.fillStyle = '#a8692f'; c.fillRect(0,0,w,h);
    for (let i = 0; i < 140; i++){
      const y0 = Math.random()*h, a = 4 + Math.random()*10, k = 1 + (Math.random()*3 | 0);
      c.strokeStyle = `rgba(${70+Math.random()*50|0},${35+Math.random()*25|0},12,${.12+Math.random()*.28})`;
      c.lineWidth = .8 + Math.random()*3.2;
      c.beginPath();
      for (let x = 0; x <= w; x += 8){
        // ondas periódicas para que la textura no tenga “costura” al envolver la esfera
        const y = y0 + Math.sin(x/w*Math.PI*2*k + i)*a + Math.sin(x/w*Math.PI*2*(k*7+5) + i*2.1)*1.5;
        x ? c.lineTo(x,y) : c.moveTo(x,y);
      }
      c.stroke();
    }
  });
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 96, 64),
    new THREE.MeshStandardMaterial({ map: wood, roughness: .5, metalness: .05 })
  );
  g.add(ball);
  g.add(glow(0xffb37a, 7.5, .18));
  const l = label('Átomo macizo e indivisible'); l.position.set(0, 2.6, 0); ball.add(l); labels.dalton.push(l);
  g.userData.tick = (t, dt) => { ball.rotation.y += dt * .25; };
}

/* ---------- 2. THOMSON ---------- */
{
  const g = addGroup('thomson');
  const R = 2.4;
  const body = new THREE.Mesh(
    new THREE.SphereGeometry(R, 80, 56),
    new THREE.MeshStandardMaterial({ color: 0xff8a65, roughness: .35, transparent: true, opacity: .26, depthWrite: false, side: THREE.DoubleSide })
  );
  body.renderOrder = 1;
  g.add(body);
  const inner = new THREE.Mesh(new THREE.SphereGeometry(R*.985, 64, 48),
    new THREE.MeshBasicMaterial({ color: 0xff7043, transparent: true, opacity: .07, depthWrite: false, side: THREE.BackSide }));
  g.add(inner);
  g.add(glow(0xff7a50, 8, .22));

  // signos +
  const plusMat = new THREE.SpriteMaterial({ map: signTex('+', '#ffd2c2'), transparent: true, depthWrite: false, opacity: .9 });
  for (let i = 0; i < 46; i++){
    const v = new THREE.Vector3().randomDirection().multiplyScalar(Math.cbrt(Math.random()) * (R - .35));
    const s = new THREE.Sprite(plusMat); s.position.copy(v); s.scale.setScalar(.32); g.add(s);
  }
  // electrones
  const eGeo = new THREE.SphereGeometry(.24, 40, 28);
  const eMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1e40af, emissiveIntensity: .6, roughness: .3 });
  const minus = new THREE.SpriteMaterial({ map: signTex('−', '#ffffff'), transparent: true, depthTest: false });
  const pos = [...fib(10, 1.65), new THREE.Vector3(.45,.35,.2), new THREE.Vector3(-.4,-.4,-.25)];
  const electrons = pos.map((p, i) => {
    const e = new THREE.Mesh(eGeo, eMat); e.position.copy(p);
    const s = new THREE.Sprite(minus); s.scale.setScalar(.36); s.renderOrder = 5; e.add(s);
    e.userData = { base: p.clone(), ph: i * 1.7 };
    g.add(e); return e;
  });
  const l1 = label('Electrón (−)'); electrons[0].add(l1);
  const l2 = label('Esfera de carga positiva (+)'); l2.position.set(0, R + .45, 0); g.add(l2);
  labels.thomson.push(l1, l2);
  g.userData.tick = (t) => {
    for (const e of electrons){
      const { base, ph } = e.userData;
      e.position.set(base.x + Math.sin(t*2.2+ph)*.05, base.y + Math.cos(t*2.6+ph)*.05, base.z + Math.sin(t*1.9+ph*2)*.05);
    }
  };
}

/* ---------- 3. RUTHERFORD ---------- */
{
  const g = addGroup('rutherford');
  const nucleus = new THREE.Group();
  const pGeo = new THREE.SphereGeometry(.17, 32, 24);
  const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: .5, roughness: .35 });
  [new THREE.Vector3(), ...fib(10, .24)].forEach(p => {
    const m = new THREE.Mesh(pGeo, pMat);
    m.position.copy(p).add(new THREE.Vector3((Math.random()-.5)*.06,(Math.random()-.5)*.06,(Math.random()-.5)*.06));
    nucleus.add(m);
  });
  nucleus.add(glow(0xff5a5a, 2.2, .7));
  g.add(nucleus);
  const ln = label('Núcleo (+)'); ln.position.set(0, .5, 0); nucleus.add(ln); labels.rutherford.push(ln);

  const defs = [
    { a:2.3, b:2.0, r:[.25,0,0],      s:1.6 },
    { a:2.9, b:2.4, r:[1.2,.6,.2],    s:1.25 },
    { a:3.5, b:2.9, r:[-.9,1.1,.5],   s:1.0 },
    { a:2.6, b:2.3, r:[2.0,-.4,1.0],  s:1.4 },
    { a:3.2, b:2.6, r:[.6,2.2,-.7],   s:1.1 },
    { a:3.8, b:3.1, r:[-1.6,-1.0,1.4],s:.9 }
  ];
  const eGeo = new THREE.SphereGeometry(.14, 32, 24);
  const eMat = new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: .9, roughness: .3 });
  const orbiters = defs.map((d, i) => {
    const og = new THREE.Group(); og.rotation.set(...d.r);
    const pts = new THREE.EllipseCurve(0,0,d.a,d.b).getPoints(200).map(p => new THREE.Vector3(p.x, p.y, 0));
    og.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color: 0x5fb3ff, transparent: true, opacity: .35 })));
    const e = new THREE.Mesh(eGeo, eMat);
    e.add(glow(0x60a5fa, .9, .8));
    e.userData = { ...d, ph: i * 1.05 };
    og.add(e); g.add(og); return e;
  });
  const le = label('Electrón (−)'); orbiters[2].add(le); labels.rutherford.push(le);
  const lo = label('Órbita'); lo.position.set(-3.5, 0, 0); orbiters[5].parent.add(lo); labels.rutherford.push(lo);
  const le2 = label('Espacio vacío'); le2.position.set(1.2, -1.3, 1.0); g.add(le2); labels.rutherford.push(le2);
  g.userData.tick = (t, dt) => {
    for (const e of orbiters){
      const { a, b, s, ph } = e.userData, ang = t * s + ph;
      e.position.set(Math.cos(ang)*a, Math.sin(ang)*b, 0);
    }
    nucleus.rotation.y += dt * .4;
  };
}

/* ---------- 4. BOHR ---------- */
const bohrInfo = document.getElementById('bohrInfo');
{
  const g = addGroup('bohr');
  g.rotation.x = .5;
  const RAD = [0, 1.0, 1.85, 2.7, 3.55];
  const nucleus = new THREE.Group();
  const pMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0x7f1d1d, emissiveIntensity: .5, roughness: .35 });
  const pGeo = new THREE.SphereGeometry(.13, 28, 20);
  [new THREE.Vector3(), ...fib(6, .17)].forEach(p => { const m = new THREE.Mesh(pGeo, pMat); m.position.copy(p); nucleus.add(m); });
  nucleus.add(glow(0xff5a5a, 1.8, .7));
  g.add(nucleus);
  const ln = label('Núcleo (+)'); ln.position.set(0, .45, 0); g.add(ln); labels.bohr.push(ln);

  const rings = [];
  for (let n = 1; n <= 4; n++){
    const ring = new THREE.Mesh(new THREE.TorusGeometry(RAD[n], .014, 8, 220),
      new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: .3 }));
    ring.rotation.x = Math.PI / 2; g.add(ring); rings[n] = ring;
    const l = label('n = ' + n, 'lbl lvl'); l.position.set(RAD[n] * .72, 0, RAD[n] * .72); g.add(l); labels.bohr.push(l);
  }
  const e = new THREE.Mesh(new THREE.SphereGeometry(.15, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0x60a5fa, emissive: 0x2563eb, emissiveIntensity: .9, roughness: .3 }));
  e.add(glow(0x60a5fa, 1, .85)); g.add(e);
  const le = label('Electrón (−)'); e.add(le); labels.bohr.push(le);

  const SEQ = [
    { to: 3, kind: 'abs', color: '#c4b5fd', txt: 'absorbe un fotón ultravioleta (103 nm) y sube' },
    { to: 2, kind: 'em',  color: '#ff3b3b', txt: 'baja y emite <b style="color:#ff6b6b">luz roja visible (656 nm, línea Hα)</b>' },
    { to: 1, kind: 'em',  color: '#c4b5fd', txt: 'baja y emite un fotón ultravioleta (122 nm), invisible al ojo humano' },
    { to: 4, kind: 'abs', color: '#c4b5fd', txt: 'absorbe un fotón ultravioleta (97 nm) y sube' },
    { to: 2, kind: 'em',  color: '#22d3ee', txt: 'baja y emite <b style="color:#5eead4">luz azul verdosa (486 nm, línea Hβ)</b>' },
    { to: 1, kind: 'em',  color: '#c4b5fd', txt: 'baja y emite un fotón ultravioleta (122 nm)' }
  ];
  const st = { n: 1, r: RAD[1], ang: 0, step: -1, timer: 2, phase: 'orbit', from: 1, to: 1, jt: 0, incoming: null };
  const photons = [];
  const X = new THREE.Vector3(1, 0, 0);

  function makePhoton(color){
    const pg = new THREE.Group();
    pg.add(glow(new THREE.Color(color), .75, 1));
    const pts = [];
    for (let i = 0; i <= 70; i++) pts.push(new THREE.Vector3(-i * .018, Math.sin(i * .55) * .08, 0));
    pg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({ color, transparent: true, opacity: .9 })));
    g.add(pg); return pg;
  }
  function aim(pg, dir){ pg.quaternion.setFromUnitVectors(X, dir.clone().normalize()); }
  function setInfo(html){ bohrInfo.innerHTML = html; }
  function restInfo(){
    setInfo(`<b>Electrón en el nivel n = ${st.n}</b>${st.n === 1 ? ' (estado fundamental)' : ' (estado excitado)'}. Mientras permanece en esta órbita no gana ni pierde energía.`);
  }
  restInfo();
  function startJump(s){ st.from = st.n; st.to = s.to; st.jt = 0; st.phase = 'jump'; }

  g.userData.tick = (t, dt) => {
    st.ang += dt * 2.6 / st.r;
    e.position.set(Math.cos(st.ang) * st.r, 0, Math.sin(st.ang) * st.r);
    nucleus.rotation.y += dt * .4;
    for (let n = 1; n <= 4; n++) rings[n].material.opacity = THREE.MathUtils.lerp(rings[n].material.opacity, n === st.n && st.phase !== 'jump' ? .85 : .25, .08);

    if (st.phase === 'orbit'){
      st.timer -= dt;
      if (st.timer <= 0){
        st.step = (st.step + 1) % SEQ.length;
        const s = SEQ[st.step];
        setInfo(`<b>n = ${st.n} → n = ${s.to}</b>: el electrón ${s.txt}.`);
        if (s.kind === 'abs'){
          const a = st.ang + .9, p = makePhoton(s.color);
          p.position.set(Math.cos(a) * 6.5, 2.2, Math.sin(a) * 6.5);
          st.incoming = p; st.phase = 'incoming';
        } else {
          startJump(s);
          const p = makePhoton(s.color), dir = e.position.clone().normalize().add(new THREE.Vector3(0, .45, 0)).normalize();
          p.position.copy(e.position); aim(p, dir);
          photons.push({ p, dir, life: 2.2 });
        }
      }
    } else if (st.phase === 'incoming'){
      const p = st.incoming, d = e.position.clone().sub(p.position);
      if (d.length() < .2){ g.remove(p); st.incoming = null; startJump(SEQ[st.step]); }
      else { aim(p, d); p.position.add(d.normalize().multiplyScalar(dt * 5)); }
    } else if (st.phase === 'jump'){
      st.jt = Math.min(1, st.jt + dt / .5);
      const k = st.jt * st.jt * (3 - 2 * st.jt);
      st.r = RAD[st.from] + (RAD[st.to] - RAD[st.from]) * k;
      if (st.jt >= 1){ st.n = st.to; st.phase = 'rest'; st.timer = 1.4; }
    } else if (st.phase === 'rest'){
      st.timer -= dt;
      if (st.timer <= 0){ restInfo(); st.phase = 'orbit'; st.timer = 2.4; }
    }
    for (let i = photons.length - 1; i >= 0; i--){
      const f = photons[i];
      f.p.position.addScaledVector(f.dir, dt * 4); f.life -= dt;
      f.p.children.forEach(c => c.material.opacity = Math.max(0, Math.min(1, f.life)));
      if (f.life <= 0){ g.remove(f.p); photons.splice(i, 1); }
    }
  };
}

/* ---------- 5. SCHRÖDINGER ---------- */
const ORBITALS = {
  '1s':  { L: 5.2, R: r => Math.exp(-r),             Y: [u => 1],           Ymax: 1,
           info: '<b>Orbital 1s</b> (n = 1, l = 0, m = 0). Forma esférica; la mayor probabilidad está cerca del núcleo. Es el orbital del electrón del hidrógeno en su estado fundamental.' },
  '2s':  { L: 15,  R: r => (2 - r) * Math.exp(-r/2), Y: [u => 1],           Ymax: 1,
           info: '<b>Orbital 2s</b> (n = 2, l = 0). También esférico, pero más grande y con un <b>nodo</b>: una capa donde la probabilidad es cero. Los colores muestran el cambio de fase de ψ.' },
  '2pz': { L: 13,  R: r => r * Math.exp(-r/2),       Y: [u => u[1]],        Ymax: 1,
           info: '<b>Orbital 2p<sub>z</sub></b> (n = 2, l = 1, m = 0). Forma de “pesa” o dos lóbulos separados por un plano nodal que pasa por el núcleo.' },
  '2p':  { L: 13,  R: r => r * Math.exp(-r/2),       Y: [u => u[0], u => u[1], u => u[2]], Ymax: 1,
           info: '<b>Los tres orbitales 2p</b> (p<sub>x</sub>, p<sub>y</sub>, p<sub>z</sub>) juntos: misma forma y energía, orientados en los tres ejes. En total caben 6 electrones.' },
  '3dz2':{ L: 29,  R: r => r * r * Math.exp(-r/3),    Y: [u => 3*u[1]*u[1] - 1], Ymax: 2,
           info: '<b>Orbital 3d<sub>z²</sub></b> (n = 3, l = 2, m = 0). Dos lóbulos sobre el eje y un “anillo” (dona) alrededor del núcleo, con fase opuesta.' },
  '3dxy':{ L: 29,  R: r => r * r * Math.exp(-r/3),    Y: [u => 2*u[0]*u[2]], Ymax: 1,
           info: '<b>Orbital 3d<sub>xy</sub></b> (n = 3, l = 2). Cuatro lóbulos en forma de trébol entre los ejes, alternando la fase de ψ.' }
};
const ORB_NAMES = { '1s':'1s', '2s':'2s', '2pz':'2p<sub>z</sub>', '2p':'2p (x, y, z)', '3dz2':'3d<sub>z²</sub>', '3dxy':'3d<sub>xy</sub>' };
let currentOrb = '2pz';

const cloud = (() => {
  const g = addGroup('schrodinger');
  const nuc = new THREE.Mesh(new THREE.SphereGeometry(.1, 24, 16),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 1 }));
  nuc.add(glow(0xff6060, .9, .9)); g.add(nuc);

  // ejes
  const axMat = new THREE.LineBasicMaterial({ color: 0x3b4a6e, transparent: true, opacity: .6 });
  const A = 3.9;
  [[A,0,0],[0,A,0],[0,0,A]].forEach(v => {
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-v[0],-v[1],-v[2]), new THREE.Vector3(...v)]), axMat));
  });
  // y en pantalla = eje z químico (vertical)
  const ax = [['x',[A+.25,0,0]],['z',[0,A+.25,0]],['y',[0,0,A+.25]]].map(([t,p]) => { const l = label(t,'lbl axis'); l.position.set(...p); g.add(l); return l; });
  const ln = label('Núcleo'); ln.position.set(0, .25, 0); nuc.add(ln);
  const lc = label('Nube de probabilidad'); g.add(lc);
  labels.schrodinger.push(...ax, ln, lc);

  const N = window.innerWidth < 700 ? 14000 : 22000;
  const pos = new Float32Array(N*3), col = new Float32Array(N*3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    size: .06, map: dotTex, vertexColors: true, transparent: true, opacity: .8,
    depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true
  }));
  g.add(pts);

  const cPos = new THREE.Color('#a78bfa'), cNeg = new THREE.Color('#22d3ee');
  let orb, pmax, scale;
  const u = [0,0,0];

  function setup(name){
    orb = ORBITALS[name];
    pmax = 0;
    for (let i = 1; i <= 4000; i++){ const r = orb.L * i / 4000, R = orb.R(r); pmax = Math.max(pmax, r*r*R*R); }
    pmax *= 1.02;
    scale = 3.6 / orb.L;
    lc.position.set(0, 0, 0);
  }
  function sample(i){
    let r, R;
    do { r = Math.random() * orb.L; R = orb.R(r); } while (Math.random() * pmax > r*r*R*R);
    const Yf = orb.Y[(Math.random() * orb.Y.length) | 0];
    let y;
    do {
      const z = 2*Math.random() - 1, phi = Math.random()*Math.PI*2, s = Math.sqrt(1 - z*z);
      u[0] = s*Math.cos(phi); u[1] = z; u[2] = s*Math.sin(phi);
      y = Yf(u);
    } while (Math.random() * orb.Ymax * orb.Ymax > y*y);
    const k = i*3, rr = r * scale;
    pos[k] = u[0]*rr; pos[k+1] = u[1]*rr; pos[k+2] = u[2]*rr;
    const c = (R * y >= 0) ? cPos : cNeg;
    col[k] = c.r; col[k+1] = c.g; col[k+2] = c.b;
  }
  function build(name){
    setup(name);
    for (let i = 0; i < N; i++) sample(i);
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    // posición de la etiqueta de la nube: el punto más alejado en el lado derecho superior
    let best = 0, bi = 0;
    for (let i = 0; i < 3000; i++){ const k = i*3, s = pos[k] + pos[k+1] * .6; if (s > best){ best = s; bi = k; } }
    lc.position.set(pos[bi]*.85, pos[bi+1]*.85, pos[bi+2]*.85);
  }
  g.userData.tick = () => {
    // la nube “parpadea”: cada cuadro se vuelven a medir algunas posiciones
    for (let j = 0; j < 160; j++) sample((Math.random() * N) | 0);
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  };
  return { build };
})();
cloud.build(currentOrb);

/* ------------------------------------------------------------------ */
/*  Interfaz                                                            */
/* ------------------------------------------------------------------ */
const $ = id => document.getElementById(id);
const modelNav = $('modelNav'), orbBtns = $('orbBtns'), orbInfo = $('orbInfo');
let current = null, labelsOn = true;

// Íconos de cada modelo (SVG en línea, usan el color del botón)
const ICONS = {
  dalton: '<circle cx="12" cy="12" r="7.5" fill="currentColor"/>',
  thomson: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="9" cy="9.5" r="1.6" fill="currentColor"/><circle cx="15" cy="10" r="1.6" fill="currentColor"/><circle cx="11" cy="15" r="1.6" fill="currentColor"/><circle cx="15.5" cy="14.8" r="1.2" fill="currentColor"/>',
  rutherford: '<ellipse cx="12" cy="12" rx="9.5" ry="4" fill="none" stroke="currentColor" stroke-width="1.5"/><ellipse cx="12" cy="12" rx="9.5" ry="4" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="4" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(-60 12 12)"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/>',
  bohr: '<circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="6.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="9.6" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="18.6" cy="12" r="1.6" fill="currentColor"/>',
  schrodinger: '<ellipse cx="12" cy="6.3" rx="4.2" ry="5.2" fill="currentColor" opacity=".55"/><ellipse cx="12" cy="17.7" rx="4.2" ry="5.2" fill="currentColor" opacity=".55"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'
};
const indicator = document.createElement('span');
indicator.className = 'nav-indicator';
modelNav.appendChild(indicator);

ORDER.forEach(k => {
  const m = MODELS[k], b = document.createElement('button');
  b.type = 'button'; b.className = 'model-tab'; b.dataset.k = k;
  b.style.setProperty('--c', m.color);
  b.innerHTML = `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[k]}</svg><span class="y">${m.year}</span><span class="n">${m.scientist.split(' ').pop()}</span>`;
  b.onclick = () => show(k);
  modelNav.appendChild(b);
});

// Efecto "onda" al tocar cualquier botón de la navegación, orbitales o anterior/siguiente
function ripple(e){
  const btn = e.target.closest('.model-tab, .chip, #prev, #next');
  if (!btn || btn.disabled) return;
  const r = btn.getBoundingClientRect(), size = Math.max(r.width, r.height) * 1.4;
  const s = document.createElement('span');
  s.className = 'ripple';
  s.style.width = s.style.height = size + 'px';
  s.style.left = (e.clientX - r.left - size / 2) + 'px';
  s.style.top = (e.clientY - r.top - size / 2) + 'px';
  btn.appendChild(s);
  s.addEventListener('animationend', () => s.remove());
}
document.addEventListener('pointerdown', ripple);

function moveIndicator(){
  const b = modelNav.querySelector('.model-tab.active');
  if (!b) return;
  indicator.style.width = b.offsetWidth + 'px';
  indicator.style.transform = `translateX(${b.offsetLeft}px)`;
}
window.addEventListener('resize', moveIndicator);
Object.keys(ORBITALS).forEach(name => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'btn btn-sm btn-outline-light rounded-pill chip'; b.dataset.o = name; b.innerHTML = ORB_NAMES[name];
  b.onclick = () => { currentOrb = name; cloud.build(name); syncOrb(); };
  orbBtns.appendChild(b);
});
function syncOrb(){
  orbBtns.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.o === currentOrb));
  orbInfo.innerHTML = ORBITALS[currentOrb].info;
}
syncOrb();

function syncLabels(){
  for (const k in labels) labels[k].forEach(l => l.visible = labelsOn && k === current);
}
const short = k => MODELS[k].title.replace('Modelo de ', '');

function show(k){
  if (!MODELS[k]) k = 'dalton';
  if (k === current) return;
  current = k;
  const m = MODELS[k], i = ORDER.indexOf(k);
  for (const g in groups) groups[g].visible = g === k;
  groups[k].scale.setScalar(.55);
  document.documentElement.style.setProperty('--accent', m.color);
  modelNav.querySelectorAll('button').forEach(b => {
    const on = b.dataset.k === k;
    b.classList.toggle('active', on); b.setAttribute('aria-current', on ? 'true' : 'false');
  });
  moveIndicator();
  // animación de entrada del texto
  const info = $('info');
  info.classList.remove('swap'); void info.offsetWidth; info.classList.add('swap');
  $('orbitals').classList.toggle('d-none', k !== 'schrodinger');
  $('bohrBox').classList.toggle('d-none', k !== 'bohr');
  $('scaleNote').classList.toggle('d-none', k !== 'rutherford');
  syncLabels();

  $('kicker').textContent = `${m.year} · ${m.scientist}`;
  $('title').textContent = m.title;
  $('alias').textContent = m.alias;
  $('desc').textContent = m.desc;
  $('legend').innerHTML = m.legend.map(([c, t]) => `<li><i style="background:${c};color:${c}"></i>${t}</li>`).join('');
  $('post').innerHTML = m.post.map(p => `<li>${p}</li>`).join('');
  $('limit').textContent = m.limit;
  $('fact').textContent = m.fact;

  const prev = $('prev'), next = $('next');
  prev.disabled = i === 0;               prev.textContent = '← ' + (i > 0 ? short(ORDER[i-1]) : 'Anterior');
  next.disabled = i === ORDER.length - 1; next.textContent = (i < ORDER.length - 1 ? short(ORDER[i+1]) : 'Siguiente') + ' →';

  if (location.hash !== '#' + k) { try { history.replaceState(null, '', '#' + k); } catch (e) {} }
}
$('prev').onclick = () => { const i = ORDER.indexOf(current); if (i > 0) show(ORDER[i-1]); };
$('next').onclick = () => { const i = ORDER.indexOf(current); if (i < ORDER.length - 1) show(ORDER[i+1]); };

const btnRotate = $('btnRotate');
btnRotate.onclick = () => { controls.autoRotate = !controls.autoRotate; btnRotate.classList.toggle('active', controls.autoRotate); };
const btnLabels = $('btnLabels');
btnLabels.onclick = () => { labelsOn = !labelsOn; btnLabels.classList.toggle('active', labelsOn); syncLabels(); };
$('btnReset').onclick = () => { camera.position.copy(HOME); controls.target.set(0, 0, 0); controls.update(); };

window.addEventListener('keydown', e => {
  const i = ORDER.indexOf(current);
  if (e.key === 'ArrowRight' && i < ORDER.length - 1) show(ORDER[i+1]);
  if (e.key === 'ArrowLeft' && i > 0) show(ORDER[i-1]);
});
window.addEventListener('hashchange', () => show(location.hash.slice(1)));

// Deslizar con el dedo sobre el texto para cambiar de modelo
let sx = null, sy = null;
const info = $('info');
info.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
info.addEventListener('touchend', e => {
  if (sx === null) return;
  const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
  if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.8) $(dx < 0 ? 'next' : 'prev').click();
  sx = null;
}, { passive: true });

show(location.hash.slice(1) || 'dalton');
resize();

/* ------------------------------------------------------------------ */
/*  Ciclo de animación                                                  */
/* ------------------------------------------------------------------ */
const clock = new THREE.Clock();
renderer.setAnimationLoop(() => {
  const dt = Math.min(clock.getDelta(), .05), t = clock.elapsedTime;
  const g = groups[current];
  g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, 1, 1 - Math.exp(-dt * 7)));
  g.userData.tick && g.userData.tick(t, dt);
  controls.update();
  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
});

})();
