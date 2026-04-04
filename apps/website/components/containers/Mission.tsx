
import { Badge } from "../Badge"
import MissionImage from "./MIssionImage"




export default function Mission() {
  return (
    <section
    id="preacher"
      aria-labelledby="code-example-title"
      className="mx-auto mt-10 sm:mt-28 w-full max-w-6xl px-3"
    >
      <Badge>Grow your reach</Badge>
      <h2
        id="our-mission-title"
        className="mt-2 inline-block bg-gradient-to-br from-gray-900 to-gray-800 bg-clip-text py-2 text-4xl font-bold tracking-tighter text-transparent sm:text-6xl md:text-6xl dark:from-gray-50 dark:to-gray-300"
      >
        Disciple more people <br/> through your sermons.
      </h2>
      <p className="mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
      Troott helps you reach hungry hearts ready to listen, 
      guide more lives, with no distractions, clutter, or limits. 
      We’re turning audio sermons into a tool for true discipleship 
      and help preachers reach millions without noise. 
      We help you build disciples not just listeners.
      </p>
     
     <div className="gap-10 items-start mt-10">

     <MissionImage/>
     </div>
     

    </section>
  )
}
