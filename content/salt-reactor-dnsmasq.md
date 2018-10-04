Title: Saltstack and Dnsmasq for Easy, Predictable Network Space Management
Date: 2018-10-04
Category: howto

# Introduction
Salt has moved on from simple configuration management and is better described as "event-driven automation". At the heart of this argument is the message bus.

A typical follow up to [getting your hands around your internal cloud]({filename}salted-vmware-part-01.md) is going to be management of your network space. Let's go through how Salt's event bus can help us solve this problem. This post assumes a simple setup of a `/24` network.

# The Problem
Salt Cloud lets you specify the IP of a machine that you plan to create but I'd rather not have that overhead. I don't care what the machine's IP is. What I do care about is that its hostname resolves correctly and that the machine's IP won't change. Like, ever. That last part can pose a problem, though, since the natural solution is to use DHCP _but_ every DHCP lease renewal risks giving the machine a new IP.

The problem can be stated, then, as follows:

1) No user input on what IP a given machine receives.

2) Guarantee that hostnames resolve correctly.

3) Guarantee that, once a machine receives a given IP, that IP does not change until the machine is destroyed.


# The Solution, and Another Problem
We can stand up [Dnsmasq](http://www.thekelleys.org.uk/dnsmasq/doc.html) to run both a DNS server and a DHCP server. We configure Dnsmasq to handle DHCP requests for our `/24` network. We also configure Dnsmasq to forward DNS requests to some known DNS servers. This solves problem #1 (no user input for IPs) and #2 (hostnames resolve) with the additional benefit that our machines can also resolve names on the greater Internet.

For problem #3, Dnsmasq allows us to maintain reservations for hosts. But managing these reservations becomes a circular problem. How do we know what IP a given new machine will receive? We won't know until the machine is created and handed one. And the only way to know _that_ beforehand is managing the hostname:ip mapping ahead of time, which is orthogonal to problem #1. 

We need to automate the creation and management of that reservation file.

When a machine is created, we need to take its hostname and IP address, then update our reservations file. All without any help from us. Since we use Salt to manage our [software-defined data center](https://en.wikipedia.org/wiki/Software-defined_data_center), we have the event bus to help us do exactly that. 

# Salt's Reactor System
One of Salt's components is [the Reactor System](https://docs.saltstack.com/en/latest/topics/reactor/). This lets us create mappings of events (from the event bus) to actions. That is, when we see an event come across the event bus, we can configure certain actions to happen. Every time Salt (or one of its components) takes an action, it generates an event and drops is onto this message bus. One of those events happens to be "I successfully created a cloud instance". This lets us solve many event-based problems. For instance, "Every time a virtual machine is created or destroyed, update my Dnsmasq reservations file".

Let's walk through exactly that.

First, we update the Salt master and tell it what events to react to, and what Reactor files to run when it sees such events:

```yaml
# /etc/salt/master.d/reactor.conf


reactor:
  - 'salt/cloud/*/created':
    - '/srv/reactor/update_dnsmasq_reservations.sls'

  - 'salt/cloud/*/destroyed':
    - '/srv/reactor/update_dnsmasq_reservations.sls'
```

Next, we write the Reactor state file mentioned in that config:

```yaml
# /srv/reactor/update_dnsmasq_reservations.sls


# This is the same as running the following on the command line:
# salt '*salt-master*' cmd.script salt://lab/create_reservations.py
update_dnsmasq_reservations:
  local.cmd.script:
    - tgt: '*salt-master*'
    - arg:
      -  salt://lab/create_reservations.py
```

Finally, we write our Python script, which takes advantage of [the Python API]({file}salt-python-api.md) to query the [Salt Mine](https://docs.saltstack.com/en/latest/topics/mine/) for everyones IP addresses, updates the reservations file, and restarts Dnsmasq.

```python
# /srv/salt/lab/create_reservations.py

#!/usr/bin/python

import salt.client

# Use the minion, akin to 'salt-call ...'
client = salt.client.Caller()

# Query for IPs...
ret = client.cmd('mine.get', '*', 'network.ip_addrs')

with open('/etc/dnsmasq.d/reservations.conf', 'w') as outfile:
    outfile.write('# Managed by Salt. Any changes made will be overwritten.\n')
    for k,v in ret.items():
        outfile.write('dhcp-host={0},{1}\n'.format(k,v[0]))
client.cmd('service.restart', 'dnsmasq')
```

The Salt Mine is outside the scope of this article. Just know that as soon as a machine is created, it updates the Salt Mine with its IP address, creating a quick and convenient source of truth for us. It's also worth noting that we've lowered our DHCP lease time to a fairly aggressive 5 minutes. This increases the broadcast traffic on the network, yes, but it's only a `/24` network and we want to avoid a scenario where rapid create/destroy cycles take up all the leases, leaving us with allocated (but unused) IP addresses. 


# Conclusion
The result is that we now have Salt managing a Dnsmasq reservations file for us. We no longer need to worry about what machine has what IP or how long is left on the DHCP lease. We're free to focus on the more interesting work.


