---
title: "Team of Teams"
author: "Stanley McChrystal"
year: 2015
date: 2018-06-18
date_read: 2018-06-18
status: "read"
rating:
categories: ["philosophy"]
draft: false
---

Gen. McChrystal captures and summarizes the experiences during the start of the GWOT (Global War on Terrorism) when Al Qaida, despite having inferior tech and weapons, routinely outsmarts and outmanuevers the US military. He describes identifying the deltas between the two organizations and how the US military completely changed their structure and culture to adapt and overcome. Of particular interest to me going into this book is the concept of “Shared Consciousness”, balanced with “Empowered Execution”

In addition to the notes below, a well-thought out summary is also available here:
[https://agileleanhouse.com/en/general-stanley-McChrystal-team-of-teams.html](https://agileleanhouse.com/en/general-stanley-McChrystal-team-of-teams.html)

This book has a wartime/military background to it but it easily maps to multiple domains: software architecture and microservices, “devops”, being a Trusted Advisor in software sales, and many others. I hope I’ve captured the essence with my notes but the entire book itself is worth the time spent to read it. I highly recommend reading the book.

# Part One - The Proteus Problem

Taken from Proteus, a sea god of constant change.

## Chapter 1 - Sons of Proteus
Largely lays out the stories and experiences proving that Al Qaida, Iraq (AQI) is organizationally superior. White boards full of org charts derived from various intel makes absolutely no sense. Take out AQI’s #2 or #3, and a new person immediately backfills them. Their structure defies all previous understanding.

## Chapter 2 - Clockwork
McChrystal goes into depth in the history of Frederick Taylor’s “Scientific Management” that is the bedrock of today’s industrial style management and, frankly, everything they taught us in Industrial Engineering. Taylor squeezed every bit of efficiency and productivity out of every process, including rendering people obsolete and removing them. In his defense, the savings gained from those human removals allowed him to raise pay for those who remained.

This becomes the foundation for our love of efficient systems. Efficient systems, however, are basically unitaskers - they can do one thing *really well*. But they can only do that one thing.

Another example of this reality is the French Maginot line in World War II. Which was a line of defense set up against the Germans, but was easily circumvented by the Germans.

It’s worth repeating that Taylor’s work was highly influential for the next 100+ years of industrial activity and remains so even to this day. Keep this in mind as you read through the notes.

## Chapter 3 - From Complicated to Complex

This chapter was especially poignant. I had invented my own understanding of the difference between “complicated” and “complex” but McChrystal’s definitions are much better.

Complicated - a *deterministic* system of components that, while challenging to comprehend, will reliably produce the same output, given the same input. Example - an internal combustion engine.

Complex - a constantly-changing system that has zero guarantee of producing the same output given the same input. Examples: the weather system, the global financial system.

The US military’s entire way of life was built around Complicated systems - reliable enemies that behaved in predictable patterns. Thus, taking time (sometimes a lot of time) to prepare for particular engagements was permissible. In a complex scenario, however, by the time you prepare for an engagement, all your work is rendered OBE (overcome by events), leaving you without a plan and vulnerable.

## Chapter 4 - Doing the Right Thing

As led into from the previous chapters - predicting events and responding to them with Taylor-like efficiency is worthless if you’ve predicted the wrong thing. More important, then, is to emphasize flexibility and resiliency. The ability for a system to change and reconfigure itself to meet new needs. A car manufacturing plant can be the most efficient in the world, but it’s useless if you need to start making helicopters tomorrow.

The pursuit of efficiency can limit flexibility. It’s worth keeping this in mind when remembering the value (and even necessity) of achieving resilience. You must accept the trade-off and that you will not be at 100% “efficient”. This is worth repeating - you must accept the decrease in efficiency in order to achieve the flexibility needed to succeed.

# Part 2 - From Many, One

## Chapter 5 - From Command to Team

McChrystal opens with a comparison of United Flight 173 (Dec 28, 1978) with US Airway 1549 (2009, with Capt Sully landing in the Hudson River).

A minor mechanical failure (indicator light for landing gear) caused the captain of Flight 173 to fall into a pattern of circling the airport while he issued commands to the crew to begin troubleshooting the problem. Despite repeated warnings from the co-pilot, the flight ended up running out of fuel and crashing short of the runway, killing a large part of the crew and passengers. The captain, being the center of all decision-making, overlooked the critical detail (fuel level) because he was so focused on the initial problem (indicator light).

Contrast that with Flight 1549. Sully was *not* the central authority on the flight. The crew acted as a distributed team - decisions were made without running them past Sully. The consequence is every member of the crew acting, in parallel, to manage a situation that is impossible for a single human to handle. The outcome, as we know, is everyone surviving the crash into the Hudson River.

There is an entire case study around this, involving how the airline industry took the lesson from Flight 173, combined it with NASA’s knowledge around Flight Books and incident management, and created a brand new team management system called Crew Resource Management. All of the airline industry uses this management system. As with anything new, it was met with resistance and the usual headwinds but, ultimately, became the system that dramatically reduced the number of flight crashes in the decades leading to the present. 

There’s a lot to talk about here, but the main point is that one is a Command and one is a Team.

Flight 173 was focused on the Process - Flight 1549 focused on Purpose. You can respond to the tragedy of Flight 173 by writing an entry in your Flight Book that says “what to do when the landing gear light malfunctions”. But what about the *next* problem? Or the multitude of other problems that come up? You cannot predict and plan for everything. You have to have a team that’s flexible and that can thrive in unexpected situations.

Last story to foot-stomp the point - the Navy SEAL raid of Osama Bin Laden’s compound had a dramatic moment when the helicopter dropped and crash-landed on a fence in the compound. While this part of the story had the media aflutter and sounded dramatic, it was highly routine for a SEAL operation - nothing goes according to plan. Again, you need to be flexible and be able to act, as a team, to quickly surround a problem and solve it.

How do you build a Team? Multiple things. But let’s start with relationships.

The SEALs have a saying - get a Swim Buddy. This is the person you do *everything* with. This is analogous to the practice of pairing or mobbing when writing software or tackling an engineering problem. In constantly being around the other person(s), you develop high quality, high trust relationships with them. These relationships are the foundation that a Team is built upon. When you’ve stood through multiple trials with a person (or people), you can move, together, at the speed of thought. This is “the connectivity of trust and purpose”.

## Chapter 6 - Team of Teams

You can practice an exercise and war-game as much as you like. But if all you can handle is that exercise, you will fail. This is one of the big reasons why AQI ran circles around the US military - we only knew plays, like that in a football game, and we couldn’t map the reality of AQI into an effective playbook.

MECE - Mutually Exclusive, Collectively Exhaustive

A MECE breaks down a set for easy organization. For instance, a set of customers. There are “paying customers” and there are “nonpaying customers”. That encompasses the entire set. While it’s handy for organizing things, it’s not effective at organizing people. Your classic, hierarchical org chart is a MECE. But that’s not how people work - an effective person can be a member of multiple groups.

Using this MECE and a rigid org chart created a situation where operators (Marines, SEALs, etc) would bring back bags of evidence that would sit for *days* before they could be exploited by analysts. This means the intelligence you get is days old. What good does it do you to know where the enemy was three days ago? The fix is to recognize that we don’t live in a world where everyone has a rigidly-defined role. Instead, you’re “purpose-driven” and fulfil whatever role is needed to achieve success (i.e. the Operators, even though they’re less effective at it, should be exploiting the evidence).

“The point at which everyone else sucks”

Everyone is fighting the same war, but on a personal level, each individual is fighting *for their team*. This can lead to people having a stronger allegiance to their team than to the overall mission, hitting what is called “The point at which everyone else sucks”. You can mitigate this by introducing representatives, or diplomats, from the teams. Consider Team A and Team B. Choose a person from Team B to liaise with Team A. This means you have a real, flesh & blood face to keep in mind when you need to reach out to the other team. This fosters the same comradery and human relationships as a Swim Buddy would have on the individual level. This helps humanize “the other team” and puts those relationships back in place, and the focus back on mission (instead of just being better than the other team). 

The evolution is something like “Command” -> “Command of Teams” -> “Team of Teams”

The above is how you achieve a Team of Teams. Not every person knows every other person. But everyone does trust each other and is united by the shared purpose.

# Part 3 - Sharing

## Chapter 7 - Seeing the System

When operations failed (i.e. raids were executed but no captures/kills were made or a person of interest eluded us), the response was to double-down on the usual. The command took a “reductionist” approach (remember Taylor?) and responded by improving the individual parts. That is, make every component as efficient as possible. But the problem isn’t that you’re not running an operation fast enough, or that you’re not running enough of them - the problem is that you need people to act independently, in real time. No well-rehearsed maneuvers in isolation can succeed in a complex world.

So how do you do this? McChrystal introduces the “Need to Know Fallacy”.

The need to know information was hindering successful operations. Operator A is only aware of their own role in an operation and does not know about Operator B’s role. This is also the cliche, “the right hand doesn’t know what the left hand is doing”. 

McChrystal belabors the point (in a good way) with a fictional soccer team, the Krasnovian soccer team. Imagine a soccer team whose players have no idea what each other is doing - they simply rehearse their own play, in isolation, and then bring that play to the field on game day. Game day is a failure, however, because five minutes into the game, the situation deviates from what everyone practiced, and no one is effective anymore. After the defeat, the coach reviews the game, devises a new playbook, and the pattern repeats with the expected results.

NASA and ELDO

NASA and ELDO (the European Launcher Development Organization, the EU’s version of NASA) both set out to put a man on the moon. Despite incredible technical challenges (for example, JFK’s statement of using “New metal alloys, some of which have not yet been invented”), NASA succeeded. ELDO never did and was eventually disbanded.

Why?

When building a complex piece of machinery, the individual components can perform perfectly. But it’s at the point of intersection - that is, where two components interface with each other (referred to as “blinks” for McChrystal’s task force) - where failures occur. This is as true for organizations as it is for technical machinery.

NASA brought in George Mueller to build the managerial foundation of the Apollo program. Old org charts (the Command style) were thrown out and both managers and engineers alike were required to communicate daily with their counterparts in other organizations. This caused a lot of strife (normally, people were used to solving problems on their own, in isolation). 

A central control room was stood up where all pertinent data was on display for everyone to see. Despite initial headwinds, the utility of this approach quickly became obvious and gained traction and mindshare. Likewise, they brought contractors in-house (contractors used to be physically outside the building, working a problem in isolation). In short, everyone was expected to understand the entire project to some degree. They were even encouraged to spend time understanding the entire project at the expense of making progress in their own area (i.e. being “inefficient”). “High-level success depended on low-level inefficiencies”. Again, you must embrace this trade-off.

This is the beginning of what is called Systems Management. 

This story lays the foundation for what McChrystal calls “shared consciousness”. In his words:
“We wanted to fuse generalized awareness with specialized expertise.”

This shared consciousness is the cornerstone of building a Team of Teams.

## Chapter 8 - Brains Out of the Locker

McChrystal goes over a brief history of office cubicles, how they were misunderstood, mimicked, and turned into the nightmare they are today. But really, the real point of this chapter is understanding the value of the Operations and Intelligence (O&I) briefing, modeled after the success of NASA’s Apollo program mentioned in the previous chapter.

It is difficult to overstate the value of the O&I.

The O&I started with a small audience but stakeholders from everywhere were encouraged (and in some cases, required) to attend. A large effort was made to install and improve communication tech at various locations around the globe so that more stakeholders could join the O&I. Poor IT or equipment would not be allowed to be an excuse.

The importance of the O&I - and that it happens regularly, cannot be overstated. It is run six days a week. It is never canceled. Everyone is expected to attend. 

Yes, there was risk in opening up classified conversations to a large number of people but that’s the tradeoff for the huge gains in shared consciousness. Also, yes, you are airing your dirty laundry (failed operations, struggles, etc) but that is the tradeoff. What you gain vastly outweighs the risks.

How do you get people to join in, though? And to actually participate? Lead by example. Be violently transparent in all of your actions in the O&I. By doing this, you show that you’re serious about communicating and give others (who are very uncomfortable) the permission to follow your lead. Not everyone will be on board though, and that’s okay. One organization, for an entire year, would answer “nothing to report on our end” when it was their turn to speak. Eventually, it became useful for people to show up, so people started showing up. Likewise for their involvement (i.e. providing more than “nothing to report on our side”).

Because the O&I is so important, I’m going to summarize a few highlights:

* It always goes on. It is never canceled
* Participation is expected
* The quality of the call is paramount. If you have logistical problems (poor video, latency, difficulty dialing in, etc) - FIX THEM
* Exercise violent transparency
* *Engage* - that means turn on your video, do not multitask, look at the camera. This is important, so treat it with importance.

## Chapter 9 - Beating the Prisoner's Dilemma

Participation in the O&I is very similar to the prisoner’s dilemma ([https://en.wikipedia.org/wiki/Prisoner%27s_dilemma](https://en.wikipedia.org/wiki/Prisoner%27s_dilemma)) in that each agency was concerned that participating and being transparent would be detrimental to them. If agency A “aired their dirty laundry” and agency B abstained, then the first suffers a loss (in status, in respect, or other measure). 

McChrystal combated this problem in two ways:

- An embedding program
- A liaison program

Embedding people for six months at a time (e.g. an Army Special Forces person embedding in a SEAL team) was controversial but effective. Naturally, they were met with the usual resistance (you don’t understand how camaraderie is built over years, etc) but once imposed, the teams were incentivized to send their best people (you don’t want your representative shaming your team). The outcome was effective cross-pollination and a shared appreciation for what the war looked like from another perspective. 

The Liaison program aimed to take the same approach. Except instead of groups within the US DoD, it was partner organizations across the US government (e.g. CIA, DIA, etc). McChrystal made an effort to send only their best people as liaison officers (LNO’s), making them linchpins in their relationships with other agencies. These were usually top-notch snipers, SEALs, etc, and they were donning civilian outfits and sitting in embassies thousands of miles away from the war. The benefit, though, was that they were excellent leaders and had a high [EQ](https://en.wikipedia.org/wiki/Emotional_intelligence).

In both approaches, the outcome was that they developed deep, personal relationships with individual humans. Humans that could be trusted and relationships that could short-circuit *weeks* of bureaucracy in a matter of minutes. This is part of what Shared Consciousness looks like. 

A quick story about this approach - one particular LNO was treated with such disdain when he started in his detail that he was given access to intel but no tasking. He took it upon himself to start taking out the trash. He went from office to office, doing this. He eventually discovered an embassy colleague loved Chick-fil-a sandwiches, so he arranged to have several delivered in the next Task Force delivery. Eventually, he gained the trust of his colleagues and was able to not only answer a question related to force protection, but made a phone call and connected the embassy employee with exactly the right person back in his home unit. After that event, the Task Force’s relationship with that embassy immediately grew tighter. In McChrystal’s words, *“A new node in our network came online and began to thrive”*.

This work takes time (a lot of time, in fact) but the returns are huge. Again, we’re talking about short-circuiting the bureaucracy and getting things done *with a phone call*, not a form and weeks of reviews.

The book does an excellent compare-and-contrast of General Motors vs Ford, using a failed ignition switch that caused the deaths of many citizens over a decade as an example from GM and the fact that Ford was the only motor company to turn a profit in 2009 (recall the Great Recession began around 2008). It’s worth paying attention to in the book but the short version is GM continued its internal competition model (pitting employees against each other because The Market makes it right) vs Ford’s imposition of cooperation among its employees. Not surprisingly, when you encourage cooperation, you get better results organization-wide. Cross-pollination (engineers that understand how a part would get installed, for example) and faster, autonomous groups in the organization work better, faster.

# Part 4 - Letting Go

## Chapter 10 - Hands Off

In short, a single human cannot reasonably make decisions and command a sufficiently-large number of humans. McChrystal uses another compare/contrast scenario to make this point with Captain Matthew Perry vs Brigadier General Ethan Allen Hitchcock.

Perry is best known for his trip to Japan circa 1851, when he convinced the nation to open commerce to the world (Japan was in a state of isolation and dealt with practically no outside nation). Perry was given full autonomy to complete this mission - no detailed instructions, only an overall goal (open Japan for commerce). He was able to use his best judgement and expertise. As we all know today, Japan is very much involved in the global economy, showing Perry’s success.

Hitchcock, on the other hand, was given the mission to reorganize federal troops in California to protect gold rushers and settlers from Indian attacks. Hitchcock was given explicit instructions, step-by-step commands, on how to do this. In short, anyone who can follow orders could have done this.

Why the difference? Pragmatism. It’s easy to control an Army general when they’re still in-country. A captain across the Pacific in the 1800’s, however, might as well be on the moon. It’s impossible to command-and-control under those circumstances. So you don’t. Despite the lack of control, however, the outcome was excellent with Perry.

In the commercial setting, another story about the Ritz-Carlton hotel shows the point. Employees can spend up to $2,000 with prior approval in order to satisfy a guest.

Another one - At Nordstrom, every employee, upon their first day, was given a card that, on one side, read:

*Our One Rule: Use good judgment in all situations. Please feel free to ask your department manager, store manager, or human resources officer any question at any time.*

Last story - Captain Nelson, in the battle of Trafalgar (a pivotal naval battle between the British vs the French & Spanish in 1805) said “No captain can do very wrong if he places his ship alongside that of the enemy”.

Nelson recognized that using flags and signals for one human to coordinate a fleet of ships was slow and error-prone. Instead, he decentralized his power and decision-making, trusting the captain of each individual ship. The phrase above is speaking to how Nelson flipped the script on how to conduct naval battle. Typical for the time, ships would simply line up in parallel lines and fight a battle of attrition. By telling his captains to run in between the enemy’s ships, he gave up the ability to command the fleet, but decisions were made faster and in better judgement (Nelson can’t know what’s going on on any given ship, which will affect how decisions are made).

Eventually, for McChrystal, a rule of thumb emerged for the task force - “If something supports our effort, as long as it is not immoral or illegal,” you can do it.

Quoting from the book:
“We decentralized until it made us uncomfortable, and it was right there - on the brink of instability - that we found our sweet spot”.

## Chapter 11 - Leading Like a Gardener

A gardener doesn’t make a plant grow. Instead, the gardener creates an environment in which the plant can grow. Fostering this environment through leadership is the goal. Again, a single human cannot have encyclopedic knowledge of every part of the organization and it’s unrealistic to expect them to. 

This does not mean you are a “hands off” leader. Consider it an “Eyes-On, Hands-Off” approach. Create the environment, maintain it, but you’re not abdicating all responsibility.

Contrast the gardener with a chess master. The chess master controls each move of the organization. This is exhausting, impossible, and slow. 

Enable. Don’t direct.

# Part 5 - Looking Ahead

## Chapter 12 - Symmetries

McChrystal ends the book with a tale of how the Task Force finally tracked down and killed Abu Musab al-Zarqawi, comparing the events with the opening story of their failure to prevent the bombing told in the opening chapter. 

A main point in this wrap-up chapter is making clear the balance of “shared consciousness” with “empowered execution” (previous chapters tempered the word “empowerment” by acknowledging that it’s been poorly executed historically). One is useless without the other. If everyone understands the situation but cannot act on it, you have failed. Likewise, if people are allowed to collectively make uninformed decisions, you will fail. He pulls in Alexis de Tocqueville’s observations (from “Democracy in America”, worth a read), saying that the foundation of a successful democracy is an informed, and involved, public. This is not a book on political commentary, however, so his illustrations stop there.

Mental models are exactly that - models. They are not reality. Consider, for example, a subway map of DC vs a topographical map of DC. A subway map is useless if you’re walking DC and a topographical map is useless for trying to catch a train. We cannot fall into the trap of using legacy models going into future engagements.

The final passage acknowledges that, just as Taylor did with reductionism in the Industrial Revolution during the 1800’s, we are now standing at the start of a new age - one of constantly changing, moving situations. Supply chains are global. Teams are made of networks, not org charts, and constantly shift roles. We now live in a necessarily more complex world and properly managing this world is “the limiting factor to the quest for human progress”.

End of Summary.
