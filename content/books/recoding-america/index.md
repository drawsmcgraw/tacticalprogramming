---
title: "Recoding America"
date: 2026-06-12T09:15:10-04:00
author: Jennifer Pahlka
year: 2023
draft: false
---

Every time my wife & I go out to a new restaurant, we're always looking for that one thing - the ingredient, the technique, the atmosphere - that we can take away from the experience and use for our own work at home. It's how we became huge fans of the Hotel Costes music series. Books are no different for me. I'm not going to remember everything but there are always a couple gems that stand out from each book.

> The good intentions of policy often shipwreck on the rocky shores of implementation.


This, to me, is the fundamental, bedrock challenge with software in government ecosystems. Let's have a (very) quick refresher of constitutional law to get our bearings. 

The US government is comprised of three branches: Legislative, Judicial, and (most importantly for this topic), Executive. Software doesn't _just_ get written in government. It has to serve some declared purpose. What purpose, you ask? Well that's up to the Legislative branch. They declare some desire - say, "Every American should have access to, and be able to enroll electronically in, a healthcare program. And if they cannot find one through conventional means, then the state will provide one". Now you need software to support that enrollment/tracking. But the details are a little hazy. And Congress, you may be surprised to learn, is _not_ made up of software developers. They just declare an intention, write it in law, and pass it over to the Executive branch to, what else, _execute_ on it. 

Here is where things go sideways. What are the parameters of that website? What's the response time? What's the SLA? Should we allow people to log in with email & password or do we need to use a central system like login.gov? Those sound like nitty little details but they all add up to _intention_ of the software system. You can't go to Congress with the questions. They've moved on to the next disaster. And so now you're left with the staffers of the Executive branch, who by-the-way are usually _also_ not software developers, to interpret the desires of the Legislative branch. Add in a few Systems Integrators, contract processes, and about 18 months of lag and you have the worst game of telephone that organized society has invented. Finally, any time a _new_ requirement comes down from Congress, the entire process starts all over again. No context carries over. No historical knowledge. No understanding of the previous system. All brand new people. This is how software _accretes_, like layers of soil and stone layering on top of each other in geological time.

Is it any wonder that government software systems get a bad rap? 

That's where the empathy comes from. It's so easy to just say "Blech, government systems suck" but that's lazy. Understanding why, and empathizing with the people caught in the machine, takes some work. But that doesn't fix things. So what does?

Remove the barriers. Bring software development in-house. The largest success from Coding America is in the form of the [United States Digital Service](https://www.usds.gov/), which was created in 2014 (side note: as of this writing in 2026, this has been renamed to the "United States DOGE Service", serving as a time capsule to what happens when citizen frustration combines with an ignorance on constitutional law). This highly successful team is built inside the US Government, staffed by government employees - most of them highly trained. 

One strong opinion, loosely held, I have is that any sufficiently large organization should have in-house IT. Not offshored, not contracted out. In. House. Staffed with the same people that execute the mission. These in-house technologists have stronger historical knowledge of systems, care more about the mission, and are able to quickly iterate on systems without the nonsense of a contract addendum (i.e. move faster). I believe the US federal government falls into that category. Building the USDS is exactly this pattern, but scaled up. 

Does it solve everything? Not even close. But it shows a method that works. Something that, if taken care of and funded thoughtfully, can start to make real differences in government software systems and building trust in government overall, which is something I think we can all agree is something we need more of.
