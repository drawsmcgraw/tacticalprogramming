Title: Automatic Updates for Raspberry Pi's
Date: 2022-05-15
Category: howto


# Problem

Raspberry Pi's are great but they don't automatically update themselves. And once we've figured out how to make them do whatever it is we wanted them to do, we're not likely to log back in _just for updates_.

We need to set the machine to update itself.

# Solution

There are, no doubt, a number of ways to do this. The following approach just drops an entry into `/etc/crontab` to make the system update itself and reboot once a day.

## Create a small shell script to do the work

Let's offload our work into a small shell script. We'll place the file as `/opt/update-and-restart.sh`

```sh
#!/bin/bash

# Simple daily update script

apt update
apt -y full-upgrade
apt -y autoremove

# Clear the cache so we don't run out of space
apt clean

# Poor man's logging
timestamp=$(date -I)
mkdir -p /opt/update-timestamps
touch /opt/update-timestamps/${timestamp}

init 6
```

## Put an entry into crontab

Now we configure crontab to run our script once a day at 2:00 am.

Add the following to `/etc/crontab`:

```sh
0  2    * * *   root    /bin/bash /opt/update-and-restart.sh
```

## Profit

That's it! Your cute little robots will now update themselves and you can worry about one-less out-of-date machine on your network.
