/*
 * @Author: carolsail 
 * @Date: 2025-05-26 21:17:21 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:57:19
 */
import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from "../BJStaticInstance";
import AudioManager from "../manager/BJAudioManager";
import SdkManager from "../manager/BJSdkManager";
import ToastManager from "../manager/BJToastManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJReviveTimerLayer extends BaseLayer {

    panel: cc.Node = null
    btnUse: cc.Node = null
    btnClose: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)

        this.btnUse = cc.find('btn_use', this.panel)
        this.btnUse.on('click', this.onUseClick, this)

        this.btnClose = cc.find('btn_close', this.panel)
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnUse.off('click', this.onUseClick, this)
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.showInterstitialAd()
    }

    onDisable() { }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.REVIVE_TIMER, false)
        StaticInstance.gameManager.onGameOver(ENUM_UI_TYPE.LOSE, 0.3)
    }

    onUseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        SdkManager.instance.showVideoAd(async (msg: string) => {
            StaticInstance.uiManager.toggle(ENUM_UI_TYPE.REVIVE_TIMER, false)
            StaticInstance.gameManager.onGameRevive()
        }, (msg: string) => {
            ToastManager.instance.show(msg, { gravity: 'TOP', bg_color: cc.color(226, 69, 109, 255) })
        })
    }
}
