/*
 * @Author: carolsail 
 * @Date: 2025-03-12 14:09:45 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:55:52
 */


import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from '../BJStaticInstance';
import AudioManager from "../manager/BJAudioManager";
import SdkManager from "../manager/BJSdkManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJLoseLayer extends BaseLayer {

    panel: cc.Node = null
    btnClose: cc.Node = null
    btnRestart: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)
        this.btnClose = cc.find('btn_close', this.panel)
        this.btnRestart = cc.find('btn_restart', this.panel)
        this.btnClose.on('click', this.onCloseClick, this)
        this.btnRestart.on('click', this.onRestartClick, this)
    }

    onDestroy() {
        this.btnClose.off('click', this.onCloseClick, this)
        this.btnRestart.off('click', this.onRestartClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.toggleBannerAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleBannerAd(false)
    }

    async onRestartClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        await StaticInstance.fadeManager.fadeIn()
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.LOSE, false)
        StaticInstance.gameManager.onGameStart()
    }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.gameManager.onGameExit()
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.LOSE, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }
}
