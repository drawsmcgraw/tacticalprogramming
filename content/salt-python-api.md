Title: Saltstack's Python API - An Introduction
Date: 2018-08-20
Category: howto

I've always said that Salt is not configuration management. I want to expand on one of the capabilities that Salt, as a platform, can offer you. That capability lies just under all the `salt` commands you're accustomed to firing on the command line. It's Salt's [Python API](https://docs.saltstack.com/en/latest/ref/clients), not to be confused with the separate `salt-api` system.

The largest advantage of going down this route is the ability to inspect the return data from a Salt run and, using the full capability of Python, write the logic necessary to make complex decisions that would otherwise be difficult in Bash or an absolute nightmare in Jinja.

I'll go over a few topics in this post. At a high level, they are:
* How to use the `LocalClient` to fire Salt jobs and inspect the return data.
* What the return data looks like and how we can tell whether a job failed or succeeded.
* How to use the `SSHClient` in the case of `salt-ssh` environments.

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

Interesting difference here. Instead of job data for a failed minion, we just get the boolean `False`. While a human can tell this right away, the problem is that it means any logic you write will need to accomodate more than a single data structure. This is where a lot of people get frustrated when breaking into the Python API.

## Salt-SSH
Getting the same functionality over `salt-ssh` is just a matter of calling a different client and providing the path to the config directory.

```python
import salt.client.ssh.client
client = salt.client.ssh.client.SSHClient(c_path='/etc/salt/master')
```

Note: You will need a properly functioning Salt-ssh deployment in order for this to work. This is just the Python equivalent of the `salt-ssh` command.

## State Runs
Firing a state run isn't much different from a simple `test.ping`.

```python
ret = client.cmd('sse-01.example.local', 
                 'state.sls', 
                 ['haproxy.update_configs'], 
                 full_return=True)
```


And the return data.

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

### Failed State Runs
I mentioned earlier that the real power here is the ability to respond to failed Salt runs. Let's look at the return data generated by a failed Salt state run. In this case, I mistyped the name of the state file ('config' instead of 'configs').

```python
{'sse-01.example.local': {'jid': '20180820180510596065',
                          'out': 'highstate',
                          'ret': ["No matching sls found for 'haproxy.update_config' in env 'base'"],
                          'retcode': 1}}
```

This differs from our failed `test.ping` run. In that one, the minion name key mapped to a boolean `False`. In this case, however, we still get our job data and our `retcode` that we can inspect for success/failure.

### Checking Failed State Runs with Salt's Checker
To help with examining whether a job succeeded or failed, we can use some built-in Salt libs.

```python

def check_salt_run_status(ret_data):
    state_checker = salt.utils.check_state_result
    logging.debug("Checking return data {0}".format(ret_data))
    minions = ret_data.keys()

    state_succeeded = True
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

If you need something more fine-tuned than success/failure, then you can walk through the `comment` field in the return data for some hints on what went wrong.


