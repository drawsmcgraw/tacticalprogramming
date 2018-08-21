Title: Saltstack's Python API - An Introduction
Date: 2018-08-20
Category: howto

I've always said that Salt is not configuration management. I want to expand on one of the capabilities that Salt, as a platform, can offer you. That capability lies just under all the `salt` commands you're accustomed to firing on the command line. It's Salt's [Python API](https://docs.saltstack.com/en/latest/ref/clients), not to be confused with the separate `salt-api` system.

The largest advantage of going down this route is the ability to inspect the return data from a Salt run and, using the full capability of Python, write the logic necessary to make complex decisions that would otherwise be difficult in Bash or an absolute nightmare in Jinja.

I'll go over a few topics in this post. At a high level, they are:

* How to use the `LocalClient` to fire Salt jobs and inspect the return data.
* What the return data looks like and how we can tell whether a job failed or succeeded.
* How to use the `SSHClient` in the case of `salt-ssh` environments.

I plan to go deeper into this topic at [Saltconf 18](https://saltconf.com/saltconf18-speakers/) this year in the talk titled _Off The Deep End: Using the Python API to smartly manage complex tasks_. You can read the code in its entirety [over on Github](https://github.com/drawsmcgraw/saltconf18-demo). But for a step-by-step introduction, please continue reading.

## Introducing the Client Interface
There are a number of clients in the API but for the vast majority of use cases, you'll just want the [`LocalClient`](https://docs.saltstack.com/en/latest/ref/clients/#localclient), which is what gets called when you issue the `salt` command on a Salt master.

Let's reproduce the classic `test.ping`. First, a refresher of what this looks like on the command line.

```bash
# CLI
[root@sse-01 ~]# salt '*' test.ping
sse-02.example.local:
    True
sse-03.example.local:
    True
sse-01.example.local:
    True
```

And let's do the same with the LocalClient.

```python
import salt.client
import pprint as pp
client = salt.client.LocalClient()
ret = client.cmd('*', 
                 'test.ping', 
                 full_return=True)
pp.pprint(ret)
```

Produces the following output.

```python
{'sse-01.example.local': {'jid': '20180820160215728983',
                          'ret': True,
                          'retcode': 0},
 'sse-02.example.local': {'jid': '20180820160215728983',
                          'ret': True,
                          'retcode': 0},
 'sse-03.example.local': {'jid': '20180820160215728983',
                          'ret': True,
                          'retcode': 0}}
```


Neat!

### Side Note - Salt-SSH
Getting the same functionality over `salt-ssh` is just a matter of calling a different client and providing the path to the config directory.

```python
import salt.client.ssh.client
client = salt.client.ssh.client.SSHClient(c_path='/etc/salt/master')
```

Note: You will need a properly functioning Salt SSH deployment in order for this to work. This is just the Python equivalent of the `salt-ssh` command.

### Side Note - Using `full_return`
[According to the docs](https://docs.saltstack.com/en/latest/topics/releases/2017.7.0.html#full-return-argument-in-localclient-and-runnerclient), using `full_return` will result in some job metadata being stuffed into the return data when the job finishes. This helps give us some predictable data structures to work with because, as we'll go over in the next section, the anatomy of a job's return data is not always predictable.

To see a failed run, let's see what happens when two of our minions are offline during a `test.ping`.

```python
{'sse-01.example.local': {'jid': '20180820160418573319',
                          'ret': True,
                          'retcode': 0},
 'sse-02.example.local': False,
 'sse-03.example.local': False}
```

Interesting difference here. Instead of job data for a failed minion, we just get the boolean `False`. While a human can tell this right away, the problem is that it means any logic you write will need to accommodate more than a single data structure. This is where a lot of people get frustrated when breaking into the Python API.

We'll revisit this topic in just a moment.

## State Runs
Firing a state run isn't much different from a simple `test.ping`.

First, the CLI version.

```bash
salt sse-01.example.local state.sls haproxy.update_configs
```

Now with the Python API.

```python
ret = client.cmd('sse-01.example.local', 
                 'state.sls', 
                 ['haproxy.update_configs'], 
                 full_return=True)
```


And the return data. Note - I've clipped the `changes` field for this demo. In reality, the field contains all the changes made by the state run.

```python
{'sse-01.example.local': {'jid': '20180820160629435011',
                          'out': 'highstate',
                          'ret': {'state_run': {'__id__': 'touch_file',
                                                '__run_num__': 0,
                                                '__sls__': 'haproxy.update_configs',
                                                'changes': {'diff': '<clipped>'},
                                                'comment': 'File /etc/haproxy/haproxy.cfg updated',
                                                'duration': 43.686,
                                                'name': '/etc/haproxy/haproxy.cfg',
                                                'pchanges': {},
                                                'result': True,
                                                'start_time': '16:06:29.930063'}},
                          'retcode': 0}}


```

### Side Note - Additional Command Line Arguments
You can also specify command line parameters, like inline Pillar data or a different targeting type, by passing them along with the call.

```python
nodes = ['sse-01.example.local', 'sse-02.example.local']
pillar = {'foo': 'bar'}
ret = client.cmd(nodes, 
                 'state.sls', 
                 tgt_type = 'list',
                 kwarg={ 'pillar': pillar },
                 ['haproxy.update_configs'], 
                 full_return=True)
```

## Failed State Runs
I mentioned earlier that the real power here is the ability to respond to failed Salt runs. Let's look at the return data generated by a failed Salt state run. In this case, I mistyped the name of the state file ('config' instead of 'configs').

```python
{'sse-01.example.local': {'jid': '20180820180510596065',
                          'out': 'highstate',
                          'ret': ["No matching sls found for 'haproxy.update_config' in env 'base'"],
                          'retcode': 1}}
```

This differs from our failed `test.ping` run. In that one, the minion name key mapped to a boolean `False`. In this case, however, we still get our job data and our `retcode` that we can inspect for success/failure.

## Checking Failed State Runs with Salt's Checker
I promised earlier that we'd revisit the topic of reliably examining whether a Salt run succeeded or failed. Let's do that now.

To help with examining whether a job succeeded or failed, we can use some built-in Salt libs.

```python
import salt.utils

def check_salt_run_status(ret_data):
    state_checker = salt.utils.check_state_result

    # Salt-ssh stores return data in the 'return' key.
    # Minion-based runs store return data in the 'ret' key.
    if options.use_ssh:
        SALT_RETURN_KEY = 'return'
    else:
        SALT_RETURN_KEY = 'ret'

    # ret_data is a dict, where the keys are minion names.
    minions = ret_data.keys()

    state_succeeded = True

    # Check the return data for each individual minion
    for minion in minions:
        if not state_checker(ret_data[minion][SALT_RETURN_KEY]):
            state_succeeded = False
    if state_succeeded:
        return True
    return False

if check_salt_run_status(ret):
  print("Success!")
else:
  print("Failure...")
``` 

If you need something more fine-tuned than success/failure (i.e., which minion failed and why), then you can walk through the `comment` field in the return data for some hints on what went wrong.

And that's exactly what I'll be going over in my talk at [Saltconf 18](https://saltconf.com/saltconf18-speakers/) this year - taking these foundational building blocks and arranging them to build a "rolling restart" capability for large clusters. You can see the code that I'll be showing off [over on Github](https://github.com/drawsmcgraw/saltconf18-demo).

## In Closing
My biggest point since becoming involved with Salt is that it is not a configuration management tool. It's a platform upon which you can build many capabilities - it's just that configuration management is one of the more popular arrangements. My hope is that, in showing some details of a capabilty that's not mentioned often, you'll start to think about some other use cases for Salt in your daily work.

