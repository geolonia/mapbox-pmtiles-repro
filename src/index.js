import { enablePmtilesProtocol } from "./pmtiles"

const main = async () => {
  enablePmtilesProtocol()
  mapboxgl.accessToken = // TODO

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
