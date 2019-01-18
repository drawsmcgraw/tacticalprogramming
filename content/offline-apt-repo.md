Title: Creating Small Local Offline Apt Repos
Date: 2019-01-17
Category: howto

# Problem
We have an offline (i.e. airgapped) Ubuntu machine (or machines) and the need to install packages on them. We also are unable to stand up our own repo mirror (because *reasons*), so all we have is our single machine with limited disk space.

# Solution
Package up only the binaries that we need and create a local repo on said airgapped machine.

In full transparency, the clean, "right" way to do this is to create a mirror of the repo in your airgapped network and simply use that. But we don't always have those things available. Sometimes you have to do hacky things. I don't like it, but the alternative is to Do Nothing.

Additionally, because of the brutality of this approach, you need to download the packages on the same version of Ubuntu as your target, airgapped machine (i.e., if your airgapped machine is running Ubuntu 18.0, download the packages on an Ubuntu 18.0 machine). This approach does not include options for fetching packages from repos for different versions of Ubuntu.

The Internet is full of howto's and hacks on how to download specific `.deb` packages but I found one that seems to be the cleanest possible, short of standing up your own full repo mirror. That solution came from a handy [Stack Overflow question](https://stackoverflow.com/questions/22008193/how-to-list-download-the-recursive-dependencies-of-a-debian-package).

In short:

* Download all necessary packages
* Create a small source repo out of those packages
* Transfer to airgapped machine
* Configure airgapped machine to use packages as a local repo.

Let's start.

## Download all the packages.
```sh
PACKAGE=apache2 # or vim, or python-flask, or whatever is in your available apt repos.
apt-get download $(apt-cache depends \
                             --recurse \
                             --no-recommends \
                             --no-suggests \
                             --no-conflicts \
                             --no-breaks \
                             --no-replaces \
                             --no-enhances \
                             --no-pre-depends \
                             ${PACKAGE} | grep "^\w" | sort -u)
```
I like this approach because it feeds all the package names to a single `apt-get download` command. A lot of other solutions iterate over a list of names, calling the `apt-get download` command a bunch of times. In the end, it's not much of a difference but I'm a fan of minor speedups whenever reasonable.

## Create a repo
Easily done with...
```sh
apt-get install dpkg-dev
dpkg-scanpackages . | gzip -9c > Packages.gz
```

Protip: `-9` just tells `gzip` to use the maximum compression possible and `-c` dumps the output to `stdout`, which we're just redirecting into our file on disk.

## Transfer and configure
Tar.gz all those packages into a single tarball (all the `.deb` packages and the `Packages.gz` file) and move them to your favorite location on the airgapped machine. In cases like this, I like fairly simple locations like `/opt/packages` but you go with your favorite. 

Let's assume `/opt/packages` for this post.

After unpacking, the directory `/opt/packages` will contain all your `.deb` files and the `Packages.gz` file. Let's update our sources:

```sh
echo "deb file:/opt/packages ./" | tee -a /etc/apt/sources.list
```

Additionally, you'll want to comment out all other sources in that file if this is truly an airgapped environment with no other repos available. Otherwise you'll be subjected to a lengthy timeout for *each* line. Don't forget any files that may have been dropped into `/etc/apt/sources.d` as well.

## Profit
After updating your sources file, update, install, and enjoy!
```sh
apt-get update
apt-get install apache2 # or vim, or python-flask, or whatever you packed up.
```
And done! Much cleaner than installing arbitrary packages and (somewhat) more maintainable.

