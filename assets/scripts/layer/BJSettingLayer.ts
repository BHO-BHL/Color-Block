/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:58:18 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:58:18 
 */

import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from '../BJStaticInstance';
import AudioManager from "../manager/BJAudioManager";
import DataManager from "../manager/BJDataManager";
import SdkManager from "../manager/BJSdkManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJSettingLayer extends BaseLayer {

    panel: cc.Node = null
    btnMusic: cc.Node = null
    btnSound: cc.Node = null
    btnClose: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)
        this.btnMusic = cc.find('buttons/btn_music', this.panel)
        this.btnSound = cc.find('buttons/btn_sound', this.panel)
        this.btnClose = cc.find('btn_close', this.panel)
        this.btnMusic.on('click', this.onMusicClick, this)
        this.btnSound.on('click', this.onSoundClick, this)
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnMusic.off('click', this.onMusicClick, this)
        this.btnSound.off('click', this.onSoundClick, this)
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        this.rendorMusic()
        this.rendorSound()
        SdkManager.instance.showInterstitialAd()
    }

    onDisable() { }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.SETTING, false)
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
