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
    const actionGuide =
    document.getElementById(
        "action-guide"
    );

const actionGuideTitle =
    document.getElementById(
        "action-guide-title"
    );

const actionGuideRole =
    document.getElementById(
        "action-guide-role"
    );

const actionGuideList =
    document.getElementById(
        "action-guide-list"
    );

/* =========================
   全体状態
========================= */

let selectedPhase = "P3";

let timerId = null;
let battleTime = 0;

/*
    P3の①〜⑥の時間区切り。

    endTimeに到達すると、
    次の行動へ切り替わる。
*/
const phase3ActionTimeline = [
    {
        step: 1,
        startTime: 0,
        endTime: 11
    },
    {
        step: 2,
        startTime: 11,
        endTime: 16
    },
    {
        step: 3,
        startTime: 16,
        endTime: 21
    },
    {
        step: 4,
        startTime: 21,
        endTime: 26
    },
    {
        step: 5,
        startTime: 26,
        endTime: 31
    },
    {
        step: 6,
        startTime: 31,
        endTime: 40
    }
];

let currentActionStep = null;

/* =========================
   プレイヤー設定
========================= */

let controlledRole = "ST";

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
    ST: { x: 240, y: 240 },
    H1: { x: 120, y: 145 },
    H2: { x: 360, y: 145 },
    D1: { x: 90, y: 285 },
    D2: { x: 390, y: 285 },
    D3: { x: 155, y: 390 },
    D4: { x: 325, y: 390 }
};

/* =========================
   P3専用フィールドデータ
========================= */

/*
    フィールドは480 × 480。
    中心は x:240、y:240。

    markerPointsのidは、
    将来の正解位置判定でも使用する。
*/
const phase3FieldData = {
    center: {
        x: 240,
        y: 240
    },

    /*
        黄色線。

        northが二等辺三角形の頂点方向。
        この方向を画面上の北として扱う。
    */
yellowPoints: [
    {
        id: "north",
        x: 240,
        y: 75
    },
    {
        id: "southWest",
        x: 130,
        y: 350
    },
    {
        id: "southEast",
        x: 350,
        y: 350
    }
],

    /*
        紫線。

        現時点では東西方向の基準線として仮配置。
        実際の見た目に合わせて後から座標調整可能。
    */
    purplePoints: [
        {
            id: "west",
            x: 70,
            y: 240
        },
        {
            id: "east",
            x: 410,
            y: 240
        }
    ],

    /*
        緑玉8個。

        idを使って、
        「北西玉が正解」などの判定を作れる。
    */
    markerPoints: [
        {
            id: "north",
            label: "北",
            x: 240,
            y: 75
        },
        {
            id: "northEast",
            label: "北東",
            x: 350,
            y: 130
        },
        {
            id: "east",
            label: "東",
            x: 405,
            y: 240
        },
        {
            id: "southEast",
            label: "南東",
            x: 350,
            y: 350
        },
        {
            id: "south",
            label: "南",
            x: 240,
            y: 405
        },
        {
            id: "southWest",
            label: "南西",
            x: 130,
            y: 350
        },
        {
            id: "west",
            label: "西",
            x: 75,
            y: 240
        },
        {
            id: "northWest",
            label: "北西",
            x: 130,
            y: 130
        }
    ]
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
/*
    P3行動データ用のロール分類。

    MT・ST・H1・H2はTH。
    D1～D4はDPS。
*/
function getActionRoleGroup(role) {
    const thRoles = [
        "MT",
        "ST",
        "H1",
        "H2"
    ];

    if (thRoles.includes(role)) {
        return "TH";
    }

    return "DPS";
}

/*
    現在操作しているパーティーメンバーを取得する。
*/
function getControlledMember() {
    return party.find(
        member => member.role === controlledRole
    );
}

/*
    フィールド上の操作キャラクター表示を更新する。
*/
function updateControlledPlayerAppearance() {
    const controlledMember =
        getControlledMember();

    if (!controlledMember) {
        return;
    }

    player.classList.remove(
        "tank",
        "healer",
        "dps"
    );

    player.classList.add(
        getRoleType(controlledRole)
    );

    player.dataset.role =
        controlledRole;

    player.innerHTML = `
        <span class="player-role">
            ${controlledRole}
        </span>

        <span class="player-you-label">
            YOU
        </span>
    `;
}

/*
    操作するロールを変更する。
*/
function selectControlledRole(role) {
    const roleExists =
        baseParty.some(
            member => member.role === role
        );

    if (!roleExists) {
        return;
    }

    controlledRole = role;

    resetBattleState();
}

function getRandomItem(array) {
    const randomIndex =
        Math.floor(Math.random() * array.length);

    return array[randomIndex];
}

/* P3パターン内のデバフを画面表示用へ変換する */
function convertPatternDebuffs(patternDebuffs) {
    return patternDebuffs.map(debuff => {
        const dictionaryData =
            debuffDictionary[debuff.type];

        return {
            name: dictionaryData
                ? dictionaryData.shortName
                : debuff.type,

            time: debuff.time
        };
    });
}

/* 自分のファイガ／ブリザガ種類を調べる */
function getPhase3AssignmentType(patternDebuffs) {
    const blizzardDebuff =
        patternDebuffs.find(
            debuff => debuff.type === "blizzard"
        );

    if (blizzardDebuff) {
        return "blizzard";
    }

    const fireDebuff =
        patternDebuffs.find(
            debuff => debuff.type === "fire"
        );

    if (!fireDebuff) {
        return null;
    }

    if (fireDebuff.time === 11) {
        return "earlyFire";
    }

    if (fireDebuff.time === 21) {
        return "middleFire";
    }

    if (fireDebuff.time === 31) {
        return "lateFire";
    }

    return null;
}

/* 配列からランダムに1つ取得する */
function getRandomPattern(patterns) {
    if (patterns.length === 0) {
        return null;
    }

    const randomIndex =
        Math.floor(Math.random() * patterns.length);

    return patterns[randomIndex];
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
    renderPhaseField();
    updateActionGuideVisibility();
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
    const roleOptionsHtml =
        baseParty
            .map(member => {
                const selectedAttribute =
                    member.role === controlledRole
                        ? "selected"
                        : "";

                return `
                    <option
                        value="${member.role}"
                        ${selectedAttribute}
                    >
                        ${member.role}：${member.job}
                    </option>
                `;
            })
            .join("");

    phaseOptions.innerHTML = `
        <div class="phase-option-box">

            <div class="phase-option-row">
                <label for="controlled-role-select">
                    <strong>操作プレイヤー</strong>
                </label>

                <select
                    id="controlled-role-select"
                    class="controlled-role-select"
                >
                    ${roleOptionsHtml}
                </select>
            </div>

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

                <select
                    id="self-debuff-select"
                    disabled
                >
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

                <div
                    id="assigned-pattern-name"
                    class="preparing-message"
                >
                    使用パターン：未配布
                </div>
            </div>

        </div>
    `;

    const controlledRoleSelect =
        document.getElementById(
            "controlled-role-select"
        );

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

    controlledRoleSelect.addEventListener(
        "change",
        function() {
            selectControlledRole(
                this.value
            );
        }
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
   P3行動ガイド
========================= */

function createActionGuideHtml(actions) {
    return actions
        .map(action => {
            const detailHtml =
                action.detail
                    ? `
                        <div class="action-guide-detail">
                            ${action.detail}
                        </div>
                    `
                    : "";

            return `
                <li
                    class="action-guide-item"
                    data-action-step="${action.step}"
                >
                    <div class="action-guide-number">
                        ${action.step}
                    </div>

                    <div class="action-guide-content">
                        <div class="action-guide-text">
                            ${action.text}
                        </div>

                        ${detailHtml}
                    </div>
                </li>
            `;
        })
        .join("");
}

function renderPhase3ActionGuide(
    assignmentType
) {
    const roleGroup =
        getActionRoleGroup(
            controlledRole
        );

    const roleActionData =
        phase3ActionData[roleGroup];

    if (!roleActionData) {
        clearActionGuide(
            "対応するロールデータがありません。"
        );

        return;
    }

    const selectedActionData =
        roleActionData[assignmentType];

    if (!selectedActionData) {
        clearActionGuide(
            "対応する行動データがありません。"
        );

        return;
    }

    actionGuide.style.display = "";

    actionGuideTitle.textContent =
        selectedActionData.label;

    actionGuideRole.textContent =
        roleGroup;

    actionGuideList.innerHTML =
        createActionGuideHtml(
            selectedActionData.actions
        );

        currentActionStep = 1;
        updatePhase3ActionGuide();
}

function clearActionGuide(
    message =
        "P3のデバフを配布すると、①〜⑥の動きが表示されます。"
) {
    actionGuideTitle.textContent =
        selectedPhase === "P3"
            ? "デバフ未配布"
            : "このフェーズは準備中";

    actionGuideRole.textContent =
        getActionRoleGroup(
            controlledRole
        );

    actionGuideList.innerHTML = `
        <li class="action-guide-empty">
            ${message}
        </li>
    `;
}

function updateActionGuideVisibility() {
    actionGuide.style.display =
        selectedPhase === "P3"
            ? ""
            : "none";
}

/*
    現在時刻から、
    今どの行動番号かを取得する。
*/
function getCurrentPhase3ActionStep(time) {
    const currentTimeline =
        phase3ActionTimeline.find(item => {
            return (
                time >= item.startTime &&
                time < item.endTime
            );
        });

    if (!currentTimeline) {
        return null;
    }

    return currentTimeline.step;
}

/*
    ①〜⑥の見た目を更新する。
*/
function updatePhase3ActionGuide() {
    if (selectedPhase !== "P3") {
        return;
    }

    const actionItems =
        actionGuideList.querySelectorAll(
            ".action-guide-item"
        );

    if (actionItems.length === 0) {
        return;
    }

    const newActionStep =
        getCurrentPhase3ActionStep(
            battleTime
        );

    currentActionStep =
        newActionStep;

    actionItems.forEach(item => {
        const itemStep =
            Number(
                item.dataset.actionStep
            );

        item.classList.remove(
            "current",
            "completed"
        );

        if (newActionStep === null) {
            if (battleTime >= 40) {
                item.classList.add(
                    "completed"
                );
            }

            return;
        }

        if (itemStep < newActionStep) {
            item.classList.add(
                "completed"
            );
        }

        if (itemStep === newActionStep) {
            item.classList.add(
                "current"
            );
        }
    });
}

/* =========================
   P3デバフ配布
========================= */

function assignPhase3Debuffs() {
    if (selectedPhase !== "P3") {
        return;
    }

    const selectedModeInput =
        document.querySelector(
            'input[name="assignment-mode"]:checked'
        );

    const selfDebuffSelect =
        document.getElementById(
            "self-debuff-select"
        );

    if (
        !selectedModeInput ||
        !selfDebuffSelect
    ) {
        return;
    }

    const selectedMode =
        selectedModeInput.value;

    const selectedSelfType =
        selfDebuffSelect.value;

    let availablePatterns =
        [...phase3Patterns];

    /*
        自分だけ指定の場合は、
        STに指定したファイガ／ブリザガがある
        パターンだけへ絞り込む。
    */
    if (selectedMode === "specified") {
        availablePatterns =
            phase3Patterns.filter(pattern => {
                const selfAssignment =
                    pattern.assignments[
                        controlledRole
                    ];

                if (!selfAssignment) {
                    return false;
                }

                const assignmentType =
                    getPhase3AssignmentType(
                        selfAssignment
                    );

                return (
                    assignmentType ===
                    selectedSelfType
                );
            });
    }

    const selectedPattern =
        getRandomPattern(availablePatterns);

    if (!selectedPattern) {
        alert(
            "指定した条件に合うパターンがありません。"
        );

        return;
    }

    party.forEach(member => {
        const patternDebuffs =
            selectedPattern.assignments[
                member.role
            ];

        if (!patternDebuffs) {
            member.debuffs = [];
            return;
        }

        member.debuffs =
            convertPatternDebuffs(
                patternDebuffs
            );
    });

    battleTime = 0;
    battleTimer.textContent = "00.0";

    const patternNameElement =
        document.getElementById(
            "assigned-pattern-name"
        );

    if (patternNameElement) {
        patternNameElement.textContent =
            `使用パターン：${selectedPattern.name}`;
    }

    renderParty();

const selfPatternDebuffs =
    selectedPattern.assignments[
        controlledRole
    ];

const selfAssignmentType =
    getPhase3AssignmentType(
        selfPatternDebuffs
    );

renderPhase3ActionGuide(
    selfAssignmentType
);

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
        const isControlled =
            member.role === controlledRole;

        const controlledClass =
            isControlled
                ? "is-controlled"
                : "";

        const youBadgeHtml =
            isControlled
                ? `
                    <span class="you-badge">
                        YOU
                    </span>
                `
                : "";

        partyList.innerHTML += `
            <div
                class="party-member ${controlledClass}"
            >
                <div class="member-info">
                    <span class="role">
                        ${member.role}
                    </span>

                    <span class="job">
                        ${member.job}
                    </span>

                    ${youBadgeHtml}
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
   P3専用フィールド表示
========================= */

function createSvgLine(
    startX,
    startY,
    endX,
    endY,
    className
) {
    return `
        <line
            x1="${startX}"
            y1="${startY}"
            x2="${endX}"
            y2="${endY}"
            class="${className}"
        ></line>
    `;
}

function createP3MarkerHtml(marker) {
    return `
        <g
            class="p3-marker"
            data-marker-id="${marker.id}"
            data-marker-label="${marker.label}"
        >
            <circle
                cx="${marker.x}"
                cy="${marker.y}"
                r="17"
                class="p3-green-orb"
            ></circle>

            <circle
                cx="${marker.x - 4}"
                cy="${marker.y - 5}"
                r="5"
                class="p3-green-orb-inner"
            ></circle>
        </g>
    `;
}

function renderPhaseField() {
    const oldPhaseField =
        field.querySelector(
            ".p3-field-object"
        );

    if (oldPhaseField) {
        oldPhaseField.remove();
    }

    field.classList.toggle(
        "p3-active",
        selectedPhase === "P3"
    );

    if (selectedPhase !== "P3") {
        return;
    }

    const center =
        phase3FieldData.center;

    const yellowLinesHtml =
        phase3FieldData.yellowPoints
            .map(point => {
                return createSvgLine(
                    center.x,
                    center.y,
                    point.x,
                    point.y,
                    "p3-yellow-line"
                );
            })
            .join("");

    const purpleLinesHtml =
        phase3FieldData.purplePoints
            .map(point => {
                return createSvgLine(
                    center.x,
                    center.y,
                    point.x,
                    point.y,
                    "p3-purple-line"
                );
            })
            .join("");

    const markersHtml =
        phase3FieldData.markerPoints
            .map(createP3MarkerHtml)
            .join("");

    const phaseField =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

    phaseField.setAttribute(
        "class",
        "p3-field-object"
    );

    phaseField.setAttribute(
        "viewBox",
        "0 0 480 480"
    );

    phaseField.setAttribute(
        "aria-label",
        "P3基準オブジェクト"
    );

    phaseField.innerHTML = `
        ${purpleLinesHtml}
        ${yellowLinesHtml}

        <circle
            cx="${center.x}"
            cy="${center.y}"
            r="43"
            class="p3-center-ring"
        ></circle>

        ${markersHtml}

        <polygon
            points="240,22 229,42 251,42"
            class="p3-north-arrow"
        ></polygon>

        <text
            x="240"
            y="58"
            class="p3-north-label"
        >
            北
        </text>
    `;

    /*
        プレイヤーより手前に出ないように、
        playerの直前へ挿入する。
    */
    field.insertBefore(
        phaseField,
        player
    );
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
    updatePhase3ActionGuide();
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
    currentActionStep = null;

    /*
        選択中のロールの初期位置を取得する。

        fieldPositionsに座標がなければ、
        フィールド中央を使用する。
    */
    const controlledStartPosition =
        fieldPositions[controlledRole] ||
        phase3FieldData.center;

    playerX =
        controlledStartPosition.x;

    playerY =
        controlledStartPosition.y;

    pressedKeys.w = false;
    pressedKeys.a = false;
    pressedKeys.s = false;
    pressedKeys.d = false;

    battleTimer.textContent = "00.0";

    /*
        パーティーリストと
        フィールド上のメンバーを再描画する。
    */
    renderParty();
    renderFieldMembers();

    /*
        操作プレイヤーのロール表示と
        座標表示を更新する。
    */
    updateControlledPlayerAppearance();
    updatePlayerPosition();

    /*
        デバフ配布後に表示される
        パターン名を未配布へ戻す。
    */
    const patternNameElement =
        document.getElementById(
            "assigned-pattern-name"
        );

    if (patternNameElement) {
        patternNameElement.textContent =
            "使用パターン：未配布";
    }

    clearActionGuide();
    updateActionGuideVisibility();
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
renderPhaseField();
renderFieldMembers();

updateControlledPlayerAppearance();
updatePlayerPosition();

clearActionGuide();
updateActionGuideVisibility();

requestAnimationFrame(gameLoop);