/* =========================
   P3：時間圧縮・絶
   ロール・デバフ別行動データ
========================= */

/*
    現時点では行動名だけを管理する。

    将来は各行動へ、

    target:
        正解位置

    judgeTime:
        判定時刻

    duration:
        行動時間

    mechanic:
        行動の種類

    などを追加できる。
*/

const phase3ActionData = {
    TH: {
        earlyFire: {
            label: "TH 早ファイガ",

            actions: [
                {
                    step: 1,
                    text: "ファイガ捨て",
                    detail: "ブリザガの場合は中央"
                },
                {
                    step: 2,
                    text: "リターン設置",
                    detail: "エラプ・砂時計下"
                },
                {
                    step: 3,
                    text: "頭割り",
                    detail: "ブリザガ"
                },
                {
                    step: 4,
                    text: "ビーム誘導",
                    detail: ""
                },
                {
                    step: 5,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 6,
                    text: "中で外周向く",
                    detail: ""
                }
            ]
        },

        middleFire: {
            label: "TH 中ファイガ",

            actions: [
                {
                    step: 1,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 2,
                    text: "リターン設置",
                    detail: "エラプ・砂時計下"
                },
                {
                    step: 3,
                    text: "ファイガ捨て",
                    detail: ""
                },
                {
                    step: 4,
                    text: "待機",
                    detail: ""
                },
                {
                    step: 5,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 6,
                    text: "ビーム誘導",
                    detail: "避けて外周向く"
                }
            ]
        },

        lateFire: {
            label: "TH 遅ファイガ",

            actions: [
                {
                    step: 1,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 2,
                    text: "ビーム誘導",
                    detail: ""
                },
                {
                    step: 3,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 4,
                    text: "リターン設置",
                    detail: "視線・中央"
                },
                {
                    step: 5,
                    text: "ファイガ捨て",
                    detail: ""
                },
                {
                    step: 6,
                    text: "中で外周向く",
                    detail: ""
                }
            ]
        },

        blizzard: {
            label: "TH ブリザガ",

            actions: [
                {
                    step: 1,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 2,
                    text: "リターン設置",
                    detail: "エラプ・砂時計下"
                },
                {
                    step: 3,
                    text: "頭割り",
                    detail: "ブリザガ"
                },
                {
                    step: 4,
                    text: "ビーム誘導",
                    detail: ""
                },
                {
                    step: 5,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 6,
                    text: "中で外周向く",
                    detail: ""
                }
            ]
        }
    },

    DPS: {
        earlyFire: {
            label: "DPS 早ファイガ",

            actions: [
                {
                    step: 1,
                    text: "ファイガ捨て",
                    detail: ""
                },
                {
                    step: 2,
                    text: "リターン設置",
                    detail: "エラプ・砂時計下"
                },
                {
                    step: 3,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 4,
                    text: "ビーム誘導",
                    detail: ""
                },
                {
                    step: 5,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 6,
                    text: "中で外周向く",
                    detail: ""
                }
            ]
        },

        middleFire: {
            label: "DPS 中ファイガ",

            actions: [
                {
                    step: 1,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 2,
                    text: "リターン設置",
                    detail: "水・中央"
                },
                {
                    step: 3,
                    text: "ファイガ捨て",
                    detail: ""
                },
                {
                    step: 4,
                    text: "待機",
                    detail: ""
                },
                {
                    step: 5,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 6,
                    text: "ビーム誘導",
                    detail: "避けて外周向く"
                }
            ]
        },

        lateFire: {
            label: "DPS 遅ファイガ",

            actions: [
                {
                    step: 1,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 2,
                    text: "ビーム誘導",
                    detail: ""
                },
                {
                    step: 3,
                    text: "頭割り",
                    detail: "ブリザガ"
                },
                {
                    step: 4,
                    text: "リターン設置",
                    detail: "視線・中央"
                },
                {
                    step: 5,
                    text: "ファイガ捨て",
                    detail: "ブリザガの場合は中央"
                },
                {
                    step: 6,
                    text: "中で外周向く",
                    detail: ""
                }
            ]
        },

        blizzard: {
            label: "DPS ブリザガ",

            actions: [
                {
                    step: 1,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 2,
                    text: "ビーム誘導",
                    detail: ""
                },
                {
                    step: 3,
                    text: "頭割り",
                    detail: "ブリザガ"
                },
                {
                    step: 4,
                    text: "リターン設置",
                    detail: "視線・中央"
                },
                {
                    step: 5,
                    text: "頭割り",
                    detail: ""
                },
                {
                    step: 6,
                    text: "中で外周向く",
                    detail: ""
                }
            ]
        }
    }
};