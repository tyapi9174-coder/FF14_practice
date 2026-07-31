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
            操作中のキャラクターは、
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

        marker.innerHTML = `
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
initializeActorStates();
renderFieldMembers();

updateControlledPlayerAppearance();
updatePlayerPosition();

clearActionGuide();
updateActionGuideVisibility();

requestAnimationFrame(gameLoop);

