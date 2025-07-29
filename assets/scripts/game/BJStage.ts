/*
 * @Author: carolsail 
 * @Date: 2025-05-18 09:13:04 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-06-07 13:24:23
 */

import { ENUM_AUDIO_CLIP, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../BJEnum";
import StaticInstance from "../BJStaticInstance";
import { getRandom } from "../BJUtils";
import AudioManager from "../manager/BJAudioManager";
import DataManager, { BLOCK_COLOR, BLOCK_GAP, BLOCK_SIZE } from "../manager/BJDataManager";
import PoolManager from "../manager/BJPoolManager";
import ResourceManager from "../manager/BJResourceManager";
import BJBlock from "./BJBlock";
import BJExit from "./BJExit";
import { BJLevelConfig } from "./BJLevelConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BJStage extends cc.Component {

    static ins: BJStage = null
    rowNum: number = 5
    colNum: number = 4
    bgNode: cc.Node = null
    blockRootNode: cc.Node = null
    blockLimitData: number[][] = []

    blockTotalNum: number = 0
    blockClearNum: number = 0

    levelLabel: cc.Label = null
    timeLabel: cc.Label = null
    remainingTime: number = 300

    skillTipNode: cc.Node = null
    guide: cc.Node = null
    guideStep: number = 0

    protected onLoad(): void {
        BJStage.ins = this
        this.bgNode = cc.find('bg', this.node)
        this.blockRootNode = cc.find('block_root', this.node)
        this.levelLabel = cc.find('safe_area/level_label', this.node).getComponent(cc.Label)
        this.timeLabel = cc.find('safe_area/timer/seconds', this.node).getComponent(cc.Label)
        this.skillTipNode = cc.find('safe_area/skill_tip', this.node)
        this.guide = cc.find('guide', this.node)
    }

    async init() {
        this.blockClearNum = 0
        this.blockTotalNum = 0

        DataManager.instance.currentSkillIndex = -1
        this.toggleSkillTip(false)

        this.levelLabel.string = `第${DataManager.instance.level}关`

        let levelConfig = BJLevelConfig[DataManager.instance.level - 1]
        if (!levelConfig) {
            const tempLevel = getRandom(10, BJLevelConfig.length - 1)
            levelConfig = BJLevelConfig[tempLevel]
        }

        if (DataManager.instance.level == 1) {
            this.guideStep = 0
            this.setGuideStep()
        }

        this.rowNum = levelConfig.rowNum
        this.colNum = levelConfig.colNum

        this.blockRootNode.width = this.colNum * 100
        this.blockRootNode.height = this.rowNum * 100

        this.bgNode.width = this.colNum * 100 + 50
        this.bgNode.height = this.rowNum * 100 + 50

        if (this.colNum >= 7) {
            this.blockRootNode.scale = 0.9
            this.bgNode.scale = 0.9
        }

        this.initBlockBg()

        this.initBlock(levelConfig.blocks)

        this.initExit(levelConfig.exits)

        this.initBlockLimit()

        this.startTimer()
    }

    startTimer() {
        // 初始化时间显示
        this.updateTimeDisplay();
        this.timeLabel.schedule(() => {
            this.remainingTime--
            if (this.remainingTime < 0) this.remainingTime = 0
            this.updateTimeDisplay()
            // 检查是否超时
            if (this.remainingTime <= 0) {
                this.stopTimer()
                this.onTimeOut()
            }
        }, 1)
    }

    stopTimer() {
        this.timeLabel.unscheduleAllCallbacks()
    }

    updateTimeDisplay() {
        this.timeLabel.string = `${this.remainingTime}`;
    }

    onTimeOut() {
        if (DataManager.instance.status == ENUM_GAME_STATUS.UNRUNING) return
        this.stopTimer()
        StaticInstance.gameManager.onGameOver(ENUM_UI_TYPE.REVIVE_TIMER)
    }

    initBlockBg() {
        const startPos = cc.v2(-this.blockRootNode.width / 2, -this.blockRootNode.height / 2)
        for (let i = 0; i < this.rowNum; i++) {
            for (let j = 0; j < this.colNum; j++) {
                const blockBgNode = PoolManager.instance.getNode('BJBlockBg', this.blockRootNode)
                blockBgNode.width = blockBgNode.height = BLOCK_SIZE
                blockBgNode.getChildByName('test_label').getComponent(cc.Label).string = `x${j}:y${i}`
                const x = startPos.x + BLOCK_SIZE * j + BLOCK_GAP * j + BLOCK_SIZE / 2 + BLOCK_GAP
                const y = startPos.y + BLOCK_SIZE * i + BLOCK_GAP * i + BLOCK_SIZE / 2 + BLOCK_GAP
                blockBgNode.setPosition(cc.v2(x, y))
            }
        }
        // 再创建边框
        this.createBlockBorders(startPos);
    }

    private createBlockBorders(startPos: cc.Vec2) {
        const minX = 0;
        const maxX = this.colNum - 1;
        const minY = 0;
        const maxY = this.rowNum - 1;

        // 1. 创建顶部边框（不含角落）
        for (let j = 0; j < this.colNum; j++) {
            const borderNode = PoolManager.instance.getNode('BJBlockBorder', this.blockRootNode);
            borderNode.width = BLOCK_SIZE;
            borderNode.height = BLOCK_SIZE;

            let x = startPos.x + BLOCK_SIZE * j + BLOCK_GAP * j + BLOCK_SIZE / 2 + BLOCK_GAP;
            let y = startPos.y + BLOCK_SIZE * maxY + BLOCK_GAP * maxY + BLOCK_SIZE / 2 + BLOCK_GAP;
            y += (BLOCK_SIZE + 50) / 2;

            borderNode.setPosition(cc.v2(x, y));

            this.setBorderSpriteFrame(borderNode, 'PA_Machine_1_11_1_1'); // 上边图集
        }

        // 2. 创建底部边框（不含角落）
        for (let j = 0; j < this.colNum; j++) {
            const borderNode = PoolManager.instance.getNode('BJBlockBorder', this.blockRootNode);
            borderNode.width = BLOCK_SIZE;
            borderNode.height = BLOCK_SIZE;

            let x = startPos.x + BLOCK_SIZE * j + BLOCK_GAP * j + BLOCK_SIZE / 2 + BLOCK_GAP;
            let y = startPos.y + BLOCK_GAP * minY + BLOCK_SIZE / 2;

            y -= (BLOCK_SIZE + 78) / 2;

            borderNode.setPosition(cc.v2(x, y));

            this.setBorderSpriteFrame(borderNode, 'PA_Machine_3_11_1_1'); // 下边图集
        }

        // 3. 创建左边框（不含角落）
        for (let i = 0; i < this.rowNum; i++) {
            const borderNode = PoolManager.instance.getNode('BJBlockBorder', this.blockRootNode);
            borderNode.width = BLOCK_SIZE;
            borderNode.height = BLOCK_SIZE;

            let x = startPos.x + BLOCK_GAP * minX + BLOCK_SIZE / 2;
            let y = startPos.y + BLOCK_SIZE * i + BLOCK_GAP * i + BLOCK_SIZE / 2 + BLOCK_GAP;

            x -= (BLOCK_SIZE + 50) / 2;

            borderNode.setPosition(cc.v2(x, y));

            this.setBorderSpriteFrame(borderNode, 'PA_Machine_4_11_1_1'); // 左边图集
        }

        // 4. 创建右边框（不含角落）
        for (let i = 0; i < this.rowNum; i++) {
            const borderNode = PoolManager.instance.getNode('BJBlockBorder', this.blockRootNode);
            borderNode.width = BLOCK_SIZE;
            borderNode.height = BLOCK_SIZE;

            let x = startPos.x + BLOCK_SIZE * maxX + BLOCK_GAP * maxX + BLOCK_SIZE / 2 + BLOCK_GAP;
            let y = startPos.y + BLOCK_SIZE * i + BLOCK_GAP * i + BLOCK_SIZE / 2 + BLOCK_GAP;

            x += (BLOCK_SIZE + 50) / 2;

            borderNode.setPosition(cc.v2(x, y));

            this.setBorderSpriteFrame(borderNode, 'PA_Machine_2_11_1_1'); // 右边图集
        }

        // 5. 创建四个角（额外添加）
        this.createCornerBorder(startPos, minX, minY, 'PA_Machine_TC_4'); // 左下角
        this.createCornerBorder(startPos, maxX, minY, 'PA_Machine_TC_3'); // 右下角
        this.createCornerBorder(startPos, minX, maxY, 'PA_Machine_TC_1'); // 左上角
        this.createCornerBorder(startPos, maxX, maxY, 'PA_Machine_TC_2'); // 右上角
    }

    private setBorderSpriteFrame(node: cc.Node, frameName: string) {
        const sprite = node.getComponent(cc.Sprite);
        if (!sprite) return;

        const spriteFrame = ResourceManager.instance.getSprite(frameName);
        if (spriteFrame) {
            sprite.spriteFrame = spriteFrame;
        }
    }

    private createCornerBorder(startPos: cc.Vec2, col: number, row: number, frameName: string) {
        const x = startPos.x + BLOCK_SIZE * col + BLOCK_GAP * col + BLOCK_SIZE / 2 + BLOCK_GAP;
        const y = startPos.y + BLOCK_SIZE * row + BLOCK_GAP * row + BLOCK_SIZE / 2 + BLOCK_GAP;

        let offsetX = 0;
        let offsetY = 0;

        if (col === 0 && row === 0) {
            offsetX = -(BLOCK_SIZE + 50) / 2;
            offsetY = -(BLOCK_SIZE + 50) / 2;
        } else if (col === this.colNum - 1 && row === 0) {
            offsetX = (BLOCK_SIZE + 50) / 2;
            offsetY = -(BLOCK_SIZE + 50) / 2;
        } else if (col === 0 && row === this.rowNum - 1) {
            offsetX = -(BLOCK_SIZE + 50) / 2;
            offsetY = (BLOCK_SIZE + 50) / 2;
        } else if (col === this.colNum - 1 && row === this.rowNum - 1) {
            offsetX = (BLOCK_SIZE + 50) / 2;
            offsetY = (BLOCK_SIZE + 50) / 2;
        }

        const cornerNode = PoolManager.instance.getNode('BJBlockBorder', this.blockRootNode);
        cornerNode.width = BLOCK_SIZE;
        cornerNode.height = BLOCK_SIZE;
        cornerNode.setPosition(cc.v2(x + offsetX, y + offsetY));
        this.setBorderSpriteFrame(cornerNode, frameName);
    }

    initBlock(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
            this.blockTotalNum += 1
            const data = arr[i]
            const blockNode = PoolManager.instance.getNode('BJBlock', this.blockRootNode)
            const x = data.x * (BLOCK_SIZE + BLOCK_GAP)
            const y = data.y * (BLOCK_SIZE + BLOCK_GAP)
            const pos = this.getRealPos(cc.v2(x, y))
            blockNode.setPosition(pos)
            const blockComp = blockNode.getComponent(BJBlock)
            // 字符串中获得数字
            const matches = data['icon'].match(/(\d+)_(\d+)$/);
            const typeIndex = parseInt(matches[1]);
            const colorIndex = parseInt(matches[2]);
            let dir = 0
            if (typeof data.dir == 'string') {
                dir = parseInt(data.dir)
            } else {
                dir = data.dir
            }
            blockComp.init(i, typeIndex, colorIndex, data.x, data.y, dir)
        }
    }

    initExit(arr: any[]) {
        for (let i = 0; i < arr.length; i++) {
            const data = arr[i]
            const blockNode = PoolManager.instance.getNode('BJExit', this.blockRootNode)
            const x = data.x * (BLOCK_SIZE + BLOCK_GAP)
            const y = data.y * (BLOCK_SIZE + BLOCK_GAP)
            const pos = this.getRealPos(cc.v2(x, y))
            blockNode.setPosition(pos)
            const blockComp = blockNode.getComponent(BJExit)
            // 字符串中获得数字
            const matches = data['icon'].match(/PA_Machine_(\d+)_(\d+)_\d+_\d+/);
            const typeIndex = parseInt(matches[1]);
            const colorIndex = parseInt(matches[2]);
            blockComp.init(i, typeIndex, colorIndex, data.size, data.x, data.y)
        }
    }

    // 重置所有方块占用
    initBlockLimit() {
        this.blockLimitData = []
        for (let i = 0; i < this.rowNum; i++) {
            this.blockLimitData[i] = []
        }
        for (let i = 0; i < this.rowNum; i++) {
            for (let j = 0; j < this.colNum; j++) {
                this.blockLimitData[i][j] = 0
            }
        }

        const blockCompArr = this.blockRootNode.getComponentsInChildren(BJBlock)
        for (let i = 0; i < blockCompArr.length; i++) {
            const blockComp = blockCompArr[i]
            switch (blockComp.typeIndex) {
                case 1:
                    // 1*1格子
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    break
                case 2:
                    // 2*1格子
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    break
                case 3:
                    // 3*1格子
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 2] = 1
                    break
                case 4:
                    // 1*2格子
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    break
                case 5:
                    // 1*3格子
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex] = 1
                    break
                case 6:
                    // 2*2格子
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    break
                case 7:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    break
                case 8:
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    break
                case 9:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    break
                case 10:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    break
                case 11:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex + 1] = 1
                    break
                case 12:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex + 1] = 1
                    break
                case 13:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 2] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex + 1] = 1
                    break
                case 14:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 3][blockComp.xIndex] = 1
                    break
                case 15:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 2] = 1
                    break
                case 16:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 2] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    break
                case 17:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex + 1] = 1
                    break
                case 18:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex] = 1
                    break
                case 19:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex + 1] = 1
                    break
                case 20:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 2][blockComp.xIndex] = 1
                    break
                case 21:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 2] = 1
                    break
                case 22:
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 1] = 1
                    this.blockLimitData[blockComp.yIndex][blockComp.xIndex + 2] = 1
                    this.blockLimitData[blockComp.yIndex + 1][blockComp.xIndex + 2] = 1
                    break
            }
        }
    }

    getRealPos(pos: cc.Vec2) {
        const startPos = cc.v2(-this.blockRootNode.width / 2 + BLOCK_GAP, -this.blockRootNode.height / 2 + BLOCK_GAP)
        const x = startPos.x + pos.x
        const y = startPos.y + pos.y
        return cc.v2(x, y)
    }

    getGridSize(): { width: number, height: number } {
        return {
            width: this.colNum,  // 列数
            height: this.rowNum  // 行数
        };
    }

    // 查是否可以放置方块
    canPlaceBlock(block: BJBlock, x: number, y: number): boolean {
        const shape = block.getBlockShape();

        // 检查边界
        if (x < 0 || y < 0 ||
            x + shape[0].length > this.colNum ||
            y + shape.length > this.rowNum) {
            return false;
        }

        // 检查形状的每个有效格子
        for (let relY = 0; relY < shape.length; relY++) {
            for (let relX = 0; relX < shape[relY].length; relX++) {
                if (shape[relY][relX] === 1) {
                    const checkX = x + relX;
                    const checkY = y + relY;

                    // 检查是否是当前方块原来的位置
                    const isOriginalPos = (
                        checkX >= block.xIndex && checkX < block.xIndex + shape[0].length &&
                        checkY >= block.yIndex && checkY < block.yIndex + shape.length
                    );

                    // 如果位置被占用且不是原来的位置，则不能放置
                    if (!isOriginalPos &&
                        this.blockLimitData[checkY] &&
                        this.blockLimitData[checkY][checkX] === 1) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // 更新当前方块的占用
    updateBlockLimitData(block: BJBlock, isAdd: boolean) {
        const shape = block.getBlockShape();

        // 清除原来的占用
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x] === 1) {
                    const posY = block.yIndex + y;
                    const posX = block.xIndex + x;
                    if (posY >= 0 && posY < this.rowNum &&
                        posX >= 0 && posX < this.colNum) {
                        this.blockLimitData[posY][posX] = 0;
                    }
                }
            }
        }

        // 如果是添加，设置新的占用
        if (isAdd) {
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] === 1) {
                        const posY = block.yIndex + y;
                        const posX = block.xIndex + x;
                        if (posY >= 0 && posY < this.rowNum &&
                            posX >= 0 && posX < this.colNum) {
                            this.blockLimitData[posY][posX] = 1;
                        }
                    }
                }
            }
        }
    }

    // 获取指定位置的所有方块
    getBlocksAtPosition(worldPos: cc.Vec2): BJBlock[] {
        const blocks = this.blockRootNode.getComponentsInChildren(BJBlock);
        const result: BJBlock[] = [];

        for (const block of blocks) {
            if (this.isPositionInBlock(worldPos, block)) {
                result.push(block);
            }
        }

        // 按选择优先级和zIndex排序
        return result.sort((a, b) => {
            const priorityDiff = b.getSelectionPriority() - a.getSelectionPriority();
            return priorityDiff !== 0 ? priorityDiff : a.node.zIndex - b.node.zIndex;
        });
    }

    // 检查位置是否在方块内（考虑形状）
    private isPositionInBlock(worldPos: cc.Vec2, block: BJBlock): boolean {
        const shape = block.getBlockShape();

        // 转换为方块局部坐标
        const localPos = block.node.convertToNodeSpaceAR(worldPos);

        // 计算网格坐标
        const gridX = Math.floor(localPos.x / BLOCK_SIZE);
        const gridY = Math.floor(localPos.y / BLOCK_SIZE);

        // 检查是否在形状范围内
        if (gridY >= 0 && gridY < shape.length &&
            gridX >= 0 && gridX < shape[gridY].length) {
            return shape[gridY][gridX] === 1;
        }

        return false;
    }

    // 出口检查逻辑
    checkExitCondition(block: BJBlock): boolean {
        const exits = this.node.getComponentsInChildren(BJExit);
        for (const exit of exits) {
            if (exit.canAcceptBlock(block)) {
                // 从占用数据中移除
                this.updateBlockLimitData(block, false)
                // cc.log(this.blockLimitData)
                DataManager.instance.currentSelectBlock = null
                // 从场景中移除
                AudioManager.instance.playSound(ENUM_AUDIO_CLIP.BLOCK_OUT)
                block.isExited = true
                this.blockClearNum += 1
                block.setActive(false)
                block.hideDir()

                if (DataManager.instance.level == 1) {
                    this.guideStep += 1
                    this.setGuideStep()
                }

                // 动画逻辑
                let moveX = 0, moveY = 0, moveX2 = 0, moveY2 = 0
                if (exit.typeIndex == 1) {
                    moveY = 50
                    moveY2 = block.node.height
                }
                if (exit.typeIndex == 2) {
                    moveX = 50
                    moveX2 = block.node.width
                }
                if (exit.typeIndex == 3) {
                    moveY = -50
                    moveY2 = -block.node.height
                }
                if (exit.typeIndex == 4) {
                    moveX = -50
                    moveX2 = -block.node.width
                }
                const act = cc.moveBy(0.2, moveX, moveY)
                cc.tween(block.node).then(act).call(() => {
                    const act = cc.moveBy(0.2, moveX2, moveY2)
                    cc.tween(block.sprite.node).then(act).call(() => [
                        block.node.destroy()
                    ]).start()

                    switch (exit.typeIndex) {
                        case 1:
                            {
                                for (let i = 0; i < exit.size; i++) {
                                    const eff = PoolManager.instance.getNode('eff_exit', exit.node)
                                    eff.x = i * 100 + 50
                                    const effParitcle = eff.getComponent(cc.ParticleSystem)
                                    effParitcle.endColor = new cc.Color().fromHEX(BLOCK_COLOR[exit.colorIndex - 1])
                                    effParitcle.gravity = cc.v2(0, 200)
                                    effParitcle.resetSystem()
                                }
                            }
                            break
                        case 2:
                            {
                                for (let i = 0; i < exit.size; i++) {
                                    const eff = PoolManager.instance.getNode('eff_exit', exit.node)
                                    eff.x = 30
                                    eff.y = i * 100 + 50
                                    const effParitcle = eff.getComponent(cc.ParticleSystem)
                                    effParitcle.endColor = new cc.Color().fromHEX(BLOCK_COLOR[exit.colorIndex - 1])
                                    effParitcle.gravity = cc.v2(0, 0)
                                    effParitcle.resetSystem()
                                }
                            }
                            break
                        case 3:
                            {
                                for (let i = 0; i < exit.size; i++) {
                                    const eff = PoolManager.instance.getNode('eff_exit', exit.node)
                                    eff.x = i * 100 + 50
                                    eff.y = 50
                                    const effParitcle = eff.getComponent(cc.ParticleSystem)
                                    effParitcle.endColor = new cc.Color().fromHEX(BLOCK_COLOR[exit.colorIndex - 1])
                                    effParitcle.gravity = cc.v2(0, -200)
                                    effParitcle.resetSystem()
                                }
                            }
                            break
                        case 4:
                            {
                                for (let i = 0; i < exit.size; i++) {
                                    const eff = PoolManager.instance.getNode('eff_exit', exit.node)
                                    eff.x = 0
                                    eff.y = i * 100 + 50
                                    const effParitcle = eff.getComponent(cc.ParticleSystem)
                                    effParitcle.endColor = new cc.Color().fromHEX(BLOCK_COLOR[exit.colorIndex - 1])
                                    effParitcle.gravity = cc.v2(0, 0)
                                    effParitcle.resetSystem()
                                }
                            }
                            break
                    }

                }).start()

                // 游戏进度
                this.checkGame()
                return true;
            }
        }

        return false;
    }

    checkGame() {
        if (this.blockClearNum >= this.blockTotalNum) {
            StaticInstance.gameManager.onGameOver(ENUM_UI_TYPE.WIN)
        }
    }

    onRevive() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.DING)
        cc.Tween.stopAllByTarget(this.timeLabel.node)
        const act_time = cc.sequence(cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1))
        cc.tween(this.timeLabel.node).then(act_time).start()
        this.remainingTime += 120
        DataManager.instance.status = ENUM_GAME_STATUS.RUNING
        this.startTimer()
    }

    onSkill() {
        if (DataManager.instance.currentSkillIndex == 2) {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.DING)
            cc.Tween.stopAllByTarget(this.timeLabel.node)
            const act_time = cc.sequence(cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1))
            cc.tween(this.timeLabel.node).then(act_time).start()
            this.remainingTime += 180
            DataManager.instance.status = ENUM_GAME_STATUS.RUNING
            this.startTimer()
        } else {
            this.toggleSkillTip(true)
        }
    }

    onSkillClick(e: any, index: number) {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.gameManager.onGamePause()
        DataManager.instance.currentSkillIndex = index
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.TIP)
    }

    toggleSkillTip(bool: boolean) {
        if (bool) {
            this.skillTipNode.active = true
            if (DataManager.instance.currentSkillIndex == 0) {
                this.skillTipNode.getChildByName('label').getComponent(cc.Label).string = '请选择想要转色的方块'
            } else if (DataManager.instance.currentSkillIndex == 1) {
                this.skillTipNode.getChildByName('label').getComponent(cc.Label).string = '请选择想要敲掉的方块'
            }
        } else {
            this.skillTipNode.active = false
        }
    }

    onPauseClick() {
        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.CLICK)
        StaticInstance.gameManager.onGamePause()
        StaticInstance.uiManager.toggle(ENUM_UI_TYPE.EXIT)
    }

    setGuideStep() {
        if (this.guideStep == 0) {
            this.guide.children[0].active = true
            this.guide.children[1].active = false
        } else if (this.guideStep == 1) {
            this.guide.children[0].active = false
            this.guide.children[1].active = true
        } else {
            this.guide.children[0].active = false
            this.guide.children[1].active = false
        }
    }
}
