/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:47:46 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:47:46 
 */

import { ENUM_AUDIO_CLIP } from '../BJEnum';
import DataManager from './BJDataManager';
import ResourceManager from "./BJResourceManager";

export default class BJAudioManager {
    private audioSource: cc.AudioSource = null
    private static _instance: any = null
    // 音效播放状态
    private _isPlaying: boolean = false

    static getInstance<T>(): T {
        if (this._instance === null) {
            this._instance = new this()
            this._instance.init()
        }

        return this._instance
    }

    static get instance() {
        return this.getInstance<BJAudioManager>()
    }

    init() {
        this.audioSource = new cc.AudioSource()
        this.audioSource.loop = true
        this.audioSource.volume = 0.3
    }

    async playMusic() {
        if (!DataManager.instance.isMusicOn) return
        if (this.audioSource.clip) {
            this.audioSource.play()
            return
        }
        const clip = await ResourceManager.instance.getClip(ENUM_AUDIO_CLIP.BGM)
        this.audioSource.clip = clip
        this.audioSource.play()
    }

    stopMusic() {
        this.audioSource.stop()
    }

    async playSound(name: ENUM_AUDIO_CLIP | string, isLoop: boolean = false) {
        if (!DataManager.instance.isSoundOn) return
        const clip = await ResourceManager.instance.getClip(name)
        return cc.audioEngine.playEffect(clip, isLoop)
    }

    playSoundDelay(name: string, delay: number = 0) {
        if (!DataManager.instance.isSoundOn) return
        if (!this._isPlaying) {
            const clip = ResourceManager.instance.getClip(name)
            if (clip) {
                cc.audioEngine.playEffect(clip, false)
            } else {
                cc.log(`音频${name}不存在`)
            }
        }
        if (delay > 0) {
            this._isPlaying = true
            this.audioSource.scheduleOnce(() => {
                this._isPlaying = false
            }, delay)
        }
    }

    stopSound(audioId: number) {
        cc.audioEngine.stopEffect(audioId)
    }
}
