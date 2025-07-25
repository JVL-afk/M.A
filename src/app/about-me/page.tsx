import Link from 'next/link';
import Navbar from '../../components/Navbar';

export default function AboutMe() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-orange-700 to-black">
      <Navbar />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6">
              My Story
            </h1>
            <p className="text-2xl text-orange-200 mb-8">
              From a Romanian student to building AFFILIFY
            </p>
          </div>

          {/* Story Content */}
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-orange-500/20">
            <div className="prose prose-lg prose-invert max-w-none">
              
              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                Hi, I'm Andrew and I'm with nothing better than you. I'm from a small village in Romania and I am a student at the local school. About one year ago, I reached my peak: I had great friends, high grades, and I was seeing my crush on the side. Everything was going as planned.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                But then, in December 2024, something hit me. I realized that I don't just want to be that normal guy, I wanted something different. That one thought changed everything, my crush became just another girl and my friends became some annoying people. I knew I had to do something.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                Back then, I didn't know anything about how to make money online, but I knew that was the best way. I tried Dropshipping and it failed, I tried Copywriting and it failed, I tried making money through social media and that failed as well.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                By now it was New Year's and I was feeling a little bit depressed, I didn't have any friends to party with and no girl to kiss. On top of that, my ambition didn't lead to any result, and I made absolutely no money from it. I wanted to quit.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                At about 1 am I saw a post about an affiliate marketing website and how much it was making. It seemed like I hit gold. I started immediately, I signed up for an affiliate program and picked my product. Then I realized that I had no idea on how to make a website, so I started looking for alternatives, all the free programs gave out, and the ones I had to pay for didn't work out as well.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                I was back to depression. I had done nothing useful. I lost everything that took me years to get. ALL for NOTHING. Then I remembered all the nights in which I dreamed of succeeding, of proving everybody wrong. I wasn't gonna let that dream fade away.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                Ok I guess that by now you know that I'm joking. What actually happened was I tried to recover my old life and it didn't work out. So I sat back down on my chair and started thinking: What should I do? What should I do?...
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                Finally, after like a week, I came to this idea: I will make a tool that will give everybody a chance to start affiliate marketing. For that I needed to build a website, so I started studying, and studying, and studying some more.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                It was March, I finally learned how to write some code. I started writing, checking the list that I made every time to see if I made mistakes. I didn't add the AI yet, but I just wanted to see how the website would work. I started deploying-error another deployment-error. I kept receiving errors like this for a month.
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                It was already April. I thought that instead of losing time deploying I should first find a way to integrate the main AI bot. I started researching again. Only after a month I had found the solution. It was going to cost me, but what was my scholarship for anyway?
              </p>

              <p className="text-xl text-gray-200 leading-relaxed mb-6">
                I started integrating-error another error and even more errors. Finally, after another three weeks I succeeded. Now I had to set up payment, legal terms and domains. Fortunately, I didn't have any problems with that.
              </p>

              <p className="text-xl text-orange-200 mb-8 font-semibold">
                And here we are, we got to the point where I'm writing this. I just want you to know that if you got here, you're probably a way better person than me because honestly, if the roles were switched, I wouldn't have done the same.
              </p>

              {/* Final Message */}
              <div className="text-center mt-12 p-8 bg-gradient-to-r from-purple-600/20 to-orange-600/20 rounded-xl">
                <h2 className="text-4xl font-bold text-white mb-6">
                  Good Luck and WELCOME TO AFFILIFY!!!
                </h2>
                <p className="text-xl text-orange-200 mb-8">
                  Your journey to affiliate marketing success starts here. Let's build something amazing together!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300"
                  >
                    Start Your Journey
                  </Link>
                  <Link
                    href="/features"
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-8 py-4 rounded-lg font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
