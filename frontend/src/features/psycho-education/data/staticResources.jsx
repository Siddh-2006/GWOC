import React from 'react';
import { Brain, Target, Shield, HelpCircle, Zap, Compass, Moon, GraduationCap, Coffee, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const STATIC_RESOURCES = {
  // START HERE SECTION
  "what-is-mental-health": {
    title: "What Is Mental Health?",
    subtitle: "Dispelling complexity and understanding balance.",
    icon: <Brain />,
    color: "bg-purple-50 text-primary",
    hubSection: "start-here",
    content: (
      <>
        <p className="lead font-medium text-xl text-gray-700 mb-8">Mental health is not just the absence of mental illness. It is a state of well-being in which an individual realizes their own abilities, can cope with the normal stresses of life, and is able to make a contribution to their community.</p>

        <div className="bg-purple-50/50 rounded-3xl p-8 border-l-4 border-purple-400 mb-10">
          <h4 className="flex items-center gap-2 text-primary font-bold mb-4">
            <Sparkles size={20} /> The Spectrum Concept
          </h4>
          <p className="text-primary/80 m-0">We often think of mental health as binary: you are either "healthy" or "sick". In reality, it's a dynamic spectrum that changes daily based on our biology, environment, and life events.</p>
        </div>

        <h3 className="text-2xl font-bold mb-4">The 4 Stages of the Spectrum</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {[
            { label: "Thriving", desc: "Stable, calm, and functioning at optimal potential." },
            { label: "Surviving", desc: "Coping adequately but feeling the weight of persistent stress." },
            { label: "Struggling", desc: "Daily tasks feel heavy; mood and sleep are noticeably affected." },
            { label: "Crisis", desc: "Persistent distress or inability to function. Immediate support is vital." }
          ].map((item, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
              <span className="block font-bold text-primary mb-1">{item.label}</span>
              <span className="text-gray-500 text-sm leading-relaxed">{item.desc}</span>
            </div>
          ))}
        </div>

        <h3 className="text-2xl font-bold mb-4">Why MindSettler Exists</h3>
        <p>MindSettler views mental health issues not as signs of weakness, but as signs of being human in a complex world. We are here to help you navigate the spectrum, move back toward 'Thriving', and build the resilience to stay there.</p>
      </>
    )
  },
  "myths-vs-facts": {
    title: "Mental Health: Myths vs Facts",
    subtitle: "Separating truth from common misconceptions.",
    icon: <Target />,
    color: "bg-pink-50 text-secondary",
    hubSection: "start-here",
    content: (
      <>
        <p className="lead">Misinformation can stop people from getting the help they need. Let's clear the air by looking at the hard data and human reality.</p>

        <div className="my-8 space-y-8">
          <div className="group relative p-8 bg-pink-50/30 rounded-3xl border border-pink-100/50 transition-all hover:bg-pink-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-secondary font-bold flex-shrink-0">M</div>
              <h4 className="text-xl font-bold text-primary pt-0.5">"Mental health issues are permanently life-altering and rare."</h4>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-primary font-bold flex-shrink-0">F</div>
              <p className="text-gray-700 m-0"><strong>Mental health issues are incredibly common and manageable.</strong> 1 in 4 people globally will be affected by mental or neurological disorders at some point in their lives.</p>
            </div>
          </div>

          <div className="group relative p-8 bg-pink-50/30 rounded-3xl border border-pink-100/50 transition-all hover:bg-pink-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-secondary font-bold flex-shrink-0">M</div>
              <h4 className="text-xl font-bold text-primary pt-0.5">"Therapy is only for people who are 'broken' or in crisis."</h4>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-primary font-bold flex-shrink-0">F</div>
              <p className="text-gray-700 m-0"><strong>Therapy is mental maintenance.</strong> Just like you visit the gym to stay physically fit, therapy helps you build emotional muscle, process complexity, and prevent small issues from becoming crises.</p>
            </div>
          </div>

          <div className="group relative p-8 bg-pink-50/30 rounded-3xl border border-pink-100/50 transition-all hover:bg-pink-50">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-secondary font-bold flex-shrink-0">M</div>
              <h4 className="text-xl font-bold text-primary pt-0.5">"If I'm strong enough, I can handle it on my own."</h4>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-primary font-bold flex-shrink-0">F</div>
              <p className="text-gray-700 m-0"><strong>Hyper-independence is often a survival mechanism, not strength.</strong> True resilience is knowing when to ask for a professional's perspective to navigate a path you haven't walked before.</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl flex items-center gap-4 text-gray-500 italic">
          <AlertCircle size={20} className="flex-shrink-0" />
          <p className="m-0 text-sm">Knowledge is the first step toward breaking stigma. Share these facts with someone today.</p>
        </div>
      </>
    )
  },
  "when-to-seek-support": {
    title: "When Should You Seek Support?",
    subtitle: "Learning to listen to what your mind needs.",
    icon: <HelpCircle />,
    color: "bg-purple-50 text-purple-500",
    hubSection: "start-here",
    content: (
      <>
        <p className="lead">Knowing when to seek help is a vital skill. It's about self-awareness—not failure. Use the following guide to gauge your current needs.</p>

        <h3 className="text-2xl font-bold mb-6">Physical & Emotional Yellow Flags</h3>
        <p className="text-gray-600 mb-4 italic text-sm">If these persist for more than two weeks, consider booking an initial consultation:</p>

        <div className="space-y-4 mb-10">
          {[
            { title: "Sleep Changes", desc: "Difficulty falling asleep, staying asleep, or sleeping significantly more than usual." },
            { title: "Relational Pullback", desc: "Avoiding friends, family, or social events you usually enjoy." },
            { title: "Physical Symptoms", desc: "Unexplained headaches, digestive issues, or constant fatigue." },
            { title: "Emotional Volatility", desc: "Feeling unusually irritable, hopeless, or numb." },
            { title: "Coping Mechanisms", desc: "Increased reliance on alcohol, substances, or doom-scrolling to 'numb out'." }
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-purple-100 hover:border-purple-300 transition-colors">
              <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
              <div>
                <strong className="block text-purple-900">{item.title}</strong>
                <span className="text-gray-500 text-sm leading-relaxed">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100">
          <h4 className="font-bold text-amber-900 mb-2">A Note on Prevention</h4>
          <p className="text-amber-800/80 m-0">At MindSettler, we believe in <strong>preventative therapy</strong>. You don't need a diagnosis or a crisis to talk to a therapist. Talking through life transitions, relationship dynamics, or career stress early can prevent burnout before it happens.</p>
        </div>
      </>
    )
  },

  // COMMON STRUGGLES
  "stress-burnout": {
    title: "Stress & Burnout",
    subtitle: "The journey from overwhelmed to restored.",
    icon: <Zap />,
    color: "bg-purple-50 text-primary",
    content: (
      <>
        <p className="lead">Stress is a biological response to perceived demands. Burnout occurs when those demands exceed your resources for a prolonged period.</p>

        <h3 className="text-2xl font-bold mb-6">The 5 Stages of Burnout</h3>
        <div className="space-y-6 mb-12">
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-50 text-primary flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="font-bold text-lg mb-1">The Honeymoon Phase</h4>
              <p className="text-gray-500">High energy, commitment, and creativity—often ignoring initial fatigue signals.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 text-primary flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Onstart of Stress</h4>
              <p className="text-gray-500">Common symptoms like irritability, lack of focus, and sleep disruption begin.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-200 text-primary flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Chronic Stress</h4>
              <p className="text-gray-500">Persistent physical illness, missed deadlines, and social withdrawal.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-300 text-white flex items-center justify-center font-bold">4</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Burnout</h4>
              <p className="text-gray-500">Severe exhaustion, cynicism, and feeling that effort is meaningless.</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary text-white flex items-center justify-center font-bold">5</div>
            <div>
              <h4 className="font-bold text-lg mb-1">Habitual Burnout</h4>
              <p className="text-gray-500">The state of physical and mental exhaustion is embedded in your daily life.</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-900 rounded-[2.5rem] text-white">
          <h4 className="font-bold text-amber-400 mb-4">Immediate Action: The 3-M Rule</h4>
          <ul className="space-y-4 text-white/80 list-none p-0">
            <li><strong>Micro:</strong> Take a 5-minute breather every 90 minutes.</li>
            <li><strong>Meso:</strong> Schedule one 'work-free' evening per week.</li>
            <li><strong>Macro:</strong> Plan a full day of complete digital and work disconnection once a month.</li>
          </ul>
        </div>
      </>
    )
  },
  "anxiety": {
    title: "Anxiety & Constant Worry",
    subtitle: "Understanding the cycle and finding ground.",
    icon: <Compass />,
    color: "bg-pink-50 text-secondary",
    hubSection: "struggles",
    content: (
      <>
        <p className="lead italic text-indigo-900/60 font-light mb-10">"Anxiety is like a rocking chair; it gives you something to do but never gets you anywhere."</p>

        <h3 className="text-2xl font-bold mb-6">The Anxiety Loop</h3>
        <p className="mb-6 text-gray-700">Anxiety thrives on a specific cycle that reinforces fear. Breaking the loop requires awareness of these four steps:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
            <h4 className="font-bold text-secondary mb-2">1. The Trigger</h4>
            <p className="text-sm text-secondary/70 leading-relaxed">An event, thought, or physical sensation that signals 'danger' to your brain.</p>
          </div>
          <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
            <h4 className="font-bold text-secondary mb-2">2. The Misappraisal</h4>
            <p className="text-sm text-secondary/70 leading-relaxed">Predicting the worst-case scenario (catastrophizing) even without evidence.</p>
          </div>
          <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
            <h4 className="font-bold text-secondary mb-2">3. The Feeling</h4>
            <p className="text-sm text-secondary/70 leading-relaxed">Rapid heartbeat, shallow breathing, stomach knots, or racing thoughts.</p>
          </div>
          <div className="p-6 bg-pink-50/50 rounded-2xl border border-pink-100">
            <h4 className="font-bold text-secondary mb-2">4. The Avoidance</h4>
            <p className="text-sm text-secondary/70 leading-relaxed">Staying away from the trigger, which provides temporary relief but validates the fear.</p>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-4">How MindSettler Helps</h3>
        <p>We use Cognitive Behavioral Therapy (CBT) and Exposure Response Prevention (ERP) components to help you safely confront the loop, challenge the misappraisal, and build tolerance for uncertainty.</p>
      </>
    )
  },
  "low-mood": {
    title: "Low Mood & Depression",
    subtitle: "Navigating the heaviness and regaining spark.",
    icon: <Moon />,
    color: "bg-purple-50 text-primary",
    hubSection: "struggles",
    content: (
      <>
        <p className="lead">Depression can feel like looking at the world through a fogged-up window. It is more than sadness; it is a persistent drop in vitality.</p>

        <h3 className="text-2xl font-bold mb-6">Cognitive Distortions in Low Mood</h3>
        <p className="text-gray-600 mb-6">Depression often 'lies' to us by twisting our thoughts through these common lenses:</p>
        <ul className="space-y-4 mb-10">
          <li><strong>All-or-Nothing Thinking:</strong> "If I'm not perfect, I'm a failure."</li>
          <li><strong>Mental Filtering:</strong> Focusing only on negative events while ignoring positive ones.</li>
          <li><strong>Personalization:</strong> Blaming yourself for things entirely out of your control.</li>
        </ul>

        <div className="bg-lavender p-8 rounded-3xl border border-purple-100">
          <h4 className="font-bold text-primary mb-4 flex items-center gap-2 underline underline-offset-4 decoration-purple-200">
            Small Win Strategy: Behavioral Activation
          </h4>
          <p className="text-primary/80 mb-6">One effective tool for low mood is to 'act before you feel'. Do not wait for motivation to strike. Start with tasks so small they feel un-failable:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white/60 rounded-xl text-center font-bold text-primary text-sm">Drink a glass of water</div>
            <div className="p-3 bg-white/60 rounded-xl text-center font-bold text-primary text-sm">Sit in sunlight (5 mins)</div>
            <div className="p-3 bg-white/60 rounded-xl text-center font-bold text-primary text-sm">Text one friend</div>
          </div>
        </div>
      </>
    )
  },

  // TOOLS
  "stress-management": {
    title: "TIPP Skills for Distress",
    subtitle: "Rapid emotional regulation tools.",
    icon: <CheckCircle2 />,
    color: "bg-purple-50 text-primary",
    hubSection: "tools",
    content: (
      <>
        <p className="lead">TIPP is a set of skills from Dialectical Behavior Therapy (DBT) designed to quickly lower your physical arousal when emotions are high.</p>

        <div className="space-y-8 my-10">
          <div className="flex gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center font-bold text-2xl text-primary flex-shrink-0">T</div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-primary">Temperature</h4>
              <p className="text-gray-600">Splash cold water on your face or hold an ice cube. This activates the 'mammalian dive reflex', which naturally slows your heart rate.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center font-bold text-2xl text-primary flex-shrink-0">I</div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-primary">Intense Exercise</h4>
              <p className="text-gray-600">Give your body a way to expel built-up energy. Do jumping jacks, run in place, or push against a wall for 60 seconds.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center font-bold text-2xl text-primary flex-shrink-0">P</div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-primary">Paced Breathing</h4>
              <p className="text-gray-600">Inhale for 4 counts, exhale for 6 or 8. Longer exhalations signal your nervous system to 'rest and digest'.</p>
            </div>
          </div>
          <div className="flex gap-6 items-start">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 flex items-center justify-center font-bold text-2xl text-primary flex-shrink-0">P</div>
            <div>
              <h4 className="font-bold text-xl mb-2 text-primary">Paired Muscle Relaxation</h4>
              <p className="text-gray-600">Tense a muscle group as hard as you can for 5 seconds, then release it completely. Feel the tension leaving your body.</p>
            </div>
          </div>
        </div>
      </>
    )
  },
  "boundaries": {
    title: "Healthy Boundaries",
    subtitle: "The art of protecting your peace.",
    icon: <CheckCircle2 />,
    color: "bg-pink-50 text-secondary",
    hubSection: "tools",
    content: (
      <>
        <p className="lead">Boundaries are the 'property lines' of your self-esteem. They define where you end and others begin.</p>

        <h3 className="text-2xl font-bold mb-6">Boundary Scripts</h3>
        <p className="text-gray-500 mb-6">Sometimes we know we need a boundary but don't know the words. Try these gentle but firm scripts:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm italic text-gray-700">
            "I'd love to help, but I don't have the capacity for more commitments this week."
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm italic text-gray-700">
            "I value our friendship, but I'm not comfortable discussing this specific topic right now."
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm italic text-gray-700">
            "If you continue to speak to me in that tone, I will need to step away from this conversation."
          </div>
          <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm italic text-gray-700">
            "I need some quiet time to recharge. I'll get back to you in a few hours."
          </div>
        </div>

        <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100">
          <p className="m-0 text-secondary text-sm font-medium italic">Reminder: Boundaries are not walls to keep people out; they are gates to let yourself in.</p>
        </div>
      </>
    )
  },
  // Default placeholders for others until expanded
  "self-care-vs-therapy": {
    title: "Self-Care vs Therapy",
    subtitle: "Daily maintenance vs professional repair.",
    icon: <Shield />,
    color: "bg-pink-50 text-pink-500",
    hubSection: "start-here",
    content: (
      <>
        <p className="lead">Understanding the difference between self-care and therapy is crucial for effective mental wellness. While both are essential, they serve different purposes in your journey.</p>

        <h3 className="text-2xl font-bold mb-6">The Comparison Table</h3>
        <div className="overflow-x-auto mb-10">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-pink-100">
                <th className="py-4 font-bold text-pink-900">Feature</th>
                <th className="py-4 font-bold text-pink-900">Self-Care</th>
                <th className="py-4 font-bold text-pink-900">Therapy</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-pink-50">
                <td className="py-4 font-bold">Goal</td>
                <td className="py-4">Maintenance & Preservation</td>
                <td className="py-4">Healing & Transformation</td>
              </tr>
              <tr className="border-b border-pink-50">
                <td className="py-4 font-bold">Nature</td>
                <td className="py-4">Solo or social activities</td>
                <td className="py-4">Professional relationship</td>
              </tr>
              <tr className="border-b border-pink-50">
                <td className="py-4 font-bold">Focus</td>
                <td className="py-4">Managing daily stress</td>
                <td className="py-4">Resolving deep-seated patterns</td>
              </tr>
              <tr>
                <td className="py-4 font-bold">Outcome</td>
                <td className="py-4">Short-term relief</td>
                <td className="py-4">Long-term structural change</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-pink-50/50 rounded-3xl p-8 border-l-4 border-pink-400 mb-10">
          <h4 className="flex items-center gap-2 text-pink-800 font-bold mb-4">
            <AlertCircle size={20} /> When Self-Care Isn't Enough
          </h4>
          <p className="text-pink-900/80 m-0">If you find that your usual self-care routines (exercise, meditation, social time) are no longer providing relief, or if you feel like you're "running on empty" despite them, it's a strong signal that professional support (therapy) is needed to address the underlying causes.</p>
        </div>

        <p>Therapy provides the tools and safe space to explore the <em>why</em> behind your feelings, while self-care provides the <em>how</em> for daily resilience.</p>
      </>
    )
  },
  "performance-pressure": {
    title: "Performance Pressure",
    subtitle: "Overcoming the fear of failure.",
    icon: <GraduationCap />,
    color: "bg-purple-50 text-primary",
    hubSection: "struggles",
    content: (
      <>
        <p className="lead">In a world obsessed with achievement, performance pressure can become a paralyzing force. It often stems from an "Internalized Excellence" that ties our self-worth to our output.</p>

        <h3 className="text-2xl font-bold mb-6">The Anatomy of Perfectionism</h3>
        <p className="mb-6">Perfectionism isn't about high standards; it's about <strong>fear of judgment</strong>. It often manifests in three ways:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <span className="block font-bold text-primary mb-2">Procrastination</span>
            <span className="text-gray-500 text-sm leading-relaxed">Delaying tasks because the fear of not doing them perfectly is overwhelming.</span>
          </div>
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <span className="block font-bold text-primary mb-2">Over-Working</span>
            <span className="text-gray-500 text-sm leading-relaxed">Spending excessive time on minor details to avoid any possibility of error.</span>
          </div>
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100">
            <span className="block font-bold text-primary mb-2">Self-Criticism</span>
            <span className="text-gray-500 text-sm leading-relaxed">A harsh internal voice that minimizes achievements and magnifies mistakes.</span>
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white mb-10">
          <h4 className="font-bold text-accent mb-4">Strategy: The "Good Enough" Rule</h4>
          <p className="text-white/80 mb-6">Purposefully aim for 80% completion in a non-critical task. Notice the anxiety it causes, and observe that the world doesn't end. This helps re-calibrate your "threat" system.</p>
          <ul className="space-y-4 text-white/70 list-none p-0 text-sm">
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-accent flex-shrink-0" /> Define "Done" before you start.</li>
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-accent flex-shrink-0" /> Set strict time-boxes for tasks.</li>
            <li className="flex gap-3"><CheckCircle2 size={16} className="text-accent flex-shrink-0" /> Celebrate "Micro-Completions."</li>
          </ul>
        </div>
      </>
    )
  },
  "sleep-issues": {
    title: "Sleep Difficulties",
    subtitle: "Practical steps for better rest.",
    icon: <Coffee />,
    color: "bg-pink-50 text-secondary",
    hubSection: "struggles",
    content: (
      <>
        <p className="lead">Sleep is the foundation of mental health. When we sleep, our brain processes emotions, clears out toxins, and consolidates memories. Poor sleep isn't just a symptom of stress—it's a major contributor to it.</p>

        <h3 className="text-2xl font-bold mb-6">The WIND-DOWN Routine</h3>
        <p className="mb-6">Preparing for sleep should start 60-90 minutes before you intend to be asleep. Try this structured approach:</p>
        <div className="space-y-4 mb-10">
          {[
            { step: "1. Digital Sunset", desc: "Turn off screens or use heavy blue-light filters. The light suppresses melatonin production." },
            { step: "2. Temperature Drop", desc: "A cool room (around 18°C) is optimal for deep sleep as your core body temperature needs to drop." },
            { step: "3. Brain Dump", desc: "Write down any lingering 'to-dos' or worries to park them outside your head for the night." },
            { step: "4. Sensory Soothe", desc: "Dim the lights, listen to calm music, or take a warm shower." }
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex gap-4 items-start">
              <div className="font-bold text-secondary whitespace-nowrap">{item.step}</div>
              <div className="text-gray-600 text-sm">{item.desc}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white">
          <h4 className="font-bold text-secondary-light mb-4">The 15-Minute Rule</h4>
          <p className="text-white/80 m-0">If you've been lying in bed awake for more than 15-20 minutes, <strong>get out of bed</strong>. Go to another room, do a quiet activity in dim light (like reading a physical book), and only return when you feel truly sleepy. This prevents your brain from associating your bed with wakefulness and anxiety.</p>
        </div>
      </>
    )
  },
  "emotional-regulation": {
    title: "Emotional Regulation",
    subtitle: "Naming it to tame it.",
    icon: <CheckCircle2 />,
    color: "bg-pink-50 text-secondary",
    hubSection: "tools",
    content: (
      <>
        <p className="lead">Emotional regulation is the ability to monitor and manage your emotional state. It's not about <em>stopping</em> emotions, but about not being <em>overwhelmed</em> by them.</p>

        <h3 className="text-2xl font-bold mb-6">The "Stop-Think-Act" Framework</h3>
        <p className="mb-8">When a strong emotion hits, try to create space between the <strong>Trigger</strong> and your <strong>Response</strong>.</p>

        <div className="relative border-l-2 border-purple-200 ml-4 pl-10 space-y-12 mb-12">
          <div className="relative">
            <div className="absolute -left-[3.25rem] top-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">1</div>
            <h4 className="font-bold text-primary mb-2">STOP</h4>
            <p className="text-gray-600">Literally pause. Take one deep breath. Recognize that an emotion is present.</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[3.25rem] top-0 w-8 h-8 rounded-full bg-purple-400 text-white flex items-center justify-center font-bold">2</div>
            <h4 className="font-bold text-primary mb-2">THINK</h4>
            <p className="text-gray-600">Label the emotion: "I am feeling frustrated." Evaluate the facts: "Is this feeling based on the current reality?"</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[3.25rem] top-0 w-8 h-8 rounded-full bg-purple-200 text-primary flex items-center justify-center font-bold">3</div>
            <h4 className="font-bold text-primary mb-2">ACT</h4>
            <p className="text-gray-600">Choose a response that aligns with your values, rather than reacting on impulse.</p>
          </div>
        </div>

        <div className="bg-purple-50 p-8 rounded-3xl">
          <p className="m-0 text-primary italic leading-relaxed">"Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom." — Viktor Frankl</p>
        </div>
      </>
    )
  },
  "grounding": {
    title: "Mindfulness & Grounding",
    subtitle: "Coming back to the present.",
    icon: <CheckCircle2 />,
    color: "bg-pink-50 text-secondary",
    hubSection: "tools",
    content: (
      <>
        <p className="lead">Grounding techniques are tools that help 'detach' you from emotional pain or spiraling thoughts by refocusing your attention on the present moment and your physical environment.</p>

        <h3 className="text-2xl font-bold mb-6">The 5-4-3-2-1 Sensory Guide</h3>
        <p className="mb-6">When you feel a panic attack coming on or your thoughts are racing, slowly work through your senses:</p>

        <div className="grid grid-cols-1 gap-3 mb-10">
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <span className="text-3xl font-bold text-gray-200">5</span>
            <span className="text-gray-700 font-medium">Things you can <strong>SEE</strong> around you (e.g., a clock, a plant, a shadow).</span>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <span className="text-3xl font-bold text-gray-200">4</span>
            <span className="text-gray-700 font-medium">Things you can <strong>TOUCH</strong> (e.g., your clothes, a table, your hair).</span>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <span className="text-3xl font-bold text-gray-200">3</span>
            <span className="text-gray-700 font-medium">Things you can <strong>HEAR</strong> (e.g., traffic, a fan, your own breath).</span>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <span className="text-3xl font-bold text-gray-200">2</span>
            <span className="text-gray-700 font-medium">Things you can <strong>SMELL</strong> (e.g., coffee, air, laundry soap).</span>
          </div>
          <div className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <span className="text-3xl font-bold text-gray-200">1</span>
            <span className="text-gray-700 font-medium">Thing you can <strong>TASTE</strong> (e.g., mint, water, or just the inside of your mouth).</span>
          </div>
        </div>

        <p>Grounding is not about making the feeling go away—it's about making it <strong>survivable</strong> until the intensity naturally decreases.</p>
      </>
    )
  },
  "confidence": {
    title: "Building Confidence",
    subtitle: "Trusting your own ability.",
    icon: <CheckCircle2 />,
    color: "bg-pink-50 text-secondary",
    hubSection: "tools",
    content: (
      <>
        <p className="lead">Confidence isn't the absence of fear; it's the belief that you can handle the outcome regardless of the fear. It is built through small, consistent actions rather than sudden epiphanies.</p>

        <h3 className="text-2xl font-bold mb-6">The Competence-Confidence Loop</h3>
        <p className="mb-8">Most people wait to <em>feel</em> confident before they act. However, the loop actually works in reverse:</p>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 p-6 bg-purple-50 rounded-2xl text-center">
            <div className="text-primary font-bold mb-2">1. Action</div>
            <p className="text-xs text-primary/70">Take a small, uncomfortable step.</p>
          </div>
          <div className="hidden md:flex items-center text-purple-200">→</div>
          <div className="flex-1 p-6 bg-purple-100 rounded-2xl text-center">
            <div className="text-primary font-bold mb-2">2. Competence</div>
            <p className="text-xs text-primary/70">Gain skill or evidence you can do it.</p>
          </div>
          <div className="hidden md:flex items-center text-purple-200">→</div>
          <div className="flex-1 p-6 bg-purple-200 rounded-2xl text-center">
            <div className="text-primary font-bold mb-2">3. Confidence</div>
            <p className="text-xs text-primary/70">The feeling of belief follows the proof.</p>
          </div>
        </div>

        <div className="bg-pink-50 p-8 rounded-3xl border-l-4 border-pink-400">
          <h4 className="font-bold text-secondary mb-2">Internal Validation vs External Praise</h4>
          <p className="text-secondary/80 m-0">True confidence is quiet. It doesn't require constant external validation because it is rooted in your own recognition of your efforts and values.</p>
        </div>
      </>
    )
  }
};
