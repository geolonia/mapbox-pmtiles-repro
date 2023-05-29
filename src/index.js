import { enablePmtilesProtocol } from "./pmtiles"

const main = async () => {
  enablePmtilesProtocol()
  mapboxgl.accessToken = 'pk.eyJ1Ijoia2FtYXRhcnlvIiwiYSI6ImNsaTJydDJ1ODA4bGEzam4waHlxMWZiMnYifQ.oikexEXnoSym6eoa_nfEcw'

  const styleResp = await fetch('./style.json')
  const style = await styleResp.json()

  const map = new mapboxgl.Map({
    container: 'map',
    style,
    minZoom: 0,
    maxZoom: 18,
  })
}
main()
