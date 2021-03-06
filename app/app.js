// Declare data variables
let data = {
  noDevice: true,
  firmwareFile: null,
  displayImportedFile: false,
  displaySelectedFile: false,

  modules: [],
  firmwares: [],
  selectedModule: null,
  selectedFirmware: null
}

// Declare buffer variables
let arrayBuffer
let firmwareFileBuffer

// Get root URL of project
function getRootUrl() {
  let url = document.URL
  return url
}

// Adds selected firmware file to the arrayBuffer to be
// flashed to connected module
function readServerFirmwareFile(path) {
  let raw = new XMLHttpRequest()
  let fileName = path

  raw.open('GET', fileName, true)
  raw.responseType = 'arraybuffer'

  raw.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let obj = this.response
      arrayBuffer = obj
    }
  }

  raw.send(null)
}

let app = new Vue({
  el: '#app',

  // Use Vuetify
  vuetify: new Vuetify(),

  template: `
  <v-app>
    <v-main>
      <v-container width="400" class="mx-auto">
        <!-- HEADER -->
        <v-row>
          <v-col class="d-flex align-center align-self-auto">
            <div>
              <v-img
                src="../assets/img/alm-circle-logo.png"
                max-width="100"
                max-height="100"
              ></v-img>
            </div>

            <div class="mt-2">
              <h1>ALM Firmware Updater</h1>
            </div>
          </v-col>
        </v-row>

        <!-- MODULE CONNECTION -->
        <v-container>
          <v-row class="mt-2">
            <v-col cols="6">
              <h3>Connect Module</h3>
              <v-btn id="connect" color="#ffbc01" class="mt-5">Connect</v-btn>
            </v-col>
          </v-row>
        </v-container>

        <v-container>
          <v-row>
            <v-col>
              <div>
                <button id="detach" disabled="true" hidden="true">Detach DFU</button>
                <button id="upload" disabled="true" hidden="true">Upload</button>

                <v-form id="configForm">
                  <p>
                    <label for="transferSize" hidden="true">Transfer Size:</label>
                    <input
                      type="number"
                      name="transferSize"
                      hidden="true"
                      id="transferSize"
                      value="1024"
                    />
                  </p>

                  <p>
                    <label hidden="true" for="vid">Vendor ID (hex):</label>
                    <input
                      hidden="true"
                      list="vendor_ids"
                      type="text"
                      name="vid"
                      id="vid"
                      maxlength="6"
                      size="8"
                      pattern="0x[A-Fa-f0-9]{1,4}"
                    />
                    <datalist id="vendor_ids"></datalist>
                  </p>

                  <div class="mt-1" id="dfuseFields" hidden="true">
                    <label for="dfuseStartAddress" hidden="true">
                      DfuSe Start Address:
                    </label>

                    <input
                      type="text"
                      name="dfuseStartAddress"
                      id="dfuseStartAddress"
                      hidden="true"
                      title="Initial memory address to read/write from (hex)"
                      size="10"
                      pattern="0x[A-Fa-f0-9]+"
                    />

                    <label for="dfuseUploadSize" hidden="true">
                      DfuSe Upload Size:
                    </label>

                    <input
                      type="number"
                      name="dfuseUploadSize"
                      id="dfuseUploadSize"
                      min="1"
                      max="2097152"
                      hidden="true"
                    />
                  </div>
                </v-form>
              </div>

              <div id="usbInfo" hidden="true" style="white-space: pre"></div>
              <div id="dfuInfo" hidden="true" style="white-space: pre"></div>
            </v-col>
          </v-row>
        </v-container>

        <!-- DISPLAYS CONNECTION INFO -->
        <v-container>
          <v-row>
            <v-col class="status-info-col">
              <h3 id="status">No Module Connected</h3>
            </v-col>
          </v-row>
        </v-container>

        <!-- VUETIFY DIVIDER -->
        <v-container>
          <v-row class="mt-0">
            <v-col class="status-col">
              <v-divider color="#000" class="mt-0 status-divider"></v-divider>
            </v-col>
          </v-row>
        </v-container>

        <!-- SELECT FIELD HEADERS -->
        <v-container>
          <v-row style="flex-wrap: nowrap">
            <v-col cols="6">
              <h3>Module</h3>
              <p>Select a module to update.</p>
            </v-col>
            <v-col cols="4">
              <h3>Firmware</h3>
              <p>Select a firmware release.</p>
            </v-col>
            <v-col cols="2"></v-col>
          </v-row>
        </v-container>

        <!-- SELECT FIELDS -->
        <v-container>
          <v-row style="flex-wrap: nowrap">
            <!-- SELECT MODULE -->
            <v-col cols="6">
              <v-select
                :items="modules"
                v-model="selectedModule"
                label="Module"
                background-color="#f6f6f6"
                color="#e0e0e0"
                item-color="#e0e0e0"
                :disabled="noDevice"
                dense
                solo
              >
              </v-select>
            </v-col>

            <!-- SELECT FIRMWARE -->
            <v-col cols="4">
              <v-select
                :items="moduleFirmwares"
                v-model="selectedFirmware"
                @change="programChanged"
                label="Firmware"
                item-text="name"
                no-data-text="First select a module"
                id="firmwareFile"
                :state="Boolean(firmwareFile)"
                background-color="#f6f6f6"
                color="#e0e0e0"
                item-color="#e0e0e0"
                :disabled="noDevice"
                return-object
                dense
                solo
                required
              >
              </v-select>
            </v-col>

            <!-- FLASH BUTTON -->
            <v-col cols="2">
              <v-btn
                color="#ffbc01"
                id="download"
                :disabled="noDevice || !selectedFirmware"
              >
                Flash
              </v-btn>
            </v-col>
          </v-row>
        </v-container>

        <!-- DISPLAYS INFO LOG WHILE FLASHING -->
        <v-container>
          <v-row>
            <v-col class="status-info-col">
              <div class="log" id="downloadLog"></div>
            </v-col>
          </v-row>
        </v-container>

        <!-- VUETIFY DIVIDER -->
        <v-container>
          <v-row class="mt-0">
            <v-col class="status-col">
              <v-divider color="#000" class="mt-0 status-divider"></v-divider>
            </v-col>
          </v-row>
        </v-container>

        <!-- INSTRUCTIONS -->
        <v-container>
          <v-row>
            <v-col>
              <h2>Instructions</h2>

              <ul>
                <li>
                  Prior to updating, disconnect your module from Eurorack power and
                  any expanders.
                </li>
                <li>
                  Connect the module directly to the computer via USB cable, it will
                  remain unlit.
                </li>
                <li>Click connect and select STM32 Bootloader from the list.</li>
                <li>Select your module and PCB revision (if applicable).</li>
                <li>
                  Choose the firmware you would like to install and click flash.
                </li>
              </ul>
            </v-col>
          </v-row>
        </v-container>
      </v-container>
    </v-main>
  </v-app>
    `,

  data: data,

  computed: {
    // Filters firmware choices by selected module
    moduleFirmwares() {
      return this.firmwares
        .filter(firmware => firmware.module === this.selectedModule)
        .sort((a, b) => {
          return parseFloat(b.name) - parseFloat(a.name)
        })
    }
  },

  mounted() {
    // Calls readFirmwareFile function on page load
    this.readFirmwareFile()
  },

  methods: {
    // Fetches and parses data from local JSON files
    readFirmwareFile() {
      let self = this
      let srcURL = getRootUrl().concat('data/firmware.json')
      let firmwareFile = new XMLHttpRequest()

      firmwareFile.overrideMimeType('application/json')
      firmwareFile.open('GET', srcURL, true)
      firmwareFile.responseType = 'text'

      firmwareFile.onreadystatechange = function () {
        if (firmwareFile.readyState === 4 && firmwareFile.status == '200') {
          let firmwareObject = this.response
          firmwareFileBuffer = JSON.parse(firmwareObject)

          // Parses all firmware options and appends them to the
          // firmwares data array
          firmwareFileBuffer.forEach(firmware => {
            self.firmwares.push(firmware)
          })

          // Parses module names from firmwareFileBuffer
          const moduleFilter = [
            ...new Set(
              firmwareFileBuffer.map(moduleObject => moduleObject.module)
            )
          ]

          // Filters unique module names from all firmware options and
          // appends them to the modules data array
          moduleFilter.forEach(function (uniqueModule) {
            if (!self.modules.includes(uniqueModule)) {
              self.modules.push(uniqueModule)
            }
          })
        }
      }

      firmwareFile.send(null)
    },

    // Gets firmware file path from selectedFirmware and
    // passes it the the readServerFirmwareFile function
    programChanged() {
      let self = this
      self.firmwareFileName = self.selectedFirmware.name
      this.displaySelectedFile = true
      let firmwarePath = self.selectedFirmware.filePath

      readServerFirmwareFile(firmwarePath)

      setTimeout(function () {
        firmwareFile = arrayBuffer
      }, 500)
    }
  },

  watch: {
    firmwareFile(newfile) {
      firmwareFile = null
      this.displaySelectedFile = true

      let newFirmware = {
        name: newfile.name,
        filePath: null,
        module: null
      }

      this.selectedFirmware = newFirmware

      let reader = new FileReader()

      reader.onload = function () {
        this.firmwareFile = reader.result
        firmwareFile = reader.result
      }

      reader.readAsArrayBuffer(newfile)
    }
  }
})
