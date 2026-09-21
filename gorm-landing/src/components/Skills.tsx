import skillsImage from "../assets/images/skills.jpg"

const skills = [
  { name: "Graphic design", value: 80 },
  { name: "Lead generation", value: 41 },
  { name: "Photoshop", value: 70 },
  { name: "Illustration", value: 100 },
]

function Skills() {
  return (
    <section className="border-b border-white/15 py-20 lg:py-28">
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-12">
        <div className="flex flex-col justify-center gap-10">
          <h2 className="text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-white lg:text-6xl">
            Our skills
          </h2>

          <div className="flex flex-col gap-6">
            {skills.map((skill) => (
              <div key={skill.name}>
                <div className="mb-2 flex items-baseline justify-between text-sm font-semibold uppercase tracking-wide text-white">
                  <span>{skill.name}</span>
                  <span>{skill.value}%</span>
                </div>
                <div className="h-px w-full bg-white/15">
                  <div
                    className="h-px bg-red"
                    style={{ width: `${skill.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted">
            * Companies we've helped build their website with Görm
          </p>
        </div>

        <img
          src={skillsImage}
          alt="Görm team member in the studio"
          className="aspect-video w-full object-cover lg:aspect-auto"
        />
      </div>
    </section>
  )
}

export default Skills
