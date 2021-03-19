# alm-firmware-updater

Web-based firmware updater for ALM Busy Circuits modules

The status messages for flashing are at:

./dfu/dfu.js
line 545: this.logInfo('Copying firmware to module...')
line 570: this.logInfo(`Read ${bytes_read} bytes...`)
line 610: this.logInfo('Copying firmware to module...')
line 649: this.logInfo('Wrote ' + bytes_sent + ' bytes...')
line 650: this.logInfo('Installing new firmware...')

./dfu/dfuse.js
line 237: this.logInfo('Erasing current firmware...')
line 257: this.logInfo('Copying firmware to module...')
line 289: this.logInfo('Wrote ' + bytes_sent + ' bytes...')
line 291: this.logInfo('Installing new firmware...')

./dfu/dfu-utils.js
line 578: logInfo('Module now updated and ready to use!')

The connections messages are at:

./dfu/dfu-utils.js
line 317: onDisconnect('Device Disconnected')
line 417: statusDisplay.textContent = 'Connected'
line 484: statusDisplay.textContent = 'No device found.'
