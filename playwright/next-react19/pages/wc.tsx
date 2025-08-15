import Head from 'next/head'
import { useEffect } from 'react'

export default function WC() {
  useEffect(() => {
    const s = document.createElement('script')
    s.src = '/wc.js'
    s.async = true
    document.head.appendChild(s)
    return () => { s.remove() }
  }, [])
  return (
    <>
      <Head>
        <title>WC Smoke</title>
      </Head>
      <main style={{ padding: 20 }}>
        <h1>WC Smoke</h1>
        <div id="ce-status" data-registered={typeof window !== 'undefined' && !!customElements.get('clover-viewer')}></div>
        <clover-viewer id="demo" iiif-content="https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json"></clover-viewer>
      </main>
    </>
  )
}
