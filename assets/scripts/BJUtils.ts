/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:44:53 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:44:53 
 */

export function getRandom(lower: number, upper: number): number {
    return Math.floor(Math.random() * (upper - lower + 1)) + lower;
}

// 数组打乱
export function shuffle(arr: any[]) {
    let length: number = arr.length,
        randomIndex: number,
        temp: any;
    while (length) {
        randomIndex = Math.floor(Math.random() * (length--));
        temp = arr[randomIndex];
        arr[randomIndex] = arr[length];
        arr[length] = temp
    }
    return arr
}

// 数组对象排序
export function sort(arr: any[] | unknown, key: any, flag: boolean = true) {
    if (arr instanceof Array) {
        return arr.sort((a, b) => {
            if (a[key] > b[key]) {
                return flag ? 1 : -1
            } else if (a[key] < b[key]) {
                return flag ? -1 : 1
            } else {
                return 0
            }
        })
    }
}

// 字符串中包含数字，提取数字进行排序
export function sortSpriteNameByNum(frames: cc.SpriteFrame[]) {
    const getNumberInSpriteName = (name: string) => {
        const reg = /\d+/g
        return parseInt(name.match(reg)[0] || '0')
    }
    return frames.sort((a, b) => getNumberInSpriteName(a.name) - getNumberInSpriteName(b.name))
}

// 字符串中提取数字
export function getNumberInStr(name: string) {
    const reg = /\d+/g
    const arr = name.match(reg)
    if (arr) {
        return parseInt(arr[0] || '0')
    } else {
        return 0
    }
}

// 秒数转换
export function formatSeconds(seconds: number | string, dateFormat = 'h:i:s'): string {
    seconds = Number(seconds)
    let obj: any = {}
    obj.h = Number.parseInt(String(seconds / 3600));
    obj.i = Number.parseInt(String((seconds - obj.h * 3600) / 60));
    obj.s = Number.parseInt(String(seconds - obj.h * 3600 - obj.i * 60));
    if (obj.h < 10) obj.h = '0' + obj.h;
    if (obj.i < 10) obj.i = '0' + obj.i;
    if (obj.s < 10) obj.s = '0' + obj.s;
    // 3.解析
    var rs = dateFormat.replace('h', obj.h).replace('i', obj.i).replace('s', obj.s);
    return rs;
}

// 两点距离
export function getDistance(start: cc.Vec2, end: cc.Vec2) {
    const pos = cc.v2(start.x - end.x, start.y - end.y);
    const dis = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    return dis;
}

// 两点角度
export function getAngle(start: cc.Vec2, end: cc.Vec2) {
    //计算出朝向
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dir = cc.v2(dx, dy);
    //根据朝向计算出夹角弧度
    const angle = dir.signAngle(cc.v2(1, 0));
    //将弧度转换为欧拉角
    const degree = angle / Math.PI * 180;
    return -degree
}

// 把节点1转节点2坐标
export function toXY(node1: cc.Node, node2: cc.Node) {
    const wpos = node1.convertToWorldSpaceAR(cc.v2(0, 0))
    const pos = node2.convertToNodeSpaceAR(wpos)
    return pos
}

// 微信头像链接
export function wxAvatar(avatarUrl: string, isCached: boolean = true) {
    if (isCached) {
        avatarUrl += `?sail.jpg`
    } else {
        const time = new Date().getTime()
        avatarUrl += `?sail=${time}.jpg`
    }
    return new Promise<void>((resolve, reject) => {
        cc.loader.load(avatarUrl, function (err: any, texture: any) {
            if (err) reject && reject()
            resolve && resolve(texture)
        })
    })
}

// 生成uuid
export function uuid() {
    let d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

export function playSpine(target: cc.Node | sp.Skeleton | null, animationName: string, loop: boolean = false, callback?: () => void): void {
    if (target) {
        const skeleton: sp.Skeleton | null = target instanceof sp.Skeleton ? target : target.getComponent(sp.Skeleton);
        if (skeleton) {
            skeleton.setAnimation(0, animationName, loop);
            skeleton.setCompleteListener((event: any) => {
                if (event.animation.name === animationName && callback) {
                    callback()
                }
            })
        }
    }
}