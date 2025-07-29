/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:49:19 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:49:19 
 */

import StaticInstance from "../BJStaticInstance";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJFadeManager extends cc.Component {
    onLoad() {
        this.node.active = false
        StaticInstance.setFadeManager(this)
    }

    fadeIn(seconds: number = 0.2) {
        return new Promise(resolve => {
            this.node.active = true
            this.node.opacity = 0
            cc.tween(this.node).to(seconds, { opacity: 255 }).call(() => {
                resolve(null)
            }).start()
        })
    }

    fadeOut(seconds: number = 0.2) {
        return new Promise(resolve => {
            this.node.active = true
            this.node.opacity = 255
            cc.tween(this.node).to(seconds, { opacity: 0 }).call(() => {
                this.node.active = false
                resolve(null)
            }).start()
        })
    }
}
