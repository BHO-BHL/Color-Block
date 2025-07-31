/*
 * @Author: carolsail 
 * @Date: 2025-05-26 21:03:12 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:44:23
 */


// 状态
export enum ENUM_GAME_STATUS {
    UNRUNING = 'UNRUNING',
    RUNING = 'RUNING'
}

// 音效
export enum ENUM_AUDIO_CLIP {
    BGM = 'bgm',
    CLICK = 'click',
    LOSE = 'lose',
    WIN = 'win',
    REVIVE = 'revive',
    DING = 'ding',
    BLOCK_CHOOSE = 'block_choose',
    BLOCK_OUT = 'block_out',
}

// ui层
export enum ENUM_UI_TYPE {
    MENU = 'BJMenuLayer',
    MAIN = 'BJMainLayer',
    SETTING = 'BJSettingLayer',
    EXIT = 'BJExitLayer',
    LOSE = 'BJLoseLayer',
    WIN = 'BJWinLayer',
    MORE = 'BJMoreLayer',
    RANK = 'BJRankLayer',
    REVIVE_TIMER = 'BJReviveTimerLayer',
    TIP = 'BJTipLayer'
}

// 资源
export const ENUM_RESOURCE_TYPE = ([
    { content: cc.AudioClip, path: 'audio', type: 'audio', ratio: 0.3 },
    { content: cc.Prefab, path: 'prefab', type: 'prefab', ratio: 0.3 },
    { content: cc.SpriteFrame, path: 'sprite', type: 'sprite', ratio: 0.2 },
    { content: cc.JsonAsset, path: 'data', type: 'json', ratio: 0.2 },
    { content: cc.TextAsset, path: 'txt', type: 'txt', ratio: 0.2 },
])

