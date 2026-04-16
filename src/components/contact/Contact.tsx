import { useRef, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Github, Linkedin, Twitter } from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  message: string
}

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
]

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const onSubmit = async (_data: ContactFormData) => {
    setStatus('sending')
    try {
      // TODO: integrate with Resend or email API
      await new Promise((r) => setTimeout(r, 1500))
      setStatus('sent')
      reset()
      setTimeout(() => setStatus('idle'), 4000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 4000)
    }
  }

  return (
    <>
      <section ref={sectionRef} id="contact" className="section-padding scroll-mt-20 px-6">
        <div className="mx-auto max-w-[1280px]">
          <p className={`reveal type-label-accent mb-12 ${visible ? 'visible' : ''}`}>Contact</p>

          <div className="grid gap-16 md:grid-cols-[1fr_1fr] lg:gap-24">
            {/* Left column — CTA headline + email + socials */}
            <div className={`reveal ${visible ? 'visible' : ''}`} style={{ transitionDelay: '0.1s' }}>
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-text-primary">
                Let's work<br />together.
              </h2>
              <p className="mt-5 max-w-sm font-body text-[clamp(0.9rem,1vw,1.05rem)] font-light leading-relaxed text-text-secondary">
                Have a project in mind? Fill out the form or reach me directly.
              </p>

              <div className="mt-8">
                <p className="type-label mb-2">Email</p>
                <a
                  href="mailto:hello@example.com"
                  className="font-body text-[clamp(0.9rem,1.2vw,1.1rem)] font-medium text-accent transition-opacity hover:opacity-70"
                >
                  hello@example.com
                </a>
              </div>

              <div className="mt-8 flex items-center gap-5">
                {socialLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-text-muted transition-colors hover:text-accent"
                      aria-label={link.label}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Right column — contact form */}
            <div
              className={`reveal ${visible ? 'visible' : ''}`}
              style={{ transitionDelay: '0.2s' }}
            >
              {status === 'sent' ? (
                <div className="flex h-full flex-col justify-center">
                  <p className="type-label-accent mb-3">Message received.</p>
                  <p className="type-body">I'll be in touch soon.</p>
                </div>
              ) : status === 'error' ? (
                <div className="flex h-full flex-col justify-center">
                  <p className="mb-3 font-body text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-red-400">Something went wrong.</p>
                  <p className="type-body">Please try again or email me directly.</p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-4 cursor-pointer font-body text-sm uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-70"
                  >
                    Try Again <span aria-hidden="true">→</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  <div>
                    <label htmlFor="contact-name" className="field-label">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Your name"
                      className={`field-input ${errors.name ? 'field-error' : ''}`}
                      {...register('name', { required: 'Name is required' })}
                    />
                    {errors.name && <p className="field-error-msg">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="field-label">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      className={`field-input ${errors.email ? 'field-error' : ''}`}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Invalid email',
                        },
                      })}
                    />
                    {errors.email && <p className="field-error-msg">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="field-label">Message</label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      placeholder="Tell me about your project..."
                      className={`field-input resize-none ${errors.message ? 'field-error' : ''}`}
                      {...register('message', { required: 'Message is required' })}
                    />
                    {errors.message && <p className="field-error-msg">{errors.message.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex cursor-pointer items-center gap-2 font-body text-sm uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === 'sending' ? 'Sending...' : 'Send Message'}
                    {status !== 'sending' && <span aria-hidden="true">→</span>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer / copyright */}
      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="font-body text-[0.6875rem] tracking-wide text-text-muted">
          &copy; {new Date().getFullYear()} Denis
        </p>
      </footer>
    </>
  )
}
