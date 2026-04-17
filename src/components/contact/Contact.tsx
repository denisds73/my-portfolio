import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Github, Linkedin } from 'lucide-react'

interface ContactFormData {
  name: string
  email: string
  subject?: string
  message: string
  // Honeypot field — hidden from humans, bots fill it
  company?: string
}

const EMAIL = 'flaviodenis2003@gmail.com'

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
    </svg>
  )
}

const socialLinks: Array<{
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}> = [
  { label: 'GitHub', href: 'https://github.com/denisds73', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/flavio-denis/', icon: Linkedin },
  { label: 'LeetCode', href: 'https://leetcode.com/u/flaviodenis/', icon: LeetCodeIcon },
]

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const [visible, setVisible] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const sectionRef = useCallback((node: HTMLElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true)
      },
      { threshold: 0.1 },
    )
    observerRef.current.observe(node)
  }, [])

  useEffect(() => () => observerRef.current?.disconnect(), [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>()

  const onSubmit = async (data: ContactFormData) => {
    setStatus('sending')
    setErrorMsg(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          subject: data.subject ?? '',
          message: data.message,
          company: data.company ?? '', // honeypot
        }),
      })

      if (!res.ok) {
        const { error } = (await res.json().catch(() => ({ error: null }))) as {
          error?: string
        }
        throw new Error(error ?? `Request failed (${res.status})`)
      }

      setStatus('sent')
      reset()
    } catch (e) {
      setStatus('error')
      setErrorMsg(
        e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <>
      <section
        ref={sectionRef}
        id="contact"
        className="section-padding scroll-mt-20 px-6"
      >
        <div className="mx-auto max-w-[1280px]">
          <p className={`reveal type-label-accent mb-12 ${visible ? 'visible' : ''}`}>
            Contact
          </p>

          <div className="grid gap-16 md:grid-cols-[1fr_1fr] lg:gap-24">
            {/* Left — CTA + email + socials */}
            <div
              className={`reveal ${visible ? 'visible' : ''}`}
              style={{ transitionDelay: '0.1s' }}
            >
              <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-text-primary">
                Let's build<br />something good.
              </h2>
              <p className="mt-5 max-w-md font-body text-[clamp(0.9rem,1vw,1.05rem)] font-light leading-relaxed text-text-secondary">
                Whether you're a recruiter sizing up a candidate, a hiring
                manager evaluating fit, or a collaborator with an idea — send a
                note. I read every message.
              </p>

              <div className="mt-8">
                <p className="type-label mb-2">Email</p>
                <a
                  href={`mailto:${EMAIL}`}
                  className="break-all font-body text-[clamp(0.9rem,1.2vw,1.1rem)] font-medium text-accent transition-opacity hover:opacity-70"
                >
                  {EMAIL}
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

            {/* Right — form */}
            <div
              className={`reveal ${visible ? 'visible' : ''}`}
              style={{ transitionDelay: '0.2s' }}
            >
              {status === 'sent' ? (
                <div className="flex h-full flex-col justify-center">
                  <p className="type-label-accent mb-3">Message received.</p>
                  <p className="type-body">
                    Thanks for reaching out — I'll be in touch within a couple of
                    days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus('idle')}
                    className="mt-6 w-fit cursor-pointer font-body text-sm uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-70"
                  >
                    Send another <span aria-hidden="true">→</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  {/* Honeypot — visually hidden, off the tab order, off-screen */}
                  <input
                    type="text"
                    autoComplete="off"
                    tabIndex={-1}
                    aria-hidden="true"
                    className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    {...register('company')}
                  />

                  <div>
                    <label htmlFor="contact-name" className="field-label">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      className={`field-input ${errors.name ? 'field-error' : ''}`}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      {...register('name', {
                        required: 'Your name helps me address you properly.',
                        maxLength: { value: 120, message: 'Keep it under 120 characters.' },
                      })}
                    />
                    {errors.name && (
                      <p className="field-error-msg">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="field-label">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@company.com"
                      className={`field-input ${errors.email ? 'field-error' : ''}`}
                      aria-invalid={errors.email ? 'true' : 'false'}
                      {...register('email', {
                        required: "I'll need an email to reply to.",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'That email doesn\'t look right.',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="field-error-msg">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="field-label">
                      Subject <span className="text-text-muted">(optional)</span>
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      autoComplete="off"
                      placeholder="Frontend engineer role · open-source collab · etc."
                      className={`field-input ${errors.subject ? 'field-error' : ''}`}
                      {...register('subject', {
                        maxLength: { value: 200, message: 'Keep subjects under 200 characters.' },
                      })}
                    />
                    {errors.subject && (
                      <p className="field-error-msg">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="field-label">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      placeholder="A few lines about the role, team, project, or question — whatever context helps me write a useful reply."
                      className={`field-input resize-none ${errors.message ? 'field-error' : ''}`}
                      aria-invalid={errors.message ? 'true' : 'false'}
                      {...register('message', {
                        required: 'A short message helps me reply well.',
                        minLength: {
                          value: 10,
                          message: 'A couple of sentences, please.',
                        },
                        maxLength: {
                          value: 5000,
                          message: 'Keep it under 5,000 characters.',
                        },
                      })}
                    />
                    {errors.message && (
                      <p className="field-error-msg">{errors.message.message}</p>
                    )}
                  </div>

                  {status === 'error' && errorMsg && (
                    <p
                      role="alert"
                      className="font-body text-[0.8125rem] text-red-400"
                    >
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="inline-flex cursor-pointer items-center gap-2 font-body text-sm uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === 'sending' ? 'Sending…' : 'Send message'}
                    {status !== 'sending' && <span aria-hidden="true">→</span>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 text-center">
        <p className="font-body text-[0.6875rem] tracking-wide text-text-muted">
          &copy; {new Date().getFullYear()} Flavio Denis
        </p>
      </footer>
    </>
  )
}
