const {
    timingTaskAddUnit,
} = require('../component/comlib/unit.js');
const {
    winapiWidget, wingetWidget,htmlWidget
} = require('../component/comlib/widget.js');
const auto_update = require('./auto_update.js');
class Main {

    async autoExecAfterByLoaded() {
        console.log(`auto_update`)
        auto_update.checkUpdateOnlyExec()

        timingTaskAddUnit.register('0 1 * * *', "change_imagebackgroud", () => {
            htmlWidget.setBackgroundByNetwork('body')
        })

        if (!winapiWidget.hasUserData(`install.isInstalledTheSystem`)) {


        } else {
            timingTaskAddUnit.register('00 07 * * *', "backup_wsl", () => {
                backupSoftwares.backup_wsl()
            })

            timingTaskAddUnit.register('* * * * *', "backup_system_enviroment", () => {
                backupSoftwares.backup_listen()
            })
        }
    }
}

module.exports = new Main()

