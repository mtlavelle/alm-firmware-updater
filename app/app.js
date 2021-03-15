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

let buffer
let ex_buffer

let anotherBuffer
let evenMoreBuffer

function getRootUrl() {
  let url = document.URL
  return url
}

function readServerFirmwareFile(path) {
  let raw = new XMLHttpRequest()
  let fname = path

  raw.open('GET', fname, true)
  raw.responseType = 'arraybuffer'
  raw.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
      let obj = this.response
      console.log(obj)
      buffer = obj
      console.log(buffer)
    }
  }

  raw.send(null)
}

let app = new Vue({
  el: '#app',

  vuetify: new Vuetify(),

  template: `
  <v-app>
    <v-main>
      <v-container width="400" class="mx-auto">
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

        <v-container>
          <v-row>
            <v-col cols="3">
              <h2>Connect Module</h2>
            </v-col>

            <v-col cols="3">
              <v-btn id="connect" color="#ffbc01">Connect</v-btn>
            </v-col>

            <v-col cols="6">
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
                  <p><span id="status"></span></p>

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
                    <datalist id="vendor_ids"> </datalist>
                  </p>

                  <div class="mt-1" id="dfuseFields" hidden="true">
                    <label for="dfuseStartAddress" hidden="true"
                      >DfuSe Start Address:</label
                    >
                    <input
                      type="text"
                      name="dfuseStartAddress"
                      id="dfuseStartAddress"
                      hidden="true"
                      title="Initial memory address to read/write from (hex)"
                      size="10"
                      pattern="0x[A-Fa-f0-9]+"
                    />
                    <label for="dfuseUploadSize" hidden="true">DfuSe Upload Size:</label>
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

        <v-container>
          <v-row style="flex-wrap: nowrap">
            <v-col cols="6">
              <v-select
                :items="modules"
                v-model="selectedModule"
                label="Module"
                background-color="#f6f6f6"
                color="#e0e0e0"
                item-color="#e0e0e0"
                outlined
                filled
                dense
              >
              </v-select>
            </v-col>

            <v-col cols="4">
              <v-select
                :items="moduleFirmwares"
                v-model="selectedFirmware"
                @change="programChanged"
                label="Firmware"
                item-text="name"
                id="firmwareFile"
                :state="Boolean(firmwareFile)"
                background-color="#f6f6f6"
                color="#e0e0e0"
                item-color="#e0e0e0"
                return-object
                outlined
                filled
                dense
                required
              >
              </v-select>
            </v-col>

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

        <v-container>
          <v-row>
            <v-col align="center">
              <v-container align="center">
                <div class="flashing-info" id="downloadLog"></div>
              </v-container>
            </v-col>
          </v-row>
        </v-container>

        <v-container>
          <v-row>
            <v-col>
              <v-divider></v-divider>
            </v-col>
          </v-row>
        </v-container>

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
    moduleFirmwares() {
      return this.firmwares
        .filter(firmware => firmware.module === this.selectedModule)
        .sort((a, b) => {
          return parseFloat(b.name) - parseFloat(a.name)
        })
    }
  },

  created() {},

  mounted() {
    this.readTextFile()
  },

  methods: {
    readTextFile() {
      let self = this
      let rawFile = new XMLHttpRequest()

      rawFile.overrideMimeType('application/json')
      rawFile.open('GET', '../data/moduleSource.json', true)
      rawFile.responseType = 'text'

      rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == '200') {
          let obj = this.response
          anotherBuffer = JSON.parse(obj)

          anotherBuffer.forEach(() => {
            let moreRaw = new XMLHttpRequest()

            moreRaw.open('GET', '../data/firmware.json', true)
            moreRaw.responseType = 'text'

            moreRaw.onreadystatechange = function () {
              if (this.readyState === 4 && this.status === 200) {
                let extObj = this.response
                evenMoreBuffer = JSON.parse(extObj)

                const moduleFilter = [
                  ...new Set(evenMoreBuffer.map(obj => obj.module))
                ]

                evenMoreBuffer.forEach(obj => {
                  self.firmwares.push(obj)
                })

                moduleFilter.forEach(function (uniqueModule) {
                  if (!self.modules.includes(uniqueModule)) {
                    self.modules.push(uniqueModule)
                  }
                })
              }
            }

            moreRaw.send(null)
          })
        }
      }

      rawFile.send(null)
    },

    programChanged() {
      let self = this
      self.firmwareFileName = self.selectedFirmware.name
      this.displaySelectedFile = true
      let srcPath = self.selectedFirmware.filepath
      console.log(srcPath)
      readServerFirmwareFile(srcPath)
      setTimeout(function () {
        firmwareFile = buffer
        console.log(firmwareFile)
      }, 500)
    }
  },

  watch: {
    firmwareFile(newfile) {
      firmwareFile = null
      this.displaySelectedFile = true

      let newFirmware = {
        name: newfile.name,
        filepath: null,
        module: null
      }

      console.log(newFirmware)

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
