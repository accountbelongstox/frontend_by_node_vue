const auto_update = require("../../main/auto_update")
const create_env_version = require("../../main/create_env_version")
const initialize_environment_to_system = require("../../main/initialize_environment_to_system")
const loaded = require("../../main/loaded")
const system_backup = require("../../main/system_backup")

let mainComs = {
    auto_update,
    create_env_version,
    initialize_environment_to_system,
    loaded,
    system_backup,
}

module.exports = mainComs
