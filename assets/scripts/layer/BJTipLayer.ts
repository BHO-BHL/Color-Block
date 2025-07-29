/*
 * @Author: carolsail 
 * @Date: 2025-03-12 14:10:19 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:57:54
 */

import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from "../BJStaticInstance";
import AudioManager from "../manager/BJAudioManager";
import DataManager from "../manager/BJDataManager";
import SdkManager from "../manager/BJSdkManager";
import ToastManager from "../manager/BJToastManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJTipLayer extends BaseLayer {

    panel: cc.Node = null
    btnSubmit: cc.Node = null
    btnClose: cc.Node = null

    props: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)
        this.btnSubmit = cc.find('btn_submit', this.panel)
        this.btnSubmit.on('click', this.onSubmitClick, this)
        this.btnClose = cc.find('btn_close', this.panel)
        this.btnClose.on('click', this.onCloseClick, this)
        this.props = cc.find('props', this.panel)
    }

    onDestroy() {
        this.btnSubmit.off('click', this.onSubmitClick, this)
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        SdkManager.instance.toggleBannerAd(true)
        this.rendor()
    }

    onDisable() {
        SdkManager.instance.toggleBannerAd(false)
    }

    rendor() {
        for (let i = 0; i < this.props.children.length; i++) {
            const propNode = this.props.children[i]
            propNode.active = i == DataManager.instance.currentSkillIndex
        }


        if (DataManager.instance.currentSkillIndex == 0) {
            this.rendorColor(true)
        }
    }

    rendorColor(isInit: boolean = false) {
        const colors = cc.find('prop1/colors', this.props)
        for (let j = 0; j < colors.children.length; j++) {
            const colorNode = colors.children[j]
            colorNode.getChildByName('tick').active = DataManager.instance.currentColorIndex == j
            if (isInit) {
                if (!colorNode.hasEventListener('click')) {
                    colorNode.on('click', () => {
                        DataManager.instance.currentColorIndex = j
                        this.rendorColor()
                    }, this)
                }
            }
        }
    }

    onSubmitClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        SdkManager.instance.showVideoAd(async () => {
            StaticInstance.uiManager.toggle(ENUM_UI_TYPE.TIP, false)
            StaticInstance.gameManager.onGameSkill()
        }, (msg: string) => {
            ToastManager.instance.show(msg, { gravity: 'TOP', bg_color: cc.color(226, 69, 109, 255) })
        })
    }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.TIP, false)
        StaticInstance.gameManager.onGameResume()
    }
}
