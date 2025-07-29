/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:58:10 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:58:10 
 */

import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from '../BJStaticInstance';
import AudioManager from "../manager/BJAudioManager";
import SdkManager from "../manager/BJSdkManager";
import ToastManager from "../manager/BJToastManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJWinLayer extends BaseLayer {

    panel: cc.Node = null
    btnNext: cc.Node = null
    btnShare: cc.Node = null
    btnClose: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)
        this.btnNext = cc.find('buttons/btn_next', this.panel)
        this.btnShare = cc.find('buttons/btn_share', this.panel)
        this.btnClose = cc.find('btn_close', this.panel)
        this.btnNext.on('click', this.onNextClick, this)
        this.btnShare.on('click', this.onShareClick, this)
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnNext.off('click', this.onNextClick, this)
        this.btnShare.off('click', this.onShareClick, this)
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.showInterstitialAd()
    }

    onDisable() { }

    async onNextClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        await StaticInstance.fadeManager.fadeIn()
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.WIN, false)
        StaticInstance.gameManager.onGameStart()
    }

    onShareClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        if (SdkManager.instance.getPlatform()) {
            SdkManager.instance.activeShare()
        } else {
            ToastManager.instance.show('仅支持小游戏平台', { gravity: 'TOP', bg_color: cc.color(226, 69, 109, 255) })
        }
    }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.gameManager.onGameExit()
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.WIN, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }
}
