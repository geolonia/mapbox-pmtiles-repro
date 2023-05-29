import * as pmtiles from 'pmtiles'

const native_fetch = globalThis.fetch
const pmtiles_cache = {}

export const enablePmtilesProtocol = () => {

  globalThis.fetch = (input, init) => {
    const url =
      typeof input === 'string' ? input : input.url
    const match = url.match(/^pmtiles:\/\/(https:\/\/.+)/)
    if (match) {
      const pmtiles_http_url = new URL(match[1])
      const { protocol, host, port, pathname } = new URL(pmtiles_http_url)
      const canonical_pmtiles_http_url = `${protocol}//${host}${
        port ? ':' + port : ''
      }${pathname}`
      return fetch_pmtiles(canonical_pmtiles_http_url, null)
    } else if (url.indexOf('pmtiles=true') > -1) {
      const pmtiles_http_url = new URL(url)
      const { protocol, host, port, pathname, searchParams } = new URL(
        pmtiles_http_url
      )
      const canonical_pmtiles_http_url = `${protocol}//${host}${
        port ? ':' + port : ''
      }${pathname}`
      const query_z = searchParams.get('z') || ''
      const query_x = searchParams.get('x') || ''
      const query_y = searchParams.get('y') || ''
      const zxy =
        query_z && query_x && query_y
          ? [query_z, query_x, query_y].map((val) => parseInt(val, 10))
          : null
      return fetch_pmtiles(canonical_pmtiles_http_url, zxy)
    } else {
      return native_fetch(input, init)
    }
  }

  const fetch_pmtiles = async (pmtiles_http_url,zxy) => {
    if (!pmtiles_cache[pmtiles_http_url]) {
      pmtiles_cache[pmtiles_http_url] = {
        instance: new pmtiles.PMTiles(pmtiles_http_url),
      }
    }
    const p = pmtiles_cache[pmtiles_http_url].instance
    if (zxy) {
      // Tile
      const [z, x, y] = zxy
      const range_response = await p.getZxyAttempt(z, x, y)
      const header = await p.getHeader()
      if (range_response && z <= header.maxZoom && header.minZoom <= z) {
        return new Response(range_response.data, { status: 206 })
      } else {
        return new Response(null, { status: 204 })
      }
    } else {
      // Source
      const metadata = await p.getMetadataAttempt()
      const pmtiles_querystring = `pmtiles=true&z={z}&x={x}&y={y}`
      metadata.tiles = [`${pmtiles_http_url}?${pmtiles_querystring}`]
      return new Response(JSON.stringify(metadata), { status: 206 })
    }
  }
}
