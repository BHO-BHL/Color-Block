/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:49:35 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:49:35 
 */


const { ccclass, property } = cc._decorator;

import { ENUM_AUDIO_CLIP, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from "../BJStaticInstance";
import BJStage from "../game/BJStage";
import AudioManager from "./BJAudioManager";
import DataManager from "./BJDataManager";
import PoolManager from "./BJPoolManager";
import SdkManager from "./BJSdkManager";

@ccclass
export default class BJGameManager extends cc.Component {

    stage: cc.Node = null
    stageComp: BJStage = null

    onLoad() {
        StaticInstance.setGameManager(this)
        this.stage = cc.find('Stage', this.node)
    }

    onDestroy() { }

    // 开始游戏
    async onGameStart() {
        DataManager.instance.reset()
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        this.stage.removeAllChildren()
        const stageNode = PoolManager.instance.getNode('BJStage', this.stage)
        this.stageComp = stageNode.getComponent(BJStage)
        this.stageComp.init()
        DataManager.instance.status = ENUM_GAME_STATUS.RUNING
        await StaticInstance.fadeManager.fadeOut()
    }

    onGameRestart() {
        this.onGameStart()
    }

    onGameRevive() {
        this.stageComp.onRevive()
    }

    onGameSkill() {
        this.stageComp.onSkill()
    }

    onGameExit() {
        this.stage.removeAllChildren()
    }

    onGamePause() {
        this.stageComp.stopTimer()
    }

    onGameResume() {
        this.stageComp.startTimer()
    }

    onGameOver(ui: ENUM_UI_TYPE, duration: number = 0.8) {
        if (StaticInstance.uiManager.isActive(ENUM_UI_TYPE.EXIT)) StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT, false)
        this.onGamePause()
        DataManager.instance.status = ENUM_GAME_STATUS.UNRUNING
        if (ui == ENUM_UI_TYPE.WIN) {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.WIN);
            DataManager.instance.score += Math.min(DataManager.instance.level, 25)
            DataManager.instance.level += 1
            DataManager.instance.save()
            SdkManager.instance.setRank(DataManager.instance.score)
        } else if (ui == ENUM_UI_TYPE.LOSE) {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.LOSE);
        } else if (ui == ENUM_UI_TYPE.REVIVE_TIMER) {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.REVIVE);
        }
        this.scheduleOnce(() => {
            StaticInstance.uiManager.toggle(ui)
        }, duration)
    }
}
