Title: Simple Bash Expansion
Date: 2018-10-05
Category: howto

In keeping with [the fundamentals]({filename}fundamentals.md), here's a handy one-liner to save yourself a few extra commands.

# Problem
We want to delete a number of machines via Salt Cloud, but we want it in a one-liner because we hate typing the same thing over and over.


```bash
$ salt-key
Accepted Keys:
esdata-01
esdata-02
esdata-03
esdata-05
```

Four machines. But we want to avoid up-arrowing or copy/pasting each individual one. So...

# Solution

```bash
$ salt-cloud -d $( for x in 1 2 3 5; do echo "esdata-0${x}"; done)
The following virtual machines are set to be destroyed:
  vmware:
    vmware:
      esdata-01
      esdata-03
      esdata-02
      esdata-05
```

And we're done. No, it's not exciting for four machines. But imagine four-hundred. Or even some uknown number that you need to hit an API for. It's the little things like this that put us in alignment with the theory of [Large Gains from Small Efficiencies](https://www.industriallogic.com/blog/small-things/).
