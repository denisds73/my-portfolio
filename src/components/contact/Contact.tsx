import { useReducedMotion, motion, AnimatePresence } from 'framer-motion'
import type { Variants } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Github, Linkedin, Send, CheckCircle, AlertCircle } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(1, 'Your name helps me address you properly.').max(120, 'Keep it under 120 characters.'),
  email: z.string().min(1, "I'll need an email to reply to.").email("That email doesn't look right."),
  subject: z.string().max(200, 'Keep subjects under 200 characters.').optional(),
  message: z.string().min(10, 'A couple of sentences, please.').max(5000, 'Keep it under 5,000 characters.'),
  company: z.string().optional(), // honeypot
})

type ContactFormData = z.infer<typeof contactSchema>

const EMAIL = 'flaviodenis2003@gmail.com'

function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
    </svg>
  )
}

const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/denisds73', icon: Github },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/flavio-denis/', icon: Linkedin },
  { label: 'LeetCode', href: 'https://leetcode.com/u/flaviodenis/', icon: LeetCodeIcon },
]

export default function Contact() {
  const prefersReducedMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    clearErrors('root')
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
        const { error } = (await res.json().catch(() => ({ error: null }))) as { error?: string }
        throw new Error(error ?? `Request failed (${res.status})`)
      }
    } catch (e) {
      setError('root', {
        type: 'server',
        message: e instanceof Error ? e.message : 'Something went wrong. Please try again.',
      })
      throw e // rethrow so react-hook-form knows it failed
    }
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: prefersReducedMotion ? 0 : 0.1, delayChildren: prefersReducedMotion ? 0 : 0.1 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
  }

  return (
    <>
      <section id="contact" className="section-padding scroll-mt-20 px-6">
        <div className="mx-auto max-w-[1280px]">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            <motion.p variants={itemVariants} className="type-label mb-12 text-accent">
              Contact
            </motion.p>

            <div className="grid gap-16 md:grid-cols-[1fr_1fr] lg:gap-24">
              {/* Left — CTA + email + socials */}
              <motion.div variants={itemVariants}>
                <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-text-primary">
                  Let's build<br />something good.
                </h2>
                <p className="type-body mt-5 max-w-md">
                  Whether you're a recruiter sizing up a candidate, a hiring manager evaluating fit, or a collaborator with an idea — send a note. I read every message.
                </p>

                <div className="mt-8">
                  <p className="field-label mb-2">Email</p>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="text-lg font-medium text-accent transition-opacity hover:opacity-70 break-all"
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
              </motion.div>

              {/* Right — form */}
              <motion.div variants={itemVariants} className="relative min-h-[400px]">
                <AnimatePresence mode="wait">
                  {isSubmitSuccessful ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="flex h-full flex-col justify-center"
                      aria-live="polite"
                      role="status"
                    >
                      <p className="font-mono text-sm font-semibold uppercase tracking-widest text-accent mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> Message received.
                      </p>
                      <p className="type-body">
                        Thanks for reaching out — I'll be in touch within a couple of days.
                      </p>
                      <button
                        type="button"
                        onClick={() => reset()}
                        className="mt-6 w-fit cursor-pointer font-body text-sm uppercase tracking-[0.08em] text-accent transition-opacity hover:opacity-70 flex items-center gap-2 group"
                      >
                        Send another <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      onSubmit={handleSubmit(onSubmit)}
                      className="space-y-8 relative"
                    >
                      {/* Honeypot */}
                      <input
                        type="text"
                        autoComplete="off"
                        tabIndex={-1}
                        aria-hidden="true"
                        className="absolute left-[-9999px] h-0 w-0 opacity-0"
                        {...register('company')}
                      />

                      <div className="relative">
                        <label htmlFor="contact-name" className="field-label">Name</label>
                        <input
                          id="contact-name"
                          type="text"
                          autoComplete="name"
                          placeholder="Your name"
                          className={`field-input ${errors.name ? 'field-error' : ''}`}
                          aria-invalid={errors.name ? 'true' : 'false'}
                          aria-describedby={errors.name ? 'name-error' : undefined}
                          {...register('name')}
                        />
                        <AnimatePresence>
                          {errors.name && (
                            <motion.p id="name-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="field-error-msg flex items-center gap-1 mt-2">
                              <AlertCircle className="h-3.5 w-3.5" /> {errors.name.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="relative">
                        <label htmlFor="contact-email" className="field-label">Email</label>
                        <input
                          id="contact-email"
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          className={`field-input ${errors.email ? 'field-error' : ''}`}
                          aria-invalid={errors.email ? 'true' : 'false'}
                          aria-describedby={errors.email ? 'email-error' : undefined}
                          {...register('email')}
                        />
                        <AnimatePresence>
                          {errors.email && (
                            <motion.p id="email-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="field-error-msg flex items-center gap-1 mt-2">
                              <AlertCircle className="h-3.5 w-3.5" /> {errors.email.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="relative">
                        <label htmlFor="contact-subject" className="field-label">Subject <span className="text-text-muted">(optional)</span></label>
                        <input
                          id="contact-subject"
                          type="text"
                          autoComplete="off"
                          placeholder="Frontend engineer role · open-source collab · etc."
                          className={`field-input ${errors.subject ? 'field-error' : ''}`}
                          aria-invalid={errors.subject ? 'true' : 'false'}
                          aria-describedby={errors.subject ? 'subject-error' : undefined}
                          {...register('subject')}
                        />
                        <AnimatePresence>
                          {errors.subject && (
                            <motion.p id="subject-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="field-error-msg flex items-center gap-1 mt-2">
                              <AlertCircle className="h-3.5 w-3.5" /> {errors.subject.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="relative">
                        <label htmlFor="contact-message" className="field-label">Message</label>
                        <textarea
                          id="contact-message"
                          rows={4}
                          placeholder="A few lines about the role, team, project, or question — whatever context helps me write a useful reply."
                          className={`field-textarea ${errors.message ? 'field-error' : ''}`}
                          aria-invalid={errors.message ? 'true' : 'false'}
                          aria-describedby={errors.message ? 'message-error' : undefined}
                          {...register('message')}
                        />
                        <AnimatePresence>
                          {errors.message && (
                            <motion.p id="message-error" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="field-error-msg flex items-center gap-1 mt-2">
                              <AlertCircle className="h-3.5 w-3.5" /> {errors.message.message}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <AnimatePresence>
                        {errors.root && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            role="alert"
                            aria-live="assertive"
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-4"
                          >
                            <p className="font-body text-sm text-red-400">
                              Looks like the network glitched. You can try again, or{' '}
                              <a href={`mailto:${EMAIL}`} className="font-medium text-red-300 underline transition-colors hover:text-white">email me directly</a>.
                            </p>
                            <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wider text-red-500/60">
                              Error: {errors.root.message}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group inline-flex w-fit cursor-pointer items-center justify-center gap-3 rounded-full bg-accent px-8 py-4 font-body text-xs font-bold uppercase tracking-[0.12em] text-white shadow-[0_4px_24px_-8px_var(--color-accent)] transition-all hover:scale-[1.02] hover:opacity-90 hover:shadow-[0_8px_32px_-8px_var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send message
                            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                          </>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.div>
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
