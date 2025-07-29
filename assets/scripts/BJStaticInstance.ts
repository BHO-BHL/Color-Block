/*
 * @Author: carolsail 
 * @Date: 2025-05-29 13:44:38 
 * @Last Modified by:   carolsail 
 * @Last Modified time: 2025-05-29 13:44:38 
 */

import FadeManager from "./manager/BJFadeManager";
import GameManager from "./manager/BJGameManager";
import UIManager from "./manager/BJUIManager";

export default class BJStaticInstance {
    static uiManager: UIManager | undefined = undefined;
    static gameManager: GameManager | undefined = undefined;
    static fadeManager: FadeManager | undefined = undefined;

    static setUIManager(context: UIManager) {
        BJStaticInstance.uiManager = context;
    }

    static setGameManager(context: GameManager) {
        BJStaticInstance.gameManager = context
    }

    static setFadeManager(context: FadeManager) {
        BJStaticInstance.fadeManager = context
    }
}