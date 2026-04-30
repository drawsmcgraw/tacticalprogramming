---
title: "New Fundamentals"
date: 2026-04-28T18:24:13-04:00
categories: []
draft: false
---

I started writing on the Internet with [a nod to the value of the fundamentals]({{< relref "posts/fundamentals.md" >}}), with an unapolagetically strong emphasis on learning bash. I think now is a good time to revisit what a "fundamental skill" is today, in 2026. 

I believe everyone has their personal "oh shit" moment when it comes to AI. Mine was on the day I heard about ChatGPT and I logged in with the free tier. After toying around with it and asking it to write short essays on US history (some accurate, some less-than-accurate involving cyborg Lincoln), I asked it to write a Bash script. I can't even remember what the task was. And it wrote the bash script. In five seconds. And it worked. 

> Holy shit, I thought. I'll never have to write another Bash script again.

So if a machine writes Bash scripts better than you. And your fundamental skillset included navigating Bash. What is your fundamental skill now? 

I'm writing this blog post after using Claude Design to redesign the whole thing. I used Claude Code to integrate those design aesthetics into the repo that's hosting this website (and migrate it from Pelican to Hugo). I also used Gemma, running on [Kronk](https://github.com/drawsmcgraw/kronk) (my ongoing personal AI server project) for the initial migration. The point is, _I didn't write a single line of code or CSS_ and I got exactly what I wanted. 

If knowing the ins-and-outs of Bash scripts, or being good at quickly writing Python, is something the machine can do better than me, what is my skillset? What are my core, fundamental skills? I don't think anyone has a solid answer to that question right now. For me, in my one, myopic existence, I can summarize my fundamental skill in a word - wisdom. But being realistic, even something as intangible as _wisdom_ is something that a machine will, or has already partially, replace. Machine learning can already identify cancers with reliable accuracy, diagnose conditions faster than carbon-based doctors, and understand what sustainable software architecture looks like. 

My latest favorite Youtuber, Mo Bitar, [summarizes our collective thoughts on the subject](https://www.youtube.com/watch?v=pzkwn3hu1Cc) very well. Basically, I used to love doing the technical lifting and the technical work. But now the machine does it. And it does it better. So who the hell am I anymore? 

## Move Up One Level
The latest book I've read on AI, _How to Think About AI_, establishes two sorts of "thinking" about AI - "process" thinking and "outcome" thinking. Without getting into the details, it's effectively "are you concerned with how The Thing gets done? Or are you concerned with what The Thing has accomplised and what you can do with that?". A perfect example is how I implemented the redesign for my site. For _years_, I've struggled to learn real front-end design concepts and actually understand CSS. I grew up in the '90s, hand writing HTML tags in my blog posts on the Internet so I'm no stranger to doing the hard work. But man, I just never _got_ web design. Now, with a few days of on-and-off work, I have something that I like, something I enjoy. I'm able to ask Claude to reduce the masthead title, or move around some items, and it works! Do you remember, 20 years ago, when you went to a Web Design Firm, and you sat down with them, in physical chairs, and you used your mouth parts to _talk_ through what you wanted? And then _DAYS_ would go by before they had a wireframe. And they would get your feedback, and the process would repeat _for weeks_. AND THEN you would pay them thousands of dollars for the service, and hundreds more in perpetuity, _to host a website_.

I just did it in the equivalent of an afternoon, for less than a cheeseburger.

{{< pair                                                                                                                                                                      
  src1="old-and-busted.png" alt1="Old and Busted" caption1="Old and Busted"
  src2="new-hotness.png"  alt2="New Hotness"  caption2="New Hotness"                                                                                                           
>}}   

Move up one layer in the proverbial stack. Don't be the person _doing_. Be the person _deciding_. Decide that you want a blog redesign. Decide that the world needs some app you've been dying to build. Am I dumber for having the machine rewrite my site? Absolutely. Did I want to actually learn CSS and web design? Hell no. I just wanted a better looking site. I wanted the Outcome.

## Hand Craft Words Like You're Going to the Gym
We don't go to the gym because we encounter situations in life that require the exact motion of grabbing a bar and lifting it straight into the air. We go to the gym to build strength so we can do the things in life that bring us joy. The things like keeping up with the kids, helping someone move, or catch a bus when we're late. In the same vein, we now have the opportunity where we no longer have to write things to get something done. We can have the machine do that. But it _does_ mean that we now have to be thoughtful about what we choose to write ourselves, and what we delegate to the machine. Think of writing (blogs, code, haikus, whatever) the same way as going to the gym now. You _have_ to do some of it yourself, else you lose the ability to think deeply or creatively or critically. This is why it's so important that students still write those crappy English essays by hand. The essay isn't the point. It's the mental struggle you went through to know what words to write. 

## Stay Human
I still don't have a reliable answer to how we should all manage our careers. The paranoid cynic in me bought and built Kronk partially out of curiosity, but also out of legit concern for my career. Being functional with an AI is rapidly becoming table stakes, and Kronk is my way of hedging that as a technologist who has made his career building distributed systems. Kronk is a forcing function for learning the very complex internals of what, on the surface, appears to be a simple "chat bot". I'm learning design patterns. I'm learning concepts. I'm learning about a router model, slot management, message queueing, and plenty more. Claude wrote all of that code. Can I rewrite it from scratch? Emphatically - no. I cannot write this from scratch. I have asked Claude to explain the code and the workflows to me so I'm not completely ignorant. I've largely made peace with that, because I can still recognize what 'good' looks like and I can describe the experience I need from Kronk.

That is "moving up one layer". That's the modern equivalent of going from pushing values into CPU registers, up to a compiled language. When you learn C, you lose visibility into the individual registers and you no longer know exactly how your flow control is implemented. Is that a loss? I'm not sure it is. Is it one more abstraction layer that carries a cost with it? Absolutely. But remember that, if we all stayed purists, we'd all still be programming with `MOV` and `ADD` instead of 'help me redesign a site'.
