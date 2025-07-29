/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:43:12 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:43:59
 */

import { ENUM_RESOURCE_TYPE, ENUM_UI_TYPE } from './BJEnum';
import StaticInstance from './BJStaticInstance';
import AudioManager from "./manager/BJAudioManager";
import DataManager from './manager/BJDataManager';
import ResourceManager from "./manager/BJResourceManager";
import SdkManager from './manager/BJSdkManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJIndex extends cc.Component {

    onLoad() {
        this.node.getChildByName('UI').opacity = 255
        cc.view.setResizeCallback(() => this.responsive())
        this.responsive()
        cc.macro.ENABLE_MULTI_TOUCH = false;
        const manager = cc.director.getCollisionManager();
        manager.enabled = true;
        // manager.enabledDebugDraw = true;
        // manager.enabledDrawBoundingBox = true;
    }

    async start() {
        if (DataManager.instance.loadingRate) {
            // 初始化ui节点信息
            StaticInstance.uiManager.init()
            // 直接载入ui
            StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU)
            return
        }
        // 加载资源
        for (const index in ENUM_RESOURCE_TYPE) {
            const resource = ENUM_RESOURCE_TYPE[index]
            await ResourceManager.instance.loadRes(resource)
        }
        // 加载ui
        StaticInstance.uiManager.init()
        // 读档
        DataManager.instance.restore()
        // 播放音乐
        AudioManager.instance.playMusic()
        // 加载sdk
        SdkManager.instance.initAudioEndListener()
        SdkManager.instance.passiveShare()
        SdkManager.instance.getRank()
        SdkManager.instance.initBannerAd()
        SdkManager.instance.initInterstitialAd()
        SdkManager.instance.initVideoAd()
        SdkManager.instance.initCustomRowAd()
        SdkManager.instance.initCustomColAd()
        // 操作ui
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.MENU, true, () => {
            DataManager.instance.loadingRate = 1
        })
    }

    // 屏幕响应式
    responsive() {
        const designSize = cc.view.getDesignResolutionSize();
        const viewSize = cc.view.getFrameSize();

        const setFitWidth = () => {
            cc.Canvas.instance.fitHeight = false;
            cc.Canvas.instance.fitWidth = true;
        }

        const setFitHeight = () => {
            cc.Canvas.instance.fitHeight = true;
            cc.Canvas.instance.fitWidth = false;
        }

        const setFitBoth = () => {
            cc.Canvas.instance.fitHeight = true;
            cc.Canvas.instance.fitWidth = true;
        }

        const designRatio = designSize.width / designSize.height
        const viewRatio = viewSize.width / viewSize.height
        if (designRatio < 1) {
            // console.error('--竖屏游戏')
            if (viewRatio < 1) {
                if (viewRatio > designRatio) {
                    setFitBoth()
                } else {
                    setFitWidth()
                }
            } else {
                setFitBoth()
            }
        } else {
            // console.error('--宽屏游戏')
            if (viewRatio > 1) {
                if (viewRatio < designRatio) {
                    setFitBoth()
                } else {
                    setFitHeight()
                }
            } else {
                setFitBoth()
            }
        }
    }
}
