/* =========================
   絶エデンP3 配布パターン
========================= */

/*
    参考画像にあった8人分の配布例。

    type:
        debuffDictionaryで決めたデバフの種類

    time:
        デバフの残り秒数
*/

const phase3Patterns = [
    {
        id: "pattern01",
        name: "参考パターン1",

        assignments: {
            MT: [
                { type: "fire", time: 11.0 },
                { type: "return", time: 16.0 },
                { type: "holy", time: 21.0 },
                { type: "gaze", time: 43.0 }
            ],

            ST: [
                { type: "fire", time: 31.0 },
                { type: "return", time: 26.0 },
                { type: "gaze", time: 43.0 }
            ],

            H1: [
                { type: "fire", time: 21.0 },
                { type: "return", time: 16.0 },
                { type: "darkEruption", time: 43.0 }
            ],

            H2: [
                { type: "fire", time: 31.0 },
                { type: "return", time: 26.0 },
                { type: "gaze", time: 43.0 }
            ],

            D1: [
                { type: "blizzard", time: 21.0 },
                { type: "return", time: 26.0 },
                { type: "holy", time: 11.0 },
                { type: "darkEruption", time: 43.0 }
            ],

            D2: [
                { type: "fire", time: 11.0 },
                { type: "return", time: 16.0 },
                { type: "holy", time: 31.0 },
                { type: "darkEruption", time: 43.0 }
            ],

            D3: [
                { type: "fire", time: 11.0 },
                { type: "return", time: 16.0 },
                { type: "darkEruption", time: 43.0 }
            ],

            D4: [
                { type: "fire", time: 21.0 },
                { type: "return", time: 16.0 },
                { type: "water", time: 43.0 }
            ]
        }
    }
];