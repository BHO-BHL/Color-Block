/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:51:01 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:51:27
 */

import { ENUM_UI_TYPE } from '../BJEnum';
import StaticInstance from '../BJStaticInstance';
import BaseLayer from '../layer/BJBaselayer';
import PoolManager from './BJPoolManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJUIManager extends cc.Component {

    private uiMap = new Map<ENUM_UI_TYPE, BaseLayer>()

    protected onLoad(): void {
        StaticInstance.setUIManager(this)
    }

    init() {
        for (let type in ENUM_UI_TYPE) {
            const node: cc.Node = PoolManager.instance.getNode(ENUM_UI_TYPE[type], this.node)
            if (node && !this.uiMap.has(ENUM_UI_TYPE[type])) {
                node.active = false
                node.addComponent(ENUM_UI_TYPE[type])
                this.uiMap.set(ENUM_UI_TYPE[type], node.getComponent(ENUM_UI_TYPE[type]))
            }
        }
    }

    toggle(key: ENUM_UI_TYPE, status: boolean = true, callback?: () => void) {
        if (this.uiMap.has(key)) {
            const layer = this.uiMap.get(key)
            status ? layer.show() : layer.hide()
            callback && callback()
        }
    }

    isActive(key: ENUM_UI_TYPE) {
        if (this.uiMap.has(key)) {
            return this.uiMap.get(key).node.active
        }
        return false
    }

    getActiveTypes() {
        const types: ENUM_UI_TYPE[] = []
        this.uiMap.forEach((layer: BaseLayer, type: ENUM_UI_TYPE) => {
            if (this.isActive(type)) types.push(type)
        })
        return types
    }
}
