// ===== JUDE'S WORLD - Main Game Script =====

(function () {
    'use strict';

    // ===== CONFIG =====
    const WORLD_WIDTH = 3200;
    const MOVE_SPEED = 4;
    const INTERACTION_DISTANCE = 80;
    const SPRITE_SCALE = 4; // each pixel in our sprite grid = 4px on canvas
    const SPRITE_W = 24;    // sprite grid width
    const SPRITE_H = 32;    // sprite grid height

    // ===== STATE =====
    let gameStarted = false;
    let judeX = 100;
    let cameraX = 0;
    let viewportWidth = window.innerWidth;
    let facingLeft = false;
    let isWalking = false;
    let walkFrame = 0;
    let walkTimer = 0;
    let keys = {};
    let nearbyObject = null;
    let musicPlaying = false;
    let audioCtx = null;

    // ===== PIXEL ART SPRITE DATA =====
    // Color palette
    const _ = null;
    const H = '#3d2010';  // hair dark
    const h = '#5a3520';  // hair mid
    const c = '#6b4230';  // hair curl highlight
    const S = '#d4956b';  // skin
    const E = '#1a1008';  // eye pupil
    const e = '#ffffff';  // eye shine
    const W = '#ffffff';  // eye white
    const P = '#f5a0c0';  // blush pink
    const M = '#c4766a';  // mouth
    const m = '#a05a4a';  // mouth shadow
    const T = '#7ec8e3';  // shirt blue
    const t = '#5aa8c3';  // shirt shadow
    const B = '#f5a0c0';  // backpack strap pink
    const b = '#7ec8e3';  // backpack strap blue
    const K = '#4a6fa5';  // shorts
    const k = '#3a5f95';  // shorts shadow
    const L = '#d4956b';  // legs (skin)
    const Y = '#f0d020';  // yellow crocs
    const y = '#d0b010';  // crocs shadow

    // Chibi sprite - oversized anime head, tiny body (24x32 grid)
    const spriteFrame0 = [
        [_,_,_,_,_,_,_,c,c,_,_,c,_,_,c,c,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,c,c,H,H,c,c,H,c,H,H,H,c,c,_,_,_,_,_,_],
        [_,_,_,_,c,H,H,h,h,H,H,h,H,h,h,H,H,H,c,_,_,_,_,_],
        [_,_,_,c,H,h,h,h,h,h,h,h,h,h,h,h,h,H,H,c,_,_,_,_],
        [_,_,c,H,h,h,h,h,h,h,h,h,h,h,h,h,h,h,H,H,c,_,_,_],
        [_,_,c,H,h,h,h,h,h,h,h,h,h,h,h,h,h,h,h,H,c,_,_,_],
        [_,_,H,h,h,h,S,S,S,S,S,S,S,S,S,S,S,h,h,h,H,_,_,_],
        [_,c,H,h,h,S,S,S,S,S,S,S,S,S,S,S,S,S,h,h,H,c,_,_],
        [_,c,H,h,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,h,H,c,_,_],
        [_,c,h,S,S,S,W,W,E,S,S,S,S,W,W,E,S,S,S,S,h,c,_,_],
        [_,_,h,S,S,S,e,W,E,S,S,S,S,e,W,E,S,S,S,S,h,_,_,_],
        [_,_,h,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,S,h,_,_,_],
        [_,_,h,S,S,P,P,S,S,S,S,S,S,S,S,P,P,S,S,S,h,_,_,_],
        [_,_,h,S,S,S,S,S,S,S,M,M,S,S,S,S,S,S,S,S,h,_,_,_],
        [_,_,_,h,S,S,S,S,S,S,m,m,S,S,S,S,S,S,S,h,_,_,_,_],
        [_,_,_,h,h,S,S,S,S,S,S,S,S,S,S,S,S,S,h,h,_,_,_,_],
        [_,_,_,_,h,h,S,S,S,S,S,S,S,S,S,S,S,h,h,_,_,_,_,_],
        [_,_,_,_,_,h,h,h,S,S,S,S,S,S,h,h,h,h,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,B,T,T,T,T,T,T,b,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,B,B,T,T,T,T,T,T,b,b,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,S,B,T,T,T,t,t,T,T,T,b,S,_,_,_,_,_,_,_],
        [_,_,_,_,_,S,_,T,T,t,t,t,t,T,T,_,S,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,T,T,t,t,t,t,T,T,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,K,K,K,K,K,K,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,K,K,k,k,K,K,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,K,k,_,_,k,K,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,L,L,_,_,L,L,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,L,L,_,_,L,L,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,L,L,_,_,L,L,_,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,Y,Y,Y,_,_,Y,Y,Y,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,Y,y,Y,_,_,Y,y,Y,_,_,_,_,_,_,_,_,_],
        [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
    ];

    // Walking frame 1: left leg forward, right leg back
    const spriteFrame1 = spriteFrame0.map((row, ry) => {
        if (ry === 25) return [_,_,_,_,_,_,_,L,L,_,_,_,_,L,L,_,_,_,_,_,_,_,_,_];
        if (ry === 26) return [_,_,_,_,_,_,L,L,_,_,_,_,_,_,L,L,_,_,_,_,_,_,_,_];
        if (ry === 27) return [_,_,_,_,_,_,L,L,_,_,_,_,_,_,_,L,L,_,_,_,_,_,_,_];
        if (ry === 28) return [_,_,_,_,_,_,L,L,_,_,_,_,_,_,_,L,L,_,_,_,_,_,_,_];
        if (ry === 29) return [_,_,_,_,_,Y,Y,Y,_,_,_,_,_,_,Y,Y,Y,_,_,_,_,_,_,_];
        if (ry === 30) return [_,_,_,_,_,Y,y,Y,_,_,_,_,_,_,Y,y,Y,_,_,_,_,_,_,_];
        return row;
    });

    // Walking frame 2: right leg forward, left leg back
    const spriteFrame2 = spriteFrame0.map((row, ry) => {
        if (ry === 25) return [_,_,_,_,_,_,_,L,L,_,_,_,_,L,L,_,_,_,_,_,_,_,_,_];
        if (ry === 26) return [_,_,_,_,_,_,_,_,L,L,_,_,L,L,_,_,_,_,_,_,_,_,_,_];
        if (ry === 27) return [_,_,_,_,_,_,_,_,_,L,L,L,L,_,_,_,_,_,_,_,_,_,_,_];
        if (ry === 28) return [_,_,_,_,_,_,_,_,_,L,L,L,L,_,_,_,_,_,_,_,_,_,_,_];
        if (ry === 29) return [_,_,_,_,_,_,_,_,Y,Y,Y,Y,Y,Y,_,_,_,_,_,_,_,_,_,_];
        if (ry === 30) return [_,_,_,_,_,_,_,_,Y,y,Y,Y,y,Y,_,_,_,_,_,_,_,_,_,_];
        return row;
    });

    const spriteFrames = [spriteFrame0, spriteFrame1, spriteFrame0, spriteFrame2];

    function drawSprite(canvas, frameData, flip) {
        const ctx = canvas.getContext('2d');
        canvas.width = SPRITE_W * SPRITE_SCALE;
        canvas.height = SPRITE_H * SPRITE_SCALE;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (flip) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }

        for (let row = 0; row < SPRITE_H; row++) {
            for (let col = 0; col < SPRITE_W; col++) {
                const color = frameData[row] && frameData[row][col];
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(col * SPRITE_SCALE, row * SPRITE_SCALE, SPRITE_SCALE, SPRITE_SCALE);
                }
            }
        }

        if (flip) ctx.restore();
    }

    // ===== WORLD OBJECT PIXEL ART ICONS (16x16 grids, scaled 4x to 64px) =====
    const ICON_SIZE = 16;
    const ICON_SCALE = 4;

    // Palette for icons
    const O = '#e87020'; // orange
    const o = '#c05818'; // orange dark
    const G = '#888888'; // grey
    const g = '#666666'; // grey dark
    const R = '#e03030'; // red
    const r = '#b02020'; // red dark
    const w = '#ffffff'; // white
    const n = '#1a1a1a'; // near-black
    const d = '#333333'; // dark grey
    const F = '#40a030'; // green
    const f = '#308020'; // green dark
    const U = '#3070d0'; // blue
    const u = '#2050a0'; // blue dark
    const V = '#f0d020'; // yellow
    const v = '#c0a010'; // yellow dark
    const p = '#f5a0c0'; // pink
    const q = '#8B4513'; // brown
    const Q = '#a0682a'; // brown light
    const N = '#2ecc71'; // bright green
    const X = '#1a8a4a'; // dark green
    const Z = '#f39c12'; // flame orange
    const J = '#c4c4c4'; // light grey
    const j = '#a0a0a0'; // mid grey

    const iconData = {
        // BIKE - orange BMX style
        bike: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,O,O,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,O,o,_,_,_,_,_,_],
            [_,_,_,_,_,_,O,O,O,_,_,_,_,_,_,_],
            [_,_,_,_,_,O,o,_,O,_,_,_,_,_,_,_],
            [_,_,_,_,O,o,_,_,_,O,_,_,_,_,_,_],
            [_,_,_,O,o,_,_,_,_,_,O,_,_,_,_,_],
            [_,_,_,O,_,_,_,_,_,_,O,_,_,_,_,_],
            [_,_,n,d,n,_,_,_,_,n,d,n,_,_,_,_],
            [_,n,_,_,_,n,_,_,n,_,_,_,n,_,_,_],
            [_,n,_,G,_,n,_,_,n,_,G,_,n,_,_,_],
            [_,n,_,_,_,n,_,_,n,_,_,_,n,_,_,_],
            [_,_,n,d,n,_,_,_,_,n,d,n,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // BASEBALL - clean ball with red stitching
        baseball: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,w,w,w,w,w,_,_,_,_,_,_],
            [_,_,_,_,w,w,w,R,w,w,w,_,_,_,_,_],
            [_,_,_,w,w,R,w,w,w,R,w,w,_,_,_,_],
            [_,_,_,w,w,w,R,w,R,w,w,w,_,_,_,_],
            [_,_,w,w,R,w,w,w,w,w,R,w,w,_,_,_],
            [_,_,w,w,w,w,w,w,w,w,w,w,w,_,_,_],
            [_,_,w,w,R,w,w,w,w,w,R,w,w,_,_,_],
            [_,_,_,w,w,w,R,w,R,w,w,w,_,_,_,_],
            [_,_,_,w,w,R,w,w,w,R,w,w,_,_,_,_],
            [_,_,_,_,w,w,w,R,w,w,w,_,_,_,_,_],
            [_,_,_,_,_,w,w,w,w,w,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // BEYBLADE - spinning top in arena
        beyblade: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,G,G,G,G,G,G,G,_,_,_,_,_],
            [_,_,_,G,g,_,_,_,_,_,g,G,_,_,_,_],
            [_,_,G,_,_,_,_,_,_,_,_,_,G,_,_,_],
            [_,G,_,_,_,_,U,U,_,_,_,_,_,G,_,_],
            [_,G,_,_,_,U,u,R,U,_,_,_,_,G,_,_],
            [_,G,_,_,U,R,V,V,r,U,_,_,_,G,_,_],
            [_,G,_,_,U,u,V,V,U,u,_,_,_,G,_,_],
            [_,G,_,_,_,U,u,u,U,_,_,V,_,G,_,_],
            [_,G,_,_,_,_,U,U,_,_,V,_,_,G,_,_],
            [_,_,G,_,_,_,_,_,_,_,_,_,G,_,_,_],
            [_,_,_,G,g,_,_,_,_,_,g,G,_,_,_,_],
            [_,_,_,_,G,G,G,G,G,G,G,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // DINOSAUR - T-Rex profile
        dino: [
            [_,_,_,_,_,_,_,_,_,_,N,N,N,N,_,_],
            [_,_,_,_,_,_,_,_,_,N,N,N,N,N,N,_],
            [_,_,_,_,_,_,_,_,_,N,w,N,N,N,N,_],
            [_,_,_,_,_,_,_,_,_,N,N,N,N,N,N,_],
            [_,_,_,_,_,_,_,_,_,N,N,w,N,w,N,_],
            [_,_,_,_,_,_,_,_,N,N,N,N,N,N,_,_],
            [_,X,_,_,_,_,_,N,N,N,_,_,_,_,_,_],
            [_,_,X,_,_,_,N,N,N,_,_,_,_,_,_,_],
            [_,_,_,X,_,N,N,N,N,_,_,_,_,_,_,_],
            [_,_,_,_,N,N,N,N,N,N,_,_,_,_,_,_],
            [_,_,_,_,N,N,N,N,f,N,_,_,_,_,_,_],
            [_,_,_,_,_,N,N,N,_,N,_,_,_,_,_,_],
            [_,_,_,_,_,N,_,N,_,N,N,_,_,_,_,_],
            [_,_,_,_,_,N,_,_,_,_,N,_,_,_,_,_],
            [_,_,_,_,N,N,_,_,_,N,N,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // HOT WHEELS - muscle car with flames
        hotwheels: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,R,R,R,R,_,_,_,_,_],
            [_,_,_,_,_,_,R,U,U,U,R,R,_,_,_,_],
            [_,_,_,R,R,R,R,R,R,R,R,R,R,R,_,_],
            [_,_,Z,R,R,r,r,R,R,R,r,r,R,R,_,_],
            [_,Z,V,R,r,r,r,R,R,r,r,r,R,R,R,_],
            [_,_,Z,R,R,r,r,R,R,R,r,r,R,R,_,_],
            [_,_,_,n,n,n,_,_,_,_,n,n,n,_,_,_],
            [_,_,n,g,G,g,n,_,_,n,g,G,g,n,_,_],
            [_,_,n,G,J,G,n,_,_,n,G,J,G,n,_,_],
            [_,_,n,g,G,g,n,_,_,n,g,G,g,n,_,_],
            [_,_,_,n,n,n,_,_,_,_,n,n,n,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // LEGO - Star Wars X-Wing style craft
        lego: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,G,G,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,G,g,g,G,_,_,_,_,_,_],
            [_,_,_,_,_,G,g,R,g,g,G,_,_,_,_,_],
            [_,_,G,G,G,g,g,g,g,g,g,G,G,G,_,_],
            [_,G,g,g,g,g,g,g,g,g,g,g,g,g,G,_],
            [_,G,J,J,G,_,_,g,g,_,_,G,J,J,G,_],
            [_,_,G,G,_,_,_,g,g,_,_,_,G,G,_,_],
            [_,_,_,_,_,_,g,R,R,g,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,g,g,_,_,_,_,_,_,_],
            [_,_,G,G,_,_,_,g,g,_,_,_,G,G,_,_],
            [_,G,J,J,G,_,_,g,g,_,_,G,J,J,G,_],
            [_,G,g,g,g,g,g,g,g,g,g,g,g,g,G,_],
            [_,_,G,G,G,g,U,U,U,U,g,G,G,G,_,_],
            [_,_,_,_,_,_,U,V,V,U,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // GALLERY - camera
        gallery: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,V,V,V,_,_,_,_,_,_,_],
            [_,_,_,d,d,d,d,d,d,d,d,d,d,_,_,_],
            [_,_,d,d,d,d,d,d,d,d,d,d,d,d,_,_],
            [_,_,d,d,_,_,n,n,n,_,_,d,V,d,_,_],
            [_,_,d,_,_,n,U,U,U,n,_,_,d,d,_,_],
            [_,_,d,_,n,U,u,w,U,U,n,_,d,d,_,_],
            [_,_,d,_,n,U,w,w,U,U,n,_,d,d,_,_],
            [_,_,d,_,n,U,U,U,U,U,n,_,d,d,_,_],
            [_,_,d,_,_,n,U,U,U,n,_,_,d,d,_,_],
            [_,_,d,d,_,_,n,n,n,_,_,d,d,d,_,_],
            [_,_,d,d,d,d,d,d,d,d,d,d,d,d,_,_],
            [_,_,_,d,d,d,d,d,d,d,d,d,d,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // TENNIS - racket and ball
        tennis: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,F,F,F,F,F,_,_,_,_,_,_],
            [_,_,_,_,F,w,F,w,F,w,F,_,_,_,_,_],
            [_,_,_,F,F,F,F,F,F,F,F,F,_,_,_,_],
            [_,_,_,F,w,F,w,F,w,F,w,F,_,_,_,_],
            [_,_,_,F,F,F,F,F,F,F,F,F,_,_,_,_],
            [_,_,_,F,w,F,w,F,w,F,w,F,_,_,_,_],
            [_,_,_,_,F,F,F,F,F,F,F,_,_,_,_,_],
            [_,_,_,_,_,F,F,F,F,F,_,_,_,_,_,_],
            [_,_,_,_,_,_,q,q,_,_,_,V,V,_,_,_],
            [_,_,_,_,_,_,_,q,q,_,V,v,V,_,_,_],
            [_,_,_,_,_,_,_,_,q,q,V,V,V,_,_,_],
            [_,_,_,_,_,_,_,_,_,q,_,V,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,q,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
        // CRICKET - bat and ball
        cricket: [
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,R,R,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,R,r,R,R,_,_],
            [_,_,_,_,_,_,_,_,_,_,R,R,r,R,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,R,R,_,_,_],
            [_,_,Q,Q,_,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,Q,Q,Q,_,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,Q,Q,Q,_,_,_,_,_,_,_,_,_,_],
            [_,_,_,Q,Q,Q,Q,_,_,_,_,_,_,_,_,_],
            [_,_,_,_,Q,Q,Q,Q,_,_,_,_,_,_,_,_],
            [_,_,_,_,_,q,q,Q,Q,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,q,q,Q,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,q,q,_,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,q,q,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,q,_,_,_,_,_,_],
            [_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],
        ],
    };

    function drawIcon(canvas, data) {
        const ctx = canvas.getContext('2d');
        canvas.width = ICON_SIZE * ICON_SCALE;
        canvas.height = ICON_SIZE * ICON_SCALE;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let row = 0; row < ICON_SIZE; row++) {
            for (let col = 0; col < ICON_SIZE; col++) {
                const color = data[row] && data[row][col];
                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(col * ICON_SCALE, row * ICON_SCALE, ICON_SCALE, ICON_SCALE);
                }
            }
        }
    }

    function renderAllIcons() {
        document.querySelectorAll('canvas.obj-sprite[data-icon]').forEach(canvas => {
            const key = canvas.dataset.icon;
            if (iconData[key]) drawIcon(canvas, iconData[key]);
        });
    }

    // ===== DOM REFS =====
    const titleScreen = document.getElementById('title-screen');
    const gameWorld = document.getElementById('game-world');
    const startBtn = document.getElementById('start-btn');
    const ground = document.getElementById('ground');
    const jude = document.getElementById('jude');
    const speechBubble = document.getElementById('speech-bubble');
    const speechText = document.getElementById('speech-text');
    const speechClose = document.getElementById('speech-close');
    const soundBtn = document.getElementById('sound-btn');
    const galleryBtn = document.getElementById('gallery-btn');
    const galleryModal = document.getElementById('gallery-modal');
    const galleryGrid = document.getElementById('gallery-grid');
    const galleryEmpty = document.getElementById('gallery-empty');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const infoModal = document.getElementById('info-modal');
    const infoTitle = document.getElementById('info-title');
    const infoBody = document.getElementById('info-body');

    // Mobile controls
    const ctrlLeft = document.getElementById('ctrl-left');
    const ctrlRight = document.getElementById('ctrl-right');
    const ctrlAction = document.getElementById('ctrl-action');

    // ===== OBJECT DATA =====
    const objectInfo = {
        bike: {
            title: '🚲 JUDE\'S BIKE',
            body: `<div class="info-emoji">🚲</div>
                <ul class="info-facts">
                    <li>Jude loves riding his bike!</li>
                    <li>Wind in his curly hair = best feeling ever</li>
                    <li>Exploring the neighborhood one pedal at a time</li>
                    <li>Adventure is always just around the corner</li>
                </ul>`
        },
        baseball: {
            title: '⚾ BASEBALL',
            body: `<div class="info-emoji">⚾</div>
                <ul class="info-facts">
                    <li>Swing batter batter SWING!</li>
                    <li>Jude's got a wicked arm</li>
                    <li>Home runs are his specialty</li>
                    <li>Catch, throw, hit, repeat!</li>
                </ul>`
        },
        beyblade: {
            title: '🌀 BEYBLADE ARENA',
            body: `<div class="info-emoji">🌀</div>
                <ul class="info-facts">
                    <li>LET IT RIP!!!</li>
                    <li>Jude is a Beyblade master</li>
                    <li>His blade spins with the power of a thousand storms</li>
                    <li>Ready to battle? Play the game!</li>
                </ul>
                <a href="beyblade/" class="info-link">🎮 PLAY BEYBLADE GAME</a>`
        },
        dino: {
            title: '🦕 DINO LAND',
            body: `<div class="info-emoji">🦖</div>
                <ul class="info-facts">
                    <li>T-REX is king but Triceratops is cool too</li>
                    <li>Did you know: Velociraptors had feathers!</li>
                    <li>Jude's dino knowledge is LEGENDARY</li>
                    <li>Rawr means "hello" in dinosaur</li>
                </ul>`
        },
        hotwheels: {
            title: '🏎️ HOT WHEELS',
            body: `<div class="info-emoji">🏎️</div>
                <ul class="info-facts">
                    <li>ZOOM ZOOM! Fastest cars in the world</li>
                    <li>Building epic tracks is an art form</li>
                    <li>Loop-de-loops are the best part</li>
                    <li>Jude's collection is MASSIVE</li>
                </ul>`
        },
        lego: {
            title: '🧱 LEGO WORKSHOP',
            body: `<div class="info-emoji">🧱</div>
                <ul class="info-facts">
                    <li>Master builder at work!</li>
                    <li>If you can dream it, you can build it</li>
                    <li>Step on one... you'll remember forever</li>
                    <li>Jude builds worlds brick by brick</li>
                </ul>`
        },
        gallery: {
            title: '📷 PHOTO GALLERY',
            body: 'gallery'
        },
        tennis: {
            title: '🎾 TENNIS',
            body: `<div class="info-emoji">🎾</div>
                <ul class="info-facts">
                    <li>ACE! Game, set, match!</li>
                    <li>Jude's backhand is coming along nicely</li>
                    <li>Running around the court = ultimate fun</li>
                    <li>New balls please!</li>
                </ul>`
        },
        cricket: {
            title: '🏏 CRICKET',
            body: `<div class="info-emoji">🏏</div>
                <ul class="info-facts">
                    <li>HOWZAT! Jude's a natural cricketer</li>
                    <li>Batting, bowling, fielding - he does it all</li>
                    <li>Six runs over the boundary? No problem!</li>
                    <li>It's just not cricket without Jude</li>
                </ul>`
        }
    };

    // ===== PHOTOS =====
    // Photos are loaded from the photos/ directory
    // Add .jpg, .png, or .gif files to photos/ and list them in photos/index.json
    let photos = [];
    let currentPhotoIndex = 0;

    async function loadPhotos() {
        try {
            const response = await fetch('photos/index.json');
            if (response.ok) {
                const data = await response.json();
                photos = data.photos || [];
            }
        } catch (e) {
            // No photos yet - that's ok!
            photos = [];
        }
        renderGallery();
    }

    function renderGallery() {
        galleryGrid.innerHTML = '';
        if (photos.length === 0) {
            galleryEmpty.style.display = 'block';
            return;
        }
        galleryEmpty.style.display = 'none';
        photos.forEach((photo, i) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `<img src="photos/${photo}" alt="Jude's photo" loading="lazy">`;
            item.addEventListener('click', () => openLightbox(i));
            galleryGrid.appendChild(item);
        });
    }

    function openLightbox(index) {
        currentPhotoIndex = index;
        lightboxImg.src = `photos/${photos[index]}`;
        lightbox.classList.remove('hidden');
    }

    function closeLightbox() {
        lightbox.classList.add('hidden');
    }

    // ===== MUSIC (chiptune generated with Web Audio API) =====
    function initAudio() {
        if (audioCtx) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    function playChiptune() {
        if (!audioCtx) initAudio();
        if (audioCtx.state === 'suspended') audioCtx.resume();

        // Simple happy melody
        const melody = [
            { note: 523, dur: 0.2 }, // C5
            { note: 587, dur: 0.2 }, // D5
            { note: 659, dur: 0.2 }, // E5
            { note: 523, dur: 0.2 }, // C5
            { note: 659, dur: 0.3 }, // E5
            { note: 784, dur: 0.4 }, // G5
            { note: 784, dur: 0.4 }, // G5
            { note: 698, dur: 0.2 }, // F5
            { note: 659, dur: 0.2 }, // E5
            { note: 587, dur: 0.2 }, // D5
            { note: 523, dur: 0.2 }, // C5
            { note: 587, dur: 0.3 }, // D5
            { note: 523, dur: 0.3 }, // C5
            { note: 440, dur: 0.4 }, // A4
            { note: 523, dur: 0.4 }, // C5
        ];

        let time = audioCtx.currentTime;
        melody.forEach(({ note, dur }) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'square';
            osc.frequency.value = note;
            gain.gain.setValueAtTime(0.08, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.02);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time);
            osc.stop(time + dur);
            time += dur;
        });

        // Loop it
        if (musicPlaying) {
            const totalDur = melody.reduce((sum, n) => sum + n.dur, 0);
            setTimeout(() => {
                if (musicPlaying) playChiptune();
            }, totalDur * 1000 + 500);
        }
    }

    function toggleMusic() {
        musicPlaying = !musicPlaying;
        if (musicPlaying) {
            soundBtn.textContent = '🔊';
            playChiptune();
        } else {
            soundBtn.textContent = '♫';
        }
    }

    // ===== START GAME =====
    function startGame() {
        titleScreen.classList.add('hidden');
        gameWorld.classList.remove('hidden');
        gameStarted = true;
        loadPhotos();
        renderJude(); // Draw initial sprite
        renderAllIcons(); // Draw all world object icons
        updateCamera();
        showSpeech("Hi! I'm JUDE! Use ← → arrow keys to explore my world. Walk up to things and press SPACE or ENTER!");
        gameLoop();
    }

    // ===== SPRITE RENDERING =====
    const spriteCanvas = document.getElementById('jude-sprite');

    function renderJude() {
        const frameIndex = isWalking ? walkFrame : 0;
        drawSprite(spriteCanvas, spriteFrames[frameIndex], facingLeft);
    }

    // ===== MOVEMENT =====
    function updateJude() {
        if (!gameStarted) return;

        let moving = false;

        if (keys['ArrowLeft'] || keys['a'] || keys['mobileLeft']) {
            judeX = Math.max(20, judeX - MOVE_SPEED);
            facingLeft = true;
            moving = true;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['mobileRight']) {
            judeX = Math.min(WORLD_WIDTH - 60, judeX + MOVE_SPEED);
            facingLeft = false;
            moving = true;
        }

        isWalking = moving;

        // Walk animation cycle
        if (moving) {
            walkTimer++;
            if (walkTimer >= 8) { // change frame every 8 ticks
                walkTimer = 0;
                walkFrame = (walkFrame + 1) % 4;
            }
        } else {
            walkFrame = 0;
            walkTimer = 0;
        }

        renderJude();

        jude.style.left = judeX + 'px';
        updateCamera();
        checkNearby();
    }

    function updateCamera() {
        viewportWidth = window.innerWidth;
        // Keep Jude roughly centered
        let targetCam = judeX - viewportWidth / 2 + 24;
        targetCam = Math.max(0, Math.min(targetCam, WORLD_WIDTH - viewportWidth));
        cameraX += (targetCam - cameraX) * 0.1;
        ground.style.transform = `translateX(${-cameraX}px)`;
    }

    function checkNearby() {
        const objects = document.querySelectorAll('.world-object');
        let closest = null;
        let closestDist = Infinity;

        objects.forEach(obj => {
            const objLeft = obj.offsetLeft;
            const dist = Math.abs(judeX + 24 - objLeft - 24);
            obj.classList.remove('nearby');

            if (dist < INTERACTION_DISTANCE && dist < closestDist) {
                closest = obj;
                closestDist = dist;
            }
        });

        if (closest) {
            closest.classList.add('nearby');
            nearbyObject = closest;
        } else {
            nearbyObject = null;
        }
    }

    function interact() {
        if (nearbyObject) {
            const name = nearbyObject.dataset.name;
            const info = objectInfo[name];
            if (info) {
                if (info.body === 'gallery') {
                    openGallery();
                } else {
                    openInfo(info.title, info.body);
                }
                // Sparkle effect
                createSparkles(nearbyObject);
            }
        }
    }

    function createSparkles(element) {
        const rect = element.getBoundingClientRect();
        for (let i = 0; i < 6; i++) {
            const spark = document.createElement('div');
            spark.className = 'sparkle';
            spark.style.left = (rect.left + Math.random() * rect.width) + 'px';
            spark.style.top = (rect.top + Math.random() * rect.height) + 'px';
            spark.style.position = 'fixed';
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 800);
        }
    }

    // ===== SPEECH BUBBLE =====
    function showSpeech(text) {
        speechText.textContent = '';
        speechBubble.classList.remove('hidden');

        // Typewriter effect
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                speechText.textContent += text[i];
                i++;
            } else {
                clearInterval(interval);
            }
        }, 30);

        // Auto-dismiss after a while
        setTimeout(() => {
            speechBubble.classList.add('hidden');
        }, Math.max(4000, text.length * 50 + 2000));
    }

    // ===== MODALS =====
    function openInfo(title, body) {
        infoTitle.textContent = title;
        infoBody.innerHTML = body;
        infoModal.classList.remove('hidden');
        speechBubble.classList.add('hidden');
    }

    function openGallery() {
        loadPhotos();
        galleryModal.classList.remove('hidden');
        speechBubble.classList.add('hidden');
    }

    function closeAllModals() {
        infoModal.classList.add('hidden');
        galleryModal.classList.add('hidden');
        lightbox.classList.add('hidden');
    }

    // ===== GAME LOOP =====
    function gameLoop() {
        updateJude();
        requestAnimationFrame(gameLoop);
    }

    // ===== EVENTS =====

    // Start button
    startBtn.addEventListener('click', () => {
        initAudio();
        startGame();
    });

    // Keyboard
    document.addEventListener('keydown', (e) => {
        keys[e.key] = true;

        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            if (!gameStarted) {
                startGame();
            } else if (!infoModal.classList.contains('hidden') || !galleryModal.classList.contains('hidden')) {
                closeAllModals();
            } else {
                interact();
            }
        }

        if (e.key === 'Escape') {
            closeAllModals();
            speechBubble.classList.add('hidden');
        }
    });

    document.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    // Mobile controls
    function addMobileControl(btn, key) {
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys[key] = true;
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[key] = false;
        });
        btn.addEventListener('mousedown', () => keys[key] = true);
        btn.addEventListener('mouseup', () => keys[key] = false);
        btn.addEventListener('mouseleave', () => keys[key] = false);
    }

    addMobileControl(ctrlLeft, 'mobileLeft');
    addMobileControl(ctrlRight, 'mobileRight');
    ctrlAction.addEventListener('click', interact);
    ctrlAction.addEventListener('touchstart', (e) => {
        e.preventDefault();
        interact();
    });

    // Click on objects
    document.querySelectorAll('.world-object').forEach(obj => {
        obj.addEventListener('click', () => {
            const name = obj.dataset.name;
            const info = objectInfo[name];
            if (info) {
                if (info.body === 'gallery') {
                    openGallery();
                } else {
                    openInfo(info.title, info.body);
                }
                createSparkles(obj);
            }
        });
    });

    // Sound
    soundBtn.addEventListener('click', toggleMusic);

    // Home button - back to title screen
    const homeBtn = document.getElementById('home-btn');
    homeBtn.addEventListener('click', () => {
        gameStarted = false;
        musicPlaying = false;
        soundBtn.textContent = '♫';
        gameWorld.classList.add('hidden');
        titleScreen.classList.remove('hidden');
        speechBubble.classList.add('hidden');
        closeAllModals();
        // Reset position
        judeX = 100;
        cameraX = 0;
        keys = {};
    });

    // Gallery button in HUD
    galleryBtn.addEventListener('click', openGallery);

    // Speech close
    speechClose.addEventListener('click', () => speechBubble.classList.add('hidden'));

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Modal backdrop click
    [infoModal, galleryModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAllModals();
        });
    });

    // Lightbox
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    lightboxPrev.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex - 1 + photos.length) % photos.length;
        lightboxImg.src = `photos/${photos[currentPhotoIndex]}`;
    });
    lightboxNext.addEventListener('click', () => {
        currentPhotoIndex = (currentPhotoIndex + 1) % photos.length;
        lightboxImg.src = `photos/${photos[currentPhotoIndex]}`;
    });

    // Resize
    window.addEventListener('resize', () => {
        viewportWidth = window.innerWidth;
    });

    // Prevent scrolling
    document.addEventListener('touchmove', (e) => {
        if (gameStarted) e.preventDefault();
    }, { passive: false });

})();
