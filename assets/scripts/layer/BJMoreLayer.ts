/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:58:33 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:58:33 
 */

import { ENUM_AUDIO_CLIP, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from '../BJStaticInstance';
import AudioManager from "../manager/BJAudioManager";
import DataManager, { IGame } from "../manager/BJDataManager";
import PoolManager from "../manager/BJPoolManager";
import ResourceManager from "../manager/BJResourceManager";
import SdkManager from "../manager/BJSdkManager";
import UIScrollControl from "../plugins/BJUIScrollControl";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJMoreLayer extends BaseLayer {

    panel: cc.Node = null
    btnClose: cc.Node = null
    scrollNode: cc.Node = null
    scrollItem: cc.Node = null

    onLoad() {
        this.panel = cc.find('style/panel', this.node)
        this.btnClose = cc.find('btn_close', this.panel)
        this.scrollNode = cc.find('scroll', this.panel)
        this.scrollItem = PoolManager.instance.getNode('BJMoreItem')
        this.btnClose.on('click', this.onCloseClick, this)
    }

    onDestroy() {
        this.btnClose.off('click', this.onCloseClick, this)
    }

    onEnable() {
        this.zoomIn(this.panel)
        this.rendor()
        SdkManager.instance.toggleCustomRowAd(true)
    }

    onDisable() {
        SdkManager.instance.toggleCustomRowAd(false)
    }

    rendor() {
        const games = DataManager.instance.games
        let isScrollToTop = false
        this.scrollNode.getComponent(UIScrollControl).init(this.scrollItem, games.length, cc.size(500, 110), 0, (node: cc.Node, index: number) => {
            if (!isScrollToTop) {
                isScrollToTop = true
                this.scrollNode.getComponent(cc.ScrollView).scrollToTop()
            }
            const game = games[index]
            node.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = ResourceManager.instance.getSprite(`${game.icon}`)
            node.getChildByName('title').getComponent(cc.Label).string = `${game.title}`
            if (!node.hasEventListener('click')) {
                node.on('click', () => { this.onItemClick(game) }, this)
            } else {
                node.off('click')
                node.on('click', () => { this.onItemClick(game) }, this)
            }
        }, (scroll: cc.ScrollView) => {
            // scroll.scrollToOffset(cc.v2(0, maxLevel * 110 - (scroll.node.height / 2)), 0.05)
            scroll.scrollToTop()
        })
    }

    onItemClick(item: IGame) {
        let url: string = ''
        if (typeof window['wx'] == 'undefined') {
            url = item.url
        } else {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
            url = item.appid
        }
        if (url) SdkManager.instance.turnToApp(url)
    }

    onCloseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MORE, false)
    }
}
