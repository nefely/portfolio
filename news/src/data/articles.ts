import type { Article } from '../types'

import articleTailwind from './../assets/article-tailwind.jpg'
import articleDevtool from './../assets/article-devtool.jpg'
import articleAiEducation from './../assets/article-ai-education.jpg'
import articleEvBattery from './../assets/article-ev-battery.jpg'
import articleItCommunity from './../assets/article-it-community.jpg'
import articlePasskeys from './../assets/article-passkeys.jpg'
import articleSatellites from './../assets/article-satellites.jpg'
import articleAiMedicine from './../assets/article-ai-medicine.jpg'
import articleSolar from './../assets/article-solar.jpg'
import articleWebassembly from './../assets/article-webassembly.jpg'

export const allArticles: Article[] = [
      {
        id: 1,
        slug: 'vite-8-and-tailwind-css-4',
        title: 'Vite 8 and Tailwind CSS 4: new possibilities for frontend development',
        excerpt:
          'A new version of Vite brings faster builds, while Tailwind CSS 4 can now be wired up with a single plugin and no separate config file.',
        content: [
          'The Vite team has released the eighth major version of the tool, with the main focus placed squarely on speed. Thanks to parts of the internal pipeline moving to Rolldown, builds for large projects are several times faster than in the previous version, and the dev server’s cold start is now practically instant even for projects with thousands of modules.',
          'Alongside it, Tailwind CSS 4 has shipped, dramatically simplifying setup. Where previously you had to create a separate config file and wire up PostCSS, now a single package with a Vite plugin plus one import line in your CSS file is enough — the framework figures out the rest by scanning your source code automatically.',
          'Developers note that the Vite 8 and Tailwind 4 combo is especially well suited to small and medium projects where iteration speed matters most. Hot style updates happen with no noticeable delay, and the final CSS bundle is automatically purged of unused classes thanks to built-in analysis.',
          'Another notable change is out-of-the-box support for modern CSS features — container queries, P3 color spaces, and logical properties. This means less custom CSS to write and more reliance on utility classes even in non-trivial responsive layouts.',
          'The community has already started migrating existing projects to the new version, and feedback has mostly been positive: migration usually comes down to deleting the old config file and installing the new packages, rather than rewriting styles.',
        ],
        category: 'Technology',
        date: 'August 28, 2026',
        image: articleTailwind,
        isHot: true,
      },
      {
        id: 2,
        slug: 'open-source-code-analysis-tool',
        title: 'Ukrainian developers build an open-source tool for code analysis',
        excerpt:
          'A new open-source app helps teams spot vulnerabilities and duplicated logic earlier, right at the code review stage.',
        content: [
          'A small team of Ukrainian developers has released an open-source static code analysis tool that plugs directly into the code review flow on GitHub and GitLab. The app automatically scans changes in a pull request and leaves comments wherever it spots a potential issue.',
          'Unlike many alternatives, the tool doesn’t just look for syntax errors — it also flags duplicated logic across files, outdated patterns, and potentially unsafe handling of user data. It combines classic linting rules with a lightweight language model that runs locally.',
          'The authors emphasize that code privacy was a top priority during development: analysis happens entirely on the team’s own servers or even locally, with no source code sent to third-party services. That matters a lot for companies working with sensitive data.',
          'Early users say the tool helped them find duplicate functions in large legacy projects that had accumulated years of technical debt. Several teams have already added it to their CI pipeline as a required step before merging.',
          'The project is distributed free of charge under an open license, and its source code is open for anyone who wants to contribute. The authors plan to add support for more programming languages soon, along with integrations with popular issue trackers.',
        ],
        category: 'Development',
        date: 'August 27, 2026',
        image: articleDevtool,
      },
      {
        id: 3,
        slug: 'ai-in-education',
        title: 'How artificial intelligence is changing the way schools teach',
        excerpt:
          'Personalized learning assistants help teachers adapt material to each student’s pace without adding to educators’ workload.',
        content: [
          'More and more schools around the world are adopting AI-based learning platforms that adjust task difficulty to each individual student’s level. Instead of one curriculum for the whole class, the system offers every child their own learning path that accounts for their strengths and weaknesses.',
          'Teachers already using these tools say the main benefit isn’t replacing the teacher — it’s freeing up time for real conversations with students. The algorithm takes over routine grading of homework and basic exercises, leaving the teacher free to focus on explaining harder topics and keeping students motivated.',
          'Studies conducted at several pilot schools show a modest but steady improvement in math and reading scores among students who had previously been falling behind. The effect is especially noticeable for children who need more time to absorb new material.',
          'At the same time, experts warn against over-relying on the technology: quality education still depends on real contact with a teacher, and AI is best treated as a supporting tool rather than a replacement for classroom teaching.',
          'Over the coming years, such programs are expected to gradually expand into middle and high school, with a particular focus on developing critical thinking and information literacy rather than just memorizing facts.',
        ],
        category: 'Education',
        date: 'August 26, 2026',
        image: articleAiEducation,
      },
      {
        id: 4,
        slug: 'ev-battery-fast-charging',
        title: 'New EV battery charges to 80% in just seven minutes',
        excerpt:
          'Engineers unveil a solid-state battery that dramatically cuts charging time without sacrificing cycle life.',
        content: [
          'A team of battery engineers has announced a new type of solid-state EV battery that can charge to 80% capacity in just seven minutes — about as long as it takes to fill up a gasoline car’s tank.',
          'The key difference is replacing the liquid electrolyte with a solid composite material, which lowers the risk of overheating and allows much higher current during charging without damaging the battery’s longevity. Preliminary tests show a lifespan of over two thousand full charge-discharge cycles.',
          'Automakers have already expressed interest in the technology, and the first commercial vehicles using these batteries are expected on the market within the next few years. This could be an important step toward wider EV adoption, since charging time remains one of the biggest factors holding back buyers.',
          'Besides faster charging, the new battery is also lighter than traditional lithium-ion packs at the same capacity, which improves a vehicle’s range. Developers also note the technology is inherently safer, since a solid electrolyte is far less prone to catching fire.',
          'The team is now working on scaling up production to make the technology affordable beyond premium models and bring it to the mass-market EV segment.',
        ],
        category: 'Technology',
        date: 'August 25, 2026',
        image: articleEvBattery,
        isHot: true,
      },
      {
        id: 5,
        slug: 'ukrainian-it-community-wins',
        title: 'Ukrainian IT community earns several wins at international competitions',
        excerpt:
          'Teams of developers and researchers from Ukraine stood out at a number of international hackathons and cybersecurity contests this summer.',
        content: [
          'This summer, several teams of Ukrainian developers took top spots at international hackathons focused on solutions in education, healthcare, and cybersecurity. One team presented an app that helps visually impaired people navigate public transport using audio cues.',
          'Ukrainian cybersecurity researchers also stood out, taking part in an international CTF (Capture The Flag) vulnerability-hunting competition and placing among the top teams out of more than thirty countries. Organizers praised the quality of the technical solutions and the speed at which the team found complex vulnerabilities.',
          'These international successes reflect the broader momentum of Ukraine’s IT industry, which continues to attract new talent even under difficult conditions. Many participants say competitions like these offer valuable international experience and help build connections with specialists from other countries.',
          'Local tech communities actively support young developers by running free mentorship programs and online courses to help them prepare for such competitions. Organizers say this is gradually shaping a new generation of specialists capable of competing on a global level.',
          'Several Ukrainian teams are already planning to take part in a few more international contests soon, including ones focused on machine learning and game development.',
        ],
        category: 'Community',
        date: 'August 24, 2026',
        image: articleItCommunity,
      },
      {
        id: 6,
        slug: 'passkeys-new-security-standard',
        title: 'Passkeys are becoming the new standard for signing in, replacing passwords',
        excerpt:
          'More and more services are switching to passkey authentication, removing the need to remember passwords and boosting account security.',
        content: [
          'Passkey technology, which lets you sign in using a fingerprint, face recognition, or your device’s PIN instead of a traditional password, is steadily becoming the standard for major online services. Over the past year, the number of platforms supporting this sign-in method has grown noticeably.',
          'Unlike passwords, passkeys are based on public-key cryptography: the private key never leaves the user’s device, so it can’t be stolen through a service’s data breach or a phishing site. This significantly lowers the risk of account compromise even in the event of a large-scale breach.',
          'Users who have already switched to passkeys point to the convenience: no more remembering dozens of complex passwords or relying on a password manager for every single service. Signing in takes a couple of seconds — just a fingerprint scan or a glance at the camera.',
          'Cybersecurity experts call this shift one of the most significant changes in account protection in the past decade, comparing its importance to the mass adoption of two-factor authentication a few years ago.',
          'Despite the benefits, passwords won’t disappear overnight — many services still need a transition period supporting both methods, and users will need time to get used to the new approach.',
        ],
        category: 'Cybersecurity',
        date: 'August 23, 2026',
        image: articlePasskeys,
        isHot: true,
      },
      {
        id: 7,
        slug: 'private-satellites-earth-observation',
        title: 'Private satellites let researchers track climate change in real time',
        excerpt:
          'A new network of small Earth-observation satellites gives researchers highly detailed imagery on a daily basis.',
        content: [
          'A private space company has finished deploying a network of several dozen small satellites designed for remote observation of the Earth’s surface. Unlike traditional government satellite programs, this network refreshes imagery of individual regions daily instead of every few weeks.',
          'Climate researchers have already started using this data to monitor glacier melt, changes in forest cover, and water levels in major bodies of water. The high refresh rate makes it possible to catch changes that used to slip through the gaps between satellite passes.',
          'Beyond scientific use, the technology is also finding demand in agriculture: farmers use the data to assess crop conditions and plan irrigation, helping them use water and fertilizer more efficiently.',
          'The company says it will provide some of the data free of charge to research institutions studying climate change, while commercial use will fund further expansion of the satellite network.',
          'In the coming years, the company plans to double the number of satellites in the network, allowing even more frequent imagery updates and coverage of more regions of the planet in high detail.',
        ],
        category: 'Science',
        date: 'August 22, 2026',
        image: articleSatellites,
      },
      {
        id: 8,
        slug: 'ai-early-disease-detection',
        title: 'Artificial intelligence helps doctors catch diseases at early stages',
        excerpt:
          'Medical imaging algorithms show high accuracy in spotting early signs of disease that are easy for the human eye to miss.',
        content: [
          'Several medical centers have rolled out AI-based imaging analysis systems that help radiologists spot early signs of disease in X-rays, MRIs, and CT scans. The algorithm flags areas of an image that deserve a closer look.',
          'Practicing doctors say the system doesn’t replace a specialist — it acts as a kind of tireless "second pair of eyes" that examines every scan with the same level of attention, no matter how many it has already reviewed that shift. That’s especially useful in clinics with a heavy patient load.',
          'In several clinical studies, using these systems helped catch early-stage disease in patients whose scans had initially been read by a doctor as showing no abnormalities. The follow-up analysis by the algorithm allowed treatment to start in time.',
          'Developers stress how important transparency is for these systems: a doctor should always understand why the algorithm flagged a particular area of a scan, rather than blindly trusting the result. The final call always stays with the human.',
          'Medical facilities already piloting these tools plan to gradually expand their use to other types of diagnostics, including blood test analysis and ECG readings.',
        ],
        category: 'Medicine',
        date: 'August 21, 2026',
        image: articleAiMedicine,
      },
      {
        id: 9,
        slug: 'next-gen-solar-panels',
        title: 'Next-generation solar panels reach record efficiency',
        excerpt:
          'Multi-layer solar cells convert a larger share of sunlight into electricity than traditional silicon panels.',
        content: [
          'A research lab has announced a new generation of solar panels that use several layers of semiconductor materials to capture a wider range of the sunlight spectrum. This allows for higher energy-conversion efficiency compared to traditional silicon panels.',
          'Unlike single-layer silicon cells, the multi-layer design captures different wavelengths of light at different levels of the panel, reducing energy losses as heat. In lab tests, the new panels show a significantly higher efficiency rating.',
          'Manufacturers say that despite the more complex production process, the cost of the panels is gradually approaching that of traditional alternatives thanks to improved manufacturing processes. That makes the technology attractive not just for large solar farms but for private households as well.',
          'Industry experts note that improved solar panel efficiency matters most for regions with limited roof or land space, where every extra percentage point of efficiency means more energy generated from the same footprint.',
          'The company plans to begin mass production of the new panels within the next few years, and the first pilot installations are already being tested in several countries with different climate conditions.',
        ],
        category: 'Energy',
        date: 'August 20, 2026',
        image: articleSolar,
      },
      {
        id: 10,
        slug: 'webassembly-in-production',
        title: 'WebAssembly moves beyond experiments and into production',
        excerpt:
          'More companies are using WebAssembly to speed up heavy computation directly in the browser, from video processing to 3D graphics.',
        content: [
          'WebAssembly, a technology that lets browsers run code compiled from languages like C++, Rust, or Go, is steadily moving from the experimental stage into full-fledged production use. Companies are applying it to tasks where regular JavaScript performance simply isn’t enough.',
          'Popular use cases include editing and processing video directly in the browser without uploading files to a server, complex calculations for engineering and scientific applications, and 3D graphics rendering for web apps that used to require installing separate desktop software.',
          'Developers note that WebAssembly makes it possible to port existing libraries written for desktop applications into the web without a full rewrite. That significantly cuts development time for teams that already have code written in other programming languages.',
          'Besides performance, security remains a key advantage: WebAssembly code runs in an isolated browser sandbox with limited access rights, reducing risk to the user compared to installing separate standalone programs.',
          'The developer community expects the technology’s capabilities to keep expanding, particularly with better multithreading support and direct access to the GPU, opening the door to even more demanding applications running right in the browser.',
        ],
        category: 'Development',
        date: 'August 19, 2026',
        image: articleWebassembly,
      },
]