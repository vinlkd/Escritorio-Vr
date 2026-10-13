import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const HALL = { minX: -13.5, maxX: 13.5, minZ: -14.5, maxZ: 18.8 };
export const OFFICE_SPAWN = { x: 0, y: 1.65, z: 9, yaw: -0.12, pitch: -0.04 };

export function buildWorld(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const colliders = [];
  const mat = (color, roughness = .7, metalness = .05) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const m = {
    plaster: mat("#e5e7df"), oak: mat("#b58c60"), edge: mat("#d6b78c"),
    floor: mat("#b7a38b"), grain: mat("#a99278"), carpet: mat("#8b9993", 1),
    carpetLine: mat("#83928d", 1), charcoal: mat("#344449", .65, .3),
    black: mat("#253237", .6), aluminum: mat("#a7b3b0", .35, .7),
    chairBlack: mat("#171c22", .96), seam: mat("#343c42", .95),
    paper: mat("#e8dfcc", 1), bag: mat("#ae8b5f", .95), water: mat("#6ea9b5", .2, .3),
    teal: mat("#537f79", .95), sofa: mat("#a6b8a0", 1), cushion: mat("#d5b37d", 1),
    red: mat("#ab343d", .9), redLight: mat("#c64c4b", .8), redDark: mat("#7b2834", .85),
    white: mat("#f2f1e8"), pot: mat("#c6b6a1"), terracotta: mat("#ae7959"),
    leaf: mat("#557853", .9), leafLight: mat("#799061", .9), stem: mat("#6d7251"),
    earth: mat("#554d3b", 1), coffee: mat("#563e2c"), blue: mat("#7498b0"),
    book: mat("#cdad76"), bookGreen: mat("#719487"), exterior: mat("#bdcbc9"),
    lawn: mat("#8ba47a", 1), paving: mat("#d1cfc3", 1), road: mat("#777f83", 1),
    treeLeaf: mat("#597d5d", 1), treeLight: mat("#78976b", 1), skyline: mat("#a5b8c7"),
    brick: mat("#bc8a78"), cityGlass: mat("#64899e", .3, .35),
    cloud: new THREE.MeshBasicMaterial({ color: "#f3f7f8" }),
    window: new THREE.MeshStandardMaterial({ color: "#dceef3", transparent: true, opacity: .055, roughness: .08, metalness: .05 }),
    glass: new THREE.MeshStandardMaterial({ color: "#bdd9d1", transparent: true, opacity: .18, roughness: .15, metalness: .15 }),
    screen: new THREE.MeshStandardMaterial({ color: "#182b37", emissive: "#183240", emissiveIntensity: .4, roughness: .5 }),
    codeBlue: new THREE.MeshBasicMaterial({ color: "#83acbc" }),
    codeGreen: new THREE.MeshBasicMaterial({ color: "#83b899" }),
    codeGold: new THREE.MeshBasicMaterial({ color: "#c5b17d" }),
    codeMuted: new THREE.MeshBasicMaterial({ color: "#506775" }),
    light: new THREE.MeshStandardMaterial({ color: "#fff5dc", emissive: "#fff1ce", emissiveIntensity: 2 }),
  };
  const cube = new THREE.BoxGeometry(1, 1, 1);
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 16);
  const sphere = new THREE.SphereGeometry(1, 12, 8);
  const foliage = new THREE.IcosahedronGeometry(1, 0);
  const padded = new RoundedBoxGeometry(1, 1, 1, 3, .14);
  let numeroEstacao=0;
  function mesh(geometry, material, x, y, z, sx, sy, sz, parent = root) {
    const object = new THREE.Mesh(geometry, material);
    object.position.set(x, y, z); object.scale.set(sx, sy, sz);
    object.castShadow = !material.transparent; object.receiveShadow = true;
    parent.add(object); return object;
  }
  const box = (w,h,d,x,y,z,material=m.charcoal,parent=root) => mesh(cube,material,x,y,z,w,h,d,parent);
  const cyl = (r,h,x,y,z,material=m.aluminum,parent=root) => mesh(cylinder,material,x,y,z,r,h,r,parent);
  function beam(a,b,r=.025,material=m.charcoal,parent=root) {
    const av=new THREE.Vector3(...a), bv=new THREE.Vector3(...b), delta=bv.clone().sub(av);
    const center=av.add(bv).multiplyScalar(.5);
    const object=cyl(r,delta.length(),center.x,center.y,center.z,material,parent);
    object.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()); return object;
  }
  function obstacle(x,z,w,d,name) {
    const collider={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,name};
    colliders.push(collider);return collider;
  }
  function plant(x,z,size=1) {
    cyl(.36*size,.62*size,x,.31*size,z,m.pot);
    cyl(.32*size,.025,x,.63*size,z,m.earth);
    for(let i=0;i<8;i++) {
      const angle=i*2.4, h=(1.1+(i%3)*.26)*size;
      const dx=Math.sin(angle)*.35*size, dz=Math.cos(angle)*.35*size;
      beam([x,.6*size,z],[x+dx,h,z+dz],.018*size,m.stem);
      const leaf=mesh(sphere,i%2?m.leaf:m.leafLight,x+dx,h,z+dz,.14*size,.4*size,.09*size);
      leaf.rotation.set(.4*Math.cos(angle),angle,.55*Math.sin(angle));
    }
    obstacle(x,z,.8*size,.8*size,"vaso");
  }
  function chair(x,z,angle=0,conference=false) {
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=angle;root.add(group);
    group.name="Cadeira preta com assento acolchoado e apoio lombar";
    const fabric=m.chairBlack;
    cyl(.045,.47,0,.3,0,m.aluminum,group);
    for(let i=0;i<5;i++) {
      const a=i*Math.PI*2/5,dx=Math.sin(a)*.37,dz=Math.cos(a)*.37;
      beam([0,.13,0],[dx,.08,dz],.025,m.charcoal,group);
      const wheel=cyl(.065,.045,dx,.065,dz,m.black,group);wheel.rotation.z=Math.PI/2;
    }
    mesh(padded,fabric,0,.56,0,.8,.19,.75,group);
    const back=mesh(padded,fabric,0,1.03,.32,.76,.86,.18,group);back.rotation.x=-.1;
    mesh(padded,fabric,0,.83,.19,.58,.2,.13,group);
    mesh(padded,m.seam,0,.58,-.31,.64,.025,.035,group);
    if(!conference) {
      box(.055,.2,.055,0,1.45,.36,m.charcoal,group);
      mesh(padded,fabric,0,1.57,.31,.48,.24,.17,group);
    }
    for(const side of [-1,1]) {
      box(.055,.29,.055,side*.44,.7,.08,m.charcoal,group);
      mesh(padded,fabric,side*.44,.85,-.01,.13,.08,.48,group);
    }
    obstacle(x,z,1.02,.96,"cadeira");
  }

  function xicara(x,y,z,parent=root,comCafe=false) {
    cyl(.065,.12,x,y+.06,z,m.white,parent);
    cyl(.054,.008,x,y+.125,z,comCafe?m.coffee:m.paper,parent);
    const alca=new THREE.Mesh(new THREE.TorusGeometry(.04,.012,6,12),m.white);
    alca.position.set(x-.07,y+.065,z);parent.add(alca);
  }
  function pacoteCafe(x,y,z,parent=root,inclinado=false) {
    const pacote=new THREE.Group();pacote.position.set(x,y,z);pacote.rotation.z=inclinado?.1:0;
    pacote.name="Pacote de café";parent.add(pacote);
    mesh(padded,m.bag,0,.17,0,.2,.34,.12,pacote);
    box(.21,.035,.13,0,.34,0,m.coffee,pacote);
    box(.13,.14,.012,0,.17,-.065,m.paper,pacote);
    for(const dx of [-.025,.025])mesh(sphere,m.coffee,dx,.17,-.076,.02,.035,.008,pacote);
  }
  function caderno(x,z,parent,cor=m.red,rotacao=.1) {
    const bloco=new THREE.Group();bloco.position.set(x,.79,z);bloco.rotation.y=rotacao;parent.add(bloco);
    bloco.name="Caderninho de anotações";
    box(.24,.023,.32,0,0,0,cor,bloco);box(.22,.017,.295,.006,.015,0,m.paper,bloco);
    box(.24,.008,.32,0,.027,0,cor,bloco);box(.008,.008,.29,-.09,.034,0,m.charcoal,bloco);
    box(.014,.015,.2,.05,.044,.025,m.charcoal,bloco);
  }

  // A madeira marca a entrada; o carpete deixa a área de trabalho mais tranquila.
  box(29,.28,31,0,-.15,0,m.floor);
  for(let x=-13.5;x<=14;x+=.65)box(.012,.008,30,x,.001,0,m.grain);
  for(let z=-14;z<15;z+=3.5)for(let x=-13.5;x<14;x+=.65)
    box(.65,.008,.012,x+.325,.002,z+(Math.round(x/.65)%3)*.7,m.grain);
  box(24,.025,19,0,.012,-3.2,m.carpet);
  for(let x=-11.5;x<12;x+=1)box(.012,.003,18.8,x,.027,-3.2,m.carpetLine);
  for(let z=-12;z<6;z+=1)box(23.8,.003,.012,0,.027,z,m.carpetLine);

  // Deixei uma abertura de verdade na parede para a porta não ser só enfeite.
  for(const side of [-1,1]) {
    box(12.4,4.3,.2,side*7.8,2.15,15,m.plaster);
    obstacle(side*7.8,15,12.4,.22,"parede da entrada");
  }
  box(3.2,1.15,.22,0,3.725,15,m.plaster);
  box(.2,4.3,30,14,2.15,0,m.plaster);
  box(28,.2,30,0,4.4,0,m.plaster);
  for(const z of [-15]) {
    box(28,.45,.2,0,.225,z,m.plaster);
    box(28,.3,.2,0,4.15,z,m.plaster);
    for(let x=-12;x<=12;x+=4) {
      box(3.9,3.5,.045,x,2.2,z,m.window);
      box(.075,3.65,.1,x-2,2.2,z+.04,m.charcoal);
    }
    box(28,.065,.1,0,2.4,z+.04,m.charcoal);
  }
  box(.2,.45,30,-14,.225,0,m.plaster);
  box(.2,.3,30,-14,4.15,0,m.plaster);
  for(let z=-12.5;z<=12.5;z+=5) {
    box(.04,3.5,4.9,-14,2.2,z,m.window);
    box(.1,3.65,.075,-13.95,2.2,z-2.5,m.charcoal);
  }
  box(.1,.065,30,-13.95,2.4,0,m.charcoal);
  for(const x of [-13.75,13.75])box(.08,.13,29.7,x,.08,0,m.white);
  for(const side of [-1,1])box(12.1,.13,.08,side*7.8,.08,14.85,m.white);
  for(const x of [-10,-5,0,5,10]) {
    box(.12,.16,29,x,4.22,0,m.oak);
    for(const z of [-10,-2,6,12]) {
      box(1.8,.06,.34,x,4.08,z,m.charcoal);
      box(1.65,.025,.25,x,4.035,z,m.light);
    }
  }
  // A praça ocupa o primeiro plano; os prédios ficam mais longe para não tapar a vista.
  box(220,.2,220,0,-.95,0,m.lawn);
  box(145,.03,7,-25,-.82,-40,m.road);
  box(7,.03,120,-42,-.82,-14,m.road);
  for(const z of [-44.1,-35.9])box(145,.06,1.2,-25,-.78,z,m.paving);
  for(const x of [-46.1,-37.9])box(1.2,.06,120,x,-.78,-14,m.paving);
  box(2.6,.045,42,-22,-.78,-8,m.paving);
  box(43,.045,2.6,-5,-.78,-24,m.paving);
  for(let x=-75;x<=40;x+=7)box(2.5,.01,.1,x,-.795,-40,m.white);
  function tree(x,z,height=4.5) {
    cyl(.13,height*.72,x,-.8+height*.36,z,m.oak);
    for(let i=0;i<10;i++) {
      const angle=i*2.4+x*.17, alcance=.3+(i%3)*.27;
      const altura=-.8+height*(.5+(i%4)*.105);
      const dx=Math.sin(angle)*alcance,dz=Math.cos(angle)*alcance;
      beam([x,altura-.7,z],[x+dx,altura,z+dz],.045,m.oak);
      const copa=mesh(foliage,i%3?m.treeLeaf:m.treeLight,x+dx,altura,z+dz,.75+(i%3)*.13,.85+(i%2)*.24,.65+(i%4)*.1);
      copa.rotation.set(i*.43,angle,i*.21);
    }
  }
  for(const [x,z,h] of [[-18,-27,4.2],[-28,-27,5],[-32,-15,4.7],[-28,1,4.5],[-20,8,4.2],[-29,18,5],[-10,-29,4.4],[1,-28,4.5],[13,-30,4.2],[28,-26,5]])tree(x,z,h);
  for(const [x,z] of [[-26,-8],[-15,-27],[7,-27]]) {
    box(2,.12,.6,x,-.28,z,m.oak);box(2,.55,.08,x,-.05,z+.3,m.oak);
    for(const dx of [-.75,.75])box(.08,.5,.4,x+dx,-.55,z,m.charcoal);
  }
  for(const [x,z,h] of [[-19,-6,5.1],[-31,-3,5.8],[-33,9,5],[-19,18,4.8],[-32,-29,5.6],[-6,-30,5.2],[7,-29,5.5],[21,-31,4.7],[-49,-25,6],[-48,8,5.5],[-27,27,5.7]])tree(x,z,h);

  // Canteiros, fonte e pergolado dão motivos para olhar para fora com mais calma.
  for(const [x,z,w,d] of [[-18,-14,1.5,6],[-28,2,5,1.4],[-9,-21,6,1.4],[12,-21,4,1.4],[-32,18,5,1.4]]) {
    box(w,.3,d,x,-.65,z,m.paving);box(w-.12,.035,d-.12,x,-.48,z,m.earth);
    const quantidade=Math.ceil(w+d);
    for(let i=0;i<quantidade;i++) {
      const px=x+(w>d?(i/(quantidade-1)-.5)*(w-.4):Math.sin(i)*.3);
      const pz=z+(d>w?(i/(quantidade-1)-.5)*(d-.4):Math.cos(i)*.3);
      const arbusto=mesh(foliage,i%2?m.treeLeaf:m.treeLight,px,-.12,pz,.45,.55,.45);arbusto.rotation.y=i;
    }
  }
  cyl(5.2,.045,-28,-.79,-13,m.paving);
  cyl(2.15,.25,-28,-.65,-13,m.pot);cyl(1.92,.035,-28,-.505,-13,m.water);
  cyl(.46,.55,-28,-.25,-13,m.paving);cyl(1,.08,-28,.04,-13,m.pot);
  cyl(.03,.8,-28,.45,-13,m.water);
  for(const x of [-30.4,-25.6])for(const z of [4.4,8])box(.13,2.8,.13,x,.6,z,m.oak);
  for(let z=4.3;z<=8.1;z+=.45)box(5.1,.12,.11,-28,2.04,z,m.oak);
  for(const z of [5,7.2]) {
    box(3.5,.15,.65,-28,-.25,z,m.oak);
    for(const dx of [-1.25,1.25])box(.09,.55,.5,-28+dx,-.55,z,m.charcoal);
  }
  for(const x of [-58,-27,-9,10,30]) {
    cyl(.055,4.2,x,1.3,-34,m.charcoal);
    beam([x,3.35,-34],[x+.65,3.35,-34],.04,m.charcoal);
    box(.7,.08,.23,x+.5,3.32,-34,m.charcoal);
    box(.6,.02,.17,x+.5,3.26,-34,m.light);
  }
  for(let z=-42.5;z<=-37.5;z+=.8)box(3.5,.012,.35,-35.5,-.79,z,m.white);
  function carro(x,z,cor,angulo=0) {
    const grupo=new THREE.Group();grupo.position.set(x,-.8,z);grupo.rotation.y=angulo;root.add(grupo);
    mesh(padded,cor,0,.52,0,3.5,.65,1.55,grupo);
    mesh(padded,cor,-.2,1,0,1.95,.65,1.4,grupo);
    box(1.65,.42,1.415,-.2,1.04,0,m.cityGlass,grupo);
    box(.1,.55,1.43,-.2,1,0,cor,grupo);
    for(const dx of [-1.1,1.1])for(const dz of [-.76,.76]) {
      const roda=cyl(.3,.16,dx,.3,dz,m.black,grupo);roda.rotation.x=Math.PI/2;
      const centro=cyl(.14,.18,dx,.3,dz,m.aluminum,grupo);centro.rotation.x=Math.PI/2;
    }
    for(const dz of [-.48,.48])box(.035,.14,.28,1.76,.6,dz,m.white,grupo);
  }
  carro(-28,-40,m.red);carro(-8,-40,m.blue);carro(16,-40,m.white,Math.PI);carro(-42,8,m.charcoal,Math.PI/2);
  function pessoa(x,z,cor) {
    mesh(padded,cor,x,.45,z,.33,.58,.23);
    mesh(sphere,m.pot,x,.94,z,.14,.17,.14);
    for(const dx of [-.1,.1])beam([x+dx,.21,z],[x+dx,-.64,z+dx],.065,m.charcoal);
    for(const lado of [-1,1])beam([x+lado*.17,.65,z],[x+lado*.23,.1,z+.08],.05,cor);
  }
  pessoa(-22,-18,m.red);pessoa(-20.7,-18.4,m.blue);pessoa(-26,5.8,m.charcoal);pessoa(3,-24,m.teal);
  for(const [index,[x,z,w,h,d]] of [[-54,-58,13,23,14],[-64,-16,12,19,15],[-56,27,14,15,13],[-24,-64,15,16,14],[2,-69,15,25,13],[28,-63,13,20,14],[49,-57,15,28,14]].entries()) {
    box(w,h,d,x,h/2-.8,z,index%3===0?m.brick:index%2?m.skyline:m.exterior);
    box(w+.3,.35,d+.3,x,h-.7,z,m.white);
    for(let y=1;y<h-1;y+=1.8) {
      for(let dx=-w/2+1.1;dx<w/2-.5;dx+=2.1)box(1.2,.95,.03,x+dx,y,z+d/2+.025,m.cityGlass);
      for(let dz=-d/2+1.1;dz<d/2-.5;dz+=2.1)box(.03,.95,1.2,x+w/2+.025,y,z+dz,m.cityGlass);
    }
  }
  for(const [x,y,z] of [[-48,20,-70],[12,25,-85],[-70,24,12]]) {
    for(let i=0;i<3;i++)mesh(sphere,m.cloud,x+i*6,y+(i%2),z,7,1.5,3);
  }

  // A porta abre dos dois lados, sem precisar colocar um botão na tela.
  box(5.8,.22,4.4,0,-.12,17.1,m.paving);
  box(5.8,.16,4.4,0,3.5,17.1,m.plaster);
  for(const side of [-1,1]) {
    box(.15,3.5,4.4,side*2.9,1.7,17.1,m.plaster);
    obstacle(side*8.15,17.1,10.5,4.5,"limite do vestíbulo");
    box(.1,3.2,.16,side*1.63,1.6,15,m.red);
  }
  box(5.8,3.5,.1,0,1.7,19.25,m.glass);
  box(3.36,.12,.18,0,3.17,15,m.red);
  box(3.4,.025,.32,0,.018,15,m.aluminum);
  box(2.4,.025,1.2,0,.02,16.7,m.redDark);
  const doors=[];
  for(const side of [-1,1]) {
    const leaf=new THREE.Group();leaf.position.set(side*.8,0,15);leaf.userData.dynamic=true;root.add(leaf);
    box(1.5,3.02,.045,0,1.54,0,m.glass,leaf);
    for(const dx of [-.75,.75])box(.055,3.1,.075,dx,1.55,0,m.red,leaf);
    for(const y of [.04,3.08])box(1.55,.06,.075,0,y,0,m.red,leaf);
    box(1.45,.14,.048,0,1.05,0,m.redLight,leaf);
    box(.04,.55,.05,-side*.6,1.4,-.07,m.aluminum,leaf);
    doors.push({leaf,side,collider:obstacle(side*.8,15,1.5,.12,"porta automática")});
  }
  let doorOpen=0;

  function monitor(x,y,z,parent,variant=0) {
    box(.96,.59,.065,x,y,z,m.charcoal,parent);
    box(.89,.51,.012,x,y,z+.04,m.screen,parent);
    box(.045,.23,.045,x,y-.37,z,m.aluminum,parent);
    box(.34,.025,.2,x,y-.49,z+.03,m.charcoal,parent);
    // As barras lembram um editor de código, sem encher a cena de texto.
    box(.15,.43,.005,x-.34,y,z+.048,m.codeMuted,parent);
    box(.67,.032,.006,x+.09,y+.22,z+.048,m.codeMuted,parent);
    for(let row=0;row<10;row++) {
      const indent=(row%4)*.025;
      const width=.15+((row*7+variant*3)%9)*.035;
      box(width,.013,.008,x-.18+indent+width/2,y+.17-row*.035,z+.05,
        [m.codeBlue,m.codeGreen,m.codeGold,m.codeMuted][(row+variant)%4],parent);
    }
  }
  function workstation(x,z,angle=0,variant=0) {
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=angle;root.add(group);
    const numero=numeroEstacao++;group.name="Cabine de trabalho "+(numero+1);
    monitor(-.46,1.26,.35,group,variant);monitor(.53,1.26,.35,group,variant+1);
    box(.64,.025,.21,0,.794,.77,m.charcoal,group);
    for(let row=0;row<4;row++)for(let key=0;key<11;key++)
      box(.042,.008,.027,-.27+key*.053,.811,.7+row*.042,m.aluminum,group);
    box(.33,.008,.3,.8,.78,.8,numero%3===0?m.red:m.charcoal,group);
    mesh(sphere,m.charcoal,.8,.81,.79,.065,.035,.09,group);
    // Nem todo mundo deixa as mesmas coisas na mesa: algumas ficam quase livres.
    if(numero%3===0)xicara(-1,.78,.9,group,true);
    if(numero%4===1||numero%5===2)caderno(numero%2?-.85:1.12,1.22,group,numero%2?m.red:m.bookGreen,numero%2?.12:-.18);
    // As duas tomadas ficam na divisória à esquerda de quem se senta aqui.
    box(.055,.24,.54,-1.493,1.12,.86,m.white,group);
    for(const dz of [-.13,.13]) {
      box(.012,.18,.215,-1.456,1.12,.86+dz,m.aluminum,group);
      for(const [hx,hy] of [[-.045,0],[.045,0],[0,.035]]) {
        const hole=cyl(.012,.012,-1.444,1.115+hy,.86+dz+hx,m.black,group);
        hole.rotation.z=Math.PI/2;
      }
    }
    box(.025,.34,.025,-1.49,.83,1.17,m.white,group);
    // O gabinete cabe embaixo da mesa, sem tomar o espaço das pernas.
    box(.24,.5,.45,1.15,.31,.85,m.charcoal,group);
    box(.022,.43,.015,1.06,.31,1.083,m.redLight,group);
    for(const y of [.2,.4]) {
      const fan=cyl(.075,.012,1.18,y,1.083,m.black,group);fan.rotation.x=Math.PI/2;
      const hub=cyl(.027,.015,1.18,y,1.092,m.redDark,group);hub.rotation.x=Math.PI/2;
    }
  }
  function deskIsland(x,z) {
    box(6.2,.105,3.2,x,.72,z,m.edge);
    for(const dx of [-2.8,2.8])for(const dz of [-1.3,1.3])
      box(.07,.68,.07,x+dx,.34,z+dz,m.white);
    box(5.7,.055,.3,x,.35,z,m.white);
    box(6.15,.9,.07,x,1.2,z,m.white);
    box(6.2,.045,.09,x,1.67,z,m.aluminum);
    // Cada cabine ganhou largura e profundidade, mas continua aberta atrás da cadeira.
    for(const dx of [-3.1,0,3.1]) {
      box(.065,.9,3.2,x+dx,1.2,z,m.white);
      box(.09,.04,3.24,x+dx,1.67,z,m.aluminum);
    }
    for(const dx of [-1.55,1.55]) {
      workstation(x+dx,z+.12,0,dx>0?1:0);
      workstation(x+dx,z-.12,Math.PI,dx>0?3:2);
      chair(x+dx,z+2.45,0);chair(x+dx,z-2.45,Math.PI);
    }
    for(const dx of [-2.8,2.8]) {
      box(.3,.32,.22,x+dx,.93,z,m.pot);
      for(let i=0;i<3;i++)mesh(sphere,m.leaf,x+dx+(i-1)*.07,1.2+i*.04,z,.08,.17,.08);
    }
    obstacle(x,z,6.3,3.3,"mesa de trabalho");
  }
  // As fileiras ficam mais perto das janelas, deixando a entrada e os cantos de descanso livres.
  deskIsland(-7,-10.3);deskIsland(-7,-2.5);deskIsland(-7,5.3);
  deskIsland(5.7,-3);deskIsland(5.7,4.8);

  // A sala de reunião tem vidro para continuar conectada ao resto do escritório.
  for(const [x,z,w,d] of [[5.8,-11.15,.06,6.7],[7.4,-7.8,3.2,.06],[12.45,-7.8,2.1,.06]]) {
    box(w,3.2,d,x,1.6,z,m.glass);
    box(Math.max(w,.07),.06,Math.max(d,.07),x,3.22,z,m.charcoal);
    box(Math.max(w,.07),.05,Math.max(d,.07),x,.04,z,m.charcoal);
    obstacle(x,z,Math.max(w,.12),Math.max(d,.12),"divisória de vidro");
  }
  for(const [x,z] of [[5.8,-14.5],[5.8,-7.8],[9,-7.8],[11.4,-7.8],[13.5,-7.8]])
    box(.065,3.25,.065,x,1.625,z,m.charcoal);
  // A mesa e as cadeiras mantêm o tamanho; só o conjunto foi levado para o canto da janela.
  box(5.2,.13,2.05,9.8,.76,-11.3,m.edge);
  for(const x of [8,11.6])box(.15,.72,1.3,x,.36,-11.3,m.charcoal);
  obstacle(9.8,-11.3,5.3,2.15,"mesa de reunião");
  for(const x of [8.1,9.8,11.5]) {
    chair(x,-9.55,0,true);chair(x,-13.05,Math.PI,true);
  }
  const laptop=new THREE.Group();laptop.position.set(9.4,.85,-11.3);laptop.rotation.y=.2;root.add(laptop);
  box(.62,.025,.43,0,0,0,m.aluminum,laptop);
  box(.62,.4,.035,0,.2,-.2,m.charcoal,laptop);
  box(.56,.34,.008,0,.2,-.177,m.screen,laptop);
  box(.4,.025,.3,10.8,.85,-11.3,m.bookGreen);
  cyl(.12,.3,9.8,.95,-11.3,m.white);
  // O painel da reunião mostra um esquema visual, sem rótulos sobre a imagem.
  box(.09,1.6,2.8,13.84,2.05,-11.3,m.charcoal);
  box(.015,1.46,2.66,13.78,2.05,-11.3,m.screen);
  for(const dz of [-.8,0,.8]) {
    box(.012,.24,.45,13.76,2.3,-11.3+dz,m.codeBlue);
    box(.012,.17,.35,13.76,1.8,-11.3+dz,m.codeGreen);
    box(.012,.32,.025,13.76,2.05,-11.3+dz,m.codeMuted);
  }
  box(.012,.025,1.7,13.76,2.3,-11.3,m.codeMuted);
  plant(12.6,-13.4,1.1);

  function quadro(x,y,z,angulo,variacao=0) {
    const moldura=new THREE.Group();moldura.position.set(x,y,z);moldura.rotation.y=angulo;
    moldura.name="Quadro abstrato na parede";root.add(moldura);
    box(1.18,1.48,.075,0,0,0,m.charcoal,moldura);
    box(1.08,1.38,.025,0,0,.047,m.paper,moldura);
    const forma=box(.43,.77,.012,-.18,-.12,.07,variacao%2?m.red:m.teal,moldura);forma.rotation.z=.25;
    const disco=cyl(.24,.014,.2,.3,.075,variacao%2?m.book:m.red,moldura);disco.rotation.x=Math.PI/2;
    box(.7,.045,.014,.04,-.48,.08,m.charcoal,moldura);
    box(.045,.5,.012,.33,-.2,.085,m.oak,moldura);
  }
  // Quadros geométricos trazem cor às paredes sem acrescentar mais textos.
  quadro(-2.8,2.25,14.83,Math.PI,0);
  quadro(2.8,2.25,14.83,Math.PI,1);
  quadro(-9.4,2.3,14.83,Math.PI,1);
  quadro(-11,2.3,14.83,Math.PI,2);
  quadro(13.82,2.6,-3.6,-Math.PI/2,2);

  // As paredes resguardam quem está descansando ou tomando café, com entradas pela lateral.
  function paredePrivacidade(x,z,w,d,nome) {
    const parede=box(w,2.7,d,x,1.35,z,m.plaster);parede.name=nome;
    box(w+.025,.055,d+.025,x,2.7275,z,m.oak);
    box(w,.12,d+.035,x,.06,z,m.white);
    obstacle(x,z,w,d,nome);
  }
  paredePrivacidade(9.25,8.65,9.3,.16,"Parede de privacidade dos sofás");
  paredePrivacidade(4.6,8.875,.16,.45,"Parede lateral dos sofás");
  paredePrivacidade(4.6,13,.16,3.8,"Parede lateral dos sofás");
  paredePrivacidade(-9.1,10.4,9.6,.16,"Parede de privacidade do café");
  paredePrivacidade(-4.3,10.7,.16,.6,"Parede lateral do café");
  paredePrivacidade(-4.3,13.95,.16,1.9,"Parede lateral do café");

  // Os dois sofás continuam voltados para a mesa, agora dentro de um canto reservado.
  box(7.4,.028,5.4,9.1,.02,11.7,m.sofa);
  function sofa(x,z,angle=0) {
    const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=angle;root.add(group);
    box(3.35,.4,.95,0,.4,0,m.teal,group);
    box(3.35,.65,.2,0,.83,.46,m.teal,group);
    for(const dx of [-1.55,1.55])box(.24,.45,1,dx,.67,0,m.teal,group);
    for(const dx of [-.9,0,.9])box(.83,.14,.75,dx,.67,-.05,m.sofa,group);
    const pillow=box(.48,.45,.18,-1,.94,.27,m.red,group);pillow.rotation.z=.18;
    obstacle(x,z,Math.abs(Math.cos(angle))*3.5+Math.abs(Math.sin(angle))*1.1,Math.abs(Math.sin(angle))*3.5+Math.abs(Math.cos(angle))*1.1,"sofá");
  }
  sofa(9.5,13.4);sofa(12.5,10.8,Math.PI/2);
  cyl(.85,.09,9,.48,10.9,m.edge);cyl(.12,.45,9,.225,10.9,m.charcoal);
  obstacle(9,10.9,1.8,1.8,"mesa de centro");
  box(.45,.025,.3,9,.55,10.9,m.bookGreen);cyl(.08,.1,8.65,.58,11.15,m.white);
  plant(12.9,13.7,1.25);plant(5.5,13.8,1);

  // Alguns armários ficam abertos para mostrar a louça e o café guardado.
  box(5.5,.75,.045,-9.5,.45,14.2,m.oak);
  box(5.5,.07,.85,-9.5,.085,13.8,m.oak);
  box(5.5,.055,.85,-9.5,.43,13.8,m.edge);
  for(const x of [-12.25,-10.42,-8.58,-6.75])box(.06,.75,.85,x,.45,13.8,m.oak);
  box(5.65,.07,1,-9.5,.865,13.8,m.white);
  obstacle(-9.5,13.8,5.7,1.05,"bancada de café");
  function portaArmario(x,lado,aberta) {
    const porta=new THREE.Group();porta.position.set(x,.45,13.35);porta.rotation.y=aberta?lado*1.22:0;
    porta.name=aberta?"Porta aberta do armário do café":"Porta do armário do café";root.add(porta);
    box(.86,.72,.055,lado*.43,0,0,m.oak,porta);
    box(.025,.17,.035,lado*.72,.02,-.05,m.charcoal,porta);
    if(aberta)obstacle(x+lado*.15,12.96,.55,.85,"porta aberta do armário");
  }
  portaArmario(-12.2,1,true);portaArmario(-10.47,-1,true);
  portaArmario(-10.38,1,false);portaArmario(-8.65,-1,false);
  portaArmario(-8.54,1,true);portaArmario(-6.8,-1,false);
  for(const x of [-11.95,-11.62,-11.29,-10.96])xicara(x,.46,13.67);
  for(const x of [-11.9,-11.5,-11.1])xicara(x,.12,13.7);
  for(const [x,z] of [[-8.22,13.78],[-7.94,13.72],[-7.66,13.82]])pacoteCafe(x,.46,z);
  box(.65,.58,.55,-10.8,1.18,13.8,m.charcoal);
  box(.5,.21,.08,-10.8,1.2,13.49,m.aluminum);
  box(.4,.025,.18,-10.8,.94,13.4,m.black);
  cyl(.07,.13,-10.8,1,13.43,m.white);
  pacoteCafe(-11.48,.91,13.7,root,true);
  xicara(-10.05,.91,13.65);xicara(-9.76,.91,13.69);
  cyl(.17,.28,-8.7,1.05,13.8,m.white);
  cyl(.06,.08,-8.1,.96,13.7,m.white);cyl(.06,.08,-7.8,.96,13.7,m.white);
  box(.5,.7,.5,-7.1,1.25,13.8,m.aluminum);
  plant(-13,11.3,1.25);
  box(.4,2.2,5,13.7,1.1,.5,m.oak);
  for(const z of [-1.5,-.5,.5,1.5,2.5]) {
    box(.45,.08,.92,13.65,1.1,z,m.edge);
    for(let i=0;i<4;i++)box(.25,.42,.1,13.4,1.4,z-.25+i*.14,i%2?m.red:m.book);
  }
  obstacle(13.4,.5,.8,5.1,"estante");
  for(let i=0;i<7;i++)box(.08,1.7,.22,13.85,2.65,5+i*.32,i%2?m.oak:m.red);
  plant(-12.6,-12.8,1.2);plant(-12.5,5.5,1);plant(1.7,-13.4,1.1);

  // Junto as peças por material para o celular não precisar desenhar cada detalhe separado.
  root.updateMatrixWorld(true);
  const buckets=new Map(),originals=[];
  root.traverse(object=>{
    if(!object.isMesh||object.material.transparent)return;
    for(let parent=object;parent;parent=parent.parent)if(parent.userData.dynamic)return;
    const geometry=object.geometry.clone().applyMatrix4(object.matrixWorld);
    const nonIndexed=geometry.index?geometry.toNonIndexed():geometry;
    if(nonIndexed!==geometry)geometry.dispose();
    if(!buckets.has(object.material.uuid))buckets.set(object.material.uuid,{material:object.material,geometries:[]});
    buckets.get(object.material.uuid).geometries.push(nonIndexed);originals.push(object);
  });
  for(const object of originals)object.removeFromParent();
  for(const {material,geometries} of buckets.values()) {
    const combined=mergeGeometries(geometries,false);
    for(const geometry of geometries)geometry.dispose();
    if(combined){const batch=new THREE.Mesh(combined,material);batch.castShadow=true;batch.receiveShadow=true;scene.add(batch);}
  }
  return {
    colliders,
    update(player,dt) {
      const target=Math.hypot(player.x,player.z-15)<3.6?1:0;
      doorOpen=THREE.MathUtils.damp(doorOpen,target,6,dt);
      for(const {leaf,side,collider} of doors) {
        leaf.position.x=side*(.8+doorOpen*1.55);
        collider.minX=leaf.position.x-.75;
        collider.maxX=leaf.position.x+.75;
      }
    },
  };
}
