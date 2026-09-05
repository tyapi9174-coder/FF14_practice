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
        title: "P4：時間結晶"
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

/*
    P4時間結晶の青線パターン。
    0 = 北東↔南西
    1 = 北西↔南東
*/
let phase4TimeCrystalPatternIndex =
    Math.floor(Math.random() * 2);

let timerId = null;
/*
    P4時間結晶用タイマー
*/
let phase4TimerId = null;
/*
    P4 リターン用
*/
let phase4ReturnActivated = false;
let phase4ReturnPositions = {};
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

/*
    NPC移動で現在適用中の①～⑥。

    行動ガイドとは別に管理し、
    同じ目的地を何度も設定しないようにする。
*/
let currentMovementStep = null;

/*
    P3正解判定設定。

    judgeRadius:
        正解座標から何px以内なら成功とするか。

    judgedSteps:
        すでに判定済みの①～⑥を記録する。

    results:
        各ステップの判定結果を保存する。
*/
const phase3JudgementState = {
    judgeRadius: 48,

    judgedSteps: new Set(),

    results: {}
};

/* =========================
   プレイヤー設定
========================= */

let controlledRole = "ST";


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

/*
    8人全員の現在位置や状態を管理する。

    現時点では座標だけを使用する。
    後から移動状態や向きなどを追加していく。
*/

let actorStates = {};

/*
    操作中ロールに合わせて、
    全actorStateのisControlledを更新する。
*/
function updateControlledActorStates() {
    Object.values(actorStates).forEach(actorState => {
        actorState.isControlled =
            actorState.role === controlledRole;
    });
}

/*
    fieldPositionsをもとに、
    8人分の初期状態を作成する。
*/
function initializeActorStates() {
    actorStates = {};

    baseParty.forEach(member => {
        const startPosition =
            fieldPositions[member.role] ||
            phase3FieldData.center;

        actorStates[member.role] = {
            role: member.role,
            job: member.job,

            x: startPosition.x,
            y: startPosition.y,

            /*
                NPCが向かう目標座標。
                初期状態では現在位置と同じ。
            */
            targetX: startPosition.x,
            targetY: startPosition.y,

            /*
                NPCの移動速度。
                1秒あたり120px。
            */
            moveSpeed: 120,

            isControlled: false
        };
    });

    updateControlledActorStates();
}



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
   P3前半・移動位置データ
========================= */

/*
    緑玉位置はphase3FieldDataと同じ座標。

    outerが付く位置は、
    対応する緑玉よりさらに外周側。
*/
const phase3MovementPositions = {
    center: {
        x: 240,
        y: 240
    },

    /*
        早ファイガTHの⑥専用。
        中央から本当に少しだけ北。
    */
    centerSlightNorth: {
        x: 240,
        y: 220
    },

    northGreen: {
        x: 240,
        y: 75
    },

    northEastGreen: {
        x: 350,
        y: 130
    },

    eastGreen: {
        x: 405,
        y: 240
    },

    southEastGreen: {
        x: 350,
        y: 350
    },

    southGreen: {
        x: 240,
        y: 405
    },

    southWestGreen: {
        x: 130,
        y: 350
    },

    westGreen: {
        x: 75,
        y: 240
    },

    northWestGreen: {
        x: 130,
        y: 130
    },

    northOuter: {
        x: 240,
        y: 20
    },

    northEastOuter: {
        x: 395,
        y: 85
    },

    eastOuter: {
        x: 460,
        y: 240
    },

    southEastOuter: {
        x: 395,
        y: 395
    },

    southOuter: {
        x: 240,
        y: 460
    },

    southWestOuter: {
        x: 85,
        y: 395
    },

    westOuter: {
        x: 20,
        y: 240
    },

    northWestOuter: {
        x: 85,
        y: 85
    }
};

/* =========================
   P3前半・デバフ別移動パターン
========================= */

/*
    positionsの1個目が①、
    2個目が②……6個目が⑥。

    actionは、あとで正解判定画面や
    NPCの行動表示にも利用できる。
*/
const phase3MovementPatterns = {
    /*
        TH
    */

    earlyFireTH: {
        label: "早ファイガTH",

        actions: [
            "ファイガ捨て",
            "リターン設置",
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "中で外周向く"
        ],

        positions: [
            "southOuter",
            "southGreen",
            "center",
            "southGreen",
            "center",
            "centerSlightNorth"
        ]
    },

    middleFireTH: {
        label: "中ファイガTH",

        actions: [
            "頭割り",
            "リターン設置",
            "ファイガ捨て",
            "待機",
            "頭割り",
            "ビーム誘導後、外周向く"
        ],

        positions: [
            "center",
            "westGreen",
            "westOuter",
            "center",
            "center",
            "westGreen"
        ]
    },

    lateFireTH1: {
        label: "遅ファイガTH①",

        actions: [
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "リターン設置",
            "ファイガ捨て",
            "中で外周向く"
        ],

        positions: [
            "center",
            "southWestGreen",
            "center",
            "center",
            "southWestOuter",
            "center"
        ]
    },

    lateFireTH2: {
        label: "遅ファイガTH②",

        actions: [
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "リターン設置",
            "ファイガ捨て",
            "中で外周向く"
        ],

        positions: [
            "center",
            "southEastGreen",
            "center",
            "center",
            "southEastOuter",
            "center"
        ]
    },

    blizzardTH: {
        label: "THブリザガ",

        actions: [
            "ブリザガ捨て",
            "リターン設置",
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "中で外周向く"
        ],

        positions: [
            "center",
            "southGreen",
            "center",
            "southGreen",
            "center",
            "center"
        ]
    },

    /*
        DPS
    */

    earlyFireDPS1: {
        label: "早ファイガDPS①",

        actions: [
            "ファイガ捨て",
            "リターン設置",
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "中で外周向く"
        ],

        positions: [
            "northWestOuter",
            "northWestGreen",
            "center",
            "northWestGreen",
            "center",
            "center"
        ]
    },

    earlyFireDPS2: {
        label: "早ファイガDPS②",

        actions: [
            "ファイガ捨て",
            "リターン設置",
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "中で外周向く"
        ],

        positions: [
            "northEastOuter",
            "northEastGreen",
            "center",
            "northEastGreen",
            "center",
            "center"
        ]
    },

    middleFireDPS: {
        label: "中ファイガDPS",

        actions: [
            "頭割り",
            "リターン設置",
            "ファイガ捨て",
            "待機",
            "頭割り",
            "ビーム誘導"
        ],

        positions: [
            "center",
            "center",
            "eastOuter",
            "center",
            "center",
            "eastGreen"
        ]
    },

    lateFireDPS: {
        label: "遅ファイガDPS",

        actions: [
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "リターン設置",
            "ファイガ捨て",
            "中で外周向く"
        ],

        positions: [
            "center",
            "northGreen",
            "center",
            "center",
            "northOuter",
            "center"
        ]
    },

    blizzardDPS: {
        label: "DPSブリザガ",

        actions: [
            "頭割り",
            "ビーム誘導",
            "頭割り",
            "リターン設置",
            "頭割り",
            "中で外周向く"
        ],

        positions: [
            "center",
            "northGreen",
            "center",
            "center",
            "center",
            "center"
        ]
    }
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

    /*
        すでに選択中のロールを押した場合は、
        何もしない。
    */
    if (controlledRole === role) {
        return;
    }

    controlledRole = role;
    updateControlledActorStates();

    /*
        ロールボタンの選択表示を更新するため、
        P3設定欄を作り直す。
    */
    renderPhaseOptions();

    /*
        パーティー、フィールド、タイマーなどを
        新しい操作ロールに合わせて初期化する。
    */
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

/*
    選ばれたP3パターンをもとに、
    8人それぞれの移動パターンを決定する。

    DPS早ファイガは、
    ロール順で①・②へ分ける。

    TH遅ファイガも、
    ロール順で①・②へ分ける。
*/
function assignPhase3MovementPatterns(
    selectedPattern
) {
    let earlyFireDpsCount = 0;
    let lateFireThCount = 0;

    baseParty.forEach(member => {
        const actorState =
            actorStates[member.role];

        if (!actorState) {
            return;
        }

        const patternDebuffs =
            selectedPattern.assignments[
                member.role
            ];

        if (!patternDebuffs) {
            actorState.movementPatternKey =
                null;

            return;
        }

        const assignmentType =
            getPhase3AssignmentType(
                patternDebuffs
            );

        const roleGroup =
            getActionRoleGroup(
                member.role
            );

        let movementPatternKey = null;

        /*
            THの担当決定。
        */
        if (roleGroup === "TH") {
            if (
                assignmentType ===
                "earlyFire"
            ) {
                movementPatternKey =
                    "earlyFireTH";
            }

            if (
                assignmentType ===
                "middleFire"
            ) {
                movementPatternKey =
                    "middleFireTH";
            }

            if (
                assignmentType ===
                "lateFire"
            ) {
                lateFireThCount += 1;

                movementPatternKey =
                    lateFireThCount === 1
                        ? "lateFireTH1"
                        : "lateFireTH2";
            }

            if (
                assignmentType ===
                "blizzard"
            ) {
                movementPatternKey =
                    "blizzardTH";
            }
        }

        /*
            DPSの担当決定。
        */
        if (roleGroup === "DPS") {
            if (
                assignmentType ===
                "earlyFire"
            ) {
                earlyFireDpsCount += 1;

                movementPatternKey =
                    earlyFireDpsCount === 1
                        ? "earlyFireDPS1"
                        : "earlyFireDPS2";
            }

            if (
                assignmentType ===
                "middleFire"
            ) {
                movementPatternKey =
                    "middleFireDPS";
            }

            if (
                assignmentType ===
                "lateFire"
            ) {
                movementPatternKey =
                    "lateFireDPS";
            }

            if (
                assignmentType ===
                "blizzard"
            ) {
                movementPatternKey =
                    "blizzardDPS";
            }
        }

        actorState.movementPatternKey =
            movementPatternKey;
    });
}

/*
    現在時間に対応する①～⑥を取得する。
*/
function getCurrentPhase3MovementStep() {
    const timelineData =
        phase3ActionTimeline.find(item => {
            return (
                battleTime >= item.startTime &&
                battleTime < item.endTime
            );
        });

    if (!timelineData) {
        return null;
    }

    return timelineData.step;
}

/*
    現在の①～⑥に対応した移動先を、
    全員のactorStateへ設定する。
*/
function updatePhase3MovementTargets(
    forceUpdate = false
) {
    if (selectedPhase !== "P3") {
        return;
    }

    const newMovementStep =
        getCurrentPhase3MovementStep();

    if (newMovementStep === null) {
        return;
    }

    if (
        !forceUpdate &&
        currentMovementStep ===
            newMovementStep
    ) {
        return;
    }

    currentMovementStep =
        newMovementStep;

    Object.values(actorStates).forEach(
        actorState => {
            const movementPatternKey =
                actorState
                    .movementPatternKey;

            if (!movementPatternKey) {
                return;
            }

            const movementPattern =
                phase3MovementPatterns[
                    movementPatternKey
                ];

            if (!movementPattern) {
                return;
            }

            /*
                配列は0から始まるため、
                ①なら0番目を使用する。
            */
            const positionKey =
                movementPattern.positions[
                    newMovementStep - 1
                ];

            const targetPosition =
                phase3MovementPositions[
                    positionKey
                ];

            if (!targetPosition) {
                console.warn(
                    `${positionKey}の座標がありません。`
                );

                return;
            }

            setActorTarget(
                actorState.role,
                targetPosition.x,
                targetPosition.y
            );
        }
    );
}

/*
    配列の順番をランダムに並べ替えた
    新しい配列を作成する。

    元の配列自体は変更しない。
*/
function shuffleArray(array) {
    const shuffledArray = [
        ...array
    ];

    for (
        let index =
            shuffledArray.length - 1;

        index > 0;

        index -= 1
    ) {
        const randomIndex =
            Math.floor(
                Math.random() *
                (index + 1)
            );

        const temporaryValue =
            shuffledArray[index];

        shuffledArray[index] =
            shuffledArray[randomIndex];

        shuffledArray[randomIndex] =
            temporaryValue;
    }

    return shuffledArray;
}

/*
    正しいP3配布パターンを基準にして、

    THはTHの4人の中、
    DPSはDPSの4人の中で、

    デバフ一式をランダムに交換する。
*/
function createRandomizedPhase3Pattern(
    originalPattern
) {
    const copiedPattern =
        cloneData(originalPattern);

    const roleGroups = [
        [
            "MT",
            "ST",
            "H1",
            "H2"
        ],
        [
            "D1",
            "D2",
            "D3",
            "D4"
        ]
    ];

    roleGroups.forEach(roles => {
        /*
            このグループが現在持っている
            デバフ一式を取得する。
        */
        const assignments =
            roles.map(role => {
                return cloneData(
                    copiedPattern
                        .assignments[role]
                );
            });

        /*
            デバフ一式の順番を
            ランダムに並べ替える。
        */
        const shuffledAssignments =
            shuffleArray(assignments);

        /*
            並べ替えたデバフ一式を、
            同じグループの各ロールへ配り直す。
        */
        roles.forEach(
            (role, index) => {
                copiedPattern.assignments[
                    role
                ] =
                    shuffledAssignments[
                        index
                    ];
            }
        );
    });

    copiedPattern.name +=
        "・ランダム配布";

    return copiedPattern;
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

/*
    同じTHまたはDPSの中から、
    指定されたデバフ担当を探す。
*/
function findRoleWithAssignmentType(
    pattern,
    roleGroup,
    assignmentType
) {
    return baseParty.find(member => {
        if (
            getActionRoleGroup(member.role) !==
            roleGroup
        ) {
            return false;
        }

        const assignment =
            pattern.assignments[
                member.role
            ];

        if (!assignment) {
            return false;
        }

        return (
            getPhase3AssignmentType(
                assignment
            ) === assignmentType
        );
    });
}

/*
    指定モード用。

    既存の正しいパターンを複製し、
    同じロールグループ内で配布内容を交換する。

    例：
    H1が中ファイガを持っていて、
    操作キャラクターがSTなら、

    STとH1のデバフ一式を交換する。
*/
function createSpecifiedPhase3Pattern(
    originalPattern,
    targetRole,
    targetAssignmentType
) {
    const copiedPattern =
        cloneData(originalPattern);

    const targetRoleGroup =
        getActionRoleGroup(
            targetRole
        );

    const sourceMember =
        findRoleWithAssignmentType(
            copiedPattern,
            targetRoleGroup,
            targetAssignmentType
        );

    if (!sourceMember) {
        return null;
    }

    /*
        すでに希望デバフなら、
        交換せずそのまま返す。
    */
    if (sourceMember.role === targetRole) {
        copiedPattern.name +=
            `・${targetRole}指定`;

        return copiedPattern;
    }

    const targetAssignment =
        copiedPattern.assignments[
            targetRole
        ];

    const sourceAssignment =
        copiedPattern.assignments[
            sourceMember.role
        ];

    copiedPattern.assignments[
        targetRole
    ] = sourceAssignment;

    copiedPattern.assignments[
        sourceMember.role
    ] = targetAssignment;

    copiedPattern.name +=
        `・${targetRole}${getAssignmentTypeLabel(
            targetAssignmentType
        )}指定`;

    return copiedPattern;
}

/*
    内部名を日本語表示へ変換する。
*/
function getAssignmentTypeLabel(
    assignmentType
) {
    const labels = {
        earlyFire: "早ファイガ",
        middleFire: "中ファイガ",
        lateFire: "遅ファイガ",
        blizzard: "ブリザガ"
    };

    return (
        labels[assignmentType] ||
        assignmentType
    );
}

/* =========================
   フェーズUI
========================= */

function selectPhase(phase) {

    selectedPhase = phase;

    phaseButtons.forEach(button => {

        const isSelected =
            button.dataset.phase ===
            selectedPhase;

        button.classList.toggle(
            "active",
            isSelected
        );
    });

    phaseTitle.textContent =
        phaseData[selectedPhase].title;


    /*
        =========================
        P4では一時停止を使わない
        =========================
    */
    if (selectedPhase === "P4") {

        pauseButton.style.display =
            "none";

    } else {

        pauseButton.style.display =
            "";
    }


    resetBattleState();

    renderPhaseOptions();

    renderPhaseField();

    updateActionGuideVisibility();
}

/* =========================
   P4：時間結晶 UI
========================= */
function renderPhase4Options() {

    const pattern =
        phase4TimeCrystalData.patterns[
            phase4TimeCrystalPatternIndex
        ];

    /*
        P3と同じ操作プレイヤー選択
    */
    const roleButtonsHtml =
        baseParty
            .map(member => {

                const activeClass =
                    member.role === controlledRole
                        ? "active"
                        : "";

                return `
                    <button
                        type="button"
                        class="controlled-role-button ${activeClass}"
                        data-controlled-role="${member.role}"
                    >
                        <span class="controlled-role-name">
                            ${member.role}
                        </span>

                        <span class="controlled-job-name">
                            ${member.job}
                        </span>
                    </button>
                `;
            })
            .join("");

    phaseOptions.innerHTML = `
        <div class="phase-option-box phase4-option-box">

            <div class="phase-option-section">

                <div class="phase-option-heading">
                    操作プレイヤー
                </div>

                <div class="controlled-role-buttons">
                    ${roleButtonsHtml}
                </div>

            </div>


            <div class="phase-option-row">

                <strong>黄色線：</strong>

                <span class="phase4-yellow-text">
                    北 ↔ 南（固定）
                </span>


                <strong>青線：</strong>

                <span class="phase4-blue-text">
                    ${pattern.label}
                </span>


                <button
                    type="button"
                    id="phase4-reroll-button"
                    class="option-button"
                >
                    青線を再抽選
                </button>

            </div>


            <div class="phase4-test-row">

                <strong>
                    YOUデバフ：
                </strong>

                <select
                    id="phase4-player-debuff-select"
                    class="phase4-test-select"
                >
                    <option value="random">
                        ランダム
                    </option>

                    <option value="blizzard">
                        ブリザガ
                    </option>

                    <option value="aero">
                        エアロガ
                    </option>

                    <option value="eruption">
                        エラプション
                    </option>

                    <option value="water">
                        ウォタガ
                    </option>

                    <option value="holy">
                        ホーリー
                    </option>
                </select>

                <span class="phase4-test-note">
                    ※テスト用
                </span>

            </div>


            <div class="phase4-order-note">

                起爆順：

                <span class="order-yellow">
                    ① 黄色線の2時計
                </span>

                →

                <span class="order-unlinked">
                    ② 線なしの2時計
                </span>

                →

                <span class="order-blue">
                    ③ 青線の2時計
                </span>

            </div>

        </div>
    `;


    /*
        =========================
        操作プレイヤー変更
        =========================
    */
    const controlledRoleButtons =
        document.querySelectorAll(
            ".controlled-role-button"
        );

    controlledRoleButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function() {

                    selectControlledRole(
                        this.dataset.controlledRole
                    );
                }
            );
        }
    );


    /*
        =========================
        YOUデバフ
        =========================
    */
    const debuffSelect =
        document.getElementById(
            "phase4-player-debuff-select"
        );

    debuffSelect.value =
        phase4ForcedPlayerDebuff;

    debuffSelect.addEventListener(
        "change",
        function() {

            phase4ForcedPlayerDebuff =
                debuffSelect.value;
        }
    );


    /*
        =========================
        青線再抽選
        =========================
    */
    const rerollButton =
        document.getElementById(
            "phase4-reroll-button"
        );

    rerollButton.addEventListener(
        "click",
        function() {

            phase4TimeCrystalPatternIndex =
                Math.floor(
                    Math.random() *
                    phase4TimeCrystalData
                        .patterns.length
                );

            renderPhase4Options();
            renderPhaseField();
        }
    );
}

function renderPhase3Options() {
    /*
        MT～D4の操作ロールボタンを作る。
    */
    const roleButtonsHtml =
        baseParty
            .map(member => {
                const activeClass =
                    member.role === controlledRole
                        ? "active"
                        : "";

                return `
                    <button
                        type="button"
                        class="controlled-role-button ${activeClass}"
                        data-controlled-role="${member.role}"
                    >
                        <span class="controlled-role-name">
                            ${member.role}
                        </span>

                        <span class="controlled-job-name">
                            ${member.job}
                        </span>
                    </button>
                `;
            })
            .join("");

    phaseOptions.innerHTML = `
        <div class="phase-option-box">

            <div class="phase-option-section">
                <div class="phase-option-heading">
                    操作プレイヤー
                </div>

                <div class="controlled-role-buttons">
                    ${roleButtonsHtml}
                </div>
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

    /*
        今作成した操作ロールボタンを取得する。
    */
    const controlledRoleButtons =
        document.querySelectorAll(
            ".controlled-role-button"
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

    /*
        操作ロールボタンを押したときの処理。
    */
    controlledRoleButtons.forEach(button => {
        button.addEventListener(
            "click",
            function() {
                selectControlledRole(
                    this.dataset.controlledRole
                );
            }
        );
    });

    /*
        「自分だけ指定」を選んだときだけ、
        デバフ選択欄を使用可能にする。
    */
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

    /*
        デバフを再配布したときは、
        前回の正解判定を消す。
    */
    resetPhase3Judgement();

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

    let selectedPattern = null;

    /*
        完全ランダムの場合。

        元になる正しいパターンを1つ選び、
        TH内・DPS内で配布をシャッフルする。
    */
    if (selectedMode === "random") {
        const originalPattern =
            getRandomPattern(
                phase3Patterns
            );

        if (originalPattern) {
            selectedPattern =
                createRandomizedPhase3Pattern(
                    originalPattern
                );
        }
    }

    /*
        自分だけ指定の場合。

        まず正しいパターンを選び、
        TH内・DPS内でランダム配布する。

        その後、自分と同じロールグループ内で
        希望デバフを持つ人と交換する。
    */
    if (selectedMode === "specified") {
        const randomizedPatterns =
            phase3Patterns.map(
                pattern => {
                    return (
                        createRandomizedPhase3Pattern(
                            pattern
                        )
                    );
                }
            );

        const controlledRoleGroup =
            getActionRoleGroup(
                controlledRole
            );

        const availablePatterns =
            randomizedPatterns.filter(
                pattern => {
                    return baseParty.some(
                        member => {
                            if (
                                getActionRoleGroup(
                                    member.role
                                ) !==
                                controlledRoleGroup
                            ) {
                                return false;
                            }

                            const assignment =
                                pattern.assignments[
                                    member.role
                                ];

                            if (!assignment) {
                                return false;
                            }

                            return (
                                getPhase3AssignmentType(
                                    assignment
                                ) ===
                                selectedSelfType
                            );
                        }
                    );
                }
            );

        const originalPattern =
            getRandomPattern(
                availablePatterns
            );

        if (originalPattern) {
            selectedPattern =
                createSpecifiedPhase3Pattern(
                    originalPattern,
                    controlledRole,
                    selectedSelfType
                );
        }
    }

    if (!selectedPattern) {
        alert(
            "同じロールグループ内に、指定したデバフを持つパターンがありません。"
        );

        return;
    }

    /*
        パーティーリストへ
        デバフを設定する。
    */
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

    /*
        NPC全員の移動パターンを決定する。
    */
    assignPhase3MovementPatterns(
        selectedPattern
    );

    battleTime = 0;
    currentActionStep = null;
    currentMovementStep = null;

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

    /*
        操作キャラクターの
        行動ガイドを表示する。
    */
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

/*
    P4時間結晶
    8人へデバフセットをランダム配布する。
*/
function assignPhase4Debuffs() {

    /*
        P4リターン状態をリセット
    */
    phase4ReturnActivated = false;
    phase4ReturnPositions = {};

    const oldReturnMarkers =
        field.querySelectorAll(
            ".phase4-return-marker"
        );

    oldReturnMarkers.forEach(marker => {
        marker.remove();
    });


    /*
        元データをコピー
    */
    let shuffledSets =
        [
            ...phase4TimeCrystalData
                .debuffSets
        ];


    /*
        YOUを取得
    */
    const playerMember =
        party.find(
            member =>
                member.role ===
                controlledRole
        );


    /*
        テスト用固定デバフ
    */
    let forcedSet = null;

    if (
        phase4ForcedPlayerDebuff !==
        "random"
    ) {

        const candidates =
            shuffledSets.filter(
                set =>
                    set.attackDebuff.type ===
                    phase4ForcedPlayerDebuff
            );

        if (candidates.length > 0) {

            forcedSet =
                candidates[
                    Math.floor(
                        Math.random() *
                        candidates.length
                    )
                ];

            /*
                YOU用セットを
                残り候補から削除
            */
            shuffledSets =
                shuffledSets.filter(
                    set =>
                        set !== forcedSet
                );
        }
    }


    /*
        残りセットをシャッフル
    */
    for (
        let i =
            shuffledSets.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            shuffledSets[i],
            shuffledSets[j]
        ] = [
            shuffledSets[j],
            shuffledSets[i]
        ];
    }


    /*
        8人へ配布
    */
    let npcSetIndex = 0;

    party.forEach(member => {

        let set = null;


        /*
            YOU固定あり
        */
        if (
            forcedSet &&
            playerMember &&
            member.role ===
                playerMember.role
        ) {

            set = forcedSet;

        } else {

            set =
                shuffledSets[
                    npcSetIndex
                ];

            npcSetIndex++;
        }


        member.debuffs = [

            {
                type:
                    set.attackDebuff.type,

                name:
                    set.attackDebuff.label,

                time:
                    set.attackDebuff.duration
            },

            {
                type:
                    set.colorDebuff.type,

                name:
                    set.colorDebuff.label,

                time:
                    set.colorDebuff.duration
            },

            {
                type:
                    set.returnDebuff.type,

                name:
                    set.returnDebuff.label,

                time:
                    set.returnDebuff.duration
            }

        ];


        member.phase4DebuffSetId =
            set.id;

        member.phase4BlueNumber =
            null;

        member.phase4RedMarker =
            null;
    });


    /*
        -------------------------
        青40秒
        1～4
        -------------------------
    */

    const blueMembers =
        party.filter(
            member =>
                member.debuffs.some(
                    debuff =>
                        debuff.type ===
                        "blue"
                )
        );

    const blueNumbers =
        [1, 2, 3, 4];

    for (
        let i =
            blueNumbers.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            blueNumbers[i],
            blueNumbers[j]
        ] = [
            blueNumbers[j],
            blueNumbers[i]
        ];
    }

    blueMembers.forEach(
        (member, index) => {

            member.phase4BlueNumber =
                blueNumbers[index];
        }
    );


    /*
        -------------------------
        赤17＋ブリザガ
        鎖1 / 鎖2
        -------------------------
    */

    const redBlizzardMembers =
        party.filter(
            member =>
                member.phase4DebuffSetId ===
                    "red17_blizzard_1" ||

                member.phase4DebuffSetId ===
                    "red17_blizzard_2"
        );

    const chainMarkers =
        ["chain1", "chain2"];

    if (Math.random() < 0.5) {
        chainMarkers.reverse();
    }

    redBlizzardMembers.forEach(
        (member, index) => {

            member.phase4RedMarker =
                chainMarkers[index];
        }
    );


    /*
        -------------------------
        赤40＋エアロガ
        禁止1 / 禁止2
        -------------------------
    */

    const redAeroMembers =
        party.filter(
            member =>
                member.phase4DebuffSetId ===
                    "red40_aero_1" ||

                member.phase4DebuffSetId ===
                    "red40_aero_2"
        );

    const stopMarkers =
        ["stop1", "stop2"];

    if (Math.random() < 0.5) {
        stopMarkers.reverse();
    }

    redAeroMembers.forEach(
        (member, index) => {

            member.phase4RedMarker =
                stopMarkers[index];
        }
    );


    /*
        表示更新
    */
    renderParty();
    renderFieldMembers();
    renderPhase4PlayerBlueNumber();
}

/* =========================
   フィールド上のPT表示
========================= */

function renderFieldMembers() {
    const oldMembers =
        field.querySelectorAll(".field-member");

    oldMembers.forEach(member => {
        member.remove();
    });

    party.forEach(member => {
        const actorState =
            actorStates[member.role];

        if (!actorState) {
            return;
        }

        /*
            操作中のキャラクターは
            player要素で表示するためNPCとして作らない。
        */
        if (actorState.isControlled) {
            return;
        }

        const marker =
            document.createElement("div");

        marker.className =
            `field-member ${getRoleType(member.role)}`;

        marker.dataset.role =
            member.role;

        marker.style.left =
            `${actorState.x}px`;

        marker.style.top =
            `${actorState.y}px`;

        /*
            P4 頭上マーカー
        */
        let phase4MarkerHtml = "";

        /*
            青デバフ
            1～4
        */
        if (member.phase4BlueNumber) {

            phase4MarkerHtml = `
                <div class="phase4-blue-number">
                    ${member.phase4BlueNumber}
                </div>
            `;
        }

        /*
            赤17秒＋ブリザガ
            鎖1 / 鎖2
        */
        if (
            member.phase4RedMarker === "chain1" ||
            member.phase4RedMarker === "chain2"
        ) {
            const number =
                member.phase4RedMarker === "chain1"
                    ? "1"
                    : "2";

            phase4MarkerHtml = `
                <div class="phase4-red-marker phase4-chain-marker">
                    <span class="phase4-marker-symbol">
                        ⛓
                    </span>

                    <span class="phase4-marker-number">
                        ${number}
                    </span>
                </div>
            `;
        }

        /*
            赤40秒＋エアロガ
            禁止1 / 禁止2
        */
        if (
            member.phase4RedMarker === "stop1" ||
            member.phase4RedMarker === "stop2"
        ) {
            const number =
                member.phase4RedMarker === "stop1"
                    ? "1"
                    : "2";

            phase4MarkerHtml = `
                <div class="phase4-red-marker phase4-stop-marker">
                    <span class="phase4-marker-symbol">
                        🚫
                    </span>

                    <span class="phase4-marker-number">
                        ${number}
                    </span>
                </div>
            `;
        }

        marker.innerHTML = `
            ${phase4MarkerHtml}

            ${member.role}

            <div class="field-member-label">
                ${member.job}
            </div>
        `;

        field.appendChild(marker);
    });
}

/*
    actorStatesの座標をもとに、
    フィールド上のNPC位置だけを更新する。
*/
function updateFieldMemberPositions() {
    const fieldMembers =
        field.querySelectorAll(
            ".field-member"
        );

    fieldMembers.forEach(marker => {
        const role =
            marker.dataset.role;

        const actorState =
            actorStates[role];

        if (!actorState) {
            return;
        }

        marker.style.left =
            `${actorState.x}px`;

        marker.style.top =
            `${actorState.y}px`;
    });
}

/*
    動作確認用。
    指定したロールを指定座標へ移動する。
*/
function moveActorForTest(role, x, y) {
    const actorState =
        actorStates[role];

    if (!actorState) {
        console.warn(
            `${role}のactorStateがありません。`
        );

        return;
    }

    actorState.x = x;
    actorState.y = y;

    actorState.targetX = x;
    actorState.targetY = y;

    updateFieldMemberPositions();
}

/*
    指定したキャラクターの
    移動目標地点を設定する。
*/
function setActorTarget(role, x, y) {
    const actorState =
        actorStates[role];

    if (!actorState) {
        return;
    }

    actorState.targetX = x;
    actorState.targetY = y;
}

/*
    操作キャラクター以外のNPCを、
    それぞれの目標地点へ移動させる。
*/
function updateNpcMovement(deltaTime) {
    let positionChanged = false;

    Object.values(actorStates).forEach(actorState => {
        if (actorState.isControlled) {
            return;
        }

        const distanceX =
            actorState.targetX - actorState.x;

        const distanceY =
            actorState.targetY - actorState.y;

        const distance =
            Math.sqrt(
                distanceX * distanceX +
                distanceY * distanceY
            );

        /*
            すでに目標地点へ到着している場合。
        */
        if (distance < 0.5) {
            actorState.x =
                actorState.targetX;

            actorState.y =
                actorState.targetY;

            return;
        }

        const moveDistance =
            Math.min(
                actorState.moveSpeed * deltaTime,
                distance
            );

        actorState.x +=
            distanceX / distance *
            moveDistance;

        actorState.y +=
            distanceY / distance *
            moveDistance;

        positionChanged = true;
    });

    if (positionChanged) {
        updateFieldMemberPositions();
    }
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
    field
        .querySelectorAll(
            ".p3-field-object, .p4-field-object"
        )
        .forEach(element => element.remove());

    field.classList.toggle(
        "p3-active",
        selectedPhase === "P3"
    );

    field.classList.toggle(
        "p4-active",
        selectedPhase === "P4"
    );

    if (selectedPhase === "P4") {
        renderPhase4TimeCrystalField();

        renderPhase4Dragons();

        return;
    }

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
   P4：時間結晶 フィールド
========================= */

/*
    P4時間結晶の時計爆発円を作る。

    今は確認用として北時計だけ使用する。
    半径は100pxから調整開始。
*/
function createPhase4ExplosionHtml(
    clock,
    radius = 145,
    extraClass = ""
) {
    return `
        <circle
            cx="${clock.x}"
            cy="${clock.y}"
            r="${radius}"
            class="p4-clock-explosion ${extraClass}"
        ></circle>
    `;
}


/*
    北時計の爆発範囲を確認するための
    一時的なテスト処理。
*/
function triggerPhase4Explosion(
    selector
) {
    const explosions =
        field.querySelectorAll(
            selector
        );

    if (explosions.length === 0) {
        return;
    }

    explosions.forEach(
        explosion => {
            explosion.classList.remove(
                "active"
            );
        }
    );

    field.getBoundingClientRect();

    explosions.forEach(
        explosion => {
            explosion.classList.add(
                "active"
            );
        }
    );

    setTimeout(
        function() {
            explosions.forEach(
                explosion => {
                    explosion.classList.remove(
                        "active"
                    );
                }
            );
        },
        1200
    );
}

function triggerPhase4ExplosionSequence() {

    /*
        ① 黄色時計爆発
    */
    triggerPhase4Explosion(
        ".p4-test-yellow-explosion"
    );

    /*
        黄色時計の爆発が終わってから
        エラプション担当は
        ②の頭割り待機位置へ移動開始
    */
setTimeout(
    function() {

        /*
            黄色時計終了後
        */

        /*
            北側
        */
        movePhase4EruptionToSecondPosition();

        /*
            南側
            エアロ ① → ②
        */
        movePhase4AeroToSecondPosition();
        movePhase4SouthBlueToSecondPosition();

    },
    1200
);

    /*
        ② 線なし時計
        6秒後
    */
    setTimeout(
        function() {
            triggerPhase4Explosion(
                ".p4-test-unlinked-explosion"
            );
        },
        6000
    );

    /*
        ③ 青線時計
        11秒後
    */
setTimeout(
    function() {

        triggerPhase4Explosion(
            ".p4-test-blue-explosion"
        );


        /*
            3回目時計終了
        */
        phase4ThirdClockFinished =
            true;


        /*
            エラプ③にいた6人
            → 横エクサ待機位置へ
        */
        movePhase4NorthSixToHorizontalWait();

    },
    11000
);
}

function createPhase4ClockHtml(
    clockId,
    clock,
    explosionOrder
) {
    return `
        <g
            class="p4-clock p4-clock-order-${explosionOrder}"
            data-clock-id="${clockId}"
            data-explosion-order="${explosionOrder}"
        >
            <circle
                cx="${clock.x}"
                cy="${clock.y}"
                r="21"
                class="p4-clock-outer"
            ></circle>

            <circle
                cx="${clock.x}"
                cy="${clock.y}"
                r="16"
                class="p4-clock-face"
            ></circle>

            <line
                x1="${clock.x}"
                y1="${clock.y}"
                x2="${clock.x}"
                y2="${clock.y - 10}"
                class="p4-clock-hand"
            ></line>

            <line
                x1="${clock.x}"
                y1="${clock.y}"
                x2="${clock.x + 8}"
                y2="${clock.y + 5}"
                class="p4-clock-hand"
            ></line>

            <circle
                cx="${clock.x}"
                cy="${clock.y}"
                r="2.5"
                class="p4-clock-pin"
            ></circle>
        </g>
    `;
}
function renderPhase4TimeCrystalField() {
    const data =
        phase4TimeCrystalData;

    const pattern =
        data.patterns[
            phase4TimeCrystalPatternIndex
        ];

    const clocks = data.clocks;

    const yellowClockIds = [
        "north",
        "south"
    ];

    const blueClockIds = [
        pattern.blueStart,
        pattern.blueEnd
    ];

    const unlinkedClockIds =
        pattern.unlinked;

    const getOrder = clockId => {
        if (
            yellowClockIds.includes(
                clockId
            )
        ) {
            return 1;
        }

        if (
            blueClockIds.includes(
                clockId
            )
        ) {
            return 3;
        }

        return 2;
    };

    const clocksHtml =
        Object.entries(clocks)
            .map(
                ([clockId, clock]) => {
                    return createPhase4ClockHtml(
                        clockId,
                        clock,
                        getOrder(clockId)
                    );
                }
            )
            .join("");

    const yellowLine =
        createSvgLine(
            clocks.north.x,
            clocks.north.y,
            clocks.south.x,
            clocks.south.y,
            "p4-yellow-line"
        );

    const blueStart =
        clocks[
            pattern.blueStart
        ];

    const blueEnd =
        clocks[
            pattern.blueEnd
        ];

    const blueLine =
        createSvgLine(
            blueStart.x,
            blueStart.y,
            blueEnd.x,
            blueEnd.y,
            "p4-blue-line"
        );

    /*
        ① 黄色線の2時計
        南側だけ30px下へずらす。
    */
    const yellowExplosionsHtml = `
        ${createPhase4ExplosionHtml(
            clocks.north,
            145,
            "p4-test-yellow-explosion"
        )}

        ${createPhase4ExplosionHtml(
            {
                x: clocks.south.x,
                y: clocks.south.y + 30
            },
            145,
            "p4-test-yellow-explosion"
        )}
    `;

    /*
        ② 線なしの2時計

        青線パターンによって
        自動的に対象が切り替わる。
    */
    const unlinkedExplosionsHtml =
    unlinkedClockIds
        .map(clockId => {

            let offsetX = 0;
            let offsetY = 0;

            /*
                北西
                左・下
            */
            if (clockId === "northWest") {
                offsetX = -5;
                offsetY = +5;
            }

            /*
                南東
                右
            */
            if (clockId === "southEast") {
                offsetX = +15;
                offsetY = +5;
            }

            /*
                北東
                ここで調整
            */
            if (clockId === "northEast") {
                offsetX = +15;
                offsetY = +5;
            }

            /*
                南西
                ここで調整
            */
            if (clockId === "southWest") {
                offsetX = 0;
                offsetY = +5;
            }

            return createPhase4ExplosionHtml(
                {
                    x:
                        clocks[clockId].x +
                        offsetX,

                    y:
                        clocks[clockId].y +
                        offsetY
                },
                145,
                "p4-test-unlinked-explosion"
            );
        })
        .join("");
        /*
    ③ 青線につながっている2時計

    青線パターンによって
    対象の2時計が自動で切り替わる。
*/
const blueExplosionsHtml =
    blueClockIds
        .map(clockId => {

            let offsetX = 0;
            let offsetY = 0;

            /*
                北西
            */
            if (clockId === "northWest") {
                offsetX = -5;
                offsetY = +5;
            }

            /*
                南東
            */
            if (clockId === "southEast") {
                offsetX = +10;
                offsetY = +5;
            }

            /*
                北東
            */
            if (clockId === "northEast") {
                offsetX = +15;
                offsetY = +5;
            }

            /*
                南西
            */
            if (clockId === "southWest") {
                offsetX = -10;
                offsetY = +9;
            }

            return createPhase4ExplosionHtml(
                {
                    x:
                        clocks[clockId].x +
                        offsetX,

                    y:
                        clocks[clockId].y +
                        offsetY
                },
                145,
                "p4-test-blue-explosion"
            );
        })
        .join("");

    const phaseField =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

    phaseField.setAttribute(
        "class",
        "p4-field-object"
    );

    phaseField.setAttribute(
        "viewBox",
        "0 0 480 480"
    );

    phaseField.setAttribute(
        "aria-label",
        "P4時間結晶 時計配置"
    );

    phaseField.innerHTML = `
        ${yellowLine}
        ${blueLine}

        ${yellowExplosionsHtml}
        ${unlinkedExplosionsHtml}
        ${blueExplosionsHtml}

        ${clocksHtml}
    `;

    field.insertBefore(
        phaseField,
        player
    );
}

/* =========================
   P3正解判定
========================= */

/*
    判定結果をすべて初期化する。
*/
function resetPhase3Judgement() {
    phase3JudgementState
        .judgedSteps
        .clear();

    phase3JudgementState.results = {};

    const oldSummary =
        document.getElementById(
            "phase3-judgement-summary"
        );

    if (oldSummary) {
        oldSummary.remove();
    }

    const actionItems =
        actionGuideList.querySelectorAll(
            ".action-guide-item"
        );

    actionItems.forEach(item => {
        item.dataset.judgement = "";

        item.style.borderColor = "";
        item.style.background = "";

        const oldResult =
            item.querySelector(
                ".action-judgement-result"
            );

        if (oldResult) {
            oldResult.remove();
        }
    });
}

/*
    操作キャラクターの移動パターンを取得する。
*/
function getControlledMovementPattern() {
    const controlledActor =
        actorStates[controlledRole];

    if (
        !controlledActor ||
        !controlledActor.movementPatternKey
    ) {
        return null;
    }

    return phase3MovementPatterns[
        controlledActor.movementPatternKey
    ] || null;
}

/*
    指定された①～⑥の正解座標を取得する。
*/
function getPhase3CorrectPosition(step) {
    const movementPattern =
        getControlledMovementPattern();

    if (!movementPattern) {
        return null;
    }

    const positionKey =
        movementPattern.positions[
            step - 1
        ];

    if (!positionKey) {
        return null;
    }

    const position =
        phase3MovementPositions[
            positionKey
        ];

    if (!position) {
        console.warn(
            `${positionKey}の正解座標がありません。`
        );

        return null;
    }

    return {
        key: positionKey,
        x: position.x,
        y: position.y
    };
}

/*
    2つの座標間の距離を計算する。
*/
function getDistanceBetweenPositions(
    x1,
    y1,
    x2,
    y2
) {
    const distanceX =
        x2 - x1;

    const distanceY =
        y2 - y1;

    return Math.sqrt(
        distanceX * distanceX +
        distanceY * distanceY
    );
}

/*
    位置キーを画面表示用の名前に変換する。
*/
function getPositionDisplayName(
    positionKey
) {
    const positionLabels = {
        center: "中央",
        centerSlightNorth: "中央やや北",

        northGreen: "北の緑玉",
        northEastGreen: "北東の緑玉",
        eastGreen: "東の緑玉",
        southEastGreen: "南東の緑玉",
        southGreen: "南の緑玉",
        southWestGreen: "南西の緑玉",
        westGreen: "西の緑玉",
        northWestGreen: "北西の緑玉",

        northOuter: "北外周",
        northEastOuter: "北東外周",
        eastOuter: "東外周",
        southEastOuter: "南東外周",
        southOuter: "南外周",
        southWestOuter: "南西外周",
        westOuter: "西外周",
        northWestOuter: "北西外周"
    };

    return (
        positionLabels[positionKey] ||
        positionKey
    );
}

/*
    行動ガイドの①～⑥へ
    成功・失敗の見た目を反映する。
*/
function renderPhase3StepJudgement(
    step,
    result
) {
    const actionItem =
        actionGuideList.querySelector(
            `[data-action-step="${step}"]`
        );

    if (!actionItem) {
        return;
    }

    const oldResult =
        actionItem.querySelector(
            ".action-judgement-result"
        );

    if (oldResult) {
        oldResult.remove();
    }

    const resultElement =
        document.createElement("div");

    resultElement.className =
        "action-judgement-result";

    resultElement.style.marginTop = "6px";
    resultElement.style.fontWeight = "700";
    resultElement.style.fontSize = "14px";

    if (result.isCorrect) {
        actionItem.dataset.judgement =
            "correct";

        actionItem.style.borderColor =
            "#50d890";

        actionItem.style.background =
            "rgba(80, 216, 144, 0.12)";

        resultElement.style.color =
            "#7dffb3";

        resultElement.textContent =
            `成功　正解位置：${result.positionLabel}`;
    } else {
        actionItem.dataset.judgement =
            "incorrect";

        actionItem.style.borderColor =
            "#ff6b6b";

        actionItem.style.background =
            "rgba(255, 107, 107, 0.12)";

        resultElement.style.color =
            "#ff8c8c";

        resultElement.textContent =
            `失敗　正解位置：${result.positionLabel}`;
    }

    actionItem.appendChild(
        resultElement
    );
}

/*
    成功数・失敗数を表示する。
*/
function renderPhase3JudgementSummary() {
    let summary =
        document.getElementById(
            "phase3-judgement-summary"
        );

    if (!summary) {
        summary =
            document.createElement("div");

        summary.id =
            "phase3-judgement-summary";

        summary.style.marginTop = "14px";
        summary.style.padding = "12px";
        summary.style.borderRadius = "8px";
        summary.style.background =
            "rgba(0, 0, 0, 0.25)";

        summary.style.textAlign = "center";
        summary.style.fontWeight = "700";

        actionGuideList.insertAdjacentElement(
            "afterend",
            summary
        );
    }

    const results =
        Object.values(
            phase3JudgementState.results
        );

    const correctCount =
        results.filter(
            result => result.isCorrect
        ).length;

    const incorrectCount =
        results.length - correctCount;

    summary.textContent =
        `判定 ${results.length}/6　` +
        `成功 ${correctCount}　` +
        `失敗 ${incorrectCount}`;
}

/*
    指定された①～⑥を判定する。
*/
function judgePhase3Step(step) {
    if (selectedPhase !== "P3") {
        return;
    }

    if (
        phase3JudgementState
            .judgedSteps
            .has(step)
    ) {
        return;
    }

    const controlledActor =
        actorStates[controlledRole];

    const correctPosition =
        getPhase3CorrectPosition(step);

    if (
        !controlledActor ||
        !correctPosition
    ) {
        return;
    }

    const distance =
        getDistanceBetweenPositions(
            controlledActor.x,
            controlledActor.y,
            correctPosition.x,
            correctPosition.y
        );

    const isCorrect =
        distance <=
        phase3JudgementState.judgeRadius;

    const result = {
        step: step,
        isCorrect: isCorrect,

        distance: distance,

        positionKey:
            correctPosition.key,

        positionLabel:
            getPositionDisplayName(
                correctPosition.key
            )
    };

    phase3JudgementState
        .judgedSteps
        .add(step);

    phase3JudgementState.results[
        step
    ] = result;

    renderPhase3StepJudgement(
        step,
        result
    );

    renderPhase3JudgementSummary();

    console.log(
        `P3判定 ステップ${step}：`,
        result
    );
}

/*
    現在時刻を確認し、
    判定時刻を通過したステップを判定する。

    タイマーが一度に少し進んだ場合でも、
    未判定のステップを順番に判定する。
*/
function updatePhase3Judgement() {
    if (selectedPhase !== "P3") {
        return;
    }

    phase3ActionTimeline.forEach(
        timeline => {
            if (
                battleTime >= timeline.endTime &&
                !phase3JudgementState
                    .judgedSteps
                    .has(timeline.step)
            ) {
                judgePhase3Step(
                    timeline.step
                );
            }
        }
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

    /*
        小数の計算誤差を防ぐため、
        毎回小数第1位へ丸める。
    */
    battleTime =
        Math.round(
            (battleTime + 0.1) * 10
        ) / 10;

    battleTimer.textContent =
        battleTime.toFixed(1);

    renderParty();

    /*
        新しい移動先へ切り替える前に、
        終了した行動の位置を判定する。
    */
    updatePhase3Judgement();

    /*
        行動ガイドの①～⑥を更新する。
    */
    updatePhase3ActionGuide();

    /*
        NPCの①～⑥の目的地を更新する。
    */
    updatePhase3MovementTargets();

    /*
        ⑥の判定が完了したら、
        タイマーを自動停止する。
    */
    if (battleTime >= 40) {
        pauseTimer();
    }
}
/*
    P4時間結晶
    タイマー開始
*/
function startPhase4Timer() {

    /*
        二重起動防止
    */
    if (phase4TimerId !== null) {
        clearInterval(
            phase4TimerId
        );
    }

    phase4TimerId =
        setInterval(
            updatePhase4Timers,
            100
        );
}


/*
    P4時間結晶
    デバフ残り時間更新
*/
/*
    P4 リターン発動

    8人全員の現在位置を保存し、
    その場所へ▶マーカーを設置する。
*/
function activatePhase4Return() {


    /*
        二重発動防止
    */
    if (phase4ReturnActivated) {
        return;
    }

    phase4ReturnActivated = true;

    /*
        前回の保存位置をリセット
    */
    phase4ReturnPositions = {};

    /*
        古い▶マーカーがあれば削除
    */
    const oldMarkers =
        field.querySelectorAll(
            ".phase4-return-marker"
        );

    oldMarkers.forEach(marker => {
        marker.remove();
    });

    /*
        8人全員の現在位置を保存
    */
    party.forEach(member => {

        const actor =
            actorStates[member.role];

        if (!actor) {
            return;
        }

        phase4ReturnPositions[
            member.role
        ] = {
            x: actor.x,
            y: actor.y
        };

        /*
            保存位置に▶を作る
        */
        const marker =
            document.createElement("div");

        marker.className =
            "phase4-return-marker";

        marker.textContent =
            "▶";

        marker.dataset.role =
            member.role;

        marker.style.left =
            `${actor.x}px`;

        marker.style.top =
            `${actor.y}px`;

               field.appendChild(marker);
    });


    /*
        リターン地点保存後も
        5秒間は自由に移動できる。

        5秒後に保存地点へ強制帰還。
    */
       /*
        =========================
        リターン設置完了

        現在位置はすでに保存済みなので、
        ここからNPCを最終散会へ動かす。
        =========================
    */
    movePhase4NpcsToFinalSpread();
    
    setTimeout(
        function() {
            executePhase4Return();
        },
        5000
    );
}
/*
    P4 リターン帰還

    保存した位置へ
    8人全員を強制的に戻す。
*/
function executePhase4Return() {

    party.forEach(member => {

        const actor =
            actorStates[member.role];

        const savedPosition =
            phase4ReturnPositions[
                member.role
            ];

        if (
            !actor ||
            !savedPosition
        ) {
            return;
        }

        /*
            保存地点へ強制帰還
        */
        actor.x =
            savedPosition.x;

        actor.y =
            savedPosition.y;

        /*
            NPCが移動中だった場合、
            古い目的地へ再び歩き出さないようにする。
        */
        actor.targetX =
            savedPosition.x;

        actor.targetY =
            savedPosition.y;
    });


    /*
        YOUの表示位置更新
    */
    updatePlayerPosition();

    /*
        NPCの表示位置更新
    */
    renderFieldMembers();

    /*
        YOUのP4頭上マーカーも再表示
    */
    renderPhase4PlayerBlueNumber();


    /*
        帰還完了後、▶を削除
    */
    const returnMarkers =
        field.querySelectorAll(
            ".phase4-return-marker"
        );

    returnMarkers.forEach(marker => {
        marker.remove();
    });
}

function updatePhase4Timers() {

    /*
        =========================
        この瞬間の8人の座標を保存

        同時着弾する攻撃について、
        処理順によって座標が変わらないようにする。
        =========================
    */
    const phase4PositionSnapshot = {};

    party.forEach(member => {

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }

        phase4PositionSnapshot[
            member.role
        ] = {
            x: actor.x,
            y: actor.y
        };
    });


    party.forEach(member => {

        member.debuffs.forEach(
            debuff => {

                if (debuff.time <= 0) {
                    return;
                }

                const previousTime =
                    debuff.time;

                debuff.time -= 0.1;

                /*
                    小数誤差防止
                */
                debuff.time =
                    Math.round(
                        debuff.time * 10
                    ) / 10;

                if (debuff.time < 0) {
                    debuff.time = 0;
                }


                /*
                    ブリザガ
                */
                if (
                    debuff.type ===
                        "blizzard" &&
                    previousTime > 0 &&
                    debuff.time <= 0
                ) {
                triggerPhase4Blizzard(
                   member,
                    phase4PositionSnapshot
                );
                }


                /*
                    エアロガ
                */
                if (
                    debuff.type ===
                        "aero" &&
                    previousTime > 0 &&
                    debuff.time <= 0
                ) {
                triggerPhase4Aero(
                 member,
                 phase4PositionSnapshot     
                );

                /*
                    エアロガ担当
                    ② → ③
                */
                movePhase4AeroToThirdPosition(
                   member
                );

                /*
                   エアロガで飛ばされた青3人
                    → エラプション②へ集合
                */
                movePhase4SouthBlueToEruptionSecond();
                }


                /*
                    エラプション
                */
                if (
                    debuff.type ===
                        "eruption" &&
                    previousTime > 0 &&
                    debuff.time <= 0
                ) {
                    triggerPhase4Eruption(
                        member
                    );
                }


                /*
                    ウォタガ
                */
                if (
                    debuff.type ===
                        "water" &&
                    previousTime > 0 &&
                    debuff.time <= 0
                ) {
                    triggerPhase4Water(
                        member
                    );
                }


                /*
    ホーリー
*/
if (
    debuff.type ===
        "holy" &&
    previousTime > 0 &&
    debuff.time <= 0
) {
    triggerPhase4Holy(
        member
    );
}

/*
    青40
    残り1秒までに
    青玉を回収できなければ失敗
*/
if (
    debuff.type ===
        "blue" &&
    previousTime > 1 &&
    debuff.time <= 1
) {
    failPhase4(
        `青玉未回収：${member.role}`
    );
}
            }
        );
    });


    /*
        リターン33秒
    */
    if (!phase4ReturnActivated) {

        const returnDebuff =
            party
                .flatMap(
                    member =>
                        member.debuffs
                )
                .find(
                    debuff =>
                        debuff.type ===
                        "return"
                );

        if (
            returnDebuff &&
            returnDebuff.time <= 0
        ) {
            activatePhase4Return();
        }
    }


   /*
    エアロ担当が
    白龍との接触で赤を消したら
    ③ → ④
*/
movePhase4AeroToFourthPosition();


/*
    赤17＋ブリザガ

    白龍接触済み
    ＋
    ブリザガ残り0.2秒以下

    ならエラプション側へ移動開始
*/
updatePhase4Red17BlizzardMovement();


/*
    PTリスト更新
*/
renderParty();

}

/*
    P3開始時のNPC移動先を設定する。

    操作中のキャラクターは、
    updateNpcMovement側で除外されるため自動移動しない。
*/
function setPhase3OpeningTargets() {
    setActorTarget("MT", 240, 75);
    setActorTarget("ST", 240, 405);

    setActorTarget("H1", 130, 130);
    setActorTarget("H2", 350, 130);

    setActorTarget("D1", 75, 240);
    setActorTarget("D2", 405, 240);

    setActorTarget("D3", 130, 350);
    setActorTarget("D4", 350, 350);
}

function startTimer() {
    if (timerId !== null) {
        return;
    }

    /*
        デバフが未配布なら開始しない。
    */
    const controlledActor =
        actorStates[controlledRole];

    if (
        !controlledActor ||
        !controlledActor.movementPatternKey
    ) {
        alert(
            "先にP3のデバフを配布してください。"
        );

        return;
    }

    /*
        スタートした瞬間に、
        ①の目的地を設定する。
    */
    updatePhase3MovementTargets(true);

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
    initializeActorStates();
    /*
    P4の未回収青玉を削除
    */
    field
    .querySelectorAll(
        ".phase4-blue-orb"
    )
    .forEach(
        orb => orb.remove()
    );
    /*
    P4 白龍の移動を停止
*/
if (
    phase4DragonAnimationId !== null
) {
    cancelAnimationFrame(
        phase4DragonAnimationId
    );

    phase4DragonAnimationId = null;
}

phase4DragonStartTime = null;

    battleTime = 0;
    currentActionStep = null;
    currentMovementStep = null;

    /*
        正解判定の履歴も初期化する。
    */
    resetPhase3Judgement();

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

    const actor =
        actorStates[controlledRole];

    if (!actor) {
        return;
    }

    player.style.left =
        `${actor.x - playerRadius}px`;

    player.style.top =
        `${actor.y - playerRadius}px`;

    /*
        P4でYOUに頭上マーカーが付いている場合、
        青・鎖・禁止のどれでもYOUに追従させる。
    */
    const phase4Marker =
        field.querySelector(
            ".phase4-player-marker"
        );

    if (phase4Marker) {

        phase4Marker.style.left =
            `${actor.x}px`;

        phase4Marker.style.top =
            `${actor.y - 30}px`;
    }
}

function renderPhase4PlayerBlueNumber() {

    /*
        以前表示したYOU用P4マーカーを削除
    */
    const oldMarker =
        field.querySelector(
            ".phase4-player-marker"
        );

    if (oldMarker) {
        oldMarker.remove();
    }

    /*
        YOUのpartyデータを取得
    */
    const member =
        party.find(
            member =>
                member.role === controlledRole
        );

    if (!member) {
        return;
    }

    /*
        YOUの現在位置を取得
    */
    const actor =
        actorStates[controlledRole];

    if (!actor) {
        return;
    }

    let marker = null;


    /*
        青40秒
        1～4マーカー
    */
    if (member.phase4BlueNumber) {

        marker =
            document.createElement("div");

        marker.className =
            "phase4-blue-number " +
            "phase4-player-marker " +
            "phase4-player-blue-number";

        marker.textContent =
            member.phase4BlueNumber;
    }


    /*
        赤17秒＋ブリザガ
        鎖1 / 鎖2
    */
    if (
        member.phase4RedMarker === "chain1" ||
        member.phase4RedMarker === "chain2"
    ) {

        const number =
            member.phase4RedMarker === "chain1"
                ? "1"
                : "2";

        marker =
            document.createElement("div");

        marker.className =
            "phase4-red-marker " +
            "phase4-chain-marker " +
            "phase4-player-marker";

        marker.innerHTML = `
            <span class="phase4-marker-symbol">
                ⛓
            </span>

            <span class="phase4-marker-number">
                ${number}
            </span>
        `;
    }


    /*
        赤40秒＋エアロガ
        禁止1 / 禁止2
    */
    if (
        member.phase4RedMarker === "stop1" ||
        member.phase4RedMarker === "stop2"
    ) {

        const number =
            member.phase4RedMarker === "stop1"
                ? "1"
                : "2";

        marker =
            document.createElement("div");

        marker.className =
            "phase4-red-marker " +
            "phase4-stop-marker " +
            "phase4-player-marker";

        marker.innerHTML = `
            <span class="phase4-marker-symbol">
                🚫
            </span>

            <span class="phase4-marker-number">
                ${number}
            </span>
        `;
    }


    /*
        P4マーカーを持っていない場合
    */
    if (!marker) {
        return;
    }


    /*
        YOU頭上へ配置
    */
    marker.style.left =
        `${actor.x}px`;

    marker.style.top =
        `${actor.y - 30}px`;

    field.appendChild(marker);
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
    const controlledActor =
        actorStates[controlledRole];

    if (!controlledActor) {
        return;
    }

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
        controlledActor.x +
        directionX *
        moveSpeed *
        deltaTime;

    const nextY =
        controlledActor.y +
        directionY *
        moveSpeed *
        deltaTime;

    if (canMoveTo(nextX, nextY)) {
        controlledActor.x = nextX;
        controlledActor.y = nextY;

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
            (
                currentTime -
                previousAnimationTime
            ) / 1000,
            0.05
        );

    previousAnimationTime =
        currentTime;

    /*
        YOUのWASD移動。
    */
    updatePlayerMovement(deltaTime);

    /*
        NPCの自動移動。
    */
    updateNpcMovement(deltaTime);

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
    function() {

        /*
            P4なら時間結晶開始
        */
        if (selectedPhase === "P4") {

            startPhase4TimeCrystal();

            return;
        }

        /*
            P3などは従来処理
        */
        startTimer();
    }
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
initializeActorStates();
renderFieldMembers();

updateControlledPlayerAppearance();
updatePlayerPosition();

clearActionGuide();
updateActionGuideVisibility();

requestAnimationFrame(gameLoop);

function triggerPhase4Blizzard(
    member,
    positionSnapshot
) {

    /*
        14秒着弾の瞬間に保存した
        ブリザガ担当の位置
    */
    const sourcePosition =
        positionSnapshot[
            member.role
        ];

    if (!sourcePosition) {
        return;
    }


    /*
        ブリザガの見た目も
        14秒着弾時点の位置に固定
    */
    const aoe =
        document.createElement("div");

    aoe.className =
        "phase4-blizzard-aoe";

    aoe.style.left =
        `${sourcePosition.x}px`;

    aoe.style.top =
        `${sourcePosition.y}px`;

    field.appendChild(aoe);


    /*
        当たり判定も
        同じ14秒着弾時点の座標を使用
    */
    checkPhase4BlizzardHit(
        member,
        positionSnapshot
    );


    /*
        見た目だけ1.2秒残す
    */
    setTimeout(
        function() {
            aoe.remove();
        },
        1200
    );
}

function checkPhase4BlizzardHit(
    sourceMember,
    positionSnapshot
) {

    /*
        ブリザガ発動瞬間の
        保存済み座標を使用
    */
    const sourcePosition =
        positionSnapshot[
            sourceMember.role
        ];

    if (!sourcePosition) {
        return;
    }


    const innerRadius = 55;
    const outerRadius = 145;


    party.forEach(member => {

        /*
            ブリザガ対象本人は
            判定しない
        */
        if (
            member.role ===
            sourceMember.role
        ) {
            return;
        }


        const position =
            positionSnapshot[
                member.role
            ];

        if (!position) {
            return;
        }


        const dx =
            position.x -
            sourcePosition.x;

        const dy =
            position.y -
            sourcePosition.y;


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /*
            発動瞬間に
            ドーナツ範囲内なら失敗
        */
        if (
            distance > innerRadius &&
            distance <= outerRadius
        ) {
            failPhase4(
                `ブリザガ被弾：${member.role}`
            );
        }
    });
}

/*
    P4 共通失敗処理
*/
/*
    P4 共通失敗処理

    alertではなく
    右側のP4判定欄へ表示する。
*/
function failPhase4(
    reason
) {

    console.log(
        "P4失敗:",
        reason
    );


    const failLog =
        document.getElementById(
            "phase4-fail-log"
        );

    if (!failLog) {
        return;
    }


    /*
        最初の
        「失敗なし」を消す
    */
    if (
        failLog.textContent.trim() ===
        "失敗なし"
    ) {
        failLog.innerHTML = "";
    }


    const item =
        document.createElement("div");

    item.className =
        "phase4-fail-log-item";

    item.textContent =
        `× ${reason}`;

    failLog.appendChild(
        item
    );
}

/*
    P4 エアロガ発動
*/
/*
    P4 エアロガ発動
*/
function triggerPhase4Aero(member) {

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }


    const aoe =
        document.createElement("div");

    aoe.className =
        "phase4-aero-aoe";

    aoe.style.left =
        `${actor.x}px`;

    aoe.style.top =
        `${actor.y}px`;

    field.appendChild(aoe);


    /*
        エアロガ対象以外を
        外向きへノックバック
    */
    applyPhase4AeroKnockback(
        member
    );


    setTimeout(
        function() {
            aoe.remove();
        },
        1200
    );
}

/*
    P4 テスト用
    YOUへ固定する攻撃デバフ
*/
let phase4ForcedPlayerDebuff =
    "random";

    /*
    P4 エアロガ
    ノックバック処理
*/
function applyPhase4AeroKnockback(
    sourceMember
) {

    const sourceActor =
        actorStates[
            sourceMember.role
        ];

    if (!sourceActor) {
        return;
    }


    /*
        エアロガ範囲
    */
    const aeroRadius = 145;


    /*
        ノックバック距離
    */
    const knockbackDistance = 280;


    party.forEach(member => {

        /*
            エアロガ対象本人は
            ノックバックしない
        */
        if (
            member.role ===
            sourceMember.role
        ) {
            return;
        }


        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }


        const dx =
            actor.x -
            sourceActor.x;

        const dy =
            actor.y -
            sourceActor.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        /*
            エアロガ範囲外なら
            ノックバックしない
        */
        if (
            distance >
            aeroRadius
        ) {
            return;
        }


        /*
            ノックバック方向
        */
        let directionX = 0;
        let directionY = -1;

        if (distance > 0) {

            directionX =
                dx / distance;

            directionY =
                dy / distance;
        }


        /*
            外向きに280ノックバック
        */
        actor.x +=
            directionX *
            knockbackDistance;

        actor.y +=
            directionY *
            knockbackDistance;


        /*
            NPCの移動先も
            ノックバック先へ合わせる
        */
        actor.targetX =
            actor.x;

        actor.targetY =
            actor.y;


        /*
            =========================
            場外判定
            =========================

            フィールド半径 240
            キャラクター半径 17

            240 - 17 = 223
        */

        const fieldCenterX = 240;
        const fieldCenterY = 240;

        const safeRadius =
            fieldRadius -
            playerRadius;

        const fieldDx =
            actor.x -
            fieldCenterX;

        const fieldDy =
            actor.y -
            fieldCenterY;

        const distanceFromCenter =
            Math.sqrt(
                fieldDx * fieldDx +
                fieldDy * fieldDy
            );


        /*
            キャラクターの外周が
            フィールドから出たら失敗
        */
        if (
            distanceFromCenter >
            safeRadius
        ) {
            failPhase4(
                `エアロガで場外：${member.role}`
            );
        }
    });


    /*
        YOUの位置更新
    */
    updatePlayerPosition();


    /*
        NPCの位置更新
    */
    renderFieldMembers();


    /*
        YOUの頭上マーカー更新
    */
    renderPhase4PlayerBlueNumber();
}

/*
    P4 エラプション発動
*/
function triggerPhase4Eruption(member) {

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }


    const aoe =
        document.createElement("div");

    aoe.className =
        "phase4-eruption-aoe";

    aoe.style.left =
        `${actor.x}px`;

    aoe.style.top =
        `${actor.y}px`;

    field.appendChild(aoe);


    /*
        エラプション当たり判定
    */
    checkPhase4EruptionHit(
        member
    );


    /*
        AoE表示を消す
    */
    setTimeout(
        function() {
            aoe.remove();
        },
        1200
    );
}


/*
    P4 エラプション
    当たり判定
*/
/*
    P4 エラプション
    当たり判定
*/
function checkPhase4EruptionHit(
    sourceMember
) {

    const sourceActor =
        actorStates[
            sourceMember.role
        ];

    if (!sourceActor) {
        return;
    }


    /*
        仮半径
    */
    const eruptionRadius = 70;


    party.forEach(member => {

        /*
            エラプション対象本人は
            判定しない
        */
        if (
            member.role ===
            sourceMember.role
        ) {
            return;
        }


        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }


        const dx =
            actor.x -
            sourceActor.x;

        const dy =
            actor.y -
            sourceActor.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        console.log(
            "エラプション判定:",
            sourceMember.role,
            "→",
            member.role,
            "距離:",
            distance
        );


        if (
            distance <=
            eruptionRadius
        ) {
            failPhase4(
                `エラプション被弾：${member.role}`
            );
        }
    });
}

function renderPhaseOptions() {
    if (selectedPhase === "P3") {
        renderPhase3Options();
        return;
    }

    if (selectedPhase === "P4") {
        renderPhase4Options();
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

/*
    =========================
    P4 ウォタガ発動
    =========================
*/
function triggerPhase4Water(
    member
) {

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }


    /*
        頭割り範囲を表示
    */
    const aoe =
        document.createElement("div");

    aoe.className =
        "phase4-water-aoe";

    aoe.style.left =
        `${actor.x}px`;

    aoe.style.top =
        `${actor.y}px`;

    field.appendChild(
        aoe
    );


    /*
        4人頭割り判定
    */
    checkPhase4WaterStack(
        member
    );


    /*
        AoEを消す
    */
    setTimeout(
        function() {
            aoe.remove();
        },
        1200
    );
}


/*
    =========================
    P4 ウォタガ
    4人頭割り判定
    =========================
*/
function checkPhase4WaterStack(
    sourceMember
) {

    const sourceActor =
        actorStates[
            sourceMember.role
        ];

    if (!sourceActor) {
        return;
    }


    /*
        頭割り範囲

        まずは仮で半径70。
        見た目を確認してから調整する。
    */
    const waterRadius = 70;

    let playerCount = 0;


    party.forEach(member => {

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }


        const dx =
            actor.x -
            sourceActor.x;

        const dy =
            actor.y -
            sourceActor.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <=
            waterRadius
        ) {
            playerCount++;
        }
    });


    console.log(
        "ウォタガ頭割り人数:",
        playerCount
    );


    /*
        対象本人を含め
        ちょうど4人なら成功
    */
    if (
        playerCount !== 4
    ) {
        failPhase4(
            `ウォタガ頭割り：${playerCount}人`
        );
    }
}

/*
    =========================
    P4 ホーリー発動
    =========================
*/
function triggerPhase4Holy(
    member
) {

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }


    const aoe =
        document.createElement("div");

    aoe.className =
        "phase4-holy-aoe";

    aoe.style.left =
        `${actor.x}px`;

    aoe.style.top =
        `${actor.y}px`;

    field.appendChild(
        aoe
    );


    /*
        頭割り人数判定
    */
    checkPhase4HolyStack(
        member
    );


    /*
        ホーリー処理後、
        北側6人全員を
        エラプション③へ移動
    */
        movePhase4NorthSixToEruptionThird();


    setTimeout(
        function() {
            aoe.remove();
        },
        1200
    );
}


/*
    =========================
    P4 ホーリー
    頭割り判定
    =========================
*/
function checkPhase4HolyStack(
    sourceMember
) {

    const sourceActor =
        actorStates[
            sourceMember.role
        ];

    if (!sourceActor) {
        return;
    }


    /*
        仮半径70
        後で見た目に合わせて調整
    */
    const holyRadius = 70;

    let playerCount = 0;


    party.forEach(member => {

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }


        const dx =
            actor.x -
            sourceActor.x;

        const dy =
            actor.y -
            sourceActor.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <=
            holyRadius
        ) {
            playerCount++;
        }
    });


    console.log(
        "ホーリー頭割り人数:",
        playerCount
    );


    /*
        対象本人を含めて
        5人以上なら成功
    */
    if (
        playerCount < 5
    ) {
        failPhase4(
            `ホーリー頭割り：${playerCount}人`
        );
    }
}
/*
    =========================
    P4 白龍
    開始位置テスト用
    =========================
*/

const phase4DragonSettings = {

    /*
        開始位置
    */
    clockwise: {
        startX: 210,
        startY: 75
    },

    counterClockwise: {
        startX: 270,
        startY: 75
    },


    /*
        =========================
        移動ルート調整用
        =========================

        centerX / centerY
            円運動の中心

        radius
            龍が通るライン
            小さくすると内側
            大きくすると外側

        speed
            1秒あたりの角度
    */
    route: {
        centerX: 240,
        centerY: 240,

        radius: 175,

        speed: 25
    }
};


/*
    白龍2体を表示する
*/
function renderPhase4Dragons() {

    /*
        以前の白龍を削除
    */
    field
        .querySelectorAll(
            ".phase4-dragon-head"
        )
        .forEach(
            dragon => {
                dragon.remove();
            }
        );


    /*
        時計回り
    */
    createPhase4Dragon(
        "clockwise",
        phase4DragonSettings
            .clockwise
    );


    /*
        反時計回り
    */
    createPhase4Dragon(
        "counter-clockwise",
        phase4DragonSettings
            .counterClockwise
    );
}


/*
    白龍1体を作る
*/
function createPhase4Dragon(
    direction,
    settings
) {

    const dragon =
        document.createElement(
            "div"
        );

    dragon.className =
        "phase4-dragon-head";

    dragon.dataset.direction =
        direction;

    /*
        この龍が処理した
        赤デバフの人数
    */
    dragon.dataset.redContactCount =
        "0";

    dragon.innerHTML = `
        <div class="phase4-dragon-symbol">
            🐉
        </div>
    `;

    dragon.style.left =
        `${settings.startX}px`;

    dragon.style.top =
        `${settings.startY}px`;

    field.appendChild(
        dragon
    );
}
/*
    =========================
    P4 白龍
    移動開始
    =========================
*/

let phase4DragonAnimationId =
    null;

let phase4DragonStartTime =
    null;


function startPhase4DragonMovement() {

    /*
        二重起動防止
    */
    if (
        phase4DragonAnimationId !==
        null
    ) {
        cancelAnimationFrame(
            phase4DragonAnimationId
        );
    }


    phase4DragonStartTime =
        performance.now();


    phase4DragonAnimationId =
        requestAnimationFrame(
            updatePhase4DragonMovement
        );
}


/*
    白龍2体を円周上で動かす
*/
function updatePhase4DragonMovement(
    currentTime
) {

    const elapsedSeconds =
        (
            currentTime -
            phase4DragonStartTime
        ) / 1000;


    const route =
        phase4DragonSettings.route;


    /*
        経過時間から
        移動角度を計算
    */
    const movementAngle =
        elapsedSeconds *
        route.speed;


    /*
        北を基準の0度にする
    */
    const startAngle =
        -90;


    /*
        時計回り
    */
    updatePhase4DragonPosition(
        "clockwise",
        startAngle +
            movementAngle
    );


    /*
        反時計回り
    */
 updatePhase4DragonPosition(
    "counter-clockwise",
    startAngle -
        movementAngle
);


/*
    龍が赤デバフ持ちに
    接触したか確認
*/
/*
    白龍と赤の接触判定
*/
checkPhase4DragonRedContact();


/*
    青持ちと青玉の
    接触判定
*/
checkPhase4BlueOrbCollection();


phase4DragonAnimationId =
    requestAnimationFrame(
        updatePhase4DragonMovement
    );
}


/*
    指定角度へ龍を配置
*/
function updatePhase4DragonPosition(
    direction,
    angleDegrees
) {

    const dragon =
        field.querySelector(
            `.phase4-dragon-head[data-direction="${direction}"]`
        );

    if (!dragon) {
        return;
    }


    const route =
        phase4DragonSettings.route;


    const angleRadians =
        angleDegrees *
        Math.PI /
        180;


    const x =
        route.centerX +
        Math.cos(
            angleRadians
        ) *
        route.radius;

    const y =
        route.centerY +
        Math.sin(
            angleRadians
        ) *
        route.radius;


    dragon.style.left =
        `${x}px`;

    dragon.style.top =
        `${y}px`;
}
/*
    =========================
    P4 白龍
    赤デバフ接触判定
    =========================
*/
function checkPhase4DragonRedContact() {

    const dragons =
        field.querySelectorAll(
            ".phase4-dragon-head"
        );

    dragons.forEach(dragon => {

        /*
            すでに2人処理済みなら
            何もしない
        */
        let redContactCount =
            Number(
                dragon.dataset
                    .redContactCount
            );

        if (
            redContactCount >= 2
        ) {
            return;
        }


        const dragonX =
            parseFloat(
                dragon.style.left
            );

        const dragonY =
            parseFloat(
                dragon.style.top
            );


        party.forEach(member => {

            /*
                この龍が処理中に
                2人へ到達した場合
                それ以上処理しない
            */
            if (
                redContactCount >= 2
            ) {
                return;
            }


            const redDebuff =
                member.debuffs.find(
                    debuff =>
                        debuff.type ===
                        "red" &&
                        debuff.time > 0
                );

            if (!redDebuff) {
                return;
            }


            const actor =
                actorStates[
                    member.role
                ];

            if (!actor) {
                return;
            }


            const dx =
                actor.x -
                dragonX;

            const dy =
                actor.y -
                dragonY;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            const contactRadius = 30;


            if (
                distance <=
                contactRadius
            ) {

                /*
                    接触地点に青玉生成
                */
                createPhase4BlueOrb(
                dragonX,
                dragonY,
                member.phase4RedMarker
                    );
                /*
                 接触地点から
                半径145の大AoE
                */
                triggerPhase4DragonExplosion(
                    dragonX,
                    dragonY
            );


                /*
                    赤デバフ解除
                */
                removePhase4RedDebuff(
                    member
                );


                /*
                    この龍の処理人数を
                    1増やす
                */
                redContactCount++;

                dragon.dataset
                    .redContactCount =
                    String(
                        redContactCount
                    );


                console.log(
                    "白龍接触:",
                    dragon.dataset.direction,
                    "→",
                    member.role,
                    `(${redContactCount}/2)`
                );


                /*
                    2人目を処理したら
                    白龍消滅
                */
                if (
                    redContactCount >= 2
                ) {
                    dragon.remove();
                }
            }
        });
    });
}


/*
    赤デバフを解除する
*/
function removePhase4RedDebuff(
    member
) {

    /*
        赤を消す前に
        赤17＋ブリザガか判定
    */
    const isRed17Blizzard =
        member.debuffs.some(
            debuff =>
                debuff.type === "red" &&
                debuff.time <= 17
        ) &&
        member.debuffs.some(
            debuff =>
                debuff.type === "blizzard"
        );


    /*
        赤を消す前に
        エアロガ担当か判定
    */
    const isAero =
        member.debuffs.some(
            debuff =>
                debuff.type === "aero"
        );


    /*
        赤デバフ解除
    */
    member.debuffs =
        member.debuffs.filter(
            debuff =>
                debuff.type !== "red"
        );


    /*
        =========================
        赤17＋ブリザガ

        白龍への接触は完了したが、
        ここではまだ移動しない。

        ブリザガ残り0.2秒以下になったら
        エラプション②へ移動する。
        =========================
    */
    if (
        isRed17Blizzard
    ) {

        member.phase4Red17DragonTouched =
            true;

        member.phase4RedMarker =
            null;
    }


    /*
        =========================
        エアロガ

        stop1 / stop2 は
        ④の左右判定に必要なので
        移動命令を出してから消す
        =========================
    */
    if (
        isAero
    ) {

        movePhase4AeroToFourthPosition();

        member.phase4RedMarker =
            null;
    }


    /*
        それ以外
    */
    if (
        !isRed17Blizzard &&
        !isAero
    ) {
        member.phase4RedMarker =
            null;
    }


    renderParty();
    renderFieldMembers();
    renderPhase4PlayerBlueNumber();
}
/*
    =========================
    P4 青玉
    =========================
*/

let phase4BlueOrbId = 0;


/*
    青玉を1個生成する
*/
function createPhase4BlueOrb(
    x,
    y,
    sourceRedMarker
) {

    phase4BlueOrbId++;

    const orb =
        document.createElement(
            "div"
        );

    orb.className =
        "phase4-blue-orb";


    /*
        青球そのもののID
    */
    orb.dataset.orbId =
        phase4BlueOrbId;


    /*
        この青球を生成した
        赤デバフ担当を記録

        chain1
        chain2
        stop1
        stop2
    */
    orb.dataset.sourceRedMarker =
        sourceRedMarker;


    orb.style.left =
        `${x}px`;

    orb.style.top =
        `${y}px`;

    field.appendChild(
        orb
    );


    console.log(
        "青球生成:",
        "ID:",
        phase4BlueOrbId,
        "生成者:",
        sourceRedMarker,
        "座標:",
        x,
        y
    );
}
/*
    =========================
    P4 白龍
    赤接触時の大AoE
    =========================
*/

function triggerPhase4DragonExplosion(
    x,
    y
) {

    const explosion =
        document.createElement(
            "div"
        );

    explosion.className =
        "phase4-dragon-explosion";

    explosion.style.left =
        `${x}px`;

    explosion.style.top =
        `${y}px`;

    field.appendChild(
        explosion
    );


    /*
        被弾判定
    */
    checkPhase4DragonExplosionHit(
        x,
        y
    );


    /*
        AoE表示を消す
    */
    setTimeout(
        function() {
            explosion.remove();
        },
        1200
    );
}


/*
    白龍AoEの被弾判定
*/
function checkPhase4DragonExplosionHit(
    explosionX,
    explosionY
) {

    const explosionRadius =
        145;


    party.forEach(member => {

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }


        const dx =
            actor.x -
            explosionX;

        const dy =
            actor.y -
            explosionY;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );


        if (
            distance <=
            explosionRadius
        ) {

            failPhase4(
                `白龍AoE被弾：${member.role}`
            );
        }
    });
}
/*
    =========================
    P4 青玉
    回収判定
    =========================
*/

function checkPhase4BlueOrbCollection() {

    const orbs =
        field.querySelectorAll(
            ".phase4-blue-orb"
        );


    orbs.forEach(orb => {

        /*
            すでに回収された玉なら
            処理しない
        */
        if (!orb.isConnected) {
            return;
        }


        const orbX =
            parseFloat(
                orb.style.left
            );

        const orbY =
            parseFloat(
                orb.style.top
            );


        party.forEach(member => {

            /*
                先に誰かが回収した場合
                それ以上この玉を処理しない
            */
            if (!orb.isConnected) {
                return;
            }


            /*
                青デバフを持っている人だけ
                回収可能
            */
            const blueDebuff =
                member.debuffs.find(
                    debuff =>
                        debuff.type ===
                        "blue" &&
                        debuff.time > 0
                );

            if (!blueDebuff) {
                return;
            }


            /*
                =========================
                担当青球チェック
                =========================

                青1 → chain2
                青2 → stop2
                青3 → stop1
                青4 → chain1

                自分の担当ではない青球は
                触れても回収しない
            */
            const assignedOrb =
                getPhase4AssignedBlueOrb(
                    member
                );

            if (
                !assignedOrb ||
                assignedOrb !== orb
            ) {
                return;
            }


            const actor =
                actorStates[
                    member.role
                ];

            if (!actor) {
                return;
            }


            const dx =
                actor.x -
                orbX;

            const dy =
                actor.y -
                orbY;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy
                );


            /*
                青玉の回収距離
            */
            const collectionRadius =
                25;


            if (
                distance <=
                collectionRadius
            ) {

                collectPhase4BlueOrb(
                    member,
                    orb
                );
            }
        });
    });
}


/*
    青玉を回収する
*/
function collectPhase4BlueOrb(
    member,
    orb
) {

    /*
        先に玉を消す

        同じ玉を複数人が
        同時取得するのを防ぐ
    */
    orb.remove();


    /*
        青デバフ解除
    */
    member.debuffs =
        member.debuffs.filter(
            debuff =>
                debuff.type !==
                "blue"
        );


    /*
        青1～4マーカー解除
    */
    member.phase4BlueNumber =
        null;


    console.log(
        "青玉回収:",
        member.role
    );


    /*
        表示更新
    */
    renderParty();

    renderFieldMembers();

    renderPhase4PlayerBlueNumber();


    /*
        =========================
        青玉4個回収確認

        全部なくなったら
        リターン設置位置へ移動開始
        =========================
    */
    checkPhase4AllBlueOrbsCollected();
}
/*
    =========================
    P4 横エクサ
    =========================
*/

const phase4ExaSettings = {

    /*
        一番西側のエクサ中心
    */
    startX: 60,

    /*
        フィールド縦中央
    */
    centerY: 240,

    /*
        次のエクサ中心まで120px
        → AoE幅120なので重ならない・隙間なし
    */
    stepX: 120,

    /*
        エクササイズ
    */
    aoeWidth: 120,
    aoeHeight: 480,

    /*
        タイミング
    */
    firstExplosionDelay: 3000,
    nextExplosionDelay: 2000
};


/*
    横エクサ開始
*/
function startPhase4HorizontalExa() {

    /*
        古いエクサを削除
    */
    field
        .querySelectorAll(
            ".phase4-exa-cell"
        )
        .forEach(
            cell => cell.remove()
        );


    /*
        true
        西 → 東

        false
        東 → 西
    */
    const westToEast =
        Math.random() < 0.5;


    /*
        NPC移動でも使うため保存
    */
    phase4HorizontalWestToEast =
        westToEast;


    const columnOrder =
        westToEast
            ? [0, 1, 2, 3]
            : [3, 2, 1, 0];


    console.log(
        "横エクサ:",
        westToEast
            ? "西→東"
            : "東→西"
    );


    /*
        最初の列の予兆
    */
    showPhase4HorizontalExaColumn(
        columnOrder[0]
    );


    /*
        1発目
    */
    setTimeout(
        function() {

            explodePhase4HorizontalExaColumn(
                columnOrder[0]
            );

            showPhase4HorizontalExaColumn(
                columnOrder[1]
            );

        },
        phase4ExaSettings
            .firstExplosionDelay
    );


    /*
        2発目
    */
    setTimeout(
        function() {

            explodePhase4HorizontalExaColumn(
            columnOrder[1]
            );

            showPhase4HorizontalExaColumn(
            columnOrder[2]
            );


            /*
            青持ちは
            2発目の爆発跡へ入る
            */
            movePhase4BlueMembersIntoHorizontalExaWake(
            columnOrder[1],
            columnOrder[2]
            );


            /*
                2発目が終わった瞬間

                6人
                236,74

                エアロ
                236,406

                ↓

                共通
                228,252
            */
            movePhase4AfterHorizontalSecondExplosion();

        },
        phase4ExaSettings
            .firstExplosionDelay +
        phase4ExaSettings
            .nextExplosionDelay
    );


/*
    3発目
*/
setTimeout(
    function() {

        explodePhase4HorizontalExaColumn(
            columnOrder[2]
        );

        showPhase4HorizontalExaColumn(
            columnOrder[3]
        );

        /*
            3発目を待っていた青持ちだけ
            爆発跡へ入る。

            その後、
            4発目も必要か判断。
        */
        movePhase4BlueMembersIntoHorizontalExaWake(
            columnOrder[2],
            columnOrder[3]
        );

    },
    phase4ExaSettings
        .firstExplosionDelay +
    phase4ExaSettings
        .nextExplosionDelay * 2
);


/*
    4発目
*/
setTimeout(
    function() {

        explodePhase4HorizontalExaColumn(
            columnOrder[3]
        );
            /*
            4発目を待っていた青持ちを
            爆発跡へ移動させる。

            これが横エクサ最後なので
            nextColumn は null。
            到着後は担当青球へ向かう。
        */
            movePhase4BlueMembersIntoHorizontalExaWake(
               columnOrder[3],
              null
            );


        /*
            横エクサ4発目終了後、
            横エクサの残った予兆を
            念のため完全削除
        */
        setTimeout(
            function() {

                field
                    .querySelectorAll(
                        ".phase4-exa-cell.phase4-exa-telegraph"
                    )
                    .forEach(
                        cell => {

                            /*
                                横エクサのセルだけ対象
                            */
                            if (
                                cell.dataset.column !==
                                undefined
                            ) {
                                cell.remove();
                            }
                        }
                    );

            },
            750
        );

    },
    phase4ExaSettings
        .firstExplosionDelay +
    phase4ExaSettings
        .nextExplosionDelay * 3
);
}

/*
    指定した1列の予兆を表示
*/
function showPhase4HorizontalExaColumn(
    column
) {

    const cell =
        createPhase4ExaCell(
            column
        );

    cell.classList.add(
        "phase4-exa-telegraph"
    );
}


/*
    指定した1列を爆発
*/
function explodePhase4HorizontalExaColumn(
    column
) {

    const cells =
        field.querySelectorAll(
            `.phase4-exa-cell[data-column="${column}"]`
        );


    cells.forEach(cell => {

        /*
            予兆 → 実AoE
        */
        cell.classList.remove(
            "phase4-exa-telegraph"
        );

        cell.classList.add(
            "phase4-exa-explosion"
        );


        /*
            爆発した瞬間だけ
            被弾判定
        */
        checkPhase4HorizontalExaHit(
            column
        );


        /*
            爆発表示を消す
        */
        setTimeout(
            function() {
                cell.remove();
            },
            700
        );
    });
}


/*
    エクサ1マスを作る
*/
function createPhase4ExaCell(
    row,
    column
) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "phase4-exa-cell";


    cell.dataset.row =
        row;

    cell.dataset.column =
        column;


    cell.style.left =
        `${
            phase4ExaSettings
                .arenaLeft +
            column *
            phase4ExaSettings
                .cellSize
        }px`;


    cell.style.top =
        `${
            phase4ExaSettings
                .arenaTop +
            row *
            phase4ExaSettings
                .cellSize
        }px`;


            cell.style.width =
            `${phase4ExaSettings.aoeWidth}px`;

            cell.style.height =
             `${phase4ExaSettings.aoeHeight}px`;


    field.appendChild(
        cell
    );


    return cell;
}
/*
    =========================
    P4 横エクサ
    AoE生成
    =========================
*/

function createPhase4ExaCell(
    column
) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "phase4-exa-cell";


    cell.dataset.column =
        column;


    /*
        西端を基準にして
        列番号 × 間隔で配置

        0 → 一番西
        1 → その右
        2 → さらに右
        3 → 一番東
    */
    const x =
        phase4ExaSettings.startX +
        column *
        phase4ExaSettings.stepX;


    const y =
        phase4ExaSettings.centerY;


    cell.style.left =
        `${x}px`;

    cell.style.top =
        `${y}px`;


    cell.style.width =
        `${phase4ExaSettings.aoeWidth}px`;

    cell.style.height =
        `${phase4ExaSettings.aoeHeight}px`;


    /*
        left / topを
        AoEの中心座標として扱う
    */
    cell.style.transform =
        "translate(-50%, -50%)";


    field.appendChild(
        cell
    );


    return cell;
}
/*
    =========================
    P4 横エクサ
    被弾判定
    =========================
*/

function checkPhase4HorizontalExaHit(
    column
) {

    /*
        各エクサの中心X

        60 / 180 / 300 / 420
    */
    const centerX =
        phase4ExaSettings.startX +
        column *
        phase4ExaSettings.stepX;


    const centerY =
        phase4ExaSettings.centerY;


    /*
        半分のサイズ

        現在の設定なら
        横 ±60
        縦 ±240
    */
    const halfWidth =
        phase4ExaSettings.aoeWidth /
        2;

    const halfHeight =
        phase4ExaSettings.aoeHeight /
        2;


party.forEach(member => {

    /*
        P4の失敗判定は
        YOUだけを対象にする。
    */
    if (
        member.role !== controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

        if (!actor) {
            return;
        }


        /*
            長方形AoEの中に
            キャラ中心が入っているか
        */
        const insideX =
            actor.x >=
                centerX - halfWidth &&
            actor.x <=
                centerX + halfWidth;

        const insideY =
            actor.y >=
                centerY - halfHeight &&
            actor.y <=
                centerY + halfHeight;


        if (
            insideX &&
            insideY
        ) {

            failPhase4(
                `横エクサ被弾：${member.role}`
            );
        }
    });
}
/*
    =========================
    P4 縦エクサ
    横エクサを90度回転
    =========================
*/

function startPhase4VerticalExa() {

    /*
        古い縦エクサを削除
    */
    field
        .querySelectorAll(
            ".phase4-vertical-exa-cell"
        )
        .forEach(
            cell => cell.remove()
        );


    /*
        方向をランダム決定
    */
    const northToSouth =
        Math.random() < 0.5;

    phase4VerticalNorthToSouth =
        northToSouth;


    const rowOrder =
        northToSouth
            ? [0, 1, 2, 3]
            : [3, 2, 1, 0];


    console.log(
        "縦エクサ:",
        northToSouth
            ? "北→南"
            : "南→北"
    );


    /*
        最初の危険行
    */
    phase4VerticalCurrentDangerRow =
        rowOrder[0];


    /*
        1発目を越える必要があるか判定
    */
    party.forEach(member => {

        decidePhase4BlueVerticalMovement(
            member,
            rowOrder[0]
        );

    });


    /*
        1発目予兆
    */
    showPhase4VerticalExaRow(
        rowOrder[0]
    );


    /*
        1発目
    */
    setTimeout(
        function() {

            explodePhase4VerticalExaRow(
                rowOrder[0]
            );

            movePhase4BlueMembersIntoVerticalExaWake(
                rowOrder[0]
            );


            /*
                次は2発目
            */
            phase4VerticalCurrentDangerRow =
                rowOrder[1];

            party.forEach(member => {

                decidePhase4BlueVerticalMovement(
                    member,
                    rowOrder[1]
                );

            });

            showPhase4VerticalExaRow(
                rowOrder[1]
            );

        },
        phase4ExaSettings
            .firstExplosionDelay
    );


    /*
        2発目
    */
    setTimeout(
        function() {

            explodePhase4VerticalExaRow(
                rowOrder[1]
            );

            movePhase4BlueMembersIntoVerticalExaWake(
                rowOrder[1]
            );


            /*
                次は3発目
            */
            phase4VerticalCurrentDangerRow =
                rowOrder[2];

            party.forEach(member => {

                decidePhase4BlueVerticalMovement(
                    member,
                    rowOrder[2]
                );

            });

            showPhase4VerticalExaRow(
                rowOrder[2]
            );

        },
        phase4ExaSettings
            .firstExplosionDelay +
        phase4ExaSettings
            .nextExplosionDelay
    );


    /*
        3発目
    */
    setTimeout(
        function() {

            explodePhase4VerticalExaRow(
                rowOrder[2]
            );

            movePhase4BlueMembersIntoVerticalExaWake(
                rowOrder[2]
            );


            /*
                次は4発目
            */
            phase4VerticalCurrentDangerRow =
                rowOrder[3];

            party.forEach(member => {

                decidePhase4BlueVerticalMovement(
                    member,
                    rowOrder[3]
                );

            });

            showPhase4VerticalExaRow(
                rowOrder[3]
            );

        },
        phase4ExaSettings
            .firstExplosionDelay +
        phase4ExaSettings
            .nextExplosionDelay * 2
    );


    /*
        4発目
    */
    setTimeout(
        function() {

            explodePhase4VerticalExaRow(
                rowOrder[3]
            );

            movePhase4BlueMembersIntoVerticalExaWake(
                rowOrder[3]
            );


            /*
                縦エクサ終了
            */
            phase4VerticalCurrentDangerRow =
                null;

        },
        phase4ExaSettings
            .firstExplosionDelay +
        phase4ExaSettings
            .nextExplosionDelay * 3
    );
}


/*
    縦エクサの予兆
*/
function showPhase4VerticalExaRow(
    row
) {

    const cell =
        createPhase4VerticalExaCell(
            row
        );

    cell.classList.add(
        "phase4-exa-telegraph"
    );
}


/*
    縦エクサの爆発
*/
function explodePhase4VerticalExaRow(
    row
) {

    const cell =
        field.querySelector(
            `.phase4-vertical-exa-cell[data-row="${row}"]`
        );

    if (!cell) {
        return;
    }


    cell.classList.remove(
        "phase4-exa-telegraph"
    );

    cell.classList.add(
        "phase4-exa-explosion"
    );


    /*
        爆発した瞬間だけ判定
    */
    checkPhase4VerticalExaHit(
        row
    );


    setTimeout(
        function() {
            cell.remove();
        },
        700
    );
}


/*
    縦エクサ生成

    横エクサの
    X / Y
    Width / Height
    を入れ替えている
*/
function createPhase4VerticalExaCell(
    row
) {

    const cell =
        document.createElement(
            "div"
        );


    cell.className =
        "phase4-exa-cell phase4-vertical-exa-cell";

    cell.dataset.row =
        row;


    /*
        横エクサでは
        X = 60 / 180 / 300 / 420

        ↓ 90度回転

        縦エクサでは
        Y = 60 / 180 / 300 / 420
    */
    const x =
        phase4ExaSettings.centerY;

    const y =
        phase4ExaSettings.startX +
        row *
        phase4ExaSettings.stepX;


    cell.style.left =
        `${x}px`;

    cell.style.top =
        `${y}px`;


    /*
        120×480
        ↓
        480×120
    */
    cell.style.width =
        `${phase4ExaSettings.aoeHeight}px`;

    cell.style.height =
        `${phase4ExaSettings.aoeWidth}px`;


    cell.style.transform =
        "translate(-50%, -50%)";


    field.appendChild(
        cell
    );


    return cell;
}


/*
    縦エクサ被弾判定
*/
function checkPhase4VerticalExaHit(
    row
) {

    const centerX =
        phase4ExaSettings.centerY;

    const centerY =
        phase4ExaSettings.startX +
        row *
        phase4ExaSettings.stepX;


    /*
        横エクサのサイズを
        90度回転
    */
    const halfWidth =
        phase4ExaSettings.aoeHeight /
        2;

    const halfHeight =
        phase4ExaSettings.aoeWidth /
        2;


party.forEach(member => {

    /*
        P4の失敗判定は
        YOUだけを対象にする。
    */
    if (
        member.role !== controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

        if (!actor) {
            return;
        }


        const insideX =
            actor.x >=
                centerX - halfWidth &&
            actor.x <=
                centerX + halfWidth;

        const insideY =
            actor.y >=
                centerY - halfHeight &&
            actor.y <=
                centerY + halfHeight;


        if (
            insideX &&
            insideY
        ) {

            failPhase4(
                `縦エクサ被弾：${member.role}`
            );
        }
    });
}
/*
    =========================
    P4 赤17 初期移動
    =========================
*/

function movePhase4Red17PlayersToDragonRoute() {

    party.forEach(member => {

        const hasRed17 =
            member.debuffs.some(
                debuff =>
                    debuff.type === "red" &&
                    debuff.time <= 17
            );

        const hasBlizzard =
            member.debuffs.some(
                debuff =>
                    debuff.type === "blizzard"
            );

        if (
            !hasRed17 ||
            !hasBlizzard
        ) {
            return;
        }

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }

        /*
            鎖1 = D側
            鎖2 = B側
        */
        if (
            member.phase4RedMarker ===
            "chain1"
        ) {
            actor.targetX = 65;
            actor.targetY = 240;
        }

        if (
            member.phase4RedMarker ===
            "chain2"
        ) {
            actor.targetX = 415;
            actor.targetY = 240;
        }
    });
}
/*
    =========================
    P4 赤17
    赤解除後 → エラプションへ合流
    =========================
*/

function movePhase4Red17ToEruption(
    member
) {

    /*
        YOUは自動移動させない
    */
    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    /*
        現在の青線パターン
    */
    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return;
    }

    /*
        青線が西側なら西②
        青線が東側なら東②
    */
    const blueIsWest =
        pattern.blueStart ===
            "northWest" ||
        pattern.blueEnd ===
            "northWest";

    const target =
        blueIsWest
            ? phase4EruptionRoute
                .westSecond
            : phase4EruptionRoute
                .eastSecond;

    /*
        エラプ本人を追跡するのではなく
        頭割り位置②へ直接集合
    */
    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}
/*
    =========================
    P4 エラプション
    ① 最初の待機位置へ移動
    =========================
*/

const phase4EruptionRoute = {

    /*
        ① 1回目時計回避
    */
    westFirst: {
        x: 102,
        y: 54
    },

    eastFirst: {
        x: 378,
        y: 54
    },

    /*
        ② ホーリー頭割り待機
    */
    westSecond: {
        x: 128,
        y: 43
    },

    eastSecond: {
        x: 352,
        y: 43
    },

    /*
        ③ 3回目時計回避
        Aマーカー真上
    */
    westThird: {
        x: 233,
        y: 12
    },

    eastThird: {
        x: 247,
        y: 12
    }
};


function movePhase4EruptionToFirstPosition() {

    const eruptionMember =
        party.find(
            member =>
                member.debuffs.some(
                    debuff =>
                        debuff.type ===
                        "eruption"
                )
        );

    if (!eruptionMember) {
        return;
    }

    /*
        YOUは自動移動させない
    */
    if (
        eruptionMember.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            eruptionMember.role
        ];

    if (!actor) {
        return;
    }

    /*
        現在選ばれている
        青線パターンを取得
    */
    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return;
    }

    /*
        青線につながる北側時計が
        北西なら西ルート
        北東なら東ルート
    */
    const blueIsWest =
        pattern.blueStart ===
            "northWest" ||
        pattern.blueEnd ===
            "northWest";

    const target =
        blueIsWest
            ? phase4EruptionRoute
                .westFirst
            : phase4EruptionRoute
                .eastFirst;

    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}
/*
    =========================
    P4 エラプション
    ② ホーリー頭割り待機位置へ
    =========================
*/

function movePhase4EruptionToSecondPosition() {

    const eruptionMember =
        party.find(
            member =>
                member.debuffs.some(
                    debuff =>
                        debuff.type ===
                        "eruption"
                )
        );

    if (!eruptionMember) {
        return;
    }

    /*
        YOUは自動移動させない
    */
    if (
        eruptionMember.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            eruptionMember.role
        ];

    if (!actor) {
        return;
    }

    /*
        現在の青線パターン
    */
    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return;
    }

    /*
        北側の青時計が
        西側か東側か判定
    */
    const blueIsWest =
        pattern.blueStart ===
            "northWest" ||
        pattern.blueEnd ===
            "northWest";

    const target =
        blueIsWest
            ? phase4EruptionRoute
                .westSecond
            : phase4EruptionRoute
                .eastSecond;

    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}
/*
    =========================
    座標確認モード
    =========================
*/

let coordinateDebugEnabled = false;


/*
    座標確認モード ON / OFF
*/
function toggleCoordinateDebug() {

    coordinateDebugEnabled =
        !coordinateDebugEnabled;

    const overlay =
        document.getElementById(
            "coordinate-debug-overlay"
        );

    const display =
        document.getElementById(
            "coordinate-debug-display"
        );

    const button =
        document.getElementById(
            "coordinate-debug-button"
        );

    if (overlay) {
        overlay.style.display =
            coordinateDebugEnabled
                ? "block"
                : "none";
    }

    if (display) {
        display.style.display =
            coordinateDebugEnabled
                ? "block"
                : "none";
    }

    if (button) {
        button.textContent =
            coordinateDebugEnabled
                ? "座標表示 OFF"
                : "座標表示 ON";
    }
}


/*
    座標確認UIを作成
*/
function createCoordinateDebugMode() {

    /*
        二重作成防止
    */
    if (
        document.getElementById(
            "coordinate-debug-overlay"
        )
    ) {
        return;
    }

    /*
        グリッド
    */
    const overlay =
        document.createElement(
            "div"
        );

    overlay.id =
        "coordinate-debug-overlay";

    overlay.innerHTML =
        createCoordinateGridHtml();

    field.appendChild(
        overlay
    );


    /*
        現在座標表示
    */
    const display =
        document.createElement(
            "div"
        );

    display.id =
        "coordinate-debug-display";

    display.textContent =
        "X: ---  Y: ---";

    field.appendChild(
        display
    );


    /*
        ON / OFFボタン
    */
    const button =
        document.createElement(
            "button"
        );

    button.id =
        "coordinate-debug-button";

    button.type =
        "button";

    button.textContent =
        "座標表示 ON";

    button.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            toggleCoordinateDebug();
        }
    );

    /*
        フィールドの親要素へ追加
    */
    field.parentElement.appendChild(
        button
    );


    /*
        マウス座標取得
    */
    field.addEventListener(
        "mousemove",
        updateCoordinateDebugMouse
    );


    /*
        クリック地点固定
    */
    field.addEventListener(
        "click",
        pinCoordinateDebugPoint
    );


    /*
        初期状態はOFF
    */
    overlay.style.display =
        "none";

    display.style.display =
        "none";
}


/*
    40px刻みのグリッドを作成
*/
function createCoordinateGridHtml() {

    let html = "";

    for (
        let value = 0;
        value <= 480;
        value += 40
    ) {

        /*
            縦線
        */
        html += `
            <div
                class="coordinate-grid-line coordinate-grid-vertical"
                style="left:${value}px;"
            ></div>
        `;

        /*
            横線
        */
        html += `
            <div
                class="coordinate-grid-line coordinate-grid-horizontal"
                style="top:${value}px;"
            ></div>
        `;

        /*
            X座標数字
        */
        if (value < 480) {
            html += `
                <div
                    class="coordinate-grid-label coordinate-grid-x-label"
                    style="left:${value + 3}px;"
                >
                    ${value}
                </div>
            `;
        }

        /*
            Y座標数字
        */
        if (value < 480) {
            html += `
                <div
                    class="coordinate-grid-label coordinate-grid-y-label"
                    style="top:${value + 3}px;"
                >
                    ${value}
                </div>
            `;
        }
    }

    return html;
}


/*
    マウス位置を
    480×480座標へ変換
*/
function getFieldMouseCoordinate(
    event
) {

    const rect =
        field.getBoundingClientRect();

    const x =
        (
            event.clientX -
            rect.left
        ) *
        480 /
        rect.width;

    const y =
        (
            event.clientY -
            rect.top
        ) *
        480 /
        rect.height;

    return {
        x: Math.round(x),
        y: Math.round(y)
    };
}


/*
    マウス座標をリアルタイム表示
*/
function updateCoordinateDebugMouse(
    event
) {

    if (
        !coordinateDebugEnabled
    ) {
        return;
    }

    const position =
        getFieldMouseCoordinate(
            event
        );

    const display =
        document.getElementById(
            "coordinate-debug-display"
        );

    if (!display) {
        return;
    }

    display.textContent =
        `X: ${position.x}  Y: ${position.y}`;
}


/*
    クリック地点を固定
*/
function pinCoordinateDebugPoint(
    event
) {

    if (
        !coordinateDebugEnabled
    ) {
        return;
    }

    /*
        既存マーカー削除
    */
    const oldMarker =
        document.getElementById(
            "coordinate-debug-pin"
        );

    if (oldMarker) {
        oldMarker.remove();
    }

    const position =
        getFieldMouseCoordinate(
            event
        );

    const marker =
        document.createElement(
            "div"
        );

    marker.id =
        "coordinate-debug-pin";

    marker.style.left =
        `${position.x}px`;

    marker.style.top =
        `${position.y}px`;

    marker.innerHTML = `
        <div class="coordinate-debug-dot">
        </div>

        <div class="coordinate-debug-pin-label">
            (${position.x}, ${position.y})
        </div>
    `;

    field.appendChild(
        marker
    );
}


/*
    ページ読み込み後に作成
*/
window.addEventListener(
    "load",
    function() {
        createCoordinateDebugMode();
    }
);
/*
    =========================
    P4 エラプション
    ③ 3回目時計回避位置へ
    =========================
*/

function movePhase4EruptionToThirdPosition() {

    const eruptionMember =
        party.find(
            member =>
                member.debuffs.some(
                    debuff =>
                        debuff.type ===
                        "eruption"
                )
        );

    if (!eruptionMember) {
        return;
    }

    /*
        YOUは自動移動させない
    */
    if (
        eruptionMember.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            eruptionMember.role
        ];

    if (!actor) {
        return;
    }

    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return;
    }

    const blueIsWest =
        pattern.blueStart ===
            "northWest" ||
        pattern.blueEnd ===
            "northWest";

    const target =
        blueIsWest
            ? phase4EruptionRoute
                .westThird
            : phase4EruptionRoute
                .eastThird;

    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}
/*
    =========================
    P4 ホーリー担当
    ② 頭割り位置へ移動
    =========================
*/

/*
    =========================
    P4 エアロガ担当ルート
    =========================
*/


/*
    現在の青線が
    西側かどうか取得
*/
function isPhase4BlueWest() {

    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return false;
    }

    return (
        pattern.blueStart === "northWest" ||
        pattern.blueEnd === "northWest"
    );
}


/*
    エアロガ担当を取得
*/
function getPhase4AeroMember() {

    return party.find(
        member =>
            member.debuffs.some(
                debuff =>
                    debuff.type === "aero"
            )
    );
}


/*
    =========================
    ① 初期位置
    =========================
*/
function movePhase4AeroToFirstPosition() {

    const member =
        getPhase4AeroMember();

    if (!member) {
        return;
    }

    /*
        YOUは自動移動しない
    */
    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    const target =
        isPhase4BlueWest()
            ? phase4AeroRoute
                .westFirst
            : phase4AeroRoute
                .eastFirst;

    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}


/*
    =========================
    ② 黄色時計終了後
    =========================
*/
function movePhase4AeroToSecondPosition() {

    const member =
        getPhase4AeroMember();

    if (!member) {
        return;
    }

    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    const target =
        isPhase4BlueWest()
            ? phase4AeroRoute
                .westSecond
            : phase4AeroRoute
                .eastSecond;

    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}


/*
    =========================
    ③ エアロガ発動直後
    =========================
*/
function movePhase4AeroToThirdPosition(
    member
) {

    if (!member) {
        return;
    }

    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    const target =
        isPhase4BlueWest()
            ? phase4AeroRoute
                .westThird
            : phase4AeroRoute
                .eastThird;

    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}


/*
    =========================
    ④ 白龍接触後
    =========================
*/
/*
    =========================
    P4 エアロガ担当ルート
    =========================
*/

const phase4AeroRoute = {

    /*
        禁止1：西側
    */
    westFirst: {
        x: 104,
        y: 425
    },

    westSecond: {
        x: 127,
        y: 441
    },

    westThird: {
        x: 124,
        y: 358
    },

    westFourth: {
        x: 231,
        y: 469
    },


    /*
        禁止2：東側
    */
    eastFirst: {
        x: 376,
        y: 425
    },

    eastSecond: {
        x: 353,
        y: 441
    },

    eastThird: {
        x: 356,
        y: 358
    },

    eastFourth: {
        x: 249,
        y: 469
    }
};


/*
    エアロガ担当を
    2人とも取得
*/
function getPhase4AeroMembers() {

    return party.filter(
        member =>
            member.debuffs.some(
                debuff =>
                    debuff.type === "aero"
            )
    );
}


/*
    禁止1 / 禁止2から
    使用するルートを取得
*/
function getPhase4AeroRoute(
    member
) {

    if (
        member.phase4RedMarker ===
        "stop1"
    ) {
        return {
            first:
                phase4AeroRoute.westFirst,

            second:
                phase4AeroRoute.westSecond,

            third:
                phase4AeroRoute.westThird,

            fourth:
                phase4AeroRoute.westFourth
        };
    }

    if (
        member.phase4RedMarker ===
        "stop2"
    ) {
        return {
            first:
                phase4AeroRoute.eastFirst,

            second:
                phase4AeroRoute.eastSecond,

            third:
                phase4AeroRoute.eastThird,

            fourth:
                phase4AeroRoute.eastFourth
        };
    }

    return null;
}


/*
    =========================
    ① 初期位置
    =========================
*/
function movePhase4AeroToFirstPosition() {

    const members =
        getPhase4AeroMembers();

    members.forEach(member => {

        /*
            YOUは自動移動しない
        */
        if (
            member.role ===
            controlledRole
        ) {
            return;
        }

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }

        const route =
            getPhase4AeroRoute(
                member
            );

        if (!route) {
            return;
        }

        actor.targetX =
            route.first.x;

        actor.targetY =
            route.first.y;
    });
}


/*
    =========================
    ② 黄色時計終了後
    =========================
*/
function movePhase4AeroToSecondPosition() {

    const members =
        getPhase4AeroMembers();

    members.forEach(member => {

        if (
            member.role ===
            controlledRole
        ) {
            return;
        }

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }

        const route =
            getPhase4AeroRoute(
                member
            );

        if (!route) {
            return;
        }

        actor.targetX =
            route.second.x;

        actor.targetY =
            route.second.y;
    });
}


/*
    =========================
    ③ エアロガ発動直後
    =========================
*/
function movePhase4AeroToThirdPosition(
    member
) {

    if (!member) {
        return;
    }

    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    const route =
        getPhase4AeroRoute(
            member
        );

    if (!route) {
        return;
    }

    actor.targetX =
        route.third.x;

    actor.targetY =
        route.third.y;
}


/*
    =========================
    ④ 白龍接触後
    =========================
*/
function movePhase4AeroToFourthPosition() {

    const members =
        getPhase4AeroMembers();

    members.forEach(member => {

        /*
            すでに④へ移動済み
        */
        if (
            member.phase4AeroMovedToFourth
        ) {
            return;
        }


        /*
            赤が残っている =
            まだ白龍処理前
        */
        const hasRed =
            member.debuffs.some(
                debuff =>
                    debuff.type === "red"
            );

        if (hasRed) {
            return;
        }


        if (
            member.role ===
            controlledRole
        ) {
            return;
        }


        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }


        const route =
            getPhase4AeroRoute(
                member
            );

        if (!route) {
            return;
        }


        member.phase4AeroMovedToFourth =
            true;


        /*
            まず④へ
        */
        actor.targetX =
            route.fourth.x;

        actor.targetY =
            route.fourth.y;


        /*
            ④へ実際に着いた後、
            3回目時計が終わっていれば
            横エクサ待機位置へ進む
        */
        waitPhase4AeroFourthArrival(
            member
        );
    });
}

/*
    =========================
    P4 南側 青3人ルート
    ブリザガ / ウォタガ / ホーリー
    =========================
*/

const phase4SouthBlueRoute = {

    /*
        ① エアロガ担当と同じ位置
    */
    westFirst: {
        x: 104,
        y: 425
    },

    eastFirst: {
        x: 376,
        y: 425
    },

    /*
        ② エアロガ受け位置
    */
    westSecond: {
    x: 157,
    y: 396
    },

    eastSecond: {
    x: 323,
    y: 396
    }
};


/*
    南側に行く青3人を取得
*/
function getPhase4SouthBlueMembers() {

    return party.filter(
        member => {

            const hasBlue =
                member.debuffs.some(
                    debuff =>
                        debuff.type === "blue"
                );

            if (!hasBlue) {
                return false;
            }

            const hasBlizzard =
                member.debuffs.some(
                    debuff =>
                        debuff.type === "blizzard"
                );

            const hasWater =
                member.debuffs.some(
                    debuff =>
                        debuff.type === "water"
                );

            const hasHoly =
                member.debuffs.some(
                    debuff =>
                        debuff.type === "holy"
                );

            return (
                hasBlizzard ||
                hasWater ||
                hasHoly
            );
        }
    );
}


/*
    西 / 東どちらへ行くか取得

    stop1側のエアロに青3人が集合する場合は西
    stop2側なら東

    現在は青線の位置に合わせる
*/
/*
    =========================
    南青3人
    エアロガを受ける側

    南側の
    3回目に爆発する青時計を見る
    =========================
*/
function getPhase4SouthBlueAeroSide() {

    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return null;
    }

    /*
        青線が

        NE ↔ SW
        → 南側青時計はSW
        → west

        NW ↔ SE
        → 南側青時計はSE
        → east
    */
    const blueIsSouthWest =
        pattern.blueStart === "southWest" ||
        pattern.blueEnd === "southWest";

    return blueIsSouthWest
        ? "west"
        : "east";
}


/*
    =========================
    南青3人
    エアロガ後に
    エラプションへ集合する側

    北側の青時計を見る
    =========================
*/
function getPhase4SouthBlueEruptionSide() {

    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return null;
    }

    const blueIsNorthWest =
        pattern.blueStart === "northWest" ||
        pattern.blueEnd === "northWest";

    return blueIsNorthWest
        ? "west"
        : "east";
}


/*
    =========================
    ① P4開始時
    =========================
*/
function movePhase4SouthBlueToFirstPosition() {

    const members =
        getPhase4SouthBlueMembers();

const side =
    getPhase4SouthBlueAeroSide();

    if (!side) return;

    const target =
        side === "west"
            ? phase4SouthBlueRoute.westFirst
            : phase4SouthBlueRoute.eastFirst;

    members.forEach(member => {

        if (member.role === controlledRole) {
            return;
        }

        const actor =
            actorStates[member.role];

        if (!actor) return;

        actor.targetX = target.x;
        actor.targetY = target.y;
    });
}


/*
    =========================
    ② 黄色時計終了後
    =========================
*/
function movePhase4SouthBlueToSecondPosition() {

    const members =
        getPhase4SouthBlueMembers();

    const side =
    getPhase4SouthBlueAeroSide();

    if (!side) return;

    const target =
        side === "west"
            ? phase4SouthBlueRoute.westSecond
            : phase4SouthBlueRoute.eastSecond;

    members.forEach(member => {

        if (member.role === controlledRole) {
            return;
        }

        const actor =
            actorStates[member.role];

        if (!actor) return;

        actor.targetX = target.x;
        actor.targetY = target.y;
    });
}
/*
    =========================
    P4 南側青3人
    エアロガ後 → エラプ②へ集合
    =========================
*/

function movePhase4SouthBlueToEruptionSecond() {

    const members =
        getPhase4SouthBlueMembers();

    const side =
    getPhase4SouthBlueEruptionSide();

    if (!side) return;

    const target =
        side === "west"
            ? phase4EruptionRoute.westSecond
            : phase4EruptionRoute.eastSecond;

    console.log(
        "【南青3人→エラプ②】対象:",
        members.map(member => ({
            role: member.role,
            debuffs: member.debuffs.map(
                debuff => debuff.type
            )
        }))
    );

    members.forEach(member => {

        if (member.role === controlledRole) {
            console.log(
                "YOUなので自動移動なし:",
                member.role
            );
            return;
        }

        const actor =
            actorStates[member.role];

        if (!actor) return;

        actor.targetX = target.x;
        actor.targetY = target.y;

        console.log(
            "エラプ②へ移動命令:",
            member.role,
            "現在位置:",
            actor.x,
            actor.y,
            "目的地:",
            actor.targetX,
            actor.targetY
        );
    });
}

/*
    =========================
    P4 エクサ回避 NPC移動
    横エクサ編
    =========================
*/

/*
    true  = 西 → 東
    false = 東 → 西
*/
let phase4HorizontalWestToEast = null;

/*
    3回目の時計が爆発済みか
*/
let phase4ThirdClockFinished = false;
/*
    横エクサ2発目が爆発済みか
*/
let phase4HorizontalSecondFinished = false;


/*
    X座標を横反転
*/
function mirrorPhase4X(x) {
    return 480 - x;
}


/*
    エアロガ2人以外
    = エラプ③まで一緒に動く6人
*/
function getPhase4NorthSixMembers() {

    return party.filter(
        member =>
            !member.debuffs.some(
                debuff =>
                    debuff.type === "aero"
            )
    );
}


/*
    横エクサ方向に合わせて
    基準座標を左右反転
*/
function getPhase4HorizontalPoint(
    x,
    y
) {

    if (
        phase4HorizontalWestToEast ===
        false
    ) {
        return {
            x: mirrorPhase4X(x),
            y: y
        };
    }

    return {
        x: x,
        y: y
    };
}


/*
    =========================
    6人
    エラプ③ → 横エクサ待機
    =========================

    西→東
    (250,63)

    東→西
    左右反転
*/
function movePhase4NorthSixToHorizontalWait() {

    const target =
        getPhase4HorizontalPoint(
            250,
            63
        );

    getPhase4NorthSixMembers()
        .forEach(member => {

            if (
                member.role ===
                controlledRole
            ) {
                return;
            }

            const actor =
                actorStates[
                    member.role
                ];

            if (!actor) {
                return;
            }

            actor.targetX =
                target.x;

            actor.targetY =
                target.y;
        });
}


/*
    =========================
    エアロガ
    ④到着後 → 横エクサ待機

    6人の待機位置を
    Y軸反転
    =========================

    西→東
    (250,417)
*/
function movePhase4AeroToHorizontalWait(
    member
) {

    if (!member) {
        return;
    }

    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    const target =
        getPhase4HorizontalPoint(
            250,
            417
        );

    actor.targetX =
        target.x;

    actor.targetY =
        target.y;
}


/*
    エアロガ担当が④へ着くまで待つ。

    さらに3回目時計が終わってから
    横エクサ待機位置へ進む。
*/
function waitPhase4AeroFourthArrival(
    member
) {

    if (!member) {
        return;
    }

    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    const route =
        getPhase4AeroRoute(
            member
        );

    if (
        !actor ||
        !route
    ) {
        return;
    }

    const checkTimer =
        setInterval(
            function() {

                const dx =
                    actor.x -
                    route.fourth.x;

                const dy =
                    actor.y -
                    route.fourth.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                /*
                    ④に着くまでは
                    絶対に次へ行かない
                */
                if (
                    distance > 1
                ) {
                    return;
                }

                /*
                    3回目時計終了前なら待つ
                */
                if (
                    !phase4ThirdClockFinished
                ) {
                    return;
                }

                clearInterval(
                    checkTimer
                );


                /*
                    横2発目がまだなら、
                    まず通常の待機位置へ
                */
                if (
                    !phase4HorizontalSecondFinished
                ) {

                    movePhase4AeroToHorizontalWait(
                        member
                    );

                    return;
                }


                /*
                    ④到着時点ですでに
                    横2発目が終わっていた場合。

                    待機位置を飛ばさず、
                    236,406相当
                    ↓
                    228,252相当
                    の順で移動。
                */
                const second =
                    getPhase4HorizontalPoint(
                        236,
                        406
                    );

                const final =
                    getPhase4HorizontalPoint(
                        228,
                        252
                    );

                movePhase4MemberViaPoint(
                    member,
                    second,
                    final
                );

            },
            50
        );
}


/*
    =========================
    横エクサ2発目終了後

    6人
    (236,74)

    エアロ
    (236,406)

    に一度入り、
    到着したら共通地点
    (228,252)
    へ進む
    =========================
*/
function movePhase4AfterHorizontalSecondExplosion() {

    /*
        =========================
        北側6人
        =========================
    */
    getPhase4NorthSixMembers()
        .forEach(member => {

            const second =
                getPhase4HorizontalPoint(
                    236,
                    74
                );

            const final =
                getPhase4HorizontalPoint(
                    228,
                    252
                );

            /*
                青持ちは中央復帰中にする
            */
            if (
                isPhase4BlueMember(
                    member
                )
            ) {
                member.phase4ReturningToCenter =
                    true;
            }

            movePhase4MemberViaPoint(
                member,
                second,
                final
            );
        });


    /*
        =========================
        エアロガ2人
        =========================
    */
    getPhase4AeroMembers()
        .forEach(member => {

            const second =
                getPhase4HorizontalPoint(
                    236,
                    406
                );

            const final =
                getPhase4HorizontalPoint(
                    228,
                    252
                );

            /*
                青持ちは中央復帰中にする
            */
            if (
                isPhase4BlueMember(
                    member
                )
            ) {
                member.phase4ReturningToCenter =
                    true;
            }

            movePhase4MemberViaPoint(
                member,
                second,
                final
            );
        });
}


/*
    中継地点まで移動
    ↓
    到着したら次の地点へ移動
*/
function movePhase4MemberViaPoint(
    member,
    via,
    final
) {

    if (!member) {
        return;
    }

    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    actor.targetX =
        via.x;

    actor.targetY =
        via.y;

    const checkTimer =
        setInterval(
            function() {

                const dx =
                    actor.x -
                    via.x;

                const dy =
                    actor.y -
                    via.y;

                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    );

                if (
                    distance > 1
                ) {
                    return;
                }

                clearInterval(
                    checkTimer
                );

                actor.targetX =
                    final.x;

                actor.targetY =
                    final.y;

                /*
                    最終地点への到着待ち
                */
                const finalCheckTimer =
                    setInterval(
                        function() {

                            const finalDx =
                                actor.x -
                                final.x;

                            const finalDy =
                                actor.y -
                                final.y;

                            const finalDistance =
                                Math.sqrt(
                                    finalDx * finalDx +
                                    finalDy * finalDy
                                );

                            if (
                                finalDistance > 1
                            ) {
                                return;
                            }

                            clearInterval(
                                finalCheckTimer
                            );

                            /*
                                青持ちが中央に到着したら
                                中央復帰中を解除
                            */
                            if (
                                member.phase4ReturningToCenter
                            ) {
                                member.phase4ReturningToCenter =
                                    false;

                                console.log(
                                    "中央復帰完了:",
                                    member.role
                                );

                                movePhase4BlueMemberToAssignedOrb(
                                    member
                                );
                            }

                        },
                        50
                    );

            },
            50
        );
}
/*
    =========================
    P4 北側6人
    ホーリー処理後
    → エラプション③へ集合
    =========================
*/
function movePhase4NorthSixToEruptionThird() {

    const pattern =
        phase4TimeCrystalData
            .patterns[
                phase4TimeCrystalPatternIndex
            ];

    if (!pattern) {
        return;
    }

    /*
        北側の青時計で左右決定
    */
    const blueIsWest =
        pattern.blueStart === "northWest" ||
        pattern.blueEnd === "northWest";

    const target =
        blueIsWest
            ? phase4EruptionRoute.westThird
            : phase4EruptionRoute.eastThird;


    /*
        エアロガ2人以外の6人
    */
    getPhase4NorthSixMembers()
        .forEach(member => {

            if (
                member.role ===
                controlledRole
            ) {
                return;
            }

            const actor =
                actorStates[
                    member.role
                ];

            if (!actor) {
                return;
            }

            actor.targetX =
                target.x;

            actor.targetY =
                target.y;
        });
}

/*
    =========================
    P4 青番号
    → 回収する青球の生成者
    =========================
*/
function getPhase4BlueOrbSourceMarker(
    blueNumber
) {

    switch (
        Number(blueNumber)
    ) {

        /*
            青1
            → バインド2
        */
        case 1:
            return "chain2";


        /*
            青2
            → ストップ2
        */
        case 2:
            return "stop2";


        /*
            青3
            → ストップ1
        */
        case 3:
            return "stop1";


        /*
            青4
            → バインド1
        */
        case 4:
            return "chain1";


        default:
            return null;
    }
}


/*
    =========================
    青持ち本人が
    回収するべき青球を取得
    =========================
*/
function getPhase4AssignedBlueOrb(
    member
) {

    if (
        !member ||
        !member.phase4BlueNumber
    ) {
        return null;
    }


    /*
        青番号から
        必要な生成者を取得
    */
    const sourceMarker =
        getPhase4BlueOrbSourceMarker(
            member.phase4BlueNumber
        );

    if (!sourceMarker) {
        return null;
    }


    /*
        フィールド上の青球を取得
    */
    const orbs =
        Array.from(
            field.querySelectorAll(
                ".phase4-blue-orb"
            )
        );


    /*
        指定された赤担当が
        作った青球を探す
    */
    return (
        orbs.find(
            orb =>
                orb.dataset
                    .sourceRedMarker ===
                sourceMarker
        ) ||
        null
    );
}
/*
    =========================
    P4 青デバフ持ち判定
    =========================
*/
function isPhase4BlueMember(
    member
) {

    if (!member) {
        return false;
    }

    return member.debuffs.some(
        debuff =>
            debuff.type === "blue"
    );
}
/*
    =========================
    P4 青持ちNPC

    横エクサが爆発したら
    その爆発跡へ移動
    =========================
*/
function movePhase4BlueMembersIntoHorizontalExaWake(
    explodedColumn,
    nextColumn = null
) {

    const targetX =
        explodedColumn * 120 + 60;


    party.forEach(member => {

        if (
            !isPhase4BlueMember(
                member
            )
        ) {
            return;
        }


        if (
            member.role ===
            controlledRole
        ) {
            return;
        }


/*
    本当にこの横エクサを
    待っていた人だけ動かす。

    null / undefined の人は
    すでに青玉へ向かっている可能性があるので
    絶対に触らない。
*/
if (
    member.phase4WaitingHorizontalColumn !==
    explodedColumn
) {
    return;
}


        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }


        member.phase4WaitingHorizontalColumn =
            null;


        /*
            爆発跡へ入る
        */
        actor.targetX =
            targetX;

        actor.targetY =
            actor.y;


        const checkTimer =
            setInterval(
                function() {

                    if (
                        !isPhase4BlueMember(
                            member
                        )
                    ) {

                        clearInterval(
                            checkTimer
                        );

                        return;
                    }


                    const distance =
                        Math.abs(
                            actor.x -
                            targetX
                        );


                    if (
                        distance > 2
                    ) {
                        return;
                    }


                    clearInterval(
                        checkTimer
                    );


                    /*
                        次の横エクサがまだある
                    */
                    if (
                        nextColumn !== null
                    ) {

                        decidePhase4BlueHorizontalMovement(
                            member,
                            nextColumn
                        );

                        return;
                    }


                    /*
                        横エクサ終了
                        → 青球へ
                    */
                    movePhase4BlueMemberToAssignedOrb(
                        member
                    );

                },
                50
            );
    });
}
/*
    =========================
    青持ちNPC
    担当青球へ向かう
    =========================
*/
function movePhase4BlueMemberToAssignedOrb(
    member
) {

    if (!member) {
        return;
    }
    /*
    中央へ戻っている途中なら
    青玉への移動命令を出さない
*/
if (
    member.phase4ReturningToCenter
) {
    console.log(
        "青玉移動保留・中央復帰中:",
        member.role
    );

    return;
}


    /*
        YOUは自動操作しない
    */
    if (
        member.role ===
        controlledRole
    ) {
        return;
    }


    /*
        もう青を回収済み
    */
    if (
        !isPhase4BlueMember(
            member
        )
    ) {

        member.phase4BlueOrbRetryPending =
            false;

        return;
    }


    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }


    /*
        青番号に対応する
        担当青球を取得
    */
    const orb =
        getPhase4AssignedBlueOrb(
            member
        );


    /*
        =========================
        担当青球がまだ出ていない

        今まではここで終了していた。

        100ms後にもう一度探す。
        =========================
    */
    if (
        !orb ||
        !orb.isConnected
    ) {

        if (
            member.phase4BlueOrbRetryPending
        ) {
            return;
        }


        member.phase4BlueOrbRetryPending =
            true;


        setTimeout(
            function() {

                member.phase4BlueOrbRetryPending =
                    false;

                movePhase4BlueMemberToAssignedOrb(
                    member
                );

            },
            100
        );


        return;
    }


    /*
        担当青球を発見したので
        再確認待ちは終了
    */
    member.phase4BlueOrbRetryPending =
        false;


    const orbX =
        parseFloat(
            orb.style.left
        );

    const orbY =
        parseFloat(
            orb.style.top
        );
        /*
    TEST
    青玉までの横エクサ危険判定
*/
checkPhase4BlueOrbHorizontalRoute(
    member
);


    actor.targetX =
        orbX;

    actor.targetY =
        orbY;


    console.log(
        "担当青球へ移動:",
        member.role,
        "青",
        member.phase4BlueNumber,
        "→",
        orb.dataset.sourceRedMarker,
        orbX,
        orbY
    );
}
/*
    =========================
    青持ち4人
    担当青球への移動開始
    =========================
*/
function startPhase4BlueOrbCollectionMovement() {

    party.forEach(member => {

        if (
            !isPhase4BlueMember(
                member
            )
        ) {
            return;
        }

        movePhase4BlueMemberToAssignedOrb(
            member
        );
    });
}
/*
    =========================
    担当青球が
    指定した横エクサ列より
    進行方向側にあるか
    =========================
*/
function doesPhase4BlueOrbNeedNextHorizontalExa(
    member,
    nextColumn
) {

    const orb =
        getPhase4AssignedBlueOrb(
            member
        );

    if (
        !orb ||
        !orb.isConnected
    ) {
        return false;
    }


    const orbX =
        parseFloat(
            orb.style.left
        );


    /*
        次エクサ列の範囲
    */
    const centerX =
        nextColumn * 120 + 60;

    const left =
        centerX - 60;

    const right =
        centerX + 60;


    /*
        西 → 東エクサ
    */
    if (
        phase4HorizontalWestToEast ===
        true
    ) {

        return (
            orbX >= left
        );
    }


    /*
        東 → 西エクサ
    */
    if (
        phase4HorizontalWestToEast ===
        false
    ) {

        return (
            orbX <= right
        );
    }


    return false;
}
/*
    =========================
    青持ちNPC

    次の横エクサが必要なら待つ。
    必要なければ担当青球へ行く。
    =========================
*/
function decidePhase4BlueHorizontalMovement(
    member,
    nextColumn
) {

    if (
        !isPhase4BlueMember(
            member
        )
    ) {
        return;
    }


    if (
        member.role ===
        controlledRole
    ) {
        return;
    }


    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }


    const needsNextExa =
        doesPhase4BlueOrbNeedNextHorizontalExa(
            member,
            nextColumn
        );


    /*
        次エクサを越える必要なし
        → 青球へ直行
    */
    if (!needsNextExa) {

        member.phase4WaitingHorizontalColumn =
            null;

        movePhase4BlueMemberToAssignedOrb(
            member
        );

        return;
    }


    /*
        次エクサを越える必要あり。

        今いる場所で待機。
    */
    member.phase4WaitingHorizontalColumn =
        nextColumn;

    actor.targetX =
        actor.x;

    actor.targetY =
        actor.y;


    console.log(
        "青持ち横エクサ待機:",
        member.role,
        "次:",
        nextColumn
    );
}
/*
    =========================
    P4 縦エクサ状態
    =========================
*/

/*
    true  = 北 → 南
    false = 南 → 北
    null  = まだ開始していない
*/
let phase4VerticalNorthToSouth =
    null;


/*
    現在予兆が出ている行

    0 = 一番北
    1 = 北寄り
    2 = 南寄り
    3 = 一番南

    null = 縦エクサ終了
*/
let phase4VerticalCurrentDangerRow =
    null;

    /*
    =========================
    赤17＋ブリザガ

    白龍接触済み
    ＋
    ブリザガ残り0.2秒以下

    の両方を満たしたら
    エラプション②へ移動
    =========================
*/
function updatePhase4Red17BlizzardMovement() {

    party.forEach(member => {

        /*
            白龍にまだ触れていない
        */
        if (
            !member.phase4Red17DragonTouched
        ) {
            return;
        }


        /*
            すでに移動開始済み
        */
        if (
            member.phase4Red17StartedEruptionMove
        ) {
            return;
        }


        /*
            現在のブリザガを取得
        */
        const blizzardDebuff =
            member.debuffs.find(
                debuff =>
                    debuff.type ===
                    "blizzard"
            );


        if (!blizzardDebuff) {
            return;
        }


        /*
            まだ0.2秒より多く残っている
        */
        if (
            blizzardDebuff.time > 0.2
        ) {
            return;
        }


        /*
            =========================
            条件成立

            白龍接触済み
            ＋
            ブリザガ残り0.2秒以下
            =========================
        */
        member.phase4Red17StartedEruptionMove =
            true;


        movePhase4Red17ToEruption(
            member
        );


        console.log(
            "赤17ブリザガ移動開始:",
            member.role,
            "ブリザガ残り:",
            blizzardDebuff.time
        );
    });
}
function doesPhase4BlueOrbNeedNextVerticalExa(
    member,
    nextRow
) {

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return false;
    }


    const orb =
        getPhase4AssignedBlueOrb(
            member
        );

    if (!orb) {
        return false;
    }


    const orbY =
        parseFloat(
            orb.style.top
        );


    /*
        縦エクサ1行の範囲

        row 0 : Y   0 ～ 120
        row 1 : Y 120 ～ 240
        row 2 : Y 240 ～ 360
        row 3 : Y 360 ～ 480
    */
    const rowMinY =
        nextRow * 120;

    const rowMaxY =
        rowMinY + 120;


    /*
        NPCと担当青玉が
        このエクサ行を挟んでいるか確認
    */
    const actorIsNorth =
        actor.y < rowMinY;

    const actorIsSouth =
        actor.y > rowMaxY;

    const orbIsNorth =
        orbY < rowMinY;

    const orbIsSouth =
        orbY > rowMaxY;


    /*
        北側 → 南側
        または
        南側 → 北側

        なら、この行を越える必要あり
    */
    return (
        actorIsNorth &&
        orbIsSouth
    ) || (
        actorIsSouth &&
        orbIsNorth
    );
}
function decidePhase4BlueVerticalMovement(
    member,
    nextRow
) {

    if (
        !isPhase4BlueMember(
            member
        )
    ) {
        return;
    }

    if (
        member.role ===
        controlledRole
    ) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    const needsNextExa =
        doesPhase4BlueOrbNeedNextVerticalExa(
            member,
            nextRow
        );

    /*
        次の縦エクサを越える必要なし
    */
    if (!needsNextExa) {

        member.phase4WaitingVerticalRow =
            null;

        console.log(
            "青持ち縦エクサ待機不要:",
            member.role,
            "次:",
            nextRow
        );

        return;
    }

    /*
        次の縦エクサを越える必要あり。

        まず「何行目を待つか」は記録する。
    */
    member.phase4WaitingVerticalRow =
        nextRow;

    /*
        横エクサ処理中なら、
        縦エクサから移動命令は出さない。
    */
    if (
        isPhase4BlueBusyWithHorizontalExa(
            member
        )
    ) {

        console.log(
            "青持ち縦エクサ保留（横処理中）:",
            member.role,
            "縦:",
            nextRow
        );

        return;
    }

    console.log(
        "青持ち縦エクサ待機可能:",
        member.role,
        "次:",
        nextRow
    );
}

function isPhase4BlueBusyWithHorizontalExa(
    member
) {

    if (!member) {
        return false;
    }

    return (
        member.phase4WaitingHorizontalColumn !==
            undefined &&
        member.phase4WaitingHorizontalColumn !==
            null
    );
}

function movePhase4BlueMembersIntoVerticalExaWake(
    explodedRow
) {

    const targetY =
        explodedRow * 120 + 60;

    party.forEach(member => {

        if (
            !isPhase4BlueMember(
                member
            )
        ) {
            return;
        }

        if (
            member.role ===
            controlledRole
        ) {
            return;
        }

        /*
            この縦エクサを
            待っている人だけ対象
        */
        if (
            member.phase4WaitingVerticalRow !==
            explodedRow
        ) {
            return;
        }

        /*
            横エクサ処理中なら
            まだ縦側から動かさない
        */
        if (
            isPhase4BlueBusyWithHorizontalExa(
                member
            )
        ) {
            console.log(
                "縦エクサ爆発済み・横処理待ち:",
                member.role,
                "縦:",
                explodedRow
            );

            return;
        }

        const actor =
            actorStates[
                member.role
            ];

        if (!actor) {
            return;
        }

        /*
            爆発した行の中央へ入る。

            Xは現在位置を維持して、
            Yだけ変更する。
        */
        actor.targetX =
            actor.x;

        actor.targetY =
            targetY;

        member.phase4WaitingVerticalRow =
            null;

        console.log(
            "青持ち縦エクサ爆発跡へ:",
            member.role,
            "行:",
            explodedRow,
            "目的地:",
            actor.targetX,
            actor.targetY
        );
    });
}

/*
    =========================
    P4 リセット用
    タイマー管理
    =========================
*/

let phase4TimeoutIds = [];

/*
    P4専用 setTimeout

    今後P4で時間予約するときは
    setTimeoutではなく
    この関数を使う。
*/
function setPhase4Timeout(
    callback,
    delay
) {

    const timeoutId =
        setTimeout(
            function() {

                /*
                    実行済みIDを
                    管理配列から削除
                */
                phase4TimeoutIds =
                    phase4TimeoutIds.filter(
                        id =>
                            id !== timeoutId
                    );

                callback();

            },
            delay
        );

    phase4TimeoutIds.push(
        timeoutId
    );

    return timeoutId;
}


/*
    P4で予約中の
    setTimeoutをすべて停止
*/
function clearPhase4Timeouts() {

    phase4TimeoutIds.forEach(
        timeoutId => {

            clearTimeout(
                timeoutId
            );

        }
    );

    phase4TimeoutIds = [];
}

/*
    =========================
    青玉ルート
    横エクサ危険判定 TEST
    =========================
*/
function checkPhase4BlueOrbHorizontalRoute(
    member
) {

    if (!member) {
        return;
    }

    const actor =
        actorStates[
            member.role
        ];

    if (!actor) {
        return;
    }

    const orb =
        getPhase4AssignedBlueOrb(
            member
        );

    if (
        !orb ||
        !orb.isConnected
    ) {
        return;
    }

    const orbX =
        parseFloat(
            orb.style.left
        );

    /*
        現在表示されている
        横エクサ予兆を取得
    */
    const horizontalTelegraphs =
        field.querySelectorAll(
            ".phase4-exa-cell.phase4-exa-telegraph[data-column]"
        );

    const dangerousColumns = [];

    horizontalTelegraphs.forEach(
        cell => {

            const column =
                Number(
                    cell.dataset.column
                );

            const columnMinX =
                column * 120;

            const columnMaxX =
                columnMinX + 120;

            /*
                現在地 → 青玉

                このX方向の区間が
                エクサ列と重なるか確認
            */
            const routeMinX =
                Math.min(
                    actor.x,
                    orbX
                );

            const routeMaxX =
                Math.max(
                    actor.x,
                    orbX
                );

            const crossesColumn =
                routeMaxX >= columnMinX &&
                routeMinX <= columnMaxX;

            if (
                crossesColumn
            ) {
                dangerousColumns.push(
                    column
                );
            }
        }
    );

    if (
        dangerousColumns.length > 0
    ) {

        console.log(
            "青玉ルート横エクサ危険:",
            member.role,
            "青",
            member.phase4BlueNumber,
            "列:",
            dangerousColumns.join(","),
            "現在X:",
            Math.round(actor.x),
            "青玉X:",
            Math.round(orbX)
        );

        return;
    }

    console.log(
        "青玉ルート横エクサ安全:",
        member.role,
        "青",
        member.phase4BlueNumber,
        "現在X:",
        Math.round(actor.x),
        "青玉X:",
        Math.round(orbX)
    );
}

/*
    =========================
    P4 時間結晶スタート
    =========================
*/
function startPhase4TimeCrystal() {

    if (selectedPhase !== "P4") {
        return;
    }

    /*
        P4開始状態
    */
    phase4HorizontalWestToEast = null;
    phase4ThirdClockFinished = false;
    phase4HorizontalSecondFinished = false;

    /*
        デバフ配布
    */
    assignPhase4Debuffs();

    /*
        NPC初動
    */
    movePhase4Red17PlayersToDragonRoute();

    movePhase4EruptionToFirstPosition();

    movePhase4AeroToFirstPosition();

    movePhase4SouthBlueToFirstPosition();

    /*
        P4タイマー開始
    */
    startPhase4Timer();


    /*
        =========================
        P4 +10秒

        時計開始
        白龍開始
        =========================
    */
    setTimeout(
        function() {

            triggerPhase4ExplosionSequence();

            renderPhase4Dragons();

            startPhase4DragonMovement();
        },
        10000
    );


    /*
        =========================
        P4 +17秒
        横エクサ開始
        =========================
    */
    setTimeout(
        function() {

            startPhase4HorizontalExa();
        },
        17000
    );


    /*
        =========================
        P4 +24秒
        縦エクサ開始
        =========================
    */
    setTimeout(
        function() {

            startPhase4VerticalExa();
        },
        24000
    );
}

/*
    =========================
    P4 リターン設置・最終散会
    =========================

    座標は北→南エクサ基準。

    南→北の場合は
    Y座標を 480 - Y で反転する。
*/
const phase4ReturnPlacementPositions = {

    MT: { x: 160, y: 80 },
    ST: { x: 320, y: 80 },

    H1: { x: 240, y: 160 },
    H2: { x: 240, y: 160 },

    D1: { x: 240, y: 160 },
    D2: { x: 240, y: 160 },
    D3: { x: 240, y: 160 },
    D4: { x: 240, y: 160 }
};


const phase4FinalSpreadPositions = {

    MT: { x: 120, y: 80 },
    ST: { x: 360, y: 80 },

    H1: { x: 160, y: 160 },
    H2: { x: 240, y: 200 },

    D1: { x: 160, y: 340 },
    D2: { x: 320, y: 320 },

    D3: { x: 120, y: 240 },
    D4: { x: 360, y: 240 }
};


/*
    縦エクサ方向に合わせて
    座標を上下反転する。
*/
function getPhase4VerticalMirroredPosition(
    position
) {

    /*
        北 → 南
        指定座標をそのまま使う
    */
    if (
        phase4VerticalNorthToSouth !== false
    ) {
        return {
            x: position.x,
            y: position.y
        };
    }


    /*
        南 → 北

        フィールド中央 (240, 240) を基準に
        X・Yの両方を反転する。
    */
    return {
        x: 480 - position.x,
        y: 480 - position.y
    };
}


/*
    NPC全員を
    リターン設置位置へ移動させる。
*/
function movePhase4NpcsToReturnPlacement() {

    party.forEach(member => {

        /*
            YOUは自分で操作する
        */
        if (
            member.role === controlledRole
        ) {
            return;
        }

        const position =
            phase4ReturnPlacementPositions[
                member.role
            ];

        if (!position) {
            return;
        }

        const target =
            getPhase4VerticalMirroredPosition(
                position
            );

        setActorTarget(
            member.role,
            target.x,
            target.y
        );
    });

    console.log(
        "P4 NPC：リターン設置位置へ移動"
    );
}


/*
    NPC全員を
    最終散会位置へ移動させる。
*/
function movePhase4NpcsToFinalSpread() {

    party.forEach(member => {

        /*
            YOUは自分で操作する
        */
        if (
            member.role === controlledRole
        ) {
            return;
        }

        const position =
            phase4FinalSpreadPositions[
                member.role
            ];

        if (!position) {
            return;
        }

        const target =
            getPhase4VerticalMirroredPosition(
                position
            );

        setActorTarget(
            member.role,
            target.x,
            target.y
        );
    });

    console.log(
        "P4 NPC：最終散会へ移動"
    );
}


/*
    青玉が全部なくなったか確認。

    4個すべて回収されたら、
    NPC全員がリターン設置位置へ向かう。
*/
function checkPhase4AllBlueOrbsCollected() {

    const remainingOrbs =
        field.querySelectorAll(
            ".phase4-blue-orb"
        );

    if (
        remainingOrbs.length !== 0
    ) {
        return;
    }

    movePhase4NpcsToReturnPlacement();
}