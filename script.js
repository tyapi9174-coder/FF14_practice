const initialParty = [
    {
        role: "MT",
        job: "暗黒騎士",
        debuffs: [
            { name: "光", time: 20.0 },
            { name: "鎖", time: 12.5 }
        ]
    },
    {
        role: "ST",
        job: "ナイト",
        debuffs: [
            { name: "闇", time: 20.0 }
        ]
    },
    {
        role: "H1",
        job: "白魔導士",
        debuffs: [
            { name: "光", time: 18.0 }
        ]
    },
    {
        role: "H2",
        job: "学者",
        debuffs: []
    },
    {
        role: "D1",
        job: "侍",
        debuffs: [
            { name: "光", time: 20.0 },
            { name: "頭割り", time: 8.0 }
        ]
    },
    {
        role: "D2",
        job: "ヴァイパー",
        debuffs: [
            { name: "闇", time: 20.0 }
        ]
    },
    {
        role: "D3",
        job: "踊り子",
        debuffs: []
    },
    {
        role: "D4",
        job: "ピクトマンサー",
        debuffs: [
            { name: "鎖", time: 15.0 }
        ]
    }
];

let party = JSON.parse(JSON.stringify(initialParty));

const partyList = document.getElementById("party-list");
const startButton = document.getElementById("start-button");
const pauseButton = document.getElementById("pause-button");
const resetButton = document.getElementById("reset-button");
const battleTimer = document.getElementById("battle-timer");
const player = document.getElementById("player");
const field = document.querySelector(".field");

let timerId = null;
let battleTime = 0;

let playerX = 240;
let playerY = 240;

const playerRadius = 17;
const fieldRadius = 240;
const moveSpeed = 8;

function createDebuffHtml(debuffs) {
    if (debuffs.length === 0) {
        return `<div class="no-debuff">デバフなし</div>`;
    }

    return debuffs
        .map(debuff => `
            <div class="debuff-item">
                <div class="debuff-name">${debuff.name}</div>
                <div class="debuff-time">${debuff.time.toFixed(1)}</div>
            </div>
        `)
        .join("");
}

function renderParty() {
    partyList.innerHTML = "";

    party.forEach(member => {
        partyList.innerHTML += `
            <div class="party-member">
                <div class="member-info">
                    <span class="role">${member.role}</span>
                    <span class="job">${member.job}</span>
                </div>

                <div class="debuff-list">
                    ${createDebuffHtml(member.debuffs)}
                </div>
            </div>
        `;
    });
}

function updateTimers() {
    party.forEach(member => {
        member.debuffs.forEach(debuff => {
            if (debuff.time > 0) {
                debuff.time -= 0.1;

                if (debuff.time < 0) {
                    debuff.time = 0;
                }
            }
        });
    });

    battleTime += 0.1;
    battleTimer.textContent = battleTime.toFixed(1);

    renderParty();
}

function startTimer() {
    if (timerId !== null) {
        return;
    }

    timerId = setInterval(updateTimers, 100);
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
}

function resetTimer() {
    pauseTimer();

    party = JSON.parse(JSON.stringify(initialParty));
    battleTime = 0;

    playerX = 240;
    playerY = 240;

    battleTimer.textContent = "00.0";

    renderParty();
    updatePlayerPosition();
}

function updatePlayerPosition() {
    player.style.left = `${playerX - playerRadius}px`;
    player.style.top = `${playerY - playerRadius}px`;
}

function canMoveTo(nextX, nextY) {
    const centerX = fieldRadius;
    const centerY = fieldRadius;

    const distanceX = nextX - centerX;
    const distanceY = nextY - centerY;

    const distanceFromCenter = Math.sqrt(
        distanceX * distanceX +
        distanceY * distanceY
    );

    return distanceFromCenter <= fieldRadius - playerRadius;
}

document.addEventListener("keydown", function(event) {
    let nextX = playerX;
    let nextY = playerY;

    switch (event.key.toLowerCase()) {
        case "w":
            nextY -= moveSpeed;
            break;

        case "s":
            nextY += moveSpeed;
            break;

        case "a":
            nextX -= moveSpeed;
            break;

        case "d":
            nextX += moveSpeed;
            break;

        default:
            return;
    }

    event.preventDefault();

    if (canMoveTo(nextX, nextY)) {
        playerX = nextX;
        playerY = nextY;

        updatePlayerPosition();
    }
});

startButton.addEventListener("click", startTimer);
pauseButton.addEventListener("click", pauseTimer);
resetButton.addEventListener("click", resetTimer);

renderParty();
updatePlayerPosition();