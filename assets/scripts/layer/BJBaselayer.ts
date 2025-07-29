/*
 * @Author: carolsail 
 * @Date: 2025-03-12 14:09:29 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-05-29 13:55:23
 */


const { ccclass, property } = cc._decorator;

@ccclass
export default class BJBaseLayer extends cc.Component {

    show() {
        this.node.active = true;
    }

    hide() {
        this.node.active = false;
    }

    zoomIn(node: cc.Node, scale: number = 1.5, speed: number = 0.3) {
        node.setScale(scale)
        const act = cc.scaleTo(speed, 1)
        cc.tween(node).then(act).start()
    }

    zoomOut(node: cc.Node, scale: number = 0.5, speed: number = 0.3) {
        node.setScale(scale)
        const act = cc.scaleTo(speed, 1)
        cc.tween(node).then(act).start()
    }

    flip(node: cc.Node) {
        const act1 = cc.scaleTo(0.1, 0, 1)
        const act2 = cc.scaleTo(0.1, 1, 1)
        const act = cc.sequence(act1, act2)
        cc.tween(node).then(act).start()
    }
}
