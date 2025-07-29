/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:52:59 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:52:59 
 */

import DataManager from './BJDataManager';
import PoolManager from './BJPoolManager';

export default class BJResourceManager {

    public clipMap = {}

    public spriteMap = {}

    public jsonMap = {}

    public txtMap = {}

    private static _instance: any = null

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<BJResourceManager>()
    }

    public async loadRes(resource: any) {
        return new Promise<void>((resolve, reject) => {
            const rate = DataManager.instance.loadingRate
            cc.resources.loadDir(resource.path, resource.content, (finished: number, total: number) => {
                // 资源加载进度
                if (resource.ratio > 0) {
                    // 保留两位小数
                    const loadingRate = Math.floor((rate + resource.ratio * finished / total) * 100) / 100
                    DataManager.instance.loadingRate = Math.max(loadingRate, DataManager.instance.loadingRate)
                }
            }, (err, assets: any) => {
                if (err) reject && reject()
                let asset: any
                if (resource.type == 'audio') {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        if (!this.clipMap[asset.name]) this.clipMap[asset.name] = asset
                    }
                }
                if (resource.type == 'prefab') {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        PoolManager.instance.setPrefab(asset.data.name, asset)
                    }
                }
                if (resource.type == 'sprite') {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        if (!this.spriteMap[asset.name]) this.spriteMap[asset.name] = asset
                    }
                }
                if (resource.type == 'json') {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        if (!this.jsonMap[asset.name]) this.jsonMap[asset.name] = asset.json
                    }
                }
                if (resource.type == 'txt') {
                    for (let i = 0; i < assets.length; i++) {
                        asset = assets[i];
                        const text = asset.text
                        const textArr = text.split(/[(\r\n)\r\n]+/)
                        for (let j = 0; j < textArr.length; j++) {
                            const level = j + 1
                            this.txtMap[`word_${level}`] = textArr[j]
                        }
                    }
                }
                resolve && resolve()
            })
        })
    }

    public getClip(name: string) {
        return this.clipMap[name]
    }

    public getSprite(name: string) {
        return this.spriteMap[name]
    }

    public getJson(name: string) {
        return this.jsonMap[name];
    }

    public getTxt(name: string) {
        return this.txtMap[name];
    }
}
