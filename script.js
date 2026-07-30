/* =========================
   コンテンツ・フェーズ設定
========================= */

const phaseData = {
    P1: {
        title: "P1：フェイトブレイカー",
        message: "P1の練習内容は準備中です。"
    },

    P2: {
        title: "P2：シヴァ・ミトロン",
        message: "P2の練習内容は準備中です。"
    },

    P3: {
        title: "P3：時間圧縮・絶"
    },

    P4: {
        title: "P4：最終フェーズ前半",
        message: "P4の練習内容は準備中です。"
    },

    P5: {
        title: "P5：最終フェーズ後半",
        message: "P5の練習内容は準備中です。"
    }
};

/*
    P3の仮デバフセット。

    現在は仕組みを作るための仮データ。
    あとから実際の組み合わせに差し替える。
*/
const phase3DebuffSets = {
    earlyFire: {
        label: "早ファイガ",
        debuffs: [
            { name: "ファイガ", time: 11.0 },
            { name: "リターン", time: 16.0 },
            { name: "ホーリー", time: 21.0 },
            { name: "エラプ", time: 43.0 }
        ]
    },

    middleFire: {
        label: "中ファイガ",
        debuffs: [
            { name: "ファイガ", time: 21.0 },
            { name: "リターン", time: 16.0 },
            { name: "エラプ", time: 43.0 }
        ]
    },

    lateFire: {
        label: "遅ファイガ",
        debuffs: [
            { name: "ファイガ", time: 31.0 },
            { name: "リターン", time: 26.0 },
            { name: "視線", time: 43.0 }

        ]
    },

    blizzard: {
        label: "ブリザガ",
        debuffs: [
            { name: "ブリザガ", time: 21.0 },
            { name: "ホーリー", time: 11.0 },
            { name: "リターン", time: 26.0 },
            { name: "視線", time: 43.0 }

        ]
    }
};

/* =========================
   パーティー基本データ
========================= */

const baseParty = [
    {
        role: "MT",
        job: "暗黒騎士",
        debuffs: []
    },
    {
        role: "ST",
        job: "ナイト",
        debuffs: []
    },
    {
        role: "H1",
        job: "白魔導士",
        debuffs: []
    },
    {
        role: "H2",
        job: "学者",
        debuffs: []
    },
    {
        role: "D1",
        job: "侍",
        debuffs: []
    },
    {
        role: "D2",
        job: "ヴァイパー",
        debuffs: []
    },
    {
        role: "D3",
        job: "踊り子",
        debuffs: []
    },
    {
        role: "D4",
        job: "ピクトマンサー",
        debuffs: []
    }
];

let party = cloneData(baseParty);

/* =========================
   HTML要素
========================= */

const partyList =
    document.getElementById("party-list");

const startButton =
    document.getElementById("start-button");

const pauseButton =
    document.getElementById("pause-button");

const resetButton =
    document.getElementById("reset-button");

const battleTimer =
    document.getElementById("battle-timer");

const player =
    document.getElementById("player");

const field =
    document.querySelector(".field");

const phaseTitle =
    document.getElementById("phase-title");

const phaseOptions =
    document.getElementById("phase-options");

const phaseButtons =
    document.querySelectorAll(".phase-button");

/* =========================
   全体状態
========================= */

let selectedPhase = "P3";

let timerId = null;
let battleTime = 0;

/* =========================
   プレイヤー設定
========================= */

const controlledRole = "ST";

let playerX = 240;
let playerY = 240;

const playerRadius = 17;
const fieldRadius = 240;
const moveSpeed = 220;

const pressedKeys = {
    w: false,
    a: false,
    s: false,
    d: false
};

let previousAnimationTime = null;

/* =========================
   フィールド上の初期配置
========================= */

const fieldPositions = {
    MT: { x: 240, y: 75 },
    H1: { x: 120, y: 145 },
    H2: { x: 360, y: 145 },
    D1: { x: 90, y: 285 },
    D2: { x: 390, y: 285 },
    D3: { x: 155, y: 390 },
    D4: { x: 325, y: 390 }
};

/* =========================
   共通処理
========================= */

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

function getRoleType(role) {
    if (role === "MT" || role === "ST") {
        return "tank";
    }

    if (role === "H1" || role === "H2") {
        return "healer";
    }

    return "dps";
}

function getRandomItem(array) {
    const randomIndex =
        Math.floor(Math.random() * array.length);

    return array[randomIndex];
}

function getPhase3SetKeys() {
    return Object.keys(phase3DebuffSets);
}

/* =========================
   フェーズUI
========================= */

function selectPhase(phase) {
    selectedPhase = phase;

    phaseButtons.forEach(button => {
        const isSelected =
            button.dataset.phase === selectedPhase;

        button.classList.toggle(
            "active",
            isSelected
        );
    });

    phaseTitle.textContent =
        phaseData[selectedPhase].title;

    resetBattleState();
    renderPhaseOptions();
}

function renderPhaseOptions() {
    if (selectedPhase === "P3") {
        renderPhase3Options();
        return;
    }

    phaseOptions.innerHTML = `
        <div class="phase-option-box">
            <div class="preparing-message">
                ${phaseData[selectedPhase].message}
            </div>
        </div>
    `;
}

function renderPhase3Options() {
    phaseOptions.innerHTML = `
        <div class="phase-option-box">

            <div class="phase-option-row">
                <strong>配布モード</strong>

                <label>
                    <input
                        type="radio"
                        name="assignment-mode"
                        value="random"
                        checked
                    >
                    完全ランダム
                </label>

                <label>
                    <input
                        type="radio"
                        name="assignment-mode"
                        value="specified"
                    >
                    自分だけ指定
                </label>
            </div>

            <div class="phase-option-row">
                <label for="self-debuff-select">
                    自分のデバフ
                </label>

                <select id="self-debuff-select" disabled>
                    <option value="earlyFire">
                        早ファイガ
                    </option>

                    <option value="middleFire">
                        中ファイガ
                    </option>

                    <option value="lateFire">
                        遅ファイガ
                    </option>

                    <option value="blizzard">
                        ブリザガ
                    </option>
                </select>

                <button
                    id="assign-debuff-button"
                    class="option-button"
                >
                    デバフ配布
                </button>
            </div>

        </div>
    `;

    const modeButtons =
        document.querySelectorAll(
            'input[name="assignment-mode"]'
        );

    const selfDebuffSelect =
        document.getElementById(
            "self-debuff-select"
        );

    const assignDebuffButton =
        document.getElementById(
            "assign-debuff-button"
        );

    modeButtons.forEach(button => {
        button.addEventListener(
            "change",
            function() {
                selfDebuffSelect.disabled =
                    this.value !== "specified";
            }
        );
    });

    assignDebuffButton.addEventListener(
        "click",
        assignPhase3Debuffs
    );
}

/* =========================
   P3デバフ配布
========================= */

function assignPhase3Debuffs() {
    if (selectedPhase !== "P3") {
        return;
    }

    const selectedMode =
        document.querySelector(
            'input[name="assignment-mode"]:checked'
        ).value;

    const selectedSelfSet =
        document.getElementById(
            "self-debuff-select"
        ).value;

    const setKeys = getPhase3SetKeys();

    party.forEach(member => {
        let assignedSetKey;

        if (
            selectedMode === "specified" &&
            member.role === controlledRole
        ) {
            assignedSetKey = selectedSelfSet;
        } else {
            assignedSetKey =
                getRandomItem(setKeys);
        }

        member.debuffs = cloneData(
            phase3DebuffSets[
                assignedSetKey
            ].debuffs
        );
    });

    battleTime = 0;
    battleTimer.textContent = "00.0";

    renderParty();
}

/* =========================
   パーティーリスト表示
========================= */

function createDebuffHtml(debuffs) {
    if (debuffs.length === 0) {
        return `
            <div class="no-debuff">
                デバフなし
            </div>
        `;
    }

    return debuffs
        .map(debuff => `
            <div class="debuff-item">
                <div class="debuff-name">
                    ${debuff.name}
                </div>

                <div class="debuff-time">
                    ${debuff.time.toFixed(1)}
                </div>
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
                    <span class="role">
                        ${member.role}
                    </span>

                    <span class="job">
                        ${member.job}
                    </span>
                </div>

                <div class="debuff-list">
                    ${createDebuffHtml(
                        member.debuffs
                    )}
                </div>
            </div>
        `;
    });
}

/* =========================
   フィールド上のPT表示
========================= */

function renderFieldMembers() {
    const oldMembers =
        field.querySelectorAll(
            ".field-member"
        );

    oldMembers.forEach(member => {
        member.remove();
    });

    party.forEach(member => {
        if (member.role === controlledRole) {
            return;
        }

        const position =
            fieldPositions[member.role];

        if (!position) {
            return;
        }

        const marker =
            document.createElement("div");

        marker.className =
            `field-member ${getRoleType(member.role)}`;

        marker.style.left =
            `${position.x}px`;

        marker.style.top =
            `${position.y}px`;

        marker.innerHTML = `
            ${member.role}

            <div class="field-member-label">
                ${member.job}
            </div>
        `;

        field.appendChild(marker);
    });
}

/* =========================
   バトルタイマー
========================= */

function updateTimers() {
    party.forEach(member => {
        member.debuffs.forEach(debuff => {
            if (debuff.time <= 0) {
                return;
            }

            debuff.time -= 0.1;

            if (debuff.time < 0) {
                debuff.time = 0;
            }
        });
    });

    battleTime += 0.1;

    battleTimer.textContent =
        battleTime.toFixed(1);

    renderParty();
}

function startTimer() {
    if (timerId !== null) {
        return;
    }

    timerId = setInterval(
        updateTimers,
        100
    );
}

function pauseTimer() {
    clearInterval(timerId);
    timerId = null;
}

/* =========================
   リセット処理
========================= */

function resetBattleState() {
    pauseTimer();

    party = cloneData(baseParty);

    battleTime = 0;

    playerX = 240;
    playerY = 240;

    pressedKeys.w = false;
    pressedKeys.a = false;
    pressedKeys.s = false;
    pressedKeys.d = false;

    battleTimer.textContent = "00.0";

    renderParty();
    renderFieldMembers();
    updatePlayerPosition();
}

function resetTimer() {
    resetBattleState();
}

/* =========================
   プレイヤー移動
========================= */

function updatePlayerPosition() {
    player.style.left =
        `${playerX - playerRadius}px`;

    player.style.top =
        `${playerY - playerRadius}px`;
}

function canMoveTo(nextX, nextY) {
    const distanceX =
        nextX - fieldRadius;

    const distanceY =
        nextY - fieldRadius;

    const distanceFromCenter =
        Math.sqrt(
            distanceX * distanceX +
            distanceY * distanceY
        );

    return (
        distanceFromCenter <=
        fieldRadius - playerRadius
    );
}

function updatePlayerMovement(deltaTime) {
    let directionX = 0;
    let directionY = 0;

    if (pressedKeys.w) {
        directionY -= 1;
    }

    if (pressedKeys.s) {
        directionY += 1;
    }

    if (pressedKeys.a) {
        directionX -= 1;
    }

    if (pressedKeys.d) {
        directionX += 1;
    }

    if (
        directionX !== 0 &&
        directionY !== 0
    ) {
        const diagonalAdjustment =
            Math.sqrt(2);

        directionX /=
            diagonalAdjustment;

        directionY /=
            diagonalAdjustment;
    }

    const nextX =
        playerX +
        directionX *
        moveSpeed *
        deltaTime;

    const nextY =
        playerY +
        directionY *
        moveSpeed *
        deltaTime;

    if (canMoveTo(nextX, nextY)) {
        playerX = nextX;
        playerY = nextY;

        updatePlayerPosition();
    }
}

function gameLoop(currentTime) {
    if (previousAnimationTime === null) {
        previousAnimationTime =
            currentTime;
    }

    const deltaTime =
        Math.min(
            (currentTime -
                previousAnimationTime) /
                1000,
            0.05
        );

    previousAnimationTime =
        currentTime;

    updatePlayerMovement(deltaTime);

    requestAnimationFrame(gameLoop);
}

/* =========================
   キー操作
========================= */

document.addEventListener(
    "keydown",
    function(event) {
        const key =
            event.key.toLowerCase();

        if (key in pressedKeys) {
            pressedKeys[key] = true;
            event.preventDefault();
        }
    }
);

document.addEventListener(
    "keyup",
    function(event) {
        const key =
            event.key.toLowerCase();

        if (key in pressedKeys) {
            pressedKeys[key] = false;
            event.preventDefault();
        }
    }
);

window.addEventListener(
    "blur",
    function() {
        pressedKeys.w = false;
        pressedKeys.a = false;
        pressedKeys.s = false;
        pressedKeys.d = false;
    }
);

/* =========================
   ボタン
========================= */

startButton.addEventListener(
    "click",
    startTimer
);

pauseButton.addEventListener(
    "click",
    pauseTimer
);

resetButton.addEventListener(
    "click",
    resetTimer
);

phaseButtons.forEach(button => {
    button.addEventListener(
        "click",
        function() {
            selectPhase(
                this.dataset.phase
            );
        }
    );
});

/* =========================
   初期表示
========================= */

renderPhaseOptions();
renderParty();
renderFieldMembers();
updatePlayerPosition();

requestAnimationFrame(gameLoop);