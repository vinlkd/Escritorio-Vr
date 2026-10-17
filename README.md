# Escritório de desenvolvimento

Um escritório para passear e explorar, feito em Three.js. São 20 estações com dois monitores cada, cabines brancas mais espaçosas e cadeiras pretas acolchoadas. As duas tomadas de cada cabine ficam na divisória à esquerda de quem se senta.

As mesas não são todas iguais: algumas têm café, outras têm um caderninho e outras ficam mais livres. No canto do café, alguns armários estão abertos, com xícaras e pacotes nas prateleiras. Também há café e louça ao lado da cafeteira.

A sala tem quadros e uma reunião mais compacta no canto das janelas. A mesa e as cadeiras mantêm o tamanho, e as fileiras de cabines ficam mais ao fundo. Os cantos do café e dos sofás têm paredes de privacidade com entradas laterais. As portas de entrada abrem quando alguém chega perto. Pela janela dá para ver a praça com árvores irregulares, canteiros, fonte, pergolado, bancos, pessoas e a rua ao fundo.

Na tela ficam só o ambiente e o joystick. Você também pode usar o teclado ou um controle. Os modelos são construídos pelo próprio código; não há arquivos 3D ou imagens para baixar.

## Executar

Requer Node.js 20.19+ ou 22.12+.

```sh
npm install
npm run dev
```

No PowerShell com scripts desativados, use `npm.cmd install` e `npm.cmd run dev`.
Abra a URL local exibida pelo Vite. Para gerar os arquivos estáticos em `dist/`, execute `npm run build`. Para testar a física, execute `npm test`.

## Controles

- Joystick na tela ou W/A/S/D: caminhar. É possível mover o joystick e arrastar a cena ao mesmo tempo em telas multitoque.
- Arrastar a cena: olhar. Clique duplo captura o mouse; Esc libera.
- Setas para cima/baixo: caminhar; esquerda/direita: girar a câmera.
- Shift: acelerar. R: voltar à entrada.
- Controle com mapeamento padrão: analógico esquerdo para andar, direito para olhar e gatilho direito para acelerar. Depois de conectar, pressione um botão para o navegador reconhecer o controle.

A simulação não depende de serviços externos para renderizar.

## Estrutura

- `src/world.js`: escritório, mobiliário, materiais, ponto inicial e colisores.
- `src/main.js`: renderização e controles de locomoção.
- `src/physics.js`: movimento com colisões, normalização e zona morta dos analógicos.
- `src/style.css`: interface responsiva.

Requer WebGL 2. A renderização usa [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html).
