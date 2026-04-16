import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Section } from '@/components/layout'
import { SectionHeading, Button, Input, Textarea } from '@/components/ui'

interface ContactFormData {
  name: string
  email: string
  message: string
}

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>()

  const onSubmit = async (_data: ContactFormData) => {
    setStatus('sending')
    // TODO: integrate with Resend or email API
    await new Promise((r) => setTimeout(r, 1500))
    setStatus('sent')
    reset()
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <Section id="contact">
      <SectionHeading
        label="// contact"
        title="Let's Work Together"
        description="Have a project in mind? I'd love to hear about it."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Name"
            placeholder="Your name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="your@email.com"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email',
              },
            })}
            error={errors.email?.message}
          />
          <Textarea
            label="Message"
            placeholder="Tell me about your project..."
            rows={5}
            {...register('message', { required: 'Message is required' })}
            error={errors.message?.message}
          />

          <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
            {status === 'sending' ? (
              'Sending...'
            ) : status === 'sent' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Sent Successfully!
              </>
            ) : status === 'error' ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Failed — Try Again
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </Section>
  )
}
