/* =========================
   P4：時間結晶
   時計・線パターンデータ
========================= */

const phase4TimeCrystalData = {
    center: { x: 240, y: 240 },
    /*
    P4時間結晶
    8人に配布されるデバフセット

    attackDebuff:
        各プレイヤー固有の攻撃デバフ

    colorDebuff:
        赤 / 青デバフ

    returnDebuff:
        全員共通のリターン
*/
debuffSets: [

    /*
        赤17秒 ＋ ブリザガ
        2人
    */
    {
        id: "red17_blizzard_1",

        attackDebuff: {
            type: "blizzard",
            label: "ブリザガ",
            duration: 14
        },

        colorDebuff: {
            type: "red",
            label: "赤",
            duration: 17
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    },

    {
        id: "red17_blizzard_2",

        attackDebuff: {
            type: "blizzard",
            label: "ブリザガ",
            duration: 14
        },

        colorDebuff: {
            type: "red",
            label: "赤",
            duration: 17
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    },


    /*
        赤40秒 ＋ エアロガ
        2人
    */
    {
        id: "red40_aero_1",

        attackDebuff: {
            type: "aero",
            label: "エアロガ",
            duration: 14
        },

        colorDebuff: {
            type: "red",
            label: "赤",
            duration: 40
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    },

    {
        id: "red40_aero_2",

        attackDebuff: {
            type: "aero",
            label: "エアロガ",
            duration: 14
        },

        colorDebuff: {
            type: "red",
            label: "赤",
            duration: 40
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    },


    /*
        青40秒 ＋ ブリザガ
    */
    {
        id: "blue40_blizzard",

        attackDebuff: {
            type: "blizzard",
            label: "ブリザガ",
            duration: 14
        },

        colorDebuff: {
            type: "blue",
            label: "青",
            duration: 40
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    },


    /*
        青40秒 ＋ エラプション
    */
    {
        id: "blue40_eruption",

        attackDebuff: {
            type: "eruption",
            label: "エラプション",
            duration: 14
        },

        colorDebuff: {
            type: "blue",
            label: "青",
            duration: 40
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    },


    /*
        青40秒 ＋ ウォタガ
    */
    {
        id: "blue40_water",

        attackDebuff: {
            type: "water",
            label: "ウォタガ",
            duration: 12
        },

        colorDebuff: {
            type: "blue",
            label: "青",
            duration: 40
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    },


    /*
        青40秒 ＋ ホーリー
    */
    {
        id: "blue40_holy",

        attackDebuff: {
            type: "holy",
            label: "ホーリー",
            duration: 17
        },

        colorDebuff: {
            type: "blue",
            label: "青",
            duration: 40
        },

        returnDebuff: {
            type: "return",
            label: "リターン",
            duration: 33
        }
    }
],

    /*
        時計は6個。
        フィールドマーカーに対応する6方向へ配置する。
    */
clocks: {
    /*
        時計はフィールドマーカー上ではなく、
        各マーカーより中央寄りにある
        ラグビーボール状模様の中心へ配置する。

        viewBox: 0 0 480 480
    */
    north: {
        x: 240,
        y: 110,
        label: "北"
    },

    northEast: {
        x: 342,
        y: 170,
        label: "北東"
    },

    southEast: {
        x: 342,
        y: 300,
        label: "南東"
    },

    south: {
        x: 240,
        y: 342,
        label: "南"
    },

    southWest: {
        x: 136,
        y: 300,
        label: "南西"
    },

    northWest: {
        x: 136,
        y: 170,
        label: "北西"
    }
},

    /*
        黄色線は北↔南で固定。
        青線のみ2パターンからランダム。
    */
    patterns: [
        {
            id: "NE_SW",
            label: "北東 ↔ 南西",
            blueStart: "northEast",
            blueEnd: "southWest",
            unlinked: ["northWest", "southEast"]
        },
        {
            id: "NW_SE",
            label: "北西 ↔ 南東",
            blueStart: "northWest",
            blueEnd: "southEast",
            unlinked: ["northEast", "southWest"]
        }
    ]
};
