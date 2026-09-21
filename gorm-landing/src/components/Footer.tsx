import instagramIcon from "../assets/icons/instagram.svg"
import twitterIcon from "../assets/icons/twitter.svg"
import dribbbleIcon from "../assets/icons/dribble.svg"
import Reveal from "./ui/Reveal"

const navLinks = ["Home", "About", "Style guide", "Licensing", "Instructions"]
const socials = [
  { name: "Instagram", icon: instagramIcon },
  { name: "Twitter", icon: twitterIcon },
  { name: "Dribbble", icon: dribbbleIcon },
]

function Footer() {
  return (
    <footer className="py-16">
      <Reveal className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-12">
        <div className="flex flex-col gap-6">
          <div className="text-2xl font-bold uppercase tracking-tight text-white">
            G<span className="text-red">ö</span>rm
          </div>
          <p className="max-w-sm text-body">
            Görm is an award UI/UX designs and branding agency based in New
            York, USA.
          </p>
          <nav className="flex flex-wrap gap-6 text-xs font-semibold uppercase tracking-widest text-white/80">
            {navLinks.map((link) => (
              <a key={link} href="#top" className="transition-colors hover:text-red">
                {link}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col items-start gap-6 lg:items-end">
          <div className="flex gap-6">
            {socials.map((social) => (
              <a
                key={social.name}
                href="#top"
                className="flex items-center gap-2 text-sm text-white transition-colors hover:text-red"
              >
                <img src={social.icon} alt="" className="h-4 w-4" />
                {social.name}
              </a>
            ))}
          </div>
          <div className="text-right text-sm text-white/80">
            <div>hello@görm.com</div>
            <div>+7 (004) 214 5700</div>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-16 max-w-[1600px] px-6 text-xs text-muted lg:px-12">
        © {new Date().getFullYear()} Görm. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
