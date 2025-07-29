/*
 * @Author: carolsail 
 * @Date: 2025-03-12 14:09:41 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:55:02
 */


import { ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from "../BJStaticInstance";
import DataManager from "../manager/BJDataManager";
import BaseLayer from "./BJBaselayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJLoadingLayer extends BaseLayer {

    @property(cc.Sprite)
    loadfill: cc.Sprite = null

    protected onLoad(): void {
        if (DataManager.instance.loadingRate) this.hide()
    }

    onEnable() { }

    onDisable() { }

    update(dt: number) {
        if (this.loadfill && this.node.active) {
            this.loadfill.fillRange = DataManager.instance.loadingRate
            if (DataManager.instance.loadingRate >= 1) {
                // menu已加载完毕
                if (StaticInstance.uiManager.isActive(ENUM_UI_TYPE.MENU)) {
                    this.hide()
                }
            }
        }
    }
}
