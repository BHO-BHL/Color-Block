/*
 * @Author: carolsail 
 * @Date: 2025-06-05 10:58:31 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-06-07 12:14:26
 */

import { BLOCK_SIZE } from "../manager/BJDataManager";
import ResourceManager from "../manager/BJResourceManager";
import BJBlock from "./BJBlock";
import BJStage from "./BJStage";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJExit extends cc.Component {

    index: number = -1
    typeIndex: number = -1
    colorIndex: number = -1
    xIndex: number = -1
    yIndex: number = -1
    size: number = 2
    sprite: cc.Sprite = null
    colliderNode: cc.Node = null

    protected onLoad(): void {
        this.sprite = this.node.getComponent(cc.Sprite)
        this.colliderNode = this.node.getChildByName('collider')
    }

    init(index: number, typeIndex: number, colorIndex: number, size: number, xIndex: number, yIndex: number) {
        this.index = index
        this.typeIndex = typeIndex
        this.colorIndex = colorIndex
        this.xIndex = xIndex
        this.yIndex = yIndex
        this.size = size
        this.initSprite()
    }

    initSprite() {
        switch (this.typeIndex) {
            case 1: // 上
                {
                    this.node.width = 100 * this.size
                    this.node.height = 50
                    this.node.y += BLOCK_SIZE

                    this.colliderNode.width = this.node.width - 20
                    this.colliderNode.x = 10
                    this.colliderNode.height = 100
                    this.colliderNode.y = -50
                    const colliderComp = this.colliderNode.addComponent(cc.BoxCollider)
                    colliderComp.size = cc.size(this.node.width - 20, 100)
                    colliderComp.offset = cc.v2((this.node.width - 20) / 2, 50)
                }
                break
            case 2: // 右
                {
                    this.node.width = 50
                    this.node.height = 100 * this.size
                    this.node.x += BLOCK_SIZE

                    this.colliderNode.width = 100
                    this.colliderNode.x = -50
                    this.colliderNode.height = this.node.height - 20
                    this.colliderNode.y = 10
                    const colliderComp = this.colliderNode.addComponent(cc.BoxCollider)
                    colliderComp.size = cc.size(100, this.node.height - 20)
                    colliderComp.offset = cc.v2(50, (this.node.height - 20) / 2)
                }
                break
            case 3: // 下
                {
                    this.node.width = 100 * this.size
                    this.node.height = 70
                    this.node.y -= 70

                    this.colliderNode.width = this.node.width - 20
                    this.colliderNode.x = 10
                    this.colliderNode.height = 120
                    this.colliderNode.y = 0
                    const colliderComp = this.colliderNode.addComponent(cc.BoxCollider)
                    colliderComp.size = cc.size(this.node.width - 20, 120)
                    colliderComp.offset = cc.v2((this.node.width - 20) / 2, 60)
                }
                break
            case 4: // 左
                {
                    this.node.width = 50
                    this.node.height = 100 * this.size
                    this.node.x -= 50

                    this.colliderNode.width = 100
                    this.colliderNode.x = 0
                    this.colliderNode.height = this.node.height - 20
                    this.colliderNode.y = 10
                    const colliderComp = this.colliderNode.addComponent(cc.BoxCollider)
                    colliderComp.size = cc.size(100, this.node.height - 20)
                    colliderComp.offset = cc.v2(50, (this.node.height - 20) / 2)
                }
                break
        }
        this.sprite.spriteFrame = ResourceManager.instance.getSprite(`PA_Machine_${this.typeIndex}_${this.colorIndex}_1_1`)
    }

    // 出口检测方法
    canAcceptBlock(block: BJBlock): boolean {
        // 1. 检查颜色是否匹配
        if (this.colorIndex !== block.colorIndex) {
            return false;
        }

        // 2. 检查大小是否合适
        const blockSize = block.getBlockSize();
        if (this.typeIndex === 1 || this.typeIndex === 3) { // 上下出口
            if (blockSize.width > this.size) {
                return false;
            }
        } else { // 左右出口
            if (blockSize.height > this.size) {
                return false;
            }
        }

        // 3. 检查位置是否对齐
        if (!this.isBlockAligned(block)) {
            return false;
        }

        // 4. 检查是否已被占用
        if (this.isBlockExited(block)) {
            return false;
        }

        return true;
    }

    private isBlockAligned(block: BJBlock): boolean {
        const blockSize = block.getBlockSize();
        const currentGridPos = block.getCurrentGridPosition();
        switch (this.typeIndex) {
            case 1: // 上出口
                {
                    const blockCount = Math.floor(block.node.width / BLOCK_SIZE) - 1
                    const blockMax = currentGridPos.x + blockCount
                    const exitMax = this.xIndex + this.size - 1
                    return (currentGridPos.x >= this.xIndex && blockMax <= exitMax) && currentGridPos.y + (blockSize.height - 1) === this.yIndex;

                    return currentGridPos.x === this.xIndex &&
                        currentGridPos.y + (blockSize.height - 1) === this.yIndex;
                }
            case 2: // 右出口
                {
                    const blockCount = Math.floor(block.node.height / BLOCK_SIZE) - 1
                    const blockMax = currentGridPos.y + blockCount
                    const exitMax = this.yIndex + this.size - 1

                    return (currentGridPos.y >= this.yIndex && blockMax <= exitMax) && currentGridPos.x + (blockSize.width - 1) === this.xIndex

                    return currentGridPos.x + (blockSize.width - 1) === this.xIndex &&
                        currentGridPos.y === this.yIndex;
                }
            case 3: // 下出口
                {
                    const blockCount = Math.floor(block.node.width / BLOCK_SIZE) - 1
                    const blockMax = currentGridPos.x + blockCount
                    const exitMax = this.xIndex + this.size - 1
                    return (currentGridPos.x >= this.xIndex && blockMax <= exitMax) && currentGridPos.y === this.yIndex

                    return currentGridPos.x === this.xIndex &&
                        currentGridPos.y === this.yIndex;
                }
            case 4: // 左出口
                {
                    const blockCount = Math.floor(block.node.height / BLOCK_SIZE) - 1
                    const blockMax = currentGridPos.y + blockCount
                    const exitMax = this.yIndex + this.size - 1
                    return (currentGridPos.y >= this.yIndex && blockMax <= exitMax) && currentGridPos.x === this.xIndex

                    return currentGridPos.x === this.xIndex &&
                        currentGridPos.y === this.yIndex;
                }
            default:
                return false;
        }
    }

    private isBlockExited(block: BJBlock): boolean {
        if (block.typeIndex == 1
            || block.typeIndex == 2
            || block.typeIndex == 3
            || block.typeIndex == 4
            || block.typeIndex == 5
            || block.typeIndex == 6
            || block.typeIndex == 14) {
            return false
        }
        const currentGridPos = block.getCurrentGridPosition();
        // 检查其他block是否在出口处已有占用
        switch (this.typeIndex) {
            case 1: // 上
                if (block.typeIndex == 7) return false
                if (block.typeIndex == 8) return false
                if (block.typeIndex == 9) {
                    const tempX1 = currentGridPos.x + 1
                    return BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1
                }
                if (block.typeIndex == 10) {
                    const tempX = currentGridPos.x
                    return BJStage.ins.blockLimitData[this.yIndex][tempX] == 1
                }
                if (block.typeIndex == 11) return false
                if (block.typeIndex == 12) {
                    const tempX = currentGridPos.x
                    const tempY = this.yIndex - 1
                    return (BJStage.ins.blockLimitData[tempY][tempX] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 13) {
                    const tempX = currentGridPos.x
                    const tempX2 = currentGridPos.x + 2
                    return (BJStage.ins.blockLimitData[this.yIndex][tempX2] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 15) return false
                if (block.typeIndex == 16) {
                    const tempX = currentGridPos.x
                    const tempX2 = currentGridPos.x + 2
                    return (BJStage.ins.blockLimitData[this.yIndex][tempX2] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 17) {
                    const tempX = currentGridPos.x
                    const tempY = this.yIndex - 2
                    return (BJStage.ins.blockLimitData[tempY][tempX] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 18) {
                    const tempX1 = currentGridPos.x + 1
                    const tempY = this.yIndex - 2
                    return (BJStage.ins.blockLimitData[tempY][tempX1] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1)
                }
                if (block.typeIndex == 19) return false
                if (block.typeIndex == 20) {
                    const tempX1 = currentGridPos.x + 1
                    const tempY = this.yIndex - 1
                    return (BJStage.ins.blockLimitData[tempY][tempX1] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1)
                }
                if (block.typeIndex == 21) return false
                if (block.typeIndex == 22) {
                    const tempX = currentGridPos.x
                    const tempX1 = currentGridPos.x + 1
                    return (BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                break
            case 2: // 右
                if (block.typeIndex == 7) {
                    const tempY = currentGridPos.y
                    return BJStage.ins.blockLimitData[tempY][this.xIndex] == 1
                }
                if (block.typeIndex == 8) return false
                if (block.typeIndex == 9) {
                    const tempY1 = currentGridPos.y + 1
                    return BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1
                }
                if (block.typeIndex == 10) return false
                if (block.typeIndex == 11) {
                    const tempY = currentGridPos.y
                    const tempY1 = currentGridPos.y + 1
                    return (BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                if (block.typeIndex == 12) return false
                if (block.typeIndex == 13) {
                    const tempY = currentGridPos.y
                    const tempY2 = currentGridPos.y + 2
                    return (BJStage.ins.blockLimitData[tempY2][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                if (block.typeIndex == 15) {
                    const tempY = currentGridPos.y
                    return BJStage.ins.blockLimitData[tempY][this.xIndex] == 1
                }
                if (block.typeIndex == 16) {
                    const tempY1 = currentGridPos.y + 1
                    return BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1
                }
                if (block.typeIndex == 17) return false
                if (block.typeIndex == 18) {
                    const tempY = currentGridPos.y
                    const tempY2 = currentGridPos.y + 2
                    return (BJStage.ins.blockLimitData[tempY2][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                if (block.typeIndex == 19) return false
                if (block.typeIndex == 20) {
                    const tempY1 = currentGridPos.y + 1
                    const tempY2 = currentGridPos.y + 2
                    return (BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY2][this.xIndex] == 1)
                }
                if (block.typeIndex == 21) {
                    const tempY = currentGridPos.y
                    const tempX = this.xIndex - 1
                    return (BJStage.ins.blockLimitData[tempY][tempX] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                if (block.typeIndex == 22) return false
                break
            case 3: // 下
                if (block.typeIndex == 7) {
                    const tempX1 = currentGridPos.x + 1
                    return BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1
                }
                if (block.typeIndex == 8) {
                    const tempX = currentGridPos.x
                    return BJStage.ins.blockLimitData[this.yIndex][tempX] == 1
                }
                if (block.typeIndex == 9) return false
                if (block.typeIndex == 10) return false
                if (block.typeIndex == 11) {
                    const tempY = this.yIndex + 1
                    const tempX1 = currentGridPos.x + 1
                    return (BJStage.ins.blockLimitData[tempY][tempX1] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1)
                }
                if (block.typeIndex == 12) return false
                if (block.typeIndex == 13) {
                    const tempX = currentGridPos.x
                    const tempX2 = currentGridPos.x + 2
                    return (BJStage.ins.blockLimitData[this.yIndex][tempX2] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 15) {
                    const tempX = currentGridPos.x
                    const tempX2 = currentGridPos.x + 2
                    return (BJStage.ins.blockLimitData[this.yIndex][tempX2] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 16) return false
                if (block.typeIndex == 17) {
                    const tempX = currentGridPos.x
                    const tempY = this.yIndex + 2
                    return (BJStage.ins.blockLimitData[tempY][tempX] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 18) {
                    const tempX1 = currentGridPos.x + 1
                    const tempY = this.yIndex + 2
                    return (BJStage.ins.blockLimitData[tempY][tempX1] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1)
                }
                if (block.typeIndex == 19) {
                    const tempX = currentGridPos.x
                    const tempY = this.yIndex + 1
                    return (BJStage.ins.blockLimitData[tempY][tempX] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX] == 1)
                }
                if (block.typeIndex == 20) return false
                if (block.typeIndex == 21) {
                    const tempX1 = currentGridPos.x + 1
                    const tempX2 = currentGridPos.x + 2
                    if (BJStage.ins.blockLimitData[this.yIndex][tempX1] == 1 || BJStage.ins.blockLimitData[this.yIndex][tempX2] == 1) return false
                }
                if (block.typeIndex == 22) return false
                break
            case 4: // 左
                if (block.typeIndex == 7) return false
                if (block.typeIndex == 8) {
                    const tempY = currentGridPos.y
                    return BJStage.ins.blockLimitData[tempY][this.xIndex] == 1
                }
                if (block.typeIndex == 9) return false
                if (block.typeIndex == 10) {
                    const tempY1 = currentGridPos.y + 1
                    return BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1
                }
                if (block.typeIndex == 11) return false
                if (block.typeIndex == 12) {
                    const tempY1 = currentGridPos.y + 1
                    const tempY2 = currentGridPos.y + 2
                    return (BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY2][this.xIndex] == 1)
                }
                if (block.typeIndex == 13) {
                    const tempY = currentGridPos.y
                    const tempY2 = currentGridPos.y + 2
                    return (BJStage.ins.blockLimitData[tempY2][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                if (block.typeIndex == 15) {
                    const tempY = currentGridPos.y
                    return BJStage.ins.blockLimitData[tempY][this.xIndex] == 1
                }
                if (block.typeIndex == 16) {
                    const tempY1 = currentGridPos.y + 1
                    return BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1
                }
                if (block.typeIndex == 17) {
                    const tempY = currentGridPos.y
                    const tempY2 = currentGridPos.y + 2
                    return (BJStage.ins.blockLimitData[tempY2][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                if (block.typeIndex == 18) return false
                if (block.typeIndex == 19) {
                    const tempY = currentGridPos.y
                    const tempY1 = currentGridPos.y + 1
                    return (BJStage.ins.blockLimitData[tempY1][this.xIndex] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                if (block.typeIndex == 20) return false
                if (block.typeIndex == 21) return false
                if (block.typeIndex == 22) {
                    const tempY = currentGridPos.y + 1
                    const tempX = this.xIndex + 1
                    return (BJStage.ins.blockLimitData[tempY][tempX] == 1 || BJStage.ins.blockLimitData[tempY][this.xIndex] == 1)
                }
                break
        }
        return false;
    }

}
