/*
 * @Author: carolsail 
 * @Date: 2025-03-12 14:09:52 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:56:17
 */

import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from '../BJStaticInstance';
import AudioManager from "../manager/BJAudioManager";
import DataManager from "../manager/BJDataManager";
import SdkManager from "../manager/BJSdkManager";
import ToastManager from "../manager/BJToastManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJMenuLayer extends BaseLayer {

    btnSetting: cc.Node = null
    btnShare: cc.Node = null
    btnRank: cc.Node = null
    btnMore: cc.Node = null
    btnStart: cc.Node = null
    scoreNumLabel: cc.Label = null

    levelLabel: cc.Label = null
    levelPreivews: cc.Node = null

    onLoad() {
        this.btnSetting = this.node.getChildByName('btn_setting')
        this.btnSetting.on('click', this.onSettingClick, this)

        this.btnRank = cc.find('bottom/btn_rank', this.node)
        this.btnRank.on('click', this.onRankClick, this)

        this.btnMore = cc.find('bottom/btn_games', this.node)
        this.btnMore.on('click', this.onMoreClick, this)

        this.btnShare = cc.find('bottom/btn_share', this.node)
        this.btnShare.on('click', this.onShareClick, this)

        this.btnStart = cc.find('btn_start', this.node)
        this.btnStart.on('click', this.onStartClick, this)

        this.scoreNumLabel = cc.find('score/nums', this.node).getComponent(cc.Label)

        this.levelLabel = cc.find('label', this.btnStart).getComponent(cc.Label)
        this.levelPreivews = cc.find('level_node/level_previews', this.node)
    }

    onDestroy() {
        this.btnRank.off('click', this.onRankClick, this)
        this.btnSetting.off('click', this.onSettingClick, this)
        this.btnShare.off('click', this.onShareClick, this)
        this.btnMore.off('click', this.onMoreClick, this)
        this.btnStart.off('click', this.onStartClick, this)
    }

    onEnable() {
        this.rendorScoreNum()
        this.rendorLevelLabel()
        this.rendorLevelPreview()
    }

    onDisable() { }

    rendorScoreNum() {
        this.scoreNumLabel.string = `${DataManager.instance.score}`
    }

    rendorLevelLabel() {
        this.levelLabel.string = `第 ${DataManager.instance.level} 关`
    }

    rendorLevelPreview() {
        this.levelPreivews.children.forEach((levelNode, i) => {
            const label = levelNode.getChildByName('label').getComponent(cc.Label)
            label.string = `${DataManager.instance.level + i}`
        })
    }

    onSettingClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.SETTING)
    }

    onMoreClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MORE)
    }

    onShareClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (SdkManager.instance.getPlatform()) {
            SdkManager.instance.activeShare()
        } else {
            ToastManager.instance.show('仅支持小游戏平台', { gravity: 'TOP', bg_color: cc.color(226, 69, 109, 255) })
        }
    }

    onRankClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.RANK)
    }

    async onStartClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        await StaticInstance.fadeManager.fadeIn()
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN)
        StaticInstance.gameManager.onGameStart()
    }
}
