
const {
	stringUnit,
    // fileUnit,
    utilUnit,
    // frameUnit,
} = require('../component/comlib/unit.js');
const {
	// httpWidget,
	// configWidget,
	// shortcutRegistrationWidget,
	// winapiWidget,
    // wingetWidget,
    // messageWidget,
    // zipWidget,
    // htmlWidget,
	shortcutIconWidget,
} = require('../component/comlib/widget.js');
const {
} = require('../component/comlib/mainComs.js');

class Main {
    init() { }

    autoExecBeforeByLoaded() {
    }

    autoExecAfterByLoaded() {

    }

    autoExecBeforeByLoadedOne() {

    }

    autoExecAfterByLoadedOne() {


    }

    closeAfterDestructe() {

    }

    async readIcons() {
        let localIconCache = await shortcutIconWidget.readIcons()
        return localIconCache
    }
}

module.exports = new Main()