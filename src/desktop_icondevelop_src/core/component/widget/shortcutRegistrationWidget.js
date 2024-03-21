const { globalShortcut } = require('electron');

class GlobalShortcutCase {
    register_shortkey = {}
    register_dict = {
        "F7": "start_cast", // 对应的event方法
        "F8": "stop_cast",
    }



    shortcutKeyEffect() {
        for (const key in this.register_dict) {
            const event_name = this.register_dict[key]
            // 注册一个全局快捷键 Ctrl+Shift+X
            const ret = globalShortcut.register(key, () => {
                if (this.register_shortkey[event_name]) {
                    this.register_shortkey[event_name]()
                }
            });

            if (!ret) {
                console.error('Failed to register global shortcut');
            }
        }
    }

    
}

module.exports = new GlobalShortcutCase()