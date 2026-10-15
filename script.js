// Wait until a video knows its size (or give up after 3 seconds)
function waitForVideo(video) {
    if (video.readyState >= 1) return Promise.resolve();

    const loaded = new Promise(resolve => {
        video.addEventListener("loadedmetadata", resolve, { once: true });
        video.addEventListener("error", resolve, { once: true });
    });
    const timeout = new Promise(resolve => setTimeout(resolve, 3000));
    return Promise.race([loaded, timeout]);
}

window.addEventListener("load", async () => {
    const row = document.querySelector(".image-row");
    const originals = Array.from(row.children);

    // Make sure videos have a real width before measuring the row
    const videos = originals.filter(item => item.tagName === "VIDEO");
    await Promise.all(videos.map(waitForVideo));

    // Copy an item to the end of the row (and make sure copied videos play)
    function appendCopy(item) {
        const copy = item.cloneNode(true);
        row.appendChild(copy);
        if (copy.tagName === "VIDEO") {
            copy.muted = true;
            copy.play().catch(() => {});
        }
    }

    // Step 1: repeat the set until the row is wider than the screen
    const targetWidth = Math.max(window.innerWidth, screen.width);
    let tries = 0;
    while (row.offsetWidth < targetWidth && tries < 20) {
        originals.forEach(appendCopy);
        tries++;
    }

    // Step 2: set the speed (about 100px per second)
    const setWidth = row.offsetWidth;
    row.style.animationDuration = (setWidth / 100) + "s";

    // Step 3: duplicate everything once more so -50% loops seamlessly
    Array.from(row.children).forEach(appendCopy);

    row.classList.add("ready");
});
/* ---------- CONFETTI ---------- */
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let pieces = [];
const colors = ["#ff4f9a", "#ffd23f", "#4fd1ff", "#7dff6b", "#b46bff", "#ff8a3d"];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function burst(count, x, y) {
    for (let i = 0; i < count; i++) {
        pieces.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 14,
            vy: Math.random() * -14 - 3,
            size: 6 + Math.random() * 7,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3
        });
    }
}

function drawConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(p => {
        p.vy += 0.25;          // gravity
        p.vx *= 0.99;          // air drag
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
    });

    // remove pieces that fell off the screen
    pieces = pieces.filter(p => p.y < canvas.height + 30);
    requestAnimationFrame(drawConfetti);
}
drawConfetti();

// Big burst when the page opens
window.addEventListener("load", () => {
    setTimeout(() => burst(200, window.innerWidth / 2, window.innerHeight / 3), 400);
});

// Small burst wherever you click
document.addEventListener("click", e => burst(40, e.clientX, e.clientY));


/* ---------- TYPING EFFECT ---------- */
const typed = document.getElementById("typed");
const fullText = typed.textContent;
typed.textContent = "";
typed.classList.add("typing");

let charIndex = 0;
const typer = setInterval(() => {
    typed.textContent += fullText[charIndex];
    charIndex++;
    if (charIndex >= fullText.length) {
        clearInterval(typer);
        typed.classList.remove("typing");
    }
}, 45);


/* ---------- FLOATING BALLOONS ---------- */
const balloonEmojis = ["🎈", "🎈", "🎈", "🎉", "💖", "🎂"];

function launchBalloon() {
    const b = document.createElement("span");
    b.className = "balloon";
    b.textContent = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
    b.style.left = Math.random() * 95 + "vw";
    b.style.animationDuration = 6 + Math.random() * 6 + "s";
    document.body.appendChild(b);
    b.addEventListener("animationend", () => b.remove());
}
setInterval(launchBalloon, 1200);


/* ---------- SURPRISE POPUP ---------- */
const modal = document.getElementById("modal");

document.getElementById("surpriseBtn").addEventListener("click", e => {
    e.stopPropagation();
    modal.classList.remove("hidden");
    burst(250, window.innerWidth / 2, window.innerHeight / 2);
});

document.getElementById("closeBtn").addEventListener("click", e => {
    e.stopPropagation();
    modal.classList.add("hidden");
});


/* ---------- MUSIC BUTTON ---------- */
const music = document.getElementById("music");
const musicBtn = document.getElementById("musicBtn");

musicBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (music.paused) {
        music.play();
        musicBtn.textContent = "⏸ Pause music";
    } else {
        music.pause();
        musicBtn.textContent = "🎵 Play music";
    }
});
/* ---------- BIRTHDAY CAKE ---------- */
const candles = document.querySelectorAll(".candle");
const cakeText = document.getElementById("cakeText");
const relightBtn = document.getElementById("relightBtn");

function checkCandles() {
    const left = document.querySelectorAll(".candle:not(.out)").length;

    if (left === 0) {
        cakeText.textContent = "🎉 Make a wish, Ashley! 🎉";
        burst(300, window.innerWidth / 2, window.innerHeight / 2);
    } else {
        cakeText.textContent = left + " more to go... 💨";
    }
}

candles.forEach(candle => {
    candle.addEventListener("click", e => {
        e.stopPropagation();
        candle.classList.add("out");
        checkCandles();
    });
});

relightBtn.addEventListener("click", e => {
    e.stopPropagation();
    candles.forEach(candle => candle.classList.remove("out"));
    cakeText.textContent = "Click the candles to blow them out! 🕯️";
});
/* ---------- LETTER PILE ---------- */
const letters = document.querySelectorAll(".letter");
const letterModal = document.getElementById("letterModal");
const letterTitle = document.getElementById("letterTitle");
const letterText = document.getElementById("letterText");

letters.forEach(letter => {
    letter.addEventListener("click", e => {
        e.stopPropagation();
        letterTitle.textContent = letter.dataset.title;
        letterText.textContent = letter.dataset.msg;
        letterModal.classList.remove("hidden");
        letter.classList.add("opened");
        burst(60, e.clientX, e.clientY);
    });
});

document.getElementById("letterClose").addEventListener("click", e => {
    e.stopPropagation();
    letterModal.classList.add("hidden");
});

// clicking the dark background also closes it
letterModal.addEventListener("click", e => {
    if (e.target === letterModal) {
        letterModal.classList.add("hidden");
    }
});