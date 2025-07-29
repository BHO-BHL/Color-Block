/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:48:07 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:48:07 
 */

import { ENUM_GAME_STATUS } from '../BJEnum';
import BJBlock from '../game/BJBlock';

const STORAGE_KEY = 'CC2_BLOCK_JAM'

export interface IGame {
    title: string;
    icon: string;
    appid: string;
    url: string;
}

export const BLOCK_SIZE = 100
export const BLOCK_GAP = 0
export const BLOCK_COLOR = ['#E51031', '#B54931', '#BF1AFB', '#9FB8BA', '#0835FB', '#24FF4B', '#FF7E2D', '#8A62A6', '#FFD112', '#FA5BB1']

export default class BJDataManager {

    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<BJDataManager>()
    }

    // 游戏状态
    status: ENUM_GAME_STATUS = ENUM_GAME_STATUS.UNRUNING
    // 加载进度
    loadingRate: number = 0
    // 声音开启
    isMusicOn: boolean = true
    isSoundOn: boolean = true
    // 更多游戏
    games: IGame[] = [
        { title: '挪车游戏', icon: 'logo_car', appid: '', url: 'https://store.cocos.com/app/search?name=carolsail' },
        { title: '打螺丝游戏', icon: 'logo_screw', appid: '', url: 'https://store.cocos.com/app/search?name=carolsail' },
        { title: '小鸟消消乐', icon: 'logo_bird', appid: '', url: 'https://store.cocos.com/app/search?name=carolsail' },
        { title: '聊天游戏', icon: 'logo_chat', appid: '', url: 'https://store.cocos.com/app/search?name=carolsail' },
        { title: '解压馆', icon: 'logo_coin', appid: '', url: 'https://store.cocos.com/app/search?name=carolsail' },
        { title: '胶囊2048', icon: 'logo_2048', appid: '', url: 'https://store.cocos.com/app/search?name=carolsail' },
    ]

    // 积分
    score: number = 0

    level: number = 1

    currentSelectBlock: BJBlock = null

    currentSkillIndex: number = -1
    currentColorIndex: number = 0

    reset() {
        this.status = ENUM_GAME_STATUS.UNRUNING
        this.currentSelectBlock = null
        this.currentSkillIndex = -1
    }

    save() {
        cc.sys.localStorage.setItem(STORAGE_KEY, JSON.stringify({
            isSoundOn: this.isSoundOn,
            isMusicOn: this.isMusicOn,
            level: this.level,
            score: this.score
        }))
    }

    restore() {
        const _data = cc.sys.localStorage.getItem(STORAGE_KEY) as any
        if (_data) {
            const data = JSON.parse(_data)
            if (data) {
                this.isMusicOn = data?.isMusicOn === false ? false : true
                this.isSoundOn = data?.isSoundOn === false ? false : true
                this.level = typeof data.level == 'number' ? data.level : 1
                this.score = typeof data.score == 'number' ? data.score : 0
            }
        }
    }
}
