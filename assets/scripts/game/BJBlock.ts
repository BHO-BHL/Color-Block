/*
 * @Author: carolsail 
 * @Date: 2025-06-01 11:20:16 
 * @Last Modified by: carolsail
 * @Last Modified time: 2025-06-07 13:24:23
 */

import { ENUM_AUDIO_CLIP, ENUM_GAME_STATUS, ENUM_UI_TYPE } from "../BJEnum";
import AudioManager from "../manager/BJAudioManager";
import DataManager, { BLOCK_GAP, BLOCK_SIZE } from "../manager/BJDataManager";
import ResourceManager from "../manager/BJResourceManager";
import BJStage from "./BJStage";
import PoolManager from "../manager/BJPoolManager";
import StaticInstance from "../BJStaticInstance";

const { ccclass, property } = cc._decorator;
export enum BLOCK_TYPE {
    NORMAL = 0,
    DIR = 1,
    ICE = 2,
    BOMB = 3,
    CHAIN = 4,
    KEY = 5
}

export type BlockData = {
    index: number
    typeIndex: number;
    colorIndex: number;
    x: number;
    y: number;
    type: BLOCK_TYPE;
    properties: {
        count: number,
        combine?: {
            type: BLOCK_TYPE,
            properties: {}
        },
    }
}
@ccclass
export default class BJBlock extends cc.Component {

    index: number = -1
    typeIndex: number = -1
    colorIndex: number = -1
    xIndex: number = -1
    yIndex: number = -1
    typeBlock: BLOCK_TYPE = BLOCK_TYPE.NORMAL
    properties = null
    maskNode: cc.Node = null
    dirNode: cc.Node = null
    bombNode: cc.Node = null
    iceNode: cc.Node = null
    chainNode: cc.Node = null
    keyNode: cc.Node = null
    sprite: cc.Sprite = null
    material: cc.Material = null
    materialActive: cc.Material = null
    colliderComp: cc.BoxCollider = null


    private isSelected: boolean = false;
    private isLocked: boolean = false;
    private isChained: boolean = false;
    private touchOffset: cc.Vec2 = cc.Vec2.ZERO;
    private originalPos: cc.Vec2 = cc.Vec2.ZERO;
    private initPos: cc.Vec2 = cc.Vec2.ZERO;

    isExited: boolean = false

    protected onLoad(): void {
        this.maskNode = this.node.getChildByName('mask')
        this.dirNode = this.node.getChildByName('icon_dir')
        this.iceNode = this.node.getChildByName('icon_ice')
        this.bombNode = this.node.getChildByName('icon_bomb')
        this.chainNode = this.node.getChildByName('icon_chain')
        this.keyNode = this.node.getChildByName('icon_key')
        this.sprite = this.maskNode.getChildByName('icon').getComponent(cc.Sprite)
        this.colliderComp = this.node.getComponent(cc.BoxCollider)
        const materials = this.sprite.getMaterials()
        this.material = cc.MaterialVariant.create(materials[0], this.sprite)
        this.materialActive = cc.MaterialVariant.create(materials[1], this.sprite)

        // 添加触摸事件监听
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    init(data: BlockData) {
        this.index = data.index;
        this.typeIndex = data.typeIndex;
        this.colorIndex = data.colorIndex;
        this.xIndex = data.x;
        this.yIndex = data.y;
        this.typeBlock = data.type;
        this.properties = data.properties;

        this.initSprite()
        switch (this.typeBlock) {
            case BLOCK_TYPE.NORMAL:
                break;
            case BLOCK_TYPE.DIR:
                this.initDir();
                break;
            case BLOCK_TYPE.ICE:
                this.initIce();
                break;
            case BLOCK_TYPE.BOMB:
                this.initBomb();
                break;
            case BLOCK_TYPE.CHAIN:
                this.initChain();
                break;
            case BLOCK_TYPE.KEY:
                this.initKey();
                break;
            default: break;
        }

        // 初始化位置信息
        this.initPos = cc.v2(this.node.position.clone());
    }

    initSprite() {
        switch (this.typeIndex) {
            case 1:
                this.node.width = 100
                this.node.height = 100
                this.maskNode.width = 100
                this.maskNode.height = 100

                this.colliderComp.size = cc.size(100, 100)
                this.colliderComp.offset = cc.v2(50, 50)
                break
            case 2:
                this.node.width = 200
                this.node.height = 100
                this.maskNode.width = 200
                this.maskNode.height = 100

                this.colliderComp.size = cc.size(200, 100)
                this.colliderComp.offset = cc.v2(100, 50)
                break
            case 3:
                this.node.width = 300
                this.node.height = 100
                this.maskNode.width = 300
                this.maskNode.height = 100

                this.colliderComp.size = cc.size(300, 100)
                this.colliderComp.offset = cc.v2(150, 50)
                break
            case 4:
                this.node.width = 100
                this.node.height = 200
                this.maskNode.width = 100
                this.maskNode.height = 200

                this.colliderComp.size = cc.size(100, 200)
                this.colliderComp.offset = cc.v2(50, 100)
                break
            case 5:
                this.node.width = 100
                this.node.height = 300
                this.maskNode.width = 100
                this.maskNode.height = 300

                this.colliderComp.size = cc.size(100, 300)
                this.colliderComp.offset = cc.v2(50, 150)
                break
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                this.node.width = 200
                this.node.height = 200
                this.maskNode.width = 200
                this.maskNode.height = 200

                this.colliderComp.size = cc.size(200, 200)
                this.colliderComp.offset = cc.v2(100, 100)
                break
            case 11:
            case 12:
                this.node.width = 200
                this.node.height = 300
                this.maskNode.width = 200
                this.maskNode.height = 300

                this.colliderComp.size = cc.size(200, 300)
                this.colliderComp.offset = cc.v2(100, 150)
                break
            case 13:
                this.node.width = 300
                this.node.height = 300
                this.maskNode.width = 300
                this.maskNode.height = 300

                this.colliderComp.size = cc.size(300, 300)
                this.colliderComp.offset = cc.v2(150, 150)
                break
            case 14:
                this.node.width = 100
                this.node.height = 400
                this.maskNode.width = 100
                this.maskNode.height = 400

                this.colliderComp.size = cc.size(100, 400)
                this.colliderComp.offset = cc.v2(50, 200)
                break
            case 15:
            case 16:
            case 21:
            case 22:
                this.node.width = 300
                this.node.height = 200
                this.maskNode.width = 300
                this.maskNode.height = 200

                this.colliderComp.size = cc.size(300, 200)
                this.colliderComp.offset = cc.v2(150, 100)
                break
            case 17:
            case 18:
            case 19:
            case 20:
                this.node.width = 200
                this.node.height = 300
                this.maskNode.width = 200
                this.maskNode.height = 300

                this.colliderComp.size = cc.size(200, 300)
                this.colliderComp.offset = cc.v2(100, 150)
                break
        }
        this.sprite.spriteFrame = ResourceManager.instance.getSprite(`PA_Grid_${this.typeIndex}_${this.colorIndex}`)
    }

    setPositionNodeCenter(node: cc.Node) {
        switch (this.typeIndex) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 13:
            case 14:
            case 15:
            case 16:
                node.x = this.node.width / 2
                node.y = this.node.height / 2
                break
            case 7:
            case 9:
            case 11:
            case 18:
            case 20:
                node.x = (this.node.width - BLOCK_SIZE) / 2
                node.y = (this.node.height - BLOCK_SIZE) / 2
                break
            case 8:
            case 10:
            case 12:
            case 17:
            case 19:
                node.x = (this.node.width + BLOCK_SIZE) / 2
                node.y = (this.node.height + BLOCK_SIZE) / 2
                break
            case 21:
                node.x = (this.node.width - BLOCK_SIZE * 2) / 2
                node.y = (this.node.height - BLOCK_SIZE * 2) / 2
                break
            case 22:
                node.x = (this.node.width + BLOCK_SIZE * 2) / 2
                node.y = (this.node.height + BLOCK_SIZE * 2) / 2
                break;
        }
    }

    initDir() {
        if (this.properties.count == 0) {
            this.dirNode.active = false
        } else if (this.properties.count == 1) {
            // 垂直
            this.dirNode.active = true
            this.dirNode.height = this.node.height
            switch (this.typeIndex) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 13:
                case 14:
                case 15:
                case 16:
                    this.dirNode.x = (this.node.width - this.dirNode.width) / 2
                    break
                case 7:
                case 9:
                case 11:
                case 18:
                case 20:
                    this.dirNode.x = (this.node.width - this.dirNode.width - BLOCK_SIZE) / 2
                    break
                case 8:
                case 10:
                case 12:
                case 17:
                case 19:
                    this.dirNode.x = (this.node.width - this.dirNode.width + BLOCK_SIZE) / 2
                    break
                case 21:
                    this.dirNode.x = (this.node.width - this.dirNode.width - BLOCK_SIZE * 2) / 2
                    break
                case 22:
                    this.dirNode.x = (this.node.width - this.dirNode.width + BLOCK_SIZE * 2) / 2
                    break
            }
        } else if (this.properties.count == 2) {
            // 水平
            this.dirNode.active = true
            this.dirNode.width = this.node.width
            switch (this.typeIndex) {
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 13:
                case 14:
                case 17:
                case 18:
                    this.dirNode.y = (this.node.height - this.dirNode.height) / 2
                    break
                case 7:
                case 8:
                case 15:
                case 21:
                    this.dirNode.y = (this.node.height - this.dirNode.height + BLOCK_SIZE) / 2
                    break
                case 9:
                case 10:
                case 16:
                case 22:
                    this.dirNode.y = (this.node.height - this.dirNode.height - BLOCK_SIZE) / 2
                    break
                case 11:
                case 19:
                    this.dirNode.y = (this.node.height - this.dirNode.height + BLOCK_SIZE * 2) / 2
                    break
                case 12:
                case 20:
                    this.dirNode.y = (this.node.height - this.dirNode.height - BLOCK_SIZE * 2) / 2
                    break
            }
        }
        this.dirNode.getComponent(cc.Sprite).spriteFrame = ResourceManager.instance.getSprite(`PA_Up_Down_1_${this.properties.count}`)
    }

    hideDir() {
        this.dirNode.active = false
    }

    initIce() {
        this.iceNode.active = true;
        this.isLocked = true;
        const countNode = this.iceNode.getChildByName("count");
        countNode.getComponent(cc.Label).string = `${this.properties.count}`;
        this.iceNode.getComponent(cc.Sprite).spriteFrame = ResourceManager.instance.getSprite(`PA_Grid_${this.typeIndex}_${this.colorIndex}`);
        this.iceNode.color = cc.Color.BLACK;
        this.iceNode.opacity = 150;
        this.setPositionNodeCenter(countNode);
    }

    setCountIce(count: number) {
        this.properties.count = count;
        const countNode = this.iceNode.getChildByName("count");
        countNode.getComponent(cc.Label).string = `${this.properties.count}`;

        if (this.properties.count <= 0) {
            this.hideIce();
            this.isLocked = false;
        }
    }

    hideIce() {
        this.iceNode.active = false
    }

    initBomb() {
        this.bombNode.active = true;
        const countNode = this.bombNode.getChildByName("count");
        countNode.getComponent(cc.Label).string = `${this.properties.count}`;
        this.startBombCountdown();
        this.setPositionNodeCenter(this.bombNode);
    }

    private bombTimer: number = null;
    startBombCountdown() {
        // Nếu đã có timer thì không tạo mới
        if (this.bombTimer !== null) return;
        this.bombTimer = setInterval(() => {
            this.properties.count -= 1;
            this.setCountBomb(this.properties.count);
            if (this.properties.count <= 0) {
                StaticInstance.gameManager.onGameOver(ENUM_UI_TYPE.REVIVE_TIMER)

                const bombEff = PoolManager.instance.getNode('eff_bomb', this.node)
                bombEff.setPosition(this.bombNode.position);
                const bombParticle = bombEff.getComponent(cc.ParticleSystem);
                bombParticle.resetSystem();

                // Xóa node effect sau khi particle kết thúc
                this.scheduleOnce(() => {
                    bombEff.destroy();
                }, bombParticle.duration + bombParticle.life);

                this.stopBombCountdown();
            }
        }, 1000);
    }

    stopBombCountdown() {
        if (this.bombTimer !== null) {
            clearInterval(this.bombTimer);
            this.bombTimer = null;
            this.hideBomb();
        }
    }

    private bombPaused: boolean = false;
    pauseBombCountdown() {
        if (this.bombTimer !== null && !this.bombPaused) {
            clearInterval(this.bombTimer);
            this.bombTimer = null;
            this.bombPaused = true;
        }
    }

    resumeBombCountdown() {
        if (this.bombPaused && this.properties.count > 0 && this.bombTimer === null) {
            this.bombPaused = false;
            this.startBombCountdown();
        }
    }

    setCountBomb(count: number) {
        this.properties.count = count;
        const countNode = this.bombNode.getChildByName("count");
        countNode.getComponent(cc.Label).string = `${this.properties.count}`;

        if (this.properties.count <= 0) {
            this.hideBomb();
        }
    }

    hideBomb() {
        this.bombNode.active = false
    }

    initChain() {
        this.chainNode.active = true;
        this.isChained = true;
        const countNode = this.chainNode.getChildByName("lock").getChildByName("count");
        countNode.getComponent(cc.Label).string = `${this.properties.count}`;
        this.setPositionNodeCenter(this.chainNode);

    }

    setCountChain(count: number) {
        this.properties.count = count;
        const countNode = this.chainNode.getChildByName("lock").getChildByName("count");
        countNode.getComponent(cc.Label).string = `${this.properties.count}`;

        if (this.properties.count <= 0) {
            this.hideChain();
            this.isChained = false;
        }
    }

    hideChain() {
        this.chainNode.active = false;
    }

    initKey() {
        this.keyNode.active = true;
        this.setPositionNodeCenter(this.keyNode);
    }

    changeColor() {
        this.sprite.spriteFrame = ResourceManager.instance.getSprite(`PA_Grid_${this.typeIndex}_${this.colorIndex}`)
    }

    setActive(bool: boolean) {
        const targetMaterial = bool ? this.materialActive : this.material
        this.sprite.setMaterial(0, targetMaterial);
    }

    // 触摸开始
    private onTouchStart(event: cc.Event.EventTouch) {
        if (this.isLocked || this.isChained) return;
        // if (DataManager.instance.currentSelectBlock) return
        if (DataManager.instance.status == ENUM_GAME_STATUS.UNRUNING) return

        // 获取所有被点击的方块（按zIndex排序）
        const touchedBlocks = BJStage.ins.getBlocksAtPosition(event.getLocation());

        // 如果没有点击到任何方块，直接返回
        if (touchedBlocks.length === 0) return;

        // 总是选择最上层的方块
        const block = touchedBlocks[touchedBlocks.length - 1];


        // 技能
        if (DataManager.instance.currentSkillIndex == 0) {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.DING)
            StaticInstance.gameManager.onGameResume()
            block.colorIndex = DataManager.instance.currentColorIndex += 1
            this.changeColor()
            DataManager.instance.currentSkillIndex = -1
            BJStage.ins.toggleSkillTip(false)
            return
        } else if (DataManager.instance.currentSkillIndex == 1) {
            AudioManager.instance.playSound(ENUM_AUDIO_CLIP.BLOCK_OUT)
            StaticInstance.gameManager.onGameResume()
            block.node.zIndex = 888
            block.isExited = true
            BJStage.ins.updateBlockLimitData(block, false)
            let act = null
            if (block.xIndex >= BJStage.ins.colNum / 2) {
                act = cc.moveBy(0.1, 200, 0)
            } else {
                act = cc.moveBy(0.1, -200, 0)
            }
            cc.tween(block.node).then(act).call(() => {
                block.node.destroy()
                this.stopBombCountdown()
            }).start()
            BJStage.ins.blockClearNum += 1
            DataManager.instance.currentSkillIndex = -1
            BJStage.ins.toggleSkillTip(false)
            return
        }



        // 如果是当前方块已经被选中，直接返回
        if (block.isSelected) return;

        AudioManager.instance.playSound(ENUM_AUDIO_CLIP.BLOCK_CHOOSE)
        // 设置选中状态
        DataManager.instance.currentSelectBlock = block;
        block.isSelected = true;
        block.setActive(true);
        block.node.zIndex = 9999;

        BJStage.ins.updateBlockLimitData(DataManager.instance.currentSelectBlock, false);

        // 保存触摸偏移量
        const touchPos = block.node.parent.convertToNodeSpaceAR(event.getLocation());
        block.touchOffset = touchPos.sub(cc.v2(block.node.position));
        block.originalPos = cc.v2(block.node.position.clone());

        event.stopPropagation();
    }

    // 动态调整边界的移动逻辑
    private onTouchMove(event: cc.Event.EventTouch) {
        if (this.isLocked || this.isChained) return;
        if (DataManager.instance.status == ENUM_GAME_STATUS.UNRUNING) return
        if (DataManager.instance.currentSelectBlock == null) return
        if (!DataManager.instance.currentSelectBlock.isSelected) return;

        // 计算新的位置
        const touchPos = DataManager.instance.currentSelectBlock.node.parent.convertToNodeSpaceAR(event.getLocation());
        let newPos = touchPos.sub(DataManager.instance.currentSelectBlock.touchOffset);

        // 获取当前网格位置
        const currentGridPos = DataManager.instance.currentSelectBlock.getCurrentGridPosition();

        // 计算基础边界
        const minX = -BJStage.ins.blockRootNode.width / 2 + BLOCK_GAP;
        const minY = -BJStage.ins.blockRootNode.height / 2 + BLOCK_GAP;

        // 动态计算实际可移动边界
        const dynamicBounds = DataManager.instance.currentSelectBlock.calculateShapeAwareBounds(currentGridPos);

        // 转换为世界坐标边界
        const worldMinX = minX + dynamicBounds.minCol * (BLOCK_SIZE + BLOCK_GAP);
        const worldMaxX = minX + dynamicBounds.maxCol * (BLOCK_SIZE + BLOCK_GAP);
        const worldMinY = minY + dynamicBounds.minRow * (BLOCK_SIZE + BLOCK_GAP);
        const worldMaxY = minY + dynamicBounds.maxRow * (BLOCK_SIZE + BLOCK_GAP);

        // 限制位置在动态边界内
        if (DataManager.instance.currentSelectBlock.typeBlock == BLOCK_TYPE.DIR
            && DataManager.instance.currentSelectBlock.properties.count == 1) {
            // cc.log(DataManager.instance.currentSelectBlock.initPos.x, DataManager.instance.currentSelectBlock.originalPos.x)
            newPos.x = DataManager.instance.currentSelectBlock.initPos.x; // 保持原始x位置
            newPos.y = cc.misc.clampf(newPos.y, worldMinY, worldMaxY);
        } else if (DataManager.instance.currentSelectBlock.typeBlock == BLOCK_TYPE.DIR
            && DataManager.instance.currentSelectBlock.properties.count == 2) {
            // cc.log(DataManager.instance.currentSelectBlock.initPos.y, DataManager.instance.currentSelectBlock.originalPos.y)
            newPos.y = DataManager.instance.currentSelectBlock.initPos.y; // 保持原始y位置
            newPos.x = cc.misc.clampf(newPos.x, worldMinX, worldMaxX);
        } else {
            newPos.x = cc.misc.clampf(newPos.x, worldMinX, worldMaxX);
            newPos.y = cc.misc.clampf(newPos.y, worldMinY, worldMaxY);
        }


        // 应用新位置
        DataManager.instance.currentSelectBlock.node.position = cc.v3(newPos);

        event.stopPropagation();
    }

    // 触摸结束
    private onTouchEnd(event: cc.Event.EventTouch) {
        if (DataManager.instance.status == ENUM_GAME_STATUS.UNRUNING) return
        if (DataManager.instance.currentSelectBlock == null) return
        if (!DataManager.instance.currentSelectBlock.isSelected) return;


        // 先检查出口条件 (test)
        // if (BJStage.ins.checkExitCondition(DataManager.instance.currentSelectBlock)) {
        //     // 已被出口移除，直接返回
        //     return;
        // }


        // 尝试放置方块
        const canPlace = DataManager.instance.currentSelectBlock.tryPlaceBlock();

        if (!canPlace) {
            // 如果不能放置，回到原始位置
            DataManager.instance.currentSelectBlock.node.position = cc.v3(DataManager.instance.currentSelectBlock.originalPos);
        }



        // 重置状态
        DataManager.instance.currentSelectBlock.isSelected = false;
        DataManager.instance.currentSelectBlock.setActive(false);
        DataManager.instance.currentSelectBlock.node.zIndex = 0
        // DataManager.instance.currentSelectBlock = null;

        event.stopPropagation();
    }

    // 尝试放置方块，返回是否成功
    private tryPlaceBlock(): boolean {
        // 计算当前所在的网格位置
        const gridPos = this.getCurrentGridPosition();

        // 检查是否可以放置
        if (BJStage.ins.canPlaceBlock(this, gridPos.x, gridPos.y)) {
            // 更新方块的位置索引
            this.xIndex = gridPos.x;
            this.yIndex = gridPos.y;

            // 重置舞台的占用数据
            BJStage.ins.initBlockLimit()

            // 对齐到网格
            this.alignToGrid();

            return true;
        }

        return false;
    }

    // 对齐到网格
    private alignToGrid() {
        const pos = BJStage.ins.getRealPos(cc.v2(
            this.xIndex * (BLOCK_SIZE + BLOCK_GAP),
            this.yIndex * (BLOCK_SIZE + BLOCK_GAP)
        ));
        this.node.position = cc.v3(pos);
    }

    // 获取当前所在的网格位置
    public getCurrentGridPosition(): { x: number, y: number } {
        const startPos = cc.v2(
            -BJStage.ins.blockRootNode.width / 2 + BLOCK_GAP,
            -BJStage.ins.blockRootNode.height / 2 + BLOCK_GAP
        );

        const relativePos = this.node.position.sub(cc.v3(startPos));

        // 计算最近的网格位置
        const gridX = Math.round(relativePos.x / (BLOCK_SIZE + BLOCK_GAP));
        const gridY = Math.round(relativePos.y / (BLOCK_SIZE + BLOCK_GAP));

        return { x: gridX, y: gridY };
    }

    // 获取方块的尺寸（以网格单位计算）
    public getBlockSize(): { width: number, height: number } {
        switch (this.typeIndex) {
            case 1: return { width: 1, height: 1 };
            case 2: return { width: 2, height: 1 };
            case 3: return { width: 3, height: 1 };
            case 4: return { width: 1, height: 2 };
            case 5: return { width: 1, height: 3 };
            case 6:
            case 7:
            case 8:
            case 9:
            case 10: return { width: 2, height: 2 };
            case 11:
            case 12: return { width: 2, height: 3 };
            case 13: return { width: 3, height: 3 };
            case 14: return { width: 1, height: 4 };
            case 15:
            case 16:
            case 21:
            case 22: return { width: 3, height: 2 };
            case 17:
            case 18:
            case 19:
            case 20: return { width: 2, height: 3 };
            default: return { width: 1, height: 1 };
        }
    }

    // 基于形状的动态边界计算
    private calculateShapeAwareBounds(currentPos: { x: number, y: number }) {
        const shape = this.getBlockShape();
        const bounds = {
            minCol: 0,
            maxCol: BJStage.ins.colNum - shape[0].length,
            minRow: 0,
            maxRow: BJStage.ins.rowNum - shape.length
        };

        // 临时移除当前方块的占用
        // BJStage.ins.updateBlockLimitData(this, false);

        // 检查四个方向的阻挡
        const checkDirection = (dx: number, dy: number) => {
            for (let step = 1; step <= Math.max(BJStage.ins.colNum, BJStage.ins.rowNum); step++) {
                const testX = currentPos.x + dx * step;
                const testY = currentPos.y + dy * step;

                // 检查形状在新位置是否会碰撞
                for (let y = 0; y < shape.length; y++) {
                    for (let x = 0; x < shape[y].length; x++) {
                        if (shape[y][x] === 1) {
                            const checkX = testX + x;
                            const checkY = testY + y;

                            // 边界检查
                            if (checkX < 0 || checkX >= BJStage.ins.colNum ||
                                checkY < 0 || checkY >= BJStage.ins.rowNum) {
                                return step - 1;
                            }

                            // 占用检查
                            if (BJStage.ins.blockLimitData[checkY] &&
                                BJStage.ins.blockLimitData[checkY][checkX] === 1) {
                                return step - 1;
                            }
                        }
                    }
                }
            }
            return 0;
        };

        bounds.minCol = currentPos.x - checkDirection(-1, 0);
        bounds.maxCol = currentPos.x + checkDirection(1, 0);
        bounds.minRow = currentPos.y - checkDirection(0, -1);
        bounds.maxRow = currentPos.y + checkDirection(0, 1);

        // 恢复当前方块的占用
        // BJStage.ins.updateBlockLimitData(this, true);

        return bounds;
    }

    public getBlockShape(): number[][] {
        switch (this.typeIndex) {
            case 1: // 1x1方块
                return [
                    [1]
                ];
            case 2: // 2x1方块
                return [
                    [1, 1]
                ];
            case 3: // 3x1方块
                return [
                    [1, 1, 1]
                ];
            case 4: // 1x2方块
                return [
                    [1],
                    [1]
                ];
            case 5: // 1x3方块
                return [
                    [1],
                    [1],
                    [1]
                ];
            case 6: // 2x2方块
                return [
                    [1, 1],
                    [1, 1],
                ];
            case 7: // 特殊方块
                return [
                    [1, 0], // [y][x] 相对坐标
                    [1, 1]
                ];
            case 8:
                return [
                    [0, 1],
                    [1, 1]
                ];
            case 9:
                return [
                    [1, 1],
                    [1, 0]
                ];
            case 10:
                return [
                    [1, 1],
                    [0, 1]
                ];
            case 11:
                return [
                    [1, 0],
                    [1, 0],
                    [1, 1]
                ];
            case 12:
                return [
                    [1, 1],
                    [0, 1],
                    [0, 1]
                ];
            case 13:
                return [
                    [0, 1, 0],
                    [1, 1, 1],
                    [0, 1, 0]
                ];
            case 14:
                return [
                    [1],
                    [1],
                    [1],
                    [1]
                ];
            case 15:
                return [
                    [0, 1, 0],
                    [1, 1, 1]
                ]
            case 16:
                return [
                    [1, 1, 1],
                    [0, 1, 0]
                ]
            case 17:
                return [
                    [0, 1],
                    [1, 1],
                    [0, 1]
                ]
            case 18:
                return [
                    [1, 0],
                    [1, 1],
                    [1, 0]
                ]
            case 19:
                return [
                    [0, 1],
                    [0, 1],
                    [1, 1]
                ]
            case 20:
                return [
                    [1, 1],
                    [1, 0],
                    [1, 0]
                ];
            case 21:
                return [
                    [1, 0, 0],
                    [1, 1, 1]
                ]
            case 22:
                return [
                    [1, 1, 1],
                    [0, 0, 1]
                ]
            default:
                return [[1]]; // 默认1x1
        }
    }

    public getSelectionPriority(): number {
        // 小方块优先级更高
        switch (this.typeIndex) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 14: return 100
            default: return 60; // 其他
        }
    }

    private lastCheckTime: number = 0;
    private checkInterval: number = 0.3;

    onCollisionStay(other: cc.Collider) {
        if (DataManager.instance.status == ENUM_GAME_STATUS.UNRUNING) return
        if (other.tag == 0 && DataManager.instance.currentSelectBlock) {
            const now = cc.director.getTotalTime() / 1000; // 转换为秒
            if (now - this.lastCheckTime >= this.checkInterval) {
                this.lastCheckTime = now;
                if (BJStage.ins.checkExitCondition(DataManager.instance.currentSelectBlock)) {
                    // 已被出口移除，直接返回
                    return;
                }
            }
        }
    }

}
