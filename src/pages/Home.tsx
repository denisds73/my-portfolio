import Hero from '@/components/hero/Hero'
import About from '@/components/about/About'
import WorkSection from '@/components/work/WorkSection'
import SkillsMarquee from '@/components/skills/SkillsMarquee'
import ExperienceList from '@/components/experience/ExperienceList'
import Contact from '@/components/contact/Contact'

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <WorkSection />
      <SkillsMarquee />
      <ExperienceList />
      <Contact />
    </>
  )
}
