/*
 * @Author: carolsail 
 * @Date: 2025-03-12 14:09:34 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:55:38
 */


import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from '../BJStaticInstance';
import AudioManager from "../manager/BJAudioManager";
import DataManager from "../manager/BJDataManager";
import SdkManager from "../manager/BJSdkManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJExitLayer extends BaseLayer {

    panel: cc.Node = null
    btnExit: cc.Node = null
    btnClose: cc.Node = null
    btnCancel: cc.Node = null

    btnMusic: cc.Node = null
    btnSound: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)

        this.btnExit = cc.find('buttons/btn_exit', this.panel)
        this.btnExit.on('click', this.onExitClick, this)

        this.btnClose = cc.find('btn_close', this.panel)
        this.btnClose.on('click', this.onCancelClick, this)

        this.btnCancel = cc.find('buttons/btn_cancel', this.panel)
        this.btnCancel.on('click', this.onCancelClick, this)

        this.btnMusic = cc.find('audio/btn_music', this.panel)
        this.btnSound = cc.find('audio/btn_sound', this.panel)
        this.btnMusic.on('click', this.onMusicClick, this)
        this.btnSound.on('click', this.onSoundClick, this)
    }

    onDestroy() {
        this.btnExit.off('click', this.onExitClick, this)
        this.btnClose.off('click', this.onExitClick, this)
        this.btnCancel.off('click', this.onCancelClick, this)
        this.btnMusic.off('click', this.onMusicClick, this)
        this.btnSound.off('click', this.onSoundClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        this.rendorMusic()
        this.rendorSound()
        SdkManager.instance.showInterstitialAd()
    }

    onDisable() { }

    onCancelClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT, false)
        StaticInstance.gameManager.onGameResume()
    }

    onExitClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.gameManager.onGameExit()
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MAIN, false)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
    }

    onSoundClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        DataManager.instance.isSoundOn = !DataManager.instance.isSoundOn
        DataManager.instance.save()
        this.rendorSound()
    }

    onMusicClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        DataManager.instance.isMusicOn = !DataManager.instance.isMusicOn
        DataManager.instance.save()
        if (DataManager.instance.isMusicOn) {
            AudioManager.instance.playMusic()
        } else {
            AudioManager.instance.stopMusic()
        }
        this.rendorMusic()
    }

    rendorMusic() {
        this.btnMusic.getChildByName('on').active = DataManager.instance.isMusicOn
        this.btnMusic.getChildByName('off').active = !DataManager.instance.isMusicOn
    }

    rendorSound() {
        this.btnSound.getChildByName('on').active = DataManager.instance.isSoundOn
        this.btnSound.getChildByName('off').active = !DataManager.instance.isSoundOn
    }
}
