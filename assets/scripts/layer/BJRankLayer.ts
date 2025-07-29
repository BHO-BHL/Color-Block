/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:58:27 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:58:27 
 */

import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from '../BJStaticInstance';
import AudioManager from "../manager/BJAudioManager";
import SdkManager from "../manager/BJSdkManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJRankLayer extends BaseLayer {

    panel: cc.Node = null
    btnClose: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)
        this.btnClose = cc.find('btn_close', this.panel)
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.getRank()
        SdkManager.instance.showInterstitialAd()
        SdkManager.instance.toggleCustomRowAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleCustomRowAd(false)
    }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.RANK, false)
    }
}
