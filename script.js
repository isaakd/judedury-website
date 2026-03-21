// ===== JUDE'S WORLD - Main Game Script =====

(function () {
    'use strict';

    // ===== CONFIG =====
    const WORLD_WIDTH = 3200;
    const MOVE_SPEED = 4;
    const INTERACTION_DISTANCE = 80;

    // ===== STATE =====
    let gameStarted = false;
    let judeX = 100;
    let cameraX = 0;
    let viewportWidth = window.innerWidth;
    let facingLeft = false;
    let isWalking = false;
    let keys = {};
    let nearbyObject = null;
    let musicPlaying = false;
    let audioCtx = null;

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
        updateCamera();
        showSpeech("Hi! I'm JUDE! Use ← → arrow keys to explore my world. Walk up to things and press SPACE or ENTER!");
        gameLoop();
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

        if (moving !== isWalking) {
            isWalking = moving;
            jude.classList.toggle('walking', moving);
        }

        if (facingLeft) {
            jude.classList.add('facing-left');
        } else {
            jude.classList.remove('facing-left');
        }

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
