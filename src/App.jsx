import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import AppsSection from './components/AppsSection.jsx'
import Billboard from './components/Billboard.jsx'
import Feedback from './components/Feedback.jsx'
import Dashboard from './components/Dashboard.jsx'
import Support from './components/Support.jsx'
import Footer from './components/Footer.jsx'
import Admin from './components/Admin.jsx'
import { apps } from './data/apps.js'
import { nhostConfigured } from './lib/nhost.js'

export default function App() {
  const [feedbackProduct, setFeedbackProduct] = useState(apps[0].id)
  const [isAdmin, setIsAdmin] = useState(
    () => typeof window !== 'undefined' && window.location.hash.toLowerCase() === '#admin'
  )

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash.toLowerCase() === '#admin')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  function openFeedback(productId) {
    setFeedbackProduct(productId)
    requestAnimationFrame(() => {
      document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' })
    })
  }

  if (isAdmin) {
    return <Admin onClose={() => setIsAdmin(false)} />
  }

  return (
    <>
      {!nhostConfigured && <ConfigBanner />}
      <Navbar />
      <main>
        <Hero />
        <AppsSection onFeedback={openFeedback} />
        <Billboard />
        <Feedback product={feedbackProduct} setProduct={setFeedbackProduct} />
        <Dashboard />
        <Support />
      </main>
      <Footer />
    </>
  )
}

function ConfigBanner() {
  return (
    <div className="sticky top-0 z-[55] bg-amber-500/15 px-4 py-2 text-center text-xs text-amber-200 backdrop-blur">
      Nhost isn&rsquo;t configured yet. Add your project details to{' '}
      <code className="font-mono">.env</code> (see <code className="font-mono">SETUP-NHOST.md</code>)
      so ideas and feedback can load.
    </div>
  )
}
