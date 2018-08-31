Title: On Presumptive Software
Date: 2018-08-30
Category: philosophy

If there's one thing that the great [Saint Atwood](https://blog.codinghorror.com/) taught me, it's this - software is built to help people do their jobs. That's why we have automation, right? Because we need something done and would rather not spend all our time manually building something. That's why we have software, computers, and all of these crazy frameworks and languages we spend our times learning - so we can build something that someone needs.

Remember that when you build your capabilities. Try not to make assumptions or let your own technical ego blind you to the fundamental truth that, at the end of the day, you are helping people. If what you've built causes confusion or slows someone down, you have not succeeded. At best, you've just uncovered another lesson you need to learn but at worst, you've indulged in simply building something that only made you feel good about your abilities.

When a Debian-based system installs a package that has an associated service (sshd, apache2, etc), the service is immediately started. The user has no input into this decision. You installed a service, surely you want to start it, right?

No. Not right in the slightest. 

When you make assumptions about how your users will use your work, you're writing presumptive software. The fact that the Internet has entries [describing how to work around this decision](https://www.s3it.uzh.ch/blog/on-debian-s-automatic-start-up-of-daemons-upon-installation/) is evidence that it's an unwanted feature.

In all fairness to Debian, I do not mean to pick on this topic specifically. It's just the easiest example to use when making my point. I, myself, have been guilty of valuing my own pride over the usability of something I've built.

In every design decision, you should ask yourself "I know I can do this but _should_ I do this?". Or, put another way, just because you  can, doesn't mean you should.

