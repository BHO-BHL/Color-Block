/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:49:56 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:49:56 
 */

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJLoadingManager extends cc.Component {

    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<BJLoadingManager>()
    }

    show() {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const loadingNode = canvas.node.getChildByName('UILoading')
        loadingNode.getChildByName('loading_bg').active = true
    }

    hide() {
        const canvas = cc.director.getScene().getComponentInChildren(cc.Canvas);
        const loadingNode = canvas.node.getChildByName('UILoading')
        loadingNode.getChildByName('loading_bg').active = true
    }
}
