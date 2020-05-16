const Switchbot = require('node-switchbot');

let Service;
let Characteristic;

module.exports = (homebridge) => {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-switchbot-for-mac', 'SwitchBot-For-Mac', SwitchBotAccessory);
}

class SwitchBotAccessory {
  constructor(log, config) {
    this.log = log;
    this.device = null;
    this.active = false;
  }

  getServices() {
    const accessoryInformationService = new Service.AccessoryInformation();
    accessoryInformationService
      .setCharacteristic(Characteristic.Manufacturer, 'zizi4n5')

    const switchService = new Service.Switch();
    switchService
      .getCharacteristic(Characteristic.On)
        .on('get', this.getOn.bind(this))
        .on('set', this.setOn.bind(this));

    return [accessoryInformationService, switchService];
  }

  getOn(callback) {
    callback(null, this.active);
  }

  async setOn(value, callback) {
    const humanState = value ? 'on' : 'off';
    this.log(`Turning ${humanState}...`);

    try {
      if (this.device == null) {
        const switchbot = new Switchbot();

        // Find a Bot (WoHand)
        const bot_list = await switchbot.discover({ duration: 10000, model: 'H', quick: true });
        if (bot_list.length === 0) {
          throw new Error('No device was found.');
        }
        // The `SwitchbotDeviceWoHand` object representing the found Bot.
        this.device = bot_list[0];
      }

      value ? await this.device.down() : await this.device.up();
      this.active = value;
      this.log(`Turned ${humanState}`);
      callback();
    } catch (error) {
      this.log(`Failed turning ${humanState}`);
      callback(`Failed turning ${humanState}`);
    }
  }
}
