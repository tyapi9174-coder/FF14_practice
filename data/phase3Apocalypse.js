/*
    第1工程：アポカリ予兆確認専用。
    trueの間はNPCの自動散開・中央集合・ノックバックを止め、
    白玉・爆発・進行方向矢印だけを確認する。
*/
const APOCALYPSE_PREVIEW_ONLY = true;

/* P3後半：アポカリプス データ */
const apocalypseLinePriority = [
    "D1", "D2", "MT", "ST",
    "D3", "H1", "D4", "H2"
];

const apocalypseTimeline = [
    /* 配布後、実戦同様に0.9秒だけデバフ確認時間を取る */
    { time: 0.9, id: "formationMove", label: "交換・並び替え開始" },

    { time: 10, id: "stack10", label: "10秒ダークウォタガ" },
    { time: 12, id: "spread", label: "ランダム対象の円範囲着弾" },
    { time: 18, id: "eruptionTelegraph", label: "ダークエラプション予兆" },
    { time: 20, id: "apoc1", label: "アポカリプス1" },
    { time: 22, id: "apoc2", label: "アポカリプス2＋エラプション" },
    { time: 24, id: "apoc3", label: "アポカリプス3" },
    { time: 26, id: "apoc4", label: "アポカリプス4＋暗夜詠唱" },
    { time: 28, id: "apoc5", label: "アポカリプス5" },
    { time: 29, id: "stack29", label: "29秒ダークウォタガ" },
    { time: 30, id: "apoc6", label: "アポカリプス6" },
    { time: 31, id: "danceHit", label: "暗夜の舞踏技" },
    { time: 34, id: "knockback", label: "ノックバック" },
    { time: 38, id: "stack38", label: "38秒ダークウォタガ" }
];

/*
    白玉は、外周8地点を進む3玉の「芋虫」が2匹。

    外周順：A → 1 → B → 2 → C → 3 → D → 4

    startIndexは、1匹目の頭が最初に出る地点。
    2匹目は必ず4マス反対側から開始する。

    4初期配置 × 時計／反時計回り ＝ 8通り。
*/
const apocalypsePatterns = [
    { id: "apoc-ac", name: "AC開始", startIndex: 0, axisAngle: 0 },
    { id: "apoc-13", name: "1・3開始", startIndex: 1, axisAngle: 45 },
    { id: "apoc-bd", name: "BD開始", startIndex: 2, axisAngle: 90 },
    { id: "apoc-24", name: "2・4開始", startIndex: 3, axisAngle: 135 }
];
